# Simply Thermostat Card (YAML UI Compat v4)

### What's new
- Rows (HVAC / Fan / Swing / Preset) now **distribute buttons across full width** (space-between, no wrap, no scroll).
- Fan & Swing buttons use **icons** only; Preset uses **text** only.
- Header icon color follows **HVAC mode** (fixed for `heat`).

### Config
```yaml
type: custom:simply-thermostat-card
entity: climate.virtual_ac_5
show_fan: chip        # true | "chip" | false
show_swing: true      # true | "chip" | false
show_preset: false    # true | "chip" | false
```
