# Simply Thermostat Card

A modern and minimal **Lovelace thermostat card** for Home Assistant.

## Features
- Chip Header color-coded by hvac_mode
- Cooling animation
- Temperature +/− controls
- Toggleable rows (mode, fan, swing, preset)
- Chip toggle bar for hidden rows
- HACS ready

## Installation
### HACS
1. Add repo to HACS
2. Install & restart
3. Add resource:
   ```yaml
   - url: /hacsfiles/simply-thermostat-card/simply-thermostat-card.js
     type: module
   ```

### Manual
Copy `simply-thermostat-card.js` to `/config/www/community/simply-thermostat-card/`.

## Usage
```yaml
type: custom:simply-thermostat-card
entity: climate.air_lg_me
name: Air LG Me
show_current: true
show_state: true
chip_animation: true
show_mode: true
show_fan: false
show_swing: false
show_preset: false
enable_mode_chip: true
enable_fan_chip: true
enable_swing_chip: true
enable_preset_chip: true
modes: ["off","cool","heat","dry","fan_only","auto"]
fan_modes: ["auto","low","medium","high"]
swing_modes: ["off","vertical","horizontal","both"]
preset_modes: ["none","eco","sleep","turbo"]
```

## License
MIT License
