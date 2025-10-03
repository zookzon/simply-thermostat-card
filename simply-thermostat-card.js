console.info("%c Simply-Thermostat-Card (yaml-ui compat v2) loaded", "color: lime; font-weight: bold");
const LitElementBase = window.LitElement || Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = window.html || LitElementBase.prototype.html;
const css = window.css || LitElementBase.prototype.css;

const MODE_ICONS = {off:"mdi:power", cool:"mdi:snowflake", heat:"mdi:fire", dry:"mdi:water-percent", fan_only:"mdi:fan", auto:"mdi:autorenew", heat_cool:"mdi:autorenew"};
const ACTION_COLORS = {off:"grey", cool:"blue", heat:"red", dry:"cyan", fan_only:"orange", auto:"green", heat_cool:"green", idle:"grey"};

class SimplyThermostatCard extends LitElementBase {
  static get properties(){ return { hass:{attribute:false}, _config:{attribute:false}, _panelFan:{type:Boolean}, _panelPreset:{type:Boolean}, _panelSwing:{type:Boolean} }; }
  static get styles(){ return css`
    ha-card{ background:var(--ha-card-background,#1f1f1f); border-radius:12px; padding:10px 10px 8px; }
    .grid2{ display:grid; grid-template-columns:1fr auto; gap:8px; align-items:start; }
    .header{ display:flex; align-items:flex-start; gap:10px; }
    .header .name{ font-weight:700; font-size:.95rem; line-height:1.15; }
    .header .meta{ font-size:.82rem; color:#cfcfcf; line-height:1.25; white-space:pre-line; }
    .icon-wrap{ width:32px; height:32px; display:grid; place-items:center; border-radius:50%; background:rgba(255,255,255,.06); margin-top:-4px; }
    .anim-cool{ animation:wobbling .7s linear infinite alternate; }
    .anim-heat{ animation: fire 1.5s infinite; transform-origin:50% 85%; }
    .anim-rotate{ animation:spin 2s linear infinite; }
    .anim-beat{ animation:beat 1.3s ease-out infinite both; }
    @keyframes wobbling{0%{transform:rotate(-12deg)}100%{transform:rotate(12deg)}}
    @keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
    @keyframes beat{0%,60%{transform:scale(1)} 33%{transform:scale(1.12)}}
    @keyframes fire{0%{ transform: rotate(-1deg) scaleY(1.0); color: rgb(var(--rgb-red)); opacity:.8;}50%{ transform: rotate(1deg) scaleY(1.1); color: rgb(var(--rgb-deep-orange)); opacity:1;}100%{ transform: rotate(-1deg) scaleY(1.0); color: rgb(var(--rgb-red)); opacity:.8;}}
    .vcenter{ display:flex; align-items:center; justify-content:center; }
    .temp-value{ font-size:35px; color:#fff; font-weight:700; min-width:72px; text-align:center; }
    mwc-icon-button{ color:#9e9e9e; }
    .row{ display:flex; gap:12px; flex-wrap:wrap; margin-top:8px; }
    .btn{ border-radius:10px; background:#2d2d2d; color:#9e9e9e; height:44px; min-width:44px; display:flex; align-items:center; justify-content:center; padding:0 12px; cursor:pointer; }
    .btn:hover{ background:#363636; color:#cfcfcf; }
    .btn.active.off{ background:#363636; color:#9e9e9e; }
    .btn.active.cool{ background:#1d3447; color:#2196f3; }
    .btn.active.heat{ background:#472421; color:#f44336; }
    .btn.active.dry{ background:#164749; color:#1BCACC; }
    .btn.active.fan_only{ background:#493516; color:#ff9800; }
    .btn.active.auto, .btn.active.heat_cool{ background:#263926; color:#4caf50; }
    .label{ margin-left:6px; font-size:.85rem; }
    .chips{ display:flex; align-items:center; justify-content:space-between; margin-top:6px; }
    .chips-left, .chips-right{ display:flex; gap:10px; align-items:center; }
    .chip{ display:inline-flex; align-items:center; gap:6px; background:transparent; color:#cfe7ff; font-size:.82rem; padding:2px 6px; border-radius:16px; cursor:default; }
    .chip .icon{ color:#00bcd4; }
    .chip.blue .icon{ color:#2196f3; }
    .chip.green .icon{ color:#4caf50; }
    .chip.purple .icon{ color:#9c27b0; }
    .chip.yellow .icon{ color:#ffc107; }
    .chip.click{ cursor:pointer; }
    .panel{ margin:6px 8px 0; }
    .panel-row{ display:flex; gap:12px; flex-wrap:wrap; }
    .panel .btn{ height:40px; }
  `;}

