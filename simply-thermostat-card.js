const STC_VERSION = "2.0.0";
console.info(`%c Simply Thermostat Card v${STC_VERSION} loaded`, "color:#4caf50;font-weight:bold");

const MODE_ICONS = {
  off:"mdi:power", cool:"mdi:snowflake", heat:"mdi:fire", dry:"mdi:water-percent",
  fan_only:"mdi:fan", auto:"mdi:autorenew", heat_cool:"mdi:autorenew"
};
const MODE_COLORS = {
  off:"#9e9e9e", cool:"#2196f3", heat:"#f44336", dry:"#1bcacc",
  fan_only:"#ff9800", auto:"#4caf50", heat_cool:"#4caf50"
};
const ACTION_LABELS = {
  off:"Off", idle:"Idle", cooling:"Cooling", heating:"Heating", drying:"Drying",
  fan:"Fan", defrosting:"Defrosting", preheating:"Preheating"
};

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const label = (v) => String(v ?? "-").replaceAll("_", " ");
function fanIcon(mode){
  const m=String(mode||"").toLowerCase();
  return m==="auto"?"mdi:fan-auto":m==="low"?"mdi:fan-speed-1":(m==="mid"||m==="medium")?"mdi:fan-speed-2":m==="high"?"mdi:fan-speed-3":"mdi:fan";
}
function swingIcon(mode){
  const m=String(mode||"").toLowerCase();
  if(m.includes("both")||m.includes("all")) return "mdi:swap-vertical-circle";
  if(m.includes("h")||m.includes("hor")) return "mdi:swap-horizontal";
  return "mdi:swap-vertical";
}

class SimplyThermostatCard extends HTMLElement {
  constructor(){
    super();
    this.attachShadow({mode:"open"});
    this._panels={fan:false,swing:false,preset:false};
  }
  setConfig(c){
    if(!c?.entity) throw new Error("Entity is required");
    this._config={
      entity:c.entity, name:c.name,
      show_hvac:c.show_hvac??true, show_fan:c.show_fan??true,
      show_swing:c.show_swing??true, show_preset:c.show_preset??true,
      step:c.step!=null?Number(c.step):null,
      icon_size:Number(c.icon_size??36)
    };
    this._panels={fan:false,swing:false,preset:false};
    this._render();
  }
  set hass(hass){ this._hass=hass; this._render(); }
  get hass(){ return this._hass; }
  static getStubConfig(hass){
    const entity=Object.keys(hass?.states||{}).find(e=>e.startsWith("climate."));
    return entity?{entity,show_hvac:true,show_fan:"chip",show_swing:"chip",show_preset:"chip"}:{};
  }
  static async getConfigElement(){ return document.createElement("simply-thermostat-card-editor"); }
  static getEntitySuggestion(){ return {domain:"climate"}; }
  getCardSize(){ return 3; }

