console.info("%c Simply Thermostat Card (v6) loaded", "color: lime; font-weight: bold");

const LitElementBase = window.LitElement || Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = window.html || LitElementBase.prototype.html;
const css = window.css || LitElementBase.prototype.css;

/** ===== Icons / Colors ===== */
const MODE_ICONS = {
  off:"mdi:power", cool:"mdi:snowflake", heat:"mdi:fire", dry:"mdi:water-percent",
  fan_only:"mdi:fan", auto:"mdi:autorenew", heat_cool:"mdi:autorenew"
};
const MODE_COLORS = {
  off:"grey", cool:"#2196f3", heat:"#f44336", dry:"#1BCACC",
  fan_only:"#ff9800", auto:"#4caf50", heat_cool:"#4caf50", idle:"grey"
};
function fanIcon(mode){
  const m = String(mode||"").toLowerCase();
  return m==="auto" ? "mdi:fan-auto"
       : m==="low" ? "mdi:fan-speed-1"
       : (m==="mid"||m==="medium") ? "mdi:fan-speed-2"
       : m==="high" ? "mdi:fan-speed-3"
       : "mdi:fan";
}
function swingIcon(mode){
  if(!mode) return "mdi:swap-vertical";
  const m = String(mode).toLowerCase();
  if(m==="off") return "mdi:swap-vertical";
  if(m.includes("both")||m.includes("all")) return "mdi:swap-vertical-circle";
  if(m.includes("h")||m.includes("hor")) return "mdi:swap-horizontal";
  if(m.includes("v")||m.includes("ver")) return "mdi:swap-vertical";
  return "mdi:swap-vertical";
}

/** ===== Card ===== */
class SimplyThermostatCardV6 extends LitElementBase {
  static get properties(){ return {
    hass:{attribute:false}, _config:{attribute:false},
    _panelFan:{type:Boolean}, _panelSwing:{type:Boolean}, _panelPreset:{type:Boolean},
  };}