  setConfig(c){
    if(!c||!c.entity) throw new Error("Entity is required");
    this._config = {
      entity:c.entity,
      name:c.name,
      weather_entity:c.weather_entity,
      show_fan: c.show_fan ?? "chip",
      show_swing: c.show_swing ?? "chip",
      show_preset: c.show_preset ?? "chip",
    };
    this._panelFan=false; this._panelPreset=false; this._panelSwing=false;
  }

  render(){
    const st = this.hass?.states?.[this._config.entity];
    if(!st) return html`<ha-card><div style="color:#888">Entity not found: ${this._config.entity}</div></ha-card>`;
    const hvacMode = st.state;
    const hvacAction = st.attributes.hvac_action || (hvacMode==="off" ? "off":"idle");
    const icon = MODE_ICONS[hvacMode] || "mdi:thermostat";
    const color = ACTION_COLORS[hvacAction] || "grey";
    const friendly = this._config.name || st.attributes.friendly_name || this._config.entity;
    const curT = st.attributes.current_temperature;
    const curH = st.attributes.current_humidity != null ? Math.round(st.attributes.current_humidity) : undefined;
    const target = st.attributes.temperature ?? st.attributes.target_temperature ?? st.attributes.target_temp_low ?? st.attributes.target_temp_high ?? "-";

    const actionText = ({off:"Off",cool:"Cooling",heat:"Heating",dry:"Drying",fan_only:"Fan",auto:"Auto",heat_cool:"Heat/Cool",idle:"Idle"}[hvacAction]||"Idle");
    const meta = `Currently: ${actionText}\nState: ${curT!=null?curT+"°C":"-"} | ${curH!=null?curH+"%":"-"}`;

    const hvacModes = (st.attributes.hvac_modes||[]).slice();
    const fanModes = (st.attributes.fan_modes||[]).slice();
    const swingModes = (st.attributes.swing_modes||[]).slice();
    const presetModes = (st.attributes.preset_modes||[]).slice();

    const rows = [];
    rows.push(this._renderHVACRow(hvacModes, hvacMode));
    if(this._config.show_fan==="row" && fanModes.length) rows.push(this._renderGenericRow("fan_mode", fanModes, st.attributes.fan_mode));
    if(this._config.show_swing==="row" && swingModes.length) rows.push(this._renderGenericRow("swing_mode", swingModes, st.attributes.swing_mode));
    if(this._config.show_preset==="row" && presetModes.length) rows.push(this._renderGenericRow("preset_mode", presetModes, st.attributes.preset_mode));

    return html`
      <ha-card>
        <div class="grid2">
          <div class="header">
            <div class="icon-wrap">
              <ha-icon class="${this._iconAnimClass(hvacMode)}" style="color:${color}" .icon=${icon}></ha-icon>
            </div>
            <div>
              <div class="name">${friendly}</div>
              <div class="meta">${meta}</div>
            </div>
          </div>
          <div class="vcenter">
            <mwc-icon-button title="Decrease" @click=${()=>this._adjustTemp(-1)}>
              <ha-icon icon="mdi:minus"></ha-icon>
            </mwc-icon-button>
            <div class="temp-value">${target!=="-"?`${target}°C`:"-"}</div>
            <mwc-icon-button title="Increase" @click=${()=>this._adjustTemp(1)}>
              <ha-icon icon="mdi:plus"></ha-icon>
            </mwc-icon-button>
          </div>
        </div>

        ${rows.map(r=>r)}

        ${this._renderChips(st, {fanModes, swingModes, presetModes})}

        ${this._panelFan ? this._renderPanel("fan_mode", fanModes, st.attributes.fan_mode) : ""}
        ${this._panelSwing ? this._renderPanel("swing_mode", swingModes, st.attributes.swing_mode, true) : ""}
        ${this._panelPreset ? this._renderPanel("preset_mode", presetModes, st.attributes.preset_mode) : ""}
      </ha-card>
    `;
  }

  _iconAnimClass(mode){
    if(mode==="cool") return "anim-cool";
    if(mode==="heat") return "anim-heat";
    if(mode==="fan_only"||mode==="auto"||mode==="heat_cool") return "anim-rotate";
    if(mode==="dry") return "anim-beat";
    return "";
  }

  _renderHVACRow(list, current){
    if(!list || !list.length) return html``;
    return html`
      <div class="row">
        ${list.map(m=>{
          const active = String(m)===String(current);
          const cls = `btn ${active?'active '+m:''}`;
          const ic = MODE_ICONS[m] || 'mdi:thermostat';
          return html`<div class="${cls}" title="${m}" @click=${()=>this._setMode(m)}><ha-icon icon="${ic}"></ha-icon></div>`;
        })}
      </div>
    `;
  }

