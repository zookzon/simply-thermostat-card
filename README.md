# Simply Thermostat Card

A custom Lovelace card for Home Assistant — built for **Virtual AC / IR Climate entities**  
with a design inspired by *Mushroom Template* and *Simple Thermostat*.

It provides a modern, unified thermostat control card  
with full control over HVAC, Fan, Swing, and Preset modes — in a single beautiful layout.

---

## ✨ Features

✅ **Modern Virtual AC layout**

✅ **4 interactive control rows:**
- HVAC Mode  
- Fan Speed  
- Swing Mode  
- Preset Mode  

✅ **Smart T/H Display**
- If both Temp and Humidity exist → show both  
  → `T: 25°C | H: 46%`
- If only one exists → show that value  
- If none exist → hide the line completely

✅ **Configurable Visibility**
Each mode row can be:
- `true` → always visible  
- `chip` → hidden in a toggle chip  
- `false` → completely disabled  

```yaml
show_hvac: true | chip | false
show_fan: true | chip | false
show_swing: true | chip | false
show_preset: true | chip | false
```

✅ **Animated HVAC Icon**
- `cool`: wobbling ❄️  
- `heat`: fire 🔥  
- `fan_only` / `auto`: rotation 🔄  
- `dry`: heartbeat 💧  

✅ **Centered Chips Panel**
- Fan, Swing, and Preset chips shown in the middle bottom  
- Tap to expand panels with selectable modes

✅ **Mushroom-style colors & shadows**

---

## 🧩 Installation

1. Copy the JS file to:
   ```
   /config/www/community/simply-thermostat-card/simply-thermostat-card-v7.1.js
   ```

2. Add to Lovelace resources:
   ```yaml
   resources:
     - url: /local/community/simply-thermostat-card/simply-thermostat-card-v7.1.js
       type: module
   ```

3. Refresh browser cache (`Ctrl+F5`)  
   You should see in console:
   ```
   ✅ Simply Thermostat Card registered (v7.1)
   ```

---

## ⚙️ Example Configuration

```yaml
type: custom:simply-thermostat-card
entity: climate.virtual_ac_5
show_hvac: true
show_fan: chip
show_swing: chip
show_preset: false
step: 1
```

---

## 🎨 Color Theme

| Mode | Background | Text/Icon |
|------|-------------|-----------|
| off | #363636 | #9e9e9e |
| cool | #1d3447 | #2196f3 |
| heat | #472421 | #f44336 |
| dry | #164749 | #1BCACC |
| fan_only | #493516 | #ff9800 |
| auto / heat_cool | #263926 | #4caf50 |

---

## 🧠 Notes

- Works with all `climate.*` entities  
  (Zigbee2MQTT, ESPHome, LocalTuya, IR Gateway, etc.)
- Fully responsive design  
- Animations match YAML-based Mushroom Template styles  
- The element name **must remain**:
  ```
  type: custom:simply-thermostat-card
  ```
  (Do not rename!)

---

## 🧑‍💻 Credits

**Author:** Kamui Shirou  
**Coded & optimized by:** ChatGPT-5 (October 2025)  
**Framework:** LitElement  
**License:** MIT  

---

## 🕓 Versions

| Version | Date | Summary |
|----------|------|----------|
| v7.1 | 2025-10-12 | Smart T/H display + Final Virtual AC layout |
| v7.0 | 2025-10-11 | New layout rewrite (Virtual AC style) |
| v6.x | 2025-10-10 | Legacy Simply Thermostat with full chip toggle |
| v5.x | 2025-09-30 | Original Mushroom-based version |