  /** ===== Styles (Style A) ===== */
  static get styles(){ return css`
    ha-card{ background:var(--ha-card-background,#1f1f1f); border-radius:12px; padding:12px; }

    .grid2{ display:grid; grid-template-columns:1fr auto; gap:10px; align-items:start; }
    .header{ display:flex; align-items:flex-start; gap:12px; }
    .name{ font-weight:700; font-size:1.06rem; line-height:1.22; }
    .meta{ font-size:0.92rem; color:#cfcfcf; line-height:1.35; white-space:pre-line; }

    .icon-wrap{
      width:36px; height:36px; display:grid; place-items:center; border-radius:50%;
      box-shadow: inset 0 0 0 0px rgba(255,255,255,.06);
      background: var(--stc-bg, rgba(255,255,255,.08));
      margin-top:-2px;
    }

    .vcenter{ display:flex; align-items:center; justify-content:center; }
    .temp-value{ font-size:35px; color:#fff; font-weight:700; min-width:72px; text-align:center; }
    mwc-icon-button{ color:#9e9e9e; }

    /* Animations */
    @keyframes wobbling { 0%{transform:rotate(-80deg);} 100%{transform:rotate(40deg);} }
    @keyframes rotation { 0%{transform:rotate(0);} 100%{transform:rotate(360deg);} }
    @keyframes beat {
      0%,60% { transform: scale(1); }
      5%,17%,57% { transform: scale(1.05); }
      10%,20%,51% { transform: scale(1.08); }
      25%,45% { transform: scale(1.12); }
      30%,39% { transform: scale(1.15); }
      33% { transform: scale(1.18); }
    }
    @keyframes fire {
      0%   { transform: rotate(-2deg) scaleY(0.98); opacity:.9; }
      10%  { transform: rotate( 2deg) scaleY(1.02); opacity:1; }
      20%  { transform: rotate(-1deg) scaleY(1.05); opacity:.95; }
      30%  { transform: rotate( 1deg) scaleY(1.00); opacity:1; }
      40%  { transform: rotate(-2deg) scaleY(1.04); opacity:.92; }
      50%  { transform: rotate( 2deg) scaleY(1.01); opacity:1; }
      60%  { transform: rotate(-1deg) scaleY(1.06); opacity:.94; }
      70%  { transform: rotate( 1deg) scaleY(1.00); opacity:1; }
      80%  { transform: rotate(-2deg) scaleY(1.03); opacity:.93; }
      90%  { transform: rotate( 2deg) scaleY(1.01); opacity:1; }
      100% { transform: rotate(-1deg) scaleY(1.00); opacity:.95; }
    }

    /* Rows (buttons) */
    .row{ display:flex; gap:12px; flex-wrap:nowrap; margin-top:8px; justify-content:space-between; }
    .row > *{ flex:1 1 0; min-width:0; }

    .btn{
      height:44px; border-radius:10px; background:#2d2d2d; color:#9e9e9e;
      display:flex; align-items:center; justify-content:center; cursor:pointer;
      padding:0 8px; min-width:0;
      transition:filter .2s ease, background .2s ease, color .2s ease;
      text-transform:lowercase; font-weight:600; letter-spacing:.3px;
    }
    .btn:hover{ background:#363636; color:#cfcfcf; }
    .btn .label{ font-size:.9rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .btn ha-icon{ --mdc-icon-size: 22px; }

    /* Active colors (match YAML style) */
    .btn.active.off{ background:#363636; color:#9e9e9e; }
    .btn.active.cool{ background:#1d3447; color:#2196f3; }
    .btn.active.heat{ background:#472421; color:#f44336; }
    .btn.active.dry{ background:#164749; color:#1BCACC; }
    .btn.active.fan_only{ background:#493516; color:#ff9800; }
    .btn.active.auto, .btn.active.heat_cool{ background:#263926; color:#4caf50; }

    /* Fan speed active (green tone to keep consistent look) */
    .row.fan_mode .btn.active,
    .panel.fan_mode .btn.active{
      background:#263926; color:#4caf50;
    }

    /* Swing/Preset active in the same "fan speed" style family */
    .row.swing_mode .btn.active,
    .panel.swing_mode .btn.active{ background:#3a3320; color:#FFD700; } /* yellow tone */
    .row.preset_mode .btn.active,
    .panel.preset_mode .btn.active{ background:#142825; color:#00FFFF; } /* cyan eco */

    /* Chips */
    .chips{ display:flex; align-items:center; justify-content:space-between; margin-top:10px; }
    .chips-left, .chips-right{ display:flex; gap:10px; align-items:center; }
    .chip{
      display:inline-flex; align-items:center; gap:6px;
      background:transparent; color:#cfe7ff; font-size:.85rem;
      padding:2px 8px; border-radius:16px; cursor:default;
    }
    .chip .icon{ color:#00bcd4; }
    .chip.blue .icon{ color:#2196f3; }
    .chip.green .icon{ color:#4caf50; }
    .chip.purple .icon{ color:#1BCACC; }
    .chip.yellow .icon{ color:#ffc107; }
    .chip.click{ cursor:pointer; }
    .chip.click:hover{ filter:brightness(1.15); }

    /* Active tint on chips when its panel is open */
    .chip.purple.click.active{ color:#00FFFF; }
    .chip.yellow.click.active{ color:#FFD700; }
    .chip.green.click.active{ color:#4caf50; }

    /* Panels under the card (when toggled by chips) */
    .panel{ margin-top:6px; }
    .panel-row{ display:flex; gap:12px; flex-wrap:nowrap; justify-content:space-between; }
    .panel-row > *{ flex:1 1 0; min-width:0; }
    .panel .btn{ height:40px; }
  `;}

  /** ===== Config ===== */
  setConfig(c){
    if(!c || !c.entity) throw new Error("Entity is required");
    this._config = {
      entity: c.entity,
      name: c.name,
      // show_*: true|false|'chip'
      show_hvac:   (c.show_hvac   ?? true),
      show_fan:    (c.show_fan    ?? true),
      show_swing:  (c.show_swing  ?? true),
      show_preset: (c.show_preset ?? true),
      // optional: custom icon size
      icon_size:   (c.icon_size ?? 36),
      step:        Number(c.step ?? 1),
    };
    this._panelFan=false; this._panelSwing=false; this._panelPreset=false;
  }

