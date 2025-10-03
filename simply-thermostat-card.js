console.info("%c Simply-Thermostat-Card (yaml-ui compat v4) loaded", "color: lime; font-weight: bold");
const LitElementBase = window.LitElement || Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = window.html || LitElementBase.prototype.html;
const css = window.css || LitElementBase.prototype.css;

// Icons & colors
const MODE_ICONS = {
  off:"mdi:power", cool:"mdi:snowflake", heat:"mdi:fire", dry:"mdi:water-percent",
  fan_only:"mdi:fan", auto:"mdi:autorenew", heat_cool:"mdi:autorenew"
};
const MODE_COLORS = {
  off:"grey", cool:"#2196f3", heat:"#f44336", dry:"#1BCACC",
  fan_only:"#ff9800", auto:"#4caf50", heat_cool:"#4caf50", idle:"grey"
};

// Fan icon by value
function fanIcon(mode){
  return mode==="auto" ? "mdi:fan-auto"
       : mode==="low" ? "mdi:fan-speed-1"
       : (mode==="mid"||mode==="medium") ? "mdi:fan-speed-2"
       : mode==="high" ? "mdi:fan-speed-3"
       : "mdi:fan";
}
// Swing icon by value
function swingIcon(mode){
  if(!mode) return "mdi:swap-vertical";
  const m = String(mode).toLowerCase();
  if(m==="off") return "mdi:swap-vertical";
  if(m.includes("both")||m.includes("all")) return "mdi:swap-vertical-circle";
  if(m.includes("h")||m.includes("hor")) return "mdi:swap-horizontal";
  if(m.includes("v")||m.includes("ver")) return "mdi:swap-vertical";
  return "mdi:swap-vertical";
}

class SimplyThermostatCard extends LitElementBase {
  static get properties(){ return {
    hass:{attribute:false}, _config:{attribute:false},
    _panelFan:{type:Boolean}, _panelPreset:{type:Boolean}, _panelSwing:{type:Boolean}
  };}

  static get styles(){ return css`
    ha-card{ background:var(--ha-card-background,#1f1f1f); border-radius:12px; padding:10px 10px 8px; }
    .grid2{ display:grid; grid-template-columns:1fr auto; gap:8px; align-items:start; }
    .header{ display:flex; align-items:flex-start; gap:10px; }
    .header .name{ font-weight:700; font-size:.95rem; line-height:1.15; }
    .header .meta{ font-size:.82rem; color:#cfcfcf; line-height:1.25; white-space:pre-line; }
    .icon-wrap{ width:32px; height:32px; display:grid; place-items:center; border-radius:50%; background:rgba(255,255,255,.06); margin-top:-4px; }
    .anim-cool{ animation:wobbling .7s linear infinite alternate; }
    .anim-heat{ animation: fire 1.5s infinite; transform-origin:50% 85%; color:${MODE_COLORS.heat}; }
    .anim-rotate{ animation:spin 2s linear infinite; }
    .anim-beat{ animation:beat 1.3s ease-out infinite both; }
    @keyframes wobbling{0%{transform:rotate(-12deg)}100%{transform:rotate(12deg)}}
    @keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
    @keyframes beat{0%,60%{transform:scale(1)} 33%{transform:scale(1.12)}}
    @keyframes fire{0%{ transform: rotate(-1deg) scaleY(1.0); opacity:.9;}50%{ transform: rotate(1deg) scaleY(1.1); opacity:1;}100%{ transform: rotate(-1deg) scaleY(1.0); opacity:.9;}}
    .vcenter{ display:flex; align-items:center; justify-content:center; }
    .temp-value{ font-size:35px; color:#fff; font-weight:700; min-width:72px; text-align:center; }
    mwc-icon-button{ color:#9e9e9e; }

    /* Rows: single line (no wrap), space-between, fill width, no scroll */
    .row{ display:flex; gap:12px; flex-wrap:nowrap; margin-top:8px; justify-content:space-between; }
    .row > *{ flex:1 1 0; }
    .btn{
      border-radius:10px; background:#2d2d2d; color:#9e9e9e; height:44px;
      display:flex; align-items:center; justify-content:center; cursor:pointer;
      min-width:0; /* allow shrink */ 
      padding:0 6px;
    }
    .btn:hover{ background:#363636; color:#cfcfcf; }
    .btn.active.off{ background:#363636; color:#9e9e9e; }
    .btn.active.cool{ background:#1d3447; color:#2196f3; }
    .btn.active.heat{ background:#472421; color:#f44336; }
    .btn.active.dry{ background:#164749; color:#1BCACC; }
    .btn.active.fan_only{ background:#493516; color:#ff9800; }
    .btn.active.auto, .btn.active.heat_cool{ background:#263926; color:#4caf50; }
    .label{ font-size:.85rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

    /* chips */
    .chips{ display:flex; align-items:center; justify-content:space-between; margin-top:6px; }
    .chips-left, .chips-right{ display:flex; gap:10px; align-items:center; }
    .chip{ display:inline-flex; align-items:center; gap:6px; background:transparent; color:#cfe7ff; font-size:.82rem; padding:2px 6px; border-radius:16px; cursor:default; }
    .chip .icon{ color:#00bcd4; }
    .chip.blue .icon{ color:#2196f3; }
    .chip.green .icon{ color:#4caf50; }
    .chip.purple .icon{ color:#9c27b0; }
    .chip.yellow .icon{ color:#ffc107; }
    .chip.click{ cursor:pointer; }

    /* Panels */
    .panel{ margin:6px 8px 0; }
    .panel-row{ display:flex; gap:12px; flex-wrap:nowrap; justify-content:space-between; }
    .panel-row > *{ flex:1 1 0; }
    .panel .btn{ height:40px; }
  `;}