  _renderGenericRow(type, list, current){
    if(!list || !list.length) return html``;
    return html`
      <div class="row">
        ${list.map(v=>{
          const active = String(v)===String(current);
          const cls = `btn ${active?'active auto':''}`;
          return html`<div class="${cls}" @click=${()=>this._setOption(type, v)}>
            <span class="label">${String(v).replaceAll("_"," ")}</span>
          </div>`;
        })}
      </div>
    `;
  }

  _renderChips(st, {fanModes, swingModes, presetModes}){
    const curT = st.attributes.current_temperature;
    const curH = st.attributes.current_humidity != null ? Math.round(st.attributes.current_humidity) : undefined;
    const left = html`
      <span class="chip blue"><ha-icon class="icon" icon="mdi:thermometer"></ha-icon>${curT!=null?`${curT}°C`:"-"}</span>
      <span class="chip"><ha-icon class="icon" icon="mdi:water"></ha-icon>${curH!=null?`${curH}%`:"-"}</span>
      ${this._config.weather_entity ? this._weatherChip(this._config.weather_entity) : ""}
    `;
    const right = html`
      ${ (this._config.show_preset!=="row" && presetModes.length) ? html`
        <span class="chip purple click" @click=${()=>this._togglePanel("preset")} title="preset">
          <ha-icon class="icon" icon="mdi:progress-star"></ha-icon>${st.attributes.preset_mode || "-"}
        </span>` : ""}
      ${ (this._config.show_swing!=="row" && swingModes.length) ? html`
        <span class="chip yellow click" @click=${()=>this._togglePanel("swing")} title="swing">
          <ha-icon class="icon" icon="mdi:swap-vertical"></ha-icon>${st.attributes.swing_mode || "-"}
        </span>` : ""}
      ${ (this._config.show_fan!=="row" && fanModes.length) ? html`
        <span class="chip green click" @click=${()=>this._togglePanel("fan")} title="fan">
          ${this._fanIconAndText(st)}
        </span>` : ""}
    `;
    return html`<div class="chips"><div class="chips-left">${left}</div><div class="chips-right">${right}</div></div>`;
  }

  _fanIconAndText(st){
    const fm = st.attributes.fan_mode;
    const icon = fm==="auto"?"mdi:fan-auto":fm==="low"?"mdi:fan-speed-1":(fm==="medium"||fm==="mid")?"mdi:fan-speed-2":fm==="high"?"mdi:fan-speed-3":"mdi:fan";
    return html`<ha-icon class="icon" icon="${icon}"></ha-icon>${fm||"-"}`;
  }

  _weatherChip(eid){
    const w = this.hass?.states?.[eid];
    if(!w) return html``;
    const label = `${w.state||""}${w.attributes.temperature!=null?" / "+w.attributes.temperature+"°C":""}`;
    return html`<span class="chip"><ha-icon class="icon" icon="mdi:weather-partly-cloudy"></ha-icon>${label}</span>`;
  }

  _renderPanel(type, list, current, swing=false){
    if(!list || !list.length) return html``;
    return html`
      <div class="panel">
        <div class="panel-row">
          ${list.map(v=>{
            const active = String(v)===String(current);
            const cls = `btn ${active?'active auto':''}`;
            return html`<div class="${cls}" @click=${()=>this._setOption(type, v)}>
              <span class="label">${String(v).replaceAll("_"," ")}</span>
            </div>`;
          })}
        </div>
      </div>
    `;
  }

  _togglePanel(which){
    this._panelFan = which==="fan" ? !this._panelFan : false;
    this._panelPreset = which==="preset" ? !this._panelPreset : false;
    this._panelSwing = which==="swing" ? !this._panelSwing : false;
    this.requestUpdate();
  }

  _adjustTemp(delta){
    const st=this.hass.states[this._config.entity];
    const cur=Number(st.attributes.temperature??st.attributes.target_temperature??st.attributes.target_temp_low??st.attributes.target_temp_high);
    if(Number.isFinite(cur)){
      const next = cur + delta;
      this.hass.callService("climate","set_temperature",{entity_id:this._config.entity,temperature:next});
    }
  }
  _setMode(m){ this.hass.callService("climate","set_hvac_mode",{entity_id:this._config.entity,hvac_mode:m}); }
  _setOption(type, val){
    const svc = { fan_mode:"set_fan_mode", swing_mode:"set_swing_mode", preset_mode:"set_preset_mode" }[type];
    if(!svc) return;
    this.hass.callService("climate", svc, { entity_id:this._config.entity, [type]:val });
  }
  getCardSize(){ return 3; }
}

customElements.define("simply-thermostat-card", SimplyThermostatCard);
window.customCards = window.customCards || [];
window.customCards.push({ type:"simply-thermostat-card", name:"Simply Thermostat Card", description:"All-in-one: header+temp+hvac modes+chips; panels for fan/preset/swing at bottom." });