  /** ===== Render ===== */
  render(){
    const st = this.hass?.states?.[this._config.entity];
    if(!st) return html`<ha-card><div style="color:#888">Entity not found: ${this._config.entity}</div></ha-card>`;

    const hvacMode = st.state;
    const friendly = this._config.name || (st.attributes.friendly_name || this._config.entity);
    const icon = MODE_ICONS[hvacMode] || "mdi:thermostat";
    const color = MODE_COLORS[hvacMode] || MODE_COLORS.off;
    const bgColor = this._softBg(color);

    const curT = st.attributes.current_temperature;
    const curH = st.attributes.current_humidity != null ? Math.round(st.attributes.current_humidity) : undefined;
    const target = st.attributes.temperature ?? st.attributes.target_temperature ?? "-";

    const actionMap = {off:"Off", cool:"Cooling", heat:"Heating", dry:"Drying", fan_only:"Fan", auto:"Auto", heat_cool:"Heat/Cool", idle:"Idle"};
    const actionText = actionMap[hvacMode] || "Idle";
    const meta = `Currently: ${actionText}\nState: ${curT!=null?curT+"°C":"-"} | ${curH!=null?curH+"%":"-"}`;

    const hvacModes   = (st.attributes.hvac_modes||[]).slice();
    const fanModes    = (st.attributes.fan_modes||[]).slice();
    const swingModes  = (st.attributes.swing_modes||[]).slice();
    const presetModes = (st.attributes.preset_modes||[]).slice();

    // Build rows from top to bottom according to config
    const rows = [];
    if(this._config.show_hvac===true && hvacModes.length)        rows.push(this._rowHVAC(hvacModes, hvacMode));
    if(this._config.show_fan===true  && fanModes.length)         rows.push(this._rowFan("fan_mode", fanModes, st.attributes.fan_mode));
    if(this._config.show_swing===true && swingModes.length)      rows.push(this._rowText("swing_mode", swingModes, st.attributes.swing_mode, "swing_mode"));
    if(this._config.show_preset===true && presetModes.length)    rows.push(this._rowText("preset_mode", presetModes, st.attributes.preset_mode, "preset_mode"));

    const animStyle = this._animStyle(hvacMode);

    return html`
      <ha-card style="--icon-size:${this._config.icon_size}px; --stc-bg:${bgColor}">
        <div class="grid2">
          <div class="header">
            <div class="icon-wrap">
              <ha-icon class="${this._iconAnimClass(hvacMode)}" style="color:${color}; ${animStyle}" .icon=${icon}></ha-icon>
            </div>
            <div>
              <div class="name">${friendly}</div>
              <div class="meta">${meta}</div>
            </div>
          </div>
          <div class="vcenter">
            <mwc-icon-button title="Decrease" @click=${()=>this._adjustTemp(-this._config.step)}>
              <ha-icon icon="mdi:minus"></ha-icon>
            </mwc-icon-button>
            <div class="temp-value">${target!=="-"?`${target}°C`:"-"}</div>
            <mwc-icon-button title="Increase" @click=${()=>this._adjustTemp(this._config.step)}>
              <ha-icon icon="mdi:plus"></ha-icon>
            </mwc-icon-button>
          </div>
        </div>

        ${rows.map(r=>r)}

        ${this._renderChips(st, {hvacModes, fanModes, swingModes, presetModes})}

        ${this._panelFan    ? this._panel("fan_mode",    fanModes,    st.attributes.fan_mode,    true) : ""}
        ${this._panelSwing  ? this._panel("swing_mode",  swingModes,  st.attributes.swing_mode,  false, "swing_mode") : ""}
        ${this._panelPreset ? this._panel("preset_mode", presetModes, st.attributes.preset_mode, false, "preset_mode") : ""}
      </ha-card>
    `;
  }

  /** ===== Animations (same as YAML) ===== */
  _iconAnimClass(mode){
    if(mode==="cool") return "anim-cool";
    if(mode==="heat") return "anim-heat";
    if(mode==="fan_only"||mode==="auto"||mode==="heat_cool") return "anim-rotate";
    if(mode==="dry") return "anim-beat";
    return "";
  }
  _animStyle(mode){
    switch(mode){
      case "cool": return "animation: wobbling 0.7s linear infinite alternate; animation-duration: 1s;";
      case "heat": return "animation: fire 1.5s infinite; transform-origin: 50% 85%;";
      case "fan_only":
      case "auto":
      case "heat_cool": return "animation: rotation 2s linear infinite;";
      case "dry": return "animation: beat 1.3s ease-out infinite both;";
      default: return "animation-duration: 0s;";
    }
  }

  /** ===== Rows ===== */
  _rowHVAC(list, current){
    if(!list || !list.length) return html``;
    return html`
      <div class="row hvac_mode">
        ${list.map(m=>{
          const active = String(m)===String(current);
          const cls = `btn ${active?'active '+m:''}`;
          const ic = MODE_ICONS[m] || 'mdi:thermostat';
          return html`<div class="${cls}" title="${m}" @click=${()=>this._setMode(m)}>
            <ha-icon icon="${ic}"></ha-icon>
          </div>`;
        })}
      </div>
    `;
  }
  _rowFan(type, list, current){
    if(!list || !list.length) return html``;
    return html`
      <div class="row fan_mode">
        ${list.map(v=>{
          const active = String(v)===String(current);
          const cls = `btn ${active?'active auto':''}`;
          const ic = fanIcon(String(v));
          return html`<div class="${cls}" title="${v}" @click=${()=>this._setOption(type, v)}>
            <ha-icon icon="${ic}"></ha-icon>
          </div>`;
        })}
      </div>
    `;
  }
  _rowText(type, list, current, kind /* 'swing_mode' | 'preset_mode' */){
    if(!list || !list.length) return html``;
    const rowCls = `row ${kind}`;
    return html`
      <div class="${rowCls}">
        ${list.map(v=>{
          const active = String(v)===String(current);
          const cls = `btn ${active?'active auto':''}`;
          return html`<div class="${cls}" title="${v}" @click=${()=>this._setOption(type, v)}>
            <span class="label">${String(v).replaceAll("_"," ").toLowerCase()}</span>
          </div>`;
        })}
      </div>
    `;
  }