  _render(){
    if(!this.shadowRoot||!this._config||!this._hass) return;
    const st=this._hass.states?.[this._config.entity];
    if(!st){ this.shadowRoot.innerHTML=`<ha-card><div style="padding:16px;color:var(--secondary-text-color)">Entity not found: ${esc(this._config.entity)}</div></ha-card>`; return; }
    const a=st.attributes||{};
    const mode=st.state;
    const action=a.hvac_action || (mode==="off"?"off":"idle");
    const actionText=ACTION_LABELS[action] || label(action);
    const target=a.temperature ?? a.target_temperature;
    const hvac=a.hvac_modes||[], fan=a.fan_modes||[], swing=a.swing_modes||[], preset=a.preset_modes||[];
    const name=this._config.name || a.friendly_name || this._config.entity;
    const color=MODE_COLORS[mode]||"var(--state-climate-active-color,var(--primary-color))";
    let meta=`State: ${actionText}`;
    if(a.current_temperature!=null) meta+=`\nT: ${Number(a.current_temperature).toFixed(1)}°${this._hass.config?.unit_system?.temperature||"C"}`;
    if(a.current_humidity!=null) meta+=`${a.current_temperature!=null?" | ":"\n"}H: ${Math.round(a.current_humidity)}%`;

    this.shadowRoot.innerHTML=`<style>${this._styles()}</style><ha-card>
      <div class="top"><div class="header"><div class="icon-wrap" style="--mode:${color}"><ha-icon class="mode-icon ${esc(mode)}" icon="${esc(MODE_ICONS[mode]||"mdi:thermostat")}"></ha-icon></div><div><div class="name">${esc(name)}</div><div class="meta">${esc(meta)}</div></div></div>
      <div class="temp"><button class="icon-btn" data-action="temp-down" aria-label="Decrease target temperature"><ha-icon icon="mdi:minus"></ha-icon></button><div class="temp-value">${target!=null?esc(target)+"°":"-"}</div><button class="icon-btn" data-action="temp-up" aria-label="Increase target temperature"><ha-icon icon="mdi:plus"></ha-icon></button></div></div>
      ${this._config.show_hvac===true?this._row("hvac",hvac,mode,true):""}
      ${this._config.show_fan===true?this._row("fan",fan,a.fan_mode,true):""}
      ${this._config.show_swing===true?this._row("swing",swing,a.swing_mode,false):""}
      ${this._config.show_preset===true?this._row("preset",preset,a.preset_mode,false):""}
      ${this._chips(a,{fan,swing,preset})}
      ${this._panels.fan?this._panel("fan",fan,a.fan_mode,true):""}
      ${this._panels.swing?this._panel("swing",swing,a.swing_mode,false):""}
      ${this._panels.preset?this._panel("preset",preset,a.preset_mode,false):""}
    </ha-card>`;
    this._bind();
  }

