# Simply Thermostat Card (YAML UI Compat v3)

- Header icon color now follows **HVAC mode** (with animations).
- Target temp +/− use real icons.
- HVAC modes row: auto from `hvac_modes`.
- Fan/Swing use **icons**; Preset uses **text**.
- Config flags: `true` = show as row, `"chip"` = show as chip (panel at bottom), `false` = hide.
- Rows are single-line (no wrap) with horizontal scroll if overflow.
- Chips: Temperature, Humidity, and optional Fan/Swing/Preset according to config.
- **Weather chip removed**.

## Example
```yaml
type: custom:simply-thermostat-card
entity: climate.virtual_ac_5
show_fan: chip        # true | "chip" | false
show_swing: true      # true | "chip" | false
show_preset: false    # true | "chip" | false
```