  setConfig(c){
    if(!c || !c.entity) throw new Error("Entity is required");
    this._config = {
      entity: c.entity,
      name: c.name, // display uses friendly_name
      show_fan: c.show_fan ?? "chip",     // true | "chip" | false
      show_swing: c.show_swing ?? "chip", // true | "chip" | false
      show_preset: c.show_preset ?? "chip" // true | "chip" | false
    };
    this._panelFan=false; this._panelPreset=false; this._panelSwing=false;
  }

  render(){
    const st = this.hass?.states?.[this._config.entity];
    if(!st) return html`<ha-card><div style="color:#888">Entity not found: ${this._config.entity}</div></ha-card>`;

    const hvacMode = st.state;
    const friendly = st.attributes.friendly_name || this._config.entity;
    const icon = MODE_ICONS[hvacMode] || "mdi:thermostat";
    const color = MODE_COLORS[hvacMode] || MODE_COLORS.off;

    const curT = st.attributes.current_temperature;
    const curH = st.attributes.current_humidity != null ? Math.round(st.attributes.current_humidity) : undefined;
    const target = st.attributes.temperature ?? st.attributes.target_temperature ?? st.attributes.target_temp_low ?? st.attributes.target_temp_high ?? "-";

    const hvacAction = st.attributes.hvac_action || (hvacMode==="off"?"off":"idle");
    const actionText = ({off:"Off",cool:"Cooling",heat:"Heating",dry:"Drying",fan_only:"Fan",auto:"Auto",heat_cool:"Heat/Cool",idle:"Idle"}[hvacAction]||"Idle");
    const meta = `Currently: ${actionText}\nState: ${curT!=null?curT+"°C":"-"} | ${curH!=null?curH+"%":"-"}`;

    const hvacModes = (st.attributes.hvac_modes||[]).slice();
    const fanModes = (st.attributes.fan_modes||[]).slice();
    const swingModes = (st.attributes.swing_modes||[]).slice();
    const presetModes = (st.attributes.preset_modes||[]).slice();

    const rows = [];
    rows.push(this._renderHVACRow(hvacModes, hvacMode));
    if(this._config.show_fan===true && fanModes.length) rows.push(this._renderIconRow("fan_mode", fanModes, st.attributes.fan_mode, fanIcon));
    if(this._config.show_swing===true && swingModes.length) rows.push(this._renderIconRow("swing_mode", swingModes, st.attributes.swing_mode, swingIcon));
    if(this._config.show_preset===true && presetModes.length) rows.push(this._renderTextRow("preset_mode", presetModes, st.attributes.preset_mode));

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

        ${this._panelFan ? this._renderPanel("fan_mode", fanModes, st.attributes.fan_mode, fanIcon) : ""}
        ${this._panelSwing ? this._renderPanel("swing_mode", swingModes, st.attributes.swing_mode, swingIcon) : ""}
        ${this._panelPreset ? this._renderPanelText("preset_mode", presetModes, st.attributes.preset_mode) : ""}
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

  // Rows
  _renderHVACRow(list, current){
    if(!list || !list.length) return html``;
    // distribute buttons across full width
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

  _renderIconRow(type, list, current, iconFn){
    if(!list || !list.length) return html``;
    return html`
      <div class="row">
        ${list.map(v=>{
          const active = String(v)===String(current);
          const cls = `btn ${active?'active auto':''}`;
          const ic = iconFn(String(v));
          return html`<div class="${cls}" title="${v}" @click=${()=>this._setOption(type, v)}><ha-icon icon="${ic}"></ha-icon></div>`;
        })}
      </div>
    `;
  }

  _renderTextRow(type, list, current){
    if(!list || !list.length) return html``;
    return html`
      <div class="row">
        ${list.map(v=>{
          const active = String(v)===String(current);
          const cls = `btn ${active?'active auto':''}`;
          return html`<div class="${cls}" title="${v}" @click=${()=>this._setOption(type, v)}>
            <span class="label">${String(v).replaceAll("_"," ")}</span>
          </div>`;
        })}
      </div>
    `;
  }

  // Chips
  _renderChips(st, {fanModes, swingModes, presetModes}){
    const curT = st.attributes.current_temperature;
    const curH = st.attributes.current_humidity != null ? Math.round(st.attributes.current_humidity) : undefined;

    const left = html`
      <span class="chip blue"><ha-icon class="icon" icon="mdi:thermometer"></ha-icon>${curT!=null?`${curT}°C`:"-"}</span>
      <span class="chip"><ha-icon class="icon" icon="mdi:water"></ha-icon>${curH!=null?`${curH}%`:"-"}</span>
    `;

    const right = html`
      ${ (this._config.show_preset==="chip" && presetModes.length) ? html`
        <span class="chip purple click" @click=${()=>this._togglePanel("preset")} title="preset">
          ${st.attributes.preset_mode || "-"}
        </span>` : ""}
      ${ (this._config.show_swing==="chip" && swingModes.length) ? html`
        <span class="chip yellow click" @click=${()=>this._togglePanel("swing")} title="swing">
          <ha-icon class="icon" icon="${swingIcon(st.attributes.swing_mode)}"></ha-icon>${st.attributes.swing_mode || "-"}
        </span>` : ""}
      ${ (this._config.show_fan==="chip" && fanModes.length) ? html`
        <span class="chip green click" @click=${()=>this._togglePanel("fan")} title="fan">
          <ha-icon class="icon" icon="${fanIcon(st.attributes.fan_mode)}"></ha-icon>${st.attributes.fan_mode || "-"}
        </span>` : ""}
    `;

    return html`<div class="chips"><div class="chips-left">${left}</div><div class="chips-right">${right}</div></div>`;
  }

  // Panels (at bottom)
  _renderPanel(type, list, current, iconFn){
    if(!list || !list.length) return html``;
    return html`
      <div class="panel">
        <div class="panel-row">
          ${list.map(v=>{
            const active = String(v)===String(current);
            const cls = `btn ${active?'active auto':''}`;
            const ic = iconFn(String(v));
            return html`<div class="${cls}" title="${v}" @click=${()=>this._setOption(type, v)}>
              <ha-icon icon="${ic}"></ha-icon>
            </div>`;
          })}
        </div>
      </div>
    `;
  }
  _renderPanelText(type, list, current){
    if(!list || !list.length) return html``;
    return html`
      <div class="panel">
        <div class="panel-row">
          ${list.map(v=>{
            const active = String(v)===String(current);
            const cls = `btn ${active?'active auto':''}`;
            return html`<div class="${cls}" title="${v}" @click=${()=>this._setOption(type, v)}>
              <span class="label">${String(v).replaceAll("_"," ")}</span>
            </div>`;
          })}
        </div>
      </div>
    `;
  }

  // Actions
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
window.customCards.push({ type:"simply-thermostat-card", name:"Simply Thermostat Card", description:"All-in-one card with flexible rows, chips, and bottom panels. v4" });