  _styles(){return `
    :host{display:block} ha-card{padding:12px;border-radius:var(--ha-card-border-radius,12px);background:var(--ha-card-background,var(--card-background-color));color:var(--primary-text-color)}
    .top{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:start}.header{display:flex;gap:12px;align-items:flex-start;min-width:0}.name{font-weight:700;font-size:1.06rem;line-height:1.22}.meta{font-size:.92rem;color:var(--secondary-text-color);line-height:1.35;white-space:pre-line}
    .icon-wrap{width:${this._config.icon_size}px;height:${this._config.icon_size}px;display:grid;place-items:center;border-radius:50%;background:color-mix(in srgb,var(--mode) 15%,transparent);flex:0 0 auto}.mode-icon{color:var(--mode)}
    .temp{display:flex;align-items:center;justify-content:center}.temp-value{font-size:35px;color:var(--primary-text-color);font-weight:700;min-width:72px;text-align:center}.icon-btn,.btn,.chip{font:inherit;border:0;cursor:pointer;color:inherit}.icon-btn{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:transparent;color:var(--secondary-text-color)}.icon-btn:hover,.icon-btn:focus-visible{background:var(--secondary-background-color);outline:2px solid transparent}
    .row,.panel-row{display:flex;gap:12px;margin-top:8px}.btn{flex:1 1 0;min-width:0;height:44px;border-radius:10px;background:var(--secondary-background-color);color:var(--secondary-text-color);display:flex;align-items:center;justify-content:center;padding:0 8px;font-weight:600}.btn:hover,.btn:focus-visible{filter:brightness(1.08);outline:2px solid var(--primary-color)}.btn.active{color:var(--primary-color);background:color-mix(in srgb,var(--primary-color) 15%,var(--secondary-background-color))}.btn.active.cool{color:#2196f3}.btn.active.heat{color:#f44336}.btn.active.dry{color:#1bcacc}.btn.active.fan_only{color:#ff9800}.btn.active.auto,.btn.active.heat_cool{color:#4caf50}.label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-transform:lowercase}
    .chips{display:flex;justify-content:center;margin-top:10px}.chip-list{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}.chip{display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:16px;background:transparent;color:var(--secondary-text-color)}.chip.active{background:var(--secondary-background-color);color:var(--primary-color)}.panel .btn{height:40px}
    @keyframes wobble{from{transform:rotate(-45deg)}to{transform:rotate(25deg)}}@keyframes rotate{to{transform:rotate(360deg)}}@keyframes beat{50%{transform:scale(1.14)}}@keyframes fire{50%{transform:rotate(2deg) scaleY(1.08)}}
    .mode-icon.cool{animation:wobble 1s linear infinite alternate}.mode-icon.heat{animation:fire 1.4s ease-in-out infinite;transform-origin:50% 85%}.mode-icon.fan_only,.mode-icon.auto,.mode-icon.heat_cool{animation:rotate 2s linear infinite}.mode-icon.dry{animation:beat 1.3s ease-out infinite}
    @media(max-width:480px){.top{grid-template-columns:1fr}.temp{justify-content:flex-end;margin-top:-4px}.row,.panel-row{gap:6px}.btn{height:42px;padding:0 4px}.temp-value{font-size:31px}}
    @media(prefers-reduced-motion:reduce){.mode-icon{animation:none!important}}
  `}
  _row(kind,list,current,icons){ if(!list?.length)return""; return `<div class="row">${list.map(v=>this._button(kind,v,current,icons)).join("")}</div>`; }
  _panel(kind,list,current,icons){ if(!list?.length)return""; return `<div class="panel"><div class="panel-row">${list.map(v=>this._button(kind,v,current,icons)).join("")}</div></div>`; }
  _button(kind,v,current,icons){
    const active=String(v)===String(current), modeClass=kind==="hvac"?String(v):"";
    const icon=kind==="hvac"?(MODE_ICONS[v]||"mdi:thermostat"):fanIcon(v);
    return `<button class="btn ${active?"active":""} ${esc(modeClass)}" data-kind="${kind}" data-value="${esc(v)}" aria-pressed="${active}" aria-label="Set ${kind} to ${esc(label(v))}">${icons?`<ha-icon icon="${esc(icon)}"></ha-icon>`:`<span class="label">${esc(label(v))}</span>`}</button>`;
  }
  _chips(a,lists){
    const out=[];
    for(const kind of ["preset","swing","fan"]){
      if(this._config[`show_${kind}`]!=="chip"||!lists[kind]?.length) continue;
      const value=a[`${kind}_mode`]; const icon=kind==="fan"?fanIcon(value):kind==="swing"?swingIcon(value):"mdi:tune-variant";
      out.push(`<button class="chip ${this._panels[kind]?"active":""}" data-panel="${kind}" aria-expanded="${this._panels[kind]}"><ha-icon icon="${icon}"></ha-icon>${esc(value||"-")}</button>`);
    }
    return out.length?`<div class="chips"><div class="chip-list">${out.join("")}</div></div>`:"";
  }
  _bind(){
    this.shadowRoot.querySelectorAll("[data-kind]").forEach(b=>b.addEventListener("click",()=>this._set(b.dataset.kind,b.dataset.value)));
    this.shadowRoot.querySelectorAll("[data-panel]").forEach(b=>b.addEventListener("click",()=>{const k=b.dataset.panel;this._panels={fan:false,swing:false,preset:false};this._panels[k]=!b.classList.contains("active");this._render();}));
    this.shadowRoot.querySelector('[data-action="temp-down"]')?.addEventListener("click",()=>this._adjustTemp(-1));
    this.shadowRoot.querySelector('[data-action="temp-up"]')?.addEventListener("click",()=>this._adjustTemp(1));
  }
  _adjustTemp(direction){
    const st=this._hass.states[this._config.entity], a=st.attributes||{};
    const cur=Number(a.temperature??a.target_temperature); if(!Number.isFinite(cur))return;
    const step=Number.isFinite(this._config.step)&&this._config.step>0?this._config.step:Number(a.target_temp_step)||1;
    const min=Number.isFinite(Number(a.min_temp))?Number(a.min_temp):-Infinity, max=Number.isFinite(Number(a.max_temp))?Number(a.max_temp):Infinity;
    const value=Math.min(max,Math.max(min,Math.round((cur+direction*step)*100)/100));
    this._hass.callService("climate","set_temperature",{entity_id:this._config.entity,temperature:value});
  }
  _set(kind,value){
    const map={hvac:["set_hvac_mode","hvac_mode"],fan:["set_fan_mode","fan_mode"],swing:["set_swing_mode","swing_mode"],preset:["set_preset_mode","preset_mode"]};
    const x=map[kind]; if(!x)return; this._hass.callService("climate",x[0],{entity_id:this._config.entity,[x[1]]:value});
  }
}