  /** ===== Chips & Panels ===== */
  _renderChips(st, {hvacModes, fanModes, swingModes, presetModes}){
    // chips-left: temperature / humidity
    const curT = st.attributes.current_temperature;
    const curH = st.attributes.current_humidity != null ? Math.round(st.attributes.current_humidity) : undefined;

    const left = html`
      <span class="chip blue"><ha-icon class="icon" icon="mdi:thermometer"></ha-icon>${curT!=null?`${curT}°C`:"-"}</span>
      <span class="chip"><ha-icon class="icon" icon="mdi:water"></ha-icon>${curH!=null?`${curH}%`:"-"}</span>
    `;

    // chips-right: per config === 'chip'
    const right = html`
      ${ (this._config.show_preset==="chip" && presetModes.length) ? html`
        <span class="chip purple click ${this._panelPreset?'active':''}" @click=${()=>this._togglePanel("preset")} title="preset">
          <ha-icon class="icon" icon="mdi:tune-variant"></ha-icon>${st.attributes.preset_mode || "-"}
        </span>` : ""}
      ${ (this._config.show_swing==="chip" && swingModes.length) ? html`
        <span class="chip yellow click ${this._panelSwing?'active':''}" @click=${()=>this._togglePanel("swing")} title="swing">
          <ha-icon class="icon" icon="${swingIcon(st.attributes.swing_mode)}"></ha-icon>${st.attributes.swing_mode || "-"}
        </span>` : ""}
      ${ (this._config.show_fan==="chip" && fanModes.length) ? html`
        <span class="chip green click ${this._panelFan?'active':''}" @click=${()=>this._togglePanel("fan")} title="fan">
          <ha-icon class="icon" icon="${fanIcon(st.attributes.fan_mode)}"></ha-icon>${st.attributes.fan_mode || "-"}
        </span>` : ""}
    `;
    // (optional) hvac chip — ทำได้ แต่ตามสเปกเรายังไม่ต้อง show_hvac=chip (ถ้าต้องการค่อยเพิ่ม)

    return html`<div class="chips"><div class="chips-left">${left}</div><div class="chips-right">${right}</div></div>`;
  }

  _panel(type, list, current, useIcons=false, kind=null){
    if(!list || !list.length) return html``;
    // if kind given -> "swing_mode"/"preset_mode" for row styling
    const panelCls = `panel ${kind || type}`;
    return html`
      <div class="${panelCls}">
        <div class="panel-row">
          ${list.map(v=>{
            const active = String(v)===String(current);
            const cls = `btn ${active?'active auto':''}`;
            return html`<div class="${cls}" title="${v}" @click=${()=>this._setOption(type, v)}>
              ${useIcons ? html`<ha-icon icon="${fanIcon(String(v))}"></ha-icon>`
                         : html`<span class="label">${String(v).replaceAll("_"," ").toLowerCase()}</span>`}
            </div>`;
          })}
        </div>
      </div>
    `;
  }

  /** ===== Actions / Services ===== */
  _togglePanel(which){
    this._panelFan   = which==="fan"    ? !this._panelFan    : false;
    this._panelSwing = which==="swing"  ? !this._panelSwing  : false;
    this._panelPreset= which==="preset" ? !this._panelPreset : false;
    this.requestUpdate();
  }
  _adjustTemp(delta){
    const st=this.hass.states[this._config.entity];
    const cur=Number(st.attributes.temperature??st.attributes.target_temperature);
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

  /** ===== Utils ===== */
  _softBg(color){
    try{
      if(color && color[0]==="#"){
        const c = color.substring(1);
        const num = parseInt(c,16);
        const r = (num>>16)&0xFF, g = (num>>8)&0xFF, b = num&0xFF;
        return `rgba(${r},${g},${b},0.15)`;
      }
      return "rgba(255,255,255,0.10)";
    }catch(e){ return "rgba(255,255,255,0.10)"; }
  }
}

/** ===== Define element ===== */
try {
  if (!customElements.get("simply-thermostat-card")) {
    customElements.define("simply-thermostat-card", SimplyThermostatCardV6);
    console.info("✅ Simply Thermostat Card registered (v6)");
  }
} catch(e) {
  console.error("❌ Failed to define simply-thermostat-card:", e);
}

/** ===== Registry (for HA card picker) ===== */
window.customCards = window.customCards || [];
window.customCards.push({
  type:"simply-thermostat-card",
  name:"Simply Thermostat Card",
  description:"Style A thermostat: 4 rows (HVAC/Fan/Swing/Preset), chip toggles, YAML-like animations, v6."
});
