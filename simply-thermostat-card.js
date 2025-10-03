console.info("%c Simply-Thermostat-Card (compat) loaded", "color: lime; font-weight: bold");

const LitElementBase = window.LitElement || Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = window.html || LitElementBase.prototype.html;
const css = window.css || LitElementBase.prototype.css;

const MODE_COLORS = {
  cool: "#42A5F5",
  heat: "#E53935",
  dry: "#FBC02D",
  fan_only: "#80DEEA",
  auto: "#66BB6A",
  off: "#9E9E9E"
};

class SimplyThermostatCard extends LitElementBase {
  static get properties() {
    return {
      hass: { attribute: false },
      _config: { attribute: false },
    };
  }

  static get styles() {
    return css`
      ha-card {
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 1.05rem;
      }
      .chip {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        animation: none;
      }
      .chip.cool {
        animation: wobble 1s linear infinite alternate;
      }
      @keyframes wobble {
        0% { transform: rotate(-20deg); }
        100% { transform: rotate(20deg); }
      }
      .meta {
        font-size: 0.9rem;
        color: var(--secondary-text-color);
      }
      .temp {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        font-size: 2.2rem;
        font-weight: bold;
      }
      .row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: center;
      }
      .chipbar {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: center;
      }
      .chip-toggle {
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(127,127,127,0.1);
        cursor: pointer;
        user-select: none;
      }
    `;
  }

  setConfig(config) {
    if (!config || !config.entity) throw new Error("Entity is required");
    this._config = {
      name: undefined,
      show_current: true,
      show_state: true,
      chip_animation: true,
      show_mode: true,
      show_fan: false,
      show_swing: false,
      show_preset: false,
      enable_mode_chip: true,
      enable_fan_chip: true,
      enable_swing_chip: true,
      enable_preset_chip: true,
      modes: undefined,
      fan_modes: undefined,
      swing_modes: undefined,
      preset_modes: undefined,
      ...config,
    };
  }

  render() {
    const cfg = this._config;
    const st = this.hass?.states?.[cfg.entity];
    if (!st) return html`<ha-card>Entity not found: ${cfg.entity}</ha-card>`;

    const hvacMode = st.state;
    const color = MODE_COLORS[hvacMode] || MODE_COLORS.off;

    const setTemp = st.attributes.temperature ?? "-";
    const current = st.attributes.current_temperature;
    const humi = st.attributes.current_humidity;

    return html`
      <ha-card>
        <!-- Header -->
        <div class="header">
          <div class="chip ${cfg.chip_animation && hvacMode==="cool" ? "cool" : ""}" style="background:${color}"></div>
          <div>${cfg.name || st.attributes.friendly_name}</div>
        </div>
        <div class="meta">
          ${this._renderMeta(hvacMode, current, humi)}
        </div>

        <!-- Temp control -->
        <div class="temp">
          <mwc-icon-button icon="mdi:minus" @click=${() => this._setTemp(Number(setTemp)-1)}></mwc-icon-button>
          <div>${setTemp !== "-" ? setTemp+"°C" : "-"}</div>
          <mwc-icon-button icon="mdi:plus" @click=${() => this._setTemp(Number(setTemp)+1)}></mwc-icon-button>
        </div>

        <!-- Rows -->
        ${cfg.show_mode ? this._renderButtons("mode", this._getList("modes", st), st.attributes.hvac_mode ?? hvacMode) : ""}
        ${cfg.show_fan ? this._renderButtons("fan_mode", this._getList("fan_modes", st), st.attributes.fan_mode) : ""}
        ${cfg.show_swing ? this._renderButtons("swing_mode", this._getList("swing_modes", st), st.attributes.swing_mode) : ""}
        ${cfg.show_preset ? this._renderButtons("preset_mode", this._getList("preset_modes", st), st.attributes.preset_mode) : ""}

        <!-- Chip toggle bar -->
        ${this._renderChipBar()}
      </ha-card>
    `;
  }

  _renderMeta(hvacMode, current, humi) {
    const parts = [];
    if (this._config.show_state && hvacMode) {
      parts.push(`Currently: ${hvacMode}`);
    }
    if (this._config.show_current && (current !== undefined || humi !== undefined)) {
      const t = current !== undefined ? `${current}°C` : "";
      const h = humi !== undefined ? `${humi}%` : "";
      parts.push(`State: ${t}${t && h ? "/" : ""}${h}`);
    }
    return parts.join("   ");
  }

  _getList(key, st) {
    switch (key) {
      case "modes": return this._config.modes || st.attributes.hvac_modes || [];
      case "fan_modes": return this._config.fan_modes || st.attributes.fan_modes || [];
      case "swing_modes": return this._config.swing_modes || st.attributes.swing_modes || [];
      case "preset_modes": return this._config.preset_modes || st.attributes.preset_modes || [];
    }
    return [];
  }

  _renderButtons(type, list, current) {
    if (!list || list.length === 0) return "";
    const label = (x) => String(x).replaceAll("_"," ");
    return html`
      <div class="row">
        ${list.map(item => html`
          <mwc-button
            dense
            ?raised=${String(item)===String(current)}
            @click=${() => this._setOption(type, item)}>
            ${label(item)}
          </mwc-button>
        `)}
      </div>
    `;
  }

  _renderChipBar() {
    const c = this._config;
    const chips = [];
    if (c.enable_mode_chip && !c.show_mode) chips.push(this._chip("Mode", () => this._toggleRow("show_mode")));
    if (c.enable_fan_chip && !c.show_fan) chips.push(this._chip("Fan", () => this._toggleRow("show_fan")));
    if (c.enable_swing_chip && !c.show_swing) chips.push(this._chip("Swing", () => this._toggleRow("show_swing")));
    if (c.enable_preset_chip && !c.show_preset) chips.push(this._chip("Preset", () => this._toggleRow("show_preset")));
    if (chips.length === 0) return "";
    return html`<div class="chipbar">${chips}</div>`;
  }

  _chip(label, cb) {
    return html`<div class="chip-toggle" @click=${cb}>${label}</div>`;
  }

  _toggleRow(prop) {
    this._config = { ...this._config, [prop]: true };
    this.requestUpdate();
  }

  _setTemp(value) {
    this.hass.callService("climate", "set_temperature", {
      entity_id: this._config.entity,
      temperature: value,
    });
  }

  _setOption(type, value) {
    const payload = { entity_id: this._config.entity };
    payload[type] = value;
    const map = {
      mode: "set_hvac_mode",
      fan_mode: "set_fan_mode",
      swing_mode: "set_swing_mode",
      preset_mode: "set_preset_mode",
    };
    this.hass.callService("climate", map[type] || ("set_"+type), payload);
  }
}

customElements.define("simply-thermostat-card", SimplyThermostatCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "simply-thermostat-card",
  name: "Simply Thermostat Card",
  description: "Thermostat card with chip header, toggle rows and chip bar",
});
