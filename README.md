# Simply Thermostat Card (YAML UI Compat v2)

- Header with dynamic icon/color + animations (cool/heat/fan/auto/heat_cool/dry)
- Big target temp with real + / − icons
- HVAC mode row: auto-sync from `hvac_modes`
- Optional rows/chips: fan, swing, preset (`row` | `chip` | `false`)
- Panels appear at the **bottom** when toggled from chips

## Example
```yaml
type: custom:simply-thermostat-card
entity: climate.virtual_ac_5
name: Virtual AC 5
weather_entity: weather.tmd_weather_forecast
show_fan: chip
show_swing: chip
show_preset: chip
```
