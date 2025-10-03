console.info("%c Simply-Thermostat-Card (yaml-ui compat) loaded", "color: lime; font-weight: bold");
const LitElementBase = window.LitElement || Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = window.html || LitElementBase.prototype.html;
const css = window.css || LitElementBase.prototype.css;
const MODE_ICONS = {off:"mdi:power",cool:"mdi:snowflake",heat:"mdi:fire",dry:"mdi:water-percent",fan_only:"mdi:autorenew",auto:"mdi:home-thermometer"};
const MODE_COLORS = {off:"grey",cool:"#2196f3",heat:"#f44336",dry:"#1BCACC",fan_only:"#ff9800",auto:"#4caf50"};
class SimplyThermostatCard extends LitElementBase{
  static get properties(){return{hass:{attribute:false},_config:{attribute:false},_showFanPanel:{type:Boolean}}}
  static get styles(){return css`
    ha-card{background:var(--ha-card-background,#1f1f1f);border-radius:12px;padding:10px 10px 6px 10px}
    .grid2{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:start}
    .header{display:flex;align-items:center;gap:10px}
    .header .name{font-weight:700;font-size:.95rem}
    .header .meta{font-size:.82rem;color:#cfcfcf;line-height:1.25}
    .header .icon-wrap{width:32px;height:32px;display:grid;place-items:center;border-radius:50%;background:rgba(255,255,255,.06)}
    .status-anim{animation:wobbling .7s linear infinite alternate}
    @keyframes wobbling{0%{transform:rotate(-12deg)}100%{transform:rotate(12deg)}}
    .temp-block{display:flex;align-items:center;justify-content:center;gap:14px;padding-top:6px}
    .temp-value{font-size:35px;color:#fff;font-weight:700;min-width:72px;text-align:center}
    mwc-icon-button{--mdc-theme-text-primary-on-background:#9e9e9e;color:#9e9e9e}
    .mode-row{margin-top:6px;display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
    .mode-btn{border-radius:10px;background:#2d2d2d;color:#9e9e9e;display:grid;place-items:center;height:48px;cursor:pointer;transition:background .15s,color .15s}
    .mode-btn:hover{background:#363636;color:#cfcfcf}
    .mode-btn.active.off{background:#363636;color:#9e9e9e}
    .mode-btn.active.cool{background:#1d3447;color:#2196f3}
    .mode-btn.active.heat{background:#472421;color:#f44336}
    .mode-btn.active.dry{background:#164749;color:#1BCACC}
    .mode-btn.active.fan_only{background:#493516;color:#ff9800}
    .mode-btn.active.auto{background:#263926;color:#4caf50}
    .chips{display:flex;gap:10px;align-items:center;justify-content:space-between;padding:4px 2px 0 2px}
    .chip{display:inline-flex;align-items:center;gap:6px;background:transparent;color:#cfe7ff;font-size:.82rem;padding:2px 6px;border-radius:16px}
    .chip .icon{color:#00bcd4}.chip.blue .icon{color:#2196f3}.chip.green .icon{color:#4caf50}
    .fan-panel{margin:6px 8px}
    .fan-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
    .fan-btn{border-radius:10px;background:#2d2d2d;color:#9e9e9e;height:42px;display:grid;place-items:center;cursor:pointer}
    .fan-btn.active{background:#263926;color:#4caf50}
    .fan-btn:hover{background:#363636;color:#cfcfcf}
    .vcenter{display:flex;align-items:center;justify-content:center}.muted{color:#6f6f6f}`}
  setConfig(c){if(!c||!c.entity)throw new Error("Entity is required");this._config={entity:c.entity,name:c.name,weather_entity:c.weather_entity,chip_temp:c.chip_temp!==false,chip_humi:c.chip_humi!==false,chip_weather:c.chip_weather!==false,chip_fan:c.chip_fan!==false};this._showFanPanel=false}
  render(){const st=this.hass?.states?.[this._config.entity];if(!st)return html`<ha-card><div class="muted">Entity not found: ${this._config.entity}</div></ha-card>`;
    const hvacMode=st.state;const hvacAction=st.attributes.hvac_action||(hvacMode==="off"?"off":"idle");const icon=MODE_ICONS[hvacMode]||MODE_ICONS.auto;const iconColor=MODE_COLORS[hvacAction]||"grey";const friendly=this._config.name||st.attributes.friendly_name||this._config.entity;const currentT=st.attributes.current_temperature;const currentH=st.attributes.current_humidity!=null?Math.round(st.attributes.current_humidity):undefined;const actionText=({off:"Off",cool:"Cooling",heat:"Heating",dry:"Dry",fan_only:"Fan",idle:"Idle"}[hvacAction]||"Idle");const stateLine=`Currently: ${actionText}\nState: ${currentT!=null?currentT+"°C":"-"}${currentH!=null?"/"+currentH+"%":""}`;const target=st.attributes.temperature??st.attributes.target_temp_low??st.attributes.target_temp_high??"-";
    return html`
      <ha-card>
        <div class="grid2">
          <div>
            <div class="header">
              <div class="icon-wrap">
                <ha-icon class="${hvacMode==='cool'?'status-anim':''}" style="color:${iconColor}" .icon=${icon}></ha-icon>
              </div>
              <div>
                <div class="name">${friendly}</div>
                <div class="meta" style="white-space:pre-line">${stateLine}</div>
              </div>
            </div>
          </div>
          <div class="vcenter">
            <mwc-icon-button title="Decrease" icon="mdi:minus" @click=${()=>this._adjustTemp(-1)}></mwc-icon-button>
            <div class="temp-value">${target!=="-"?`${target}°C`:"-"}</div>
            <mwc-icon-button title="Increase" icon="mdi:plus" @click=${()=>this._adjustTemp(1)}></mwc-icon-button>
          </div>
        </div>
        <div class="mode-row">
          ${this._modeBtn("off","mdi:power",hvacMode)}
          ${this._modeBtn("cool","mdi:snowflake",hvacMode)}
          ${this._modeBtn("dry","mdi:water-percent",hvacMode)}
          ${this._modeBtn("fan_only","mdi:autorenew",hvacMode)}
          ${this._modeBtn("heat","mdi:fire",hvacMode)}
        </div>
        <div class="chips">
          ${this._config.chip_temp?html`<span class="chip blue"><ha-icon class="icon" icon="mdi:thermometer"></ha-icon>${currentT!=null?`${currentT}°C`:"-"}</span>`:""}
          ${this._config.chip_humi?html`<span class="chip"><ha-icon class="icon" icon="mdi:water"></ha-icon>${currentH!=null?`${currentH}%`:"-"}</span>`:""}
          ${this._config.chip_weather&&this._config.weather_entity?this._weatherChip(this._config.weather_entity):html`<span></span>`}
          ${this._config.chip_fan?html`<span class="chip green" @click=${this._toggleFanPanel}>${this._fanIconAndText(st)}</span>`:""}
        </div>
        ${this._showFanPanel?this._renderFanPanel(st):""}
      </ha-card>`}
  _modeBtn(mode,mdi,current){const active=String(mode)===String(current);const cls=`mode-btn ${active?"active "+mode:""}`;return html`<div class="${cls}" title=${mode} @click=${()=>this._setMode(mode)}><ha-icon icon="${mdi}"></ha-icon></div>`}
  _weatherChip(eid){const we=this.hass?.states?.[eid];if(!we)return html`<span class="chip"></span>`;const label=`${we.state||""}${we.attributes.temperature!=null?" / "+we.attributes.temperature+"°C":""}`;return html`<span class="chip"><ha-icon class="icon" icon="mdi:weather-partly-cloudy"></ha-icon>${label}</span>`}
  _fanIconAndText(st){const fm=st.attributes.fan_mode;const icon=fm==="auto"?"mdi:fan-auto":fm==="low"?"mdi:fan-speed-1":(fm==="medium"||fm==="mid")?"mdi:fan-speed-2":fm==="high"?"mdi:fan-speed-3":"mdi:fan";return html`<ha-icon class="icon" icon="${icon}"></ha-icon>${fm||"-"}`}
  _renderFanPanel(st){const current=st.attributes.fan_mode;const btn=(val,label,icon)=>html`<div class="fan-btn ${String(current)===String(val)?"active":""}" @click=${()=>this._setFan(val)} title="${label}"><ha-icon icon="${icon}"></ha-icon></div>`;return html`<div class="fan-panel"><div class="fan-row">
      ${btn("auto","auto","mdi:fan-auto")}
      ${btn("low","low","mdi:fan-speed-1")}
      ${btn("medium","medium","mdi:fan-speed-2")}
      ${btn("high","high","mdi:fan-speed-3")}
    </div></div>`}
  _toggleFanPanel=()=>{this._showFanPanel=!this._showFanPanel;this.requestUpdate()}
  _adjustTemp(d){const st=this.hass.states[this._config.entity];const cur=Number(st.attributes.temperature??st.attributes.target_temperature??st.attributes.target_temp_low??st.attributes.target_temp_high);if(Number.isFinite(cur)){const next=cur+d;this.hass.callService("climate","set_temperature",{entity_id:this._config.entity,temperature:next})}}
  _setMode(m){this.hass.callService("climate","set_hvac_mode",{entity_id:this._config.entity,hvac_mode:m})}
  _setFan(m){this.hass.callService("climate","set_fan_mode",{entity_id:this._config.entity,fan_mode:m})}
  getCardSize(){return 3}
}
customElements.define("simply-thermostat-card",SimplyThermostatCard);
window.customCards=window.customCards||[];window.customCards.push({type:"simply-thermostat-card",name:"Simply Thermostat Card",description:"Single-card version of the YAML stack (header, temp control, modes, chips, fan panel)"});
