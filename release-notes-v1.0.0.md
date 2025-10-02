# 📜 Release Notes — v1.0.0

## 🚀 First Release of Simply Thermostat Card

This is the first public release of **Simply Thermostat Card**, a custom Lovelace card for [Home Assistant](https://www.home-assistant.io).  
The card provides a minimal and modern thermostat interface with chip-based header and flexible controls.

---

### ✨ Features
- **Chip Header**: Small circular chip replaces the default power icon, color-coded by `hvac_mode`  
  - Cool → Blue  
  - Heat → Red  
  - Dry → Yellow  
  - Fan Only → Light Blue  
  - Auto → Green  
  - Off → Grey  
- **Animated Cooling Mode**: The header chip animates when cooling.  
- **Temperature Controls**: Large `+` / `−` buttons with the target temperature in the center.  
- **Configurable Rows**: Show or hide rows for Mode, Fan, Swing, and Preset.  
- **Chip Toggle Bar**: Hidden rows can be quickly toggled back using pill-style chips at the bottom.  
- **HACS Ready**: Can be installed via [HACS](https://hacs.xyz) or manually.  

---

### 📦 Installation

#### HACS (Recommended)
1. Add this repository as a **Custom Repository** in HACS → Frontend.  
2. Install the card and restart Home Assistant.  
3. Add the resource:
   ```yaml
   - url: /hacsfiles/simply-thermostat-card/simply-thermostat-card.js
     type: module
   ```

#### Manual
1. Copy `dist/simply-thermostat-card.js` into:
   ```
   <config>/www/community/simply-thermostat-card/
   ```
2. Add the resource:
   ```yaml
   lovelace:
     resources:
       - url: /local/community/simply-thermostat-card/simply-thermostat-card.js
         type: module
   ```

---

### 🛠 Example Configuration
```yaml
type: custom:simply-thermostat-card
entity: climate.air_lg_me
name: Air LG Me

# Header
show_current: true
show_state: true
chip_animation: true

# Rows
show_mode: true
show_fan: false
show_swing: false
show_preset: false

# Chip toggle bar
enable_mode_chip: true
enable_fan_chip: true
enable_swing_chip: true
enable_preset_chip: true

# Optional overrides
modes: ["off","cool","heat","dry","fan_only","auto"]
fan_modes: ["auto","low","medium","high"]
swing_modes: ["off","vertical","horizontal","both"]
preset_modes: ["none","eco","sleep","turbo"]
```

---

### 📝 Notes
- This release is considered **stable for daily use**.  
- Feedback and contributions are welcome!  
- Please report issues on the [GitHub Issues](../../issues) page.  
