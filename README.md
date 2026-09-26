# Simply Thermostat Card

A compact, modern custom climate card for Home Assistant.

Designed for standard `climate.*` entities including ESPHome, Zigbee2MQTT, LocalTuya, IR gateways and virtual AC integrations. It provides HVAC, fan, swing and preset controls in one responsive card while automatically hiding unsupported capabilities.

## Features

- HVAC, fan, swing and preset controls
- `true`, `chip`, or `false` visibility for each control group
- Current temperature and humidity display when provided by the entity
- Real operating state from `hvac_action` (for example Cooling vs Idle)
- Animated HVAC icon with reduced-motion support
- Automatic `target_temp_step` support
- Automatic `min_temp` / `max_temp` protection
- Home Assistant theme variables and light/dark theme support
- Keyboard-accessible native buttons and ARIA labels
- Responsive mobile layout
- Built-in visual card editor
- Card picker registration and `climate` entity suggestion
- No dependency on `mwc-*` controls or Home Assistant's internal Lit implementation

## Installation

### HACS custom repository

Add this repository to HACS as a Dashboard custom repository, install **Simply Thermostat Card**, then reload Home Assistant/frontend resources.

### Manual

Copy `simply-thermostat-card.js` to:

```text
/config/www/community/simply-thermostat-card/simply-thermostat-card.js
```

Add the resource:

```yaml
resources:
  - url: /local/community/simply-thermostat-card/simply-thermostat-card.js
    type: module
```

Then hard-refresh the browser. The console should report `Simply Thermostat Card registered v2.0.0`.

## Configuration

The card can be configured from the Home Assistant visual editor or YAML.

```yaml
type: custom:simply-thermostat-card
entity: climate.living_room
show_hvac: true
show_fan: chip
show_swing: chip
show_preset: false
```

Optional settings:

```yaml
name: Living Room
step: 0.5       # omit to use entity target_temp_step, then fallback to 1
icon_size: 36
```

Visibility values:

```yaml
show_hvac: true     # always visible
show_fan: chip      # compact chip that expands controls
show_swing: false   # hidden
show_preset: chip
```

A control is also omitted when the selected climate entity does not expose the corresponding mode list.

## Climate behavior

The entity state is treated as the selected HVAC mode, while `hvac_action` is used for the current operating state. This means an inverter AC can correctly show `State: Idle` while its selected HVAC mode remains `cool`.

Temperature adjustment uses the entity's `target_temp_step` unless `step` is explicitly configured. Values are clamped to `min_temp` and `max_temp` before `climate.set_temperature` is called.

## Compatibility

v2.0.0 uses a native Web Component implementation. It intentionally avoids `mwc-icon-button` and does not derive LitElement from Home Assistant private frontend elements. Standard Home Assistant elements such as `ha-card` and `ha-icon` are used for presentation.

## Credits

**Author:** Kamui Shirou / zookzon  
**Project:** Simply Thermostat Card  
**License:** MIT

The original design was inspired by Mushroom-style thermostat layouts and Simple Thermostat concepts. v2 preserves the original Simply Thermostat interaction model while modernizing its Home Assistant frontend integration.

## Version history

See [CHANGELOG.md](CHANGELOG.md) for full details.

Current development release: **v2.0.0**.