class SimplyThermostatCardEditor extends HTMLElement {
  constructor(){super();this.attachShadow({mode:"open"});}
  set hass(v){this._hass=v;this._render();} get hass(){return this._hass;}
  setConfig(v){this._config={...v};this._render();}
  _render(){
    if(!this.shadowRoot||!this._config||!this._hass)return;
    const entities=Object.keys(this._hass.states||{}).filter(e=>e.startsWith("climate.")).sort();
    const visibility=(key)=>["true","chip","false"].map(v=>`<option value="${v}" ${String(this._config[key])===v?"selected":""}>${v}</option>`).join("");
    this.shadowRoot.innerHTML=`<style>:host{display:block;padding:8px 0;color:var(--primary-text-color)}label{display:block;margin:12px 0 4px;font-weight:600}select,input{box-sizing:border-box;width:100%;padding:10px;border:1px solid var(--divider-color);border-radius:8px;background:var(--card-background-color);color:var(--primary-text-color)}</style>
      <label>Climate entity</label><select data-key="entity">${entities.map(e=>`<option value="${esc(e)}" ${e===this._config.entity?"selected":""}>${esc(e)}</option>`).join("")}</select>
      <label>Name (optional)</label><input data-key="name" value="${esc(this._config.name||"")}">
      ${["hvac","fan","swing","preset"].map(k=>`<label>Show ${k.toUpperCase()}</label><select data-key="show_${k}">${visibility(`show_${k}`)}</select>`).join("")}
      <label>Temperature step (blank = entity default)</label><input data-key="step" type="number" min="0.1" step="0.1" value="${this._config.step??""}">
      <label>Icon size</label><input data-key="icon_size" type="number" min="24" max="64" value="${this._config.icon_size??36}">`;
    this.shadowRoot.querySelectorAll("select,input").forEach(el=>el.addEventListener("change",()=>this._changed(el)));
  }
  _changed(el){
    const c={...this._config}, k=el.dataset.key, v=el.value;
    if(k.startsWith("show_")) c[k]=v==="true"?true:v==="false"?false:v;
    else if(k==="step"||k==="icon_size") { if(v==="") delete c[k]; else c[k]=Number(v); }
    else if(k==="name"&&v==="") delete c[k]; else c[k]=v;
    this._config=c; this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:c},bubbles:true,composed:true}));
  }
}

if(!customElements.get("simply-thermostat-card")) customElements.define("simply-thermostat-card",SimplyThermostatCard);
if(!customElements.get("simply-thermostat-card-editor")) customElements.define("simply-thermostat-card-editor",SimplyThermostatCardEditor);
window.customCards=window.customCards||[];
if(!window.customCards.some(c=>c.type==="simply-thermostat-card")) window.customCards.push({type:"simply-thermostat-card",name:"Simply Thermostat Card",description:"Compact climate thermostat with HVAC, fan, swing and preset controls.",preview:true});
console.info(`%c Simply Thermostat Card registered v${STC_VERSION}`,"color:#4caf50;font-weight:bold");
