# Simply Thermostat Card (YAML UI, Compat)

Single custom card that replicates your YAML stack:
- Header with mode icon/color + cooling animation
- Big temperature with +/-
- Mode icon row (off/cool/dry/fan_only/heat) with themed active color
- Chips: temperature, humidity, weather (optional), fan toggle
- Fan panel (auto/low/medium/high)

## Example
```yaml
type: custom:simply-thermostat-card
entity: climate.air_lg_mom
name: Air LG Mom
weather_entity: weather.tmd_weather_forecast  # optional
```
