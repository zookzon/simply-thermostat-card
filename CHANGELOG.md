# Changelog

All notable changes to **Simply Thermostat Card** are documented here.

## [v2.0.3] — 2026-09-26

### Fixed
- Fixed intermittent overlap when expanding Fan, Swing, Preset or HVAC chip panels in Home Assistant Sections dashboards.
- Removed the `rows` value from `getGridOptions()` so Home Assistant ignores fixed grid rows and lets the card use its natural content height, as required by the Home Assistant custom-card sizing API.
- Expanded panels now grow the card naturally and push following cards down instead of drawing over them.

### Preserved
- Default width remains 4 columns with a 4-column minimum.
- Responsive expanded-panel wrapping for large fan-mode lists.
- Adaptive fan-speed controls, Fan → Swing → Preset order, and legacy control colors.

## [v2.0.2] — 2026-09-26

### Fixed
- Home Assistant Sections cards now request automatic row height so expanded chip panels can increase the card height instead of overlapping the card below.
- Expanded Fan, Swing, Preset and HVAC panels use a responsive 4-column grid.
- Large fan-mode lists such as 7-speed AC units wrap onto additional rows instead of being compressed into one row.
- Very narrow displays fall back to a 3-column expanded-panel grid.

### Preserved
- Default card width remains 4 columns with a 4-column minimum.
- Adaptive fan-speed numbering and special fan-mode icons from v2.0.1.
- Fan → Swing → Preset chip order and legacy Fan/Swing/Preset colors.

## [v2.0.1] — 2026-09-26

### Changed
- Home Assistant Sections default grid width is now 4 columns with a 4-column minimum.
- Fan speed controls now adapt to the `fan_modes` exposed by each climate entity instead of assuming only Low / Medium / High.
- Numeric fan levels are displayed dynamically for standard speed modes, supporting 4-speed, 7-speed and other fan counts.
- Special fan modes such as Auto, Off, Quiet/Silent/Sleep and Turbo/Powerful/Boost retain dedicated icons.
- Chip order is now Fan → Swing → Preset (HVAC remains first when configured as a chip).
- Expanded Fan, Swing and Preset option text uses normal font weight.
- Restored the legacy control colors: Fan green, Swing gold and Preset cyan.

## [v2.0.0] — 2026-09-26

### Added
- Built-in Home Assistant visual card editor.
- Card picker registration and climate entity suggestion.
- Automatic `target_temp_step` support with configurable override.
- Temperature clamping using entity `min_temp` and `max_temp`.
- Native button controls with keyboard focus and ARIA labels.
- Responsive mobile layout and `prefers-reduced-motion` support.

### Changed
- Rebuilt the card as a native Web Component to avoid depending on Home Assistant's private Lit implementation.
- Replaced legacy `mwc-icon-button` controls with native accessible buttons and `ha-icon`.
- Operating status now uses `hvac_action`; HVAC mode remains based on entity state.
- Migrated most neutral UI colors to Home Assistant theme variables for light/dark/custom theme compatibility.
- Unified project versioning around semantic versioning starting at v2.0.0.
- Manual installation now consistently uses `simply-thermostat-card.js`.

### Preserved
- HVAC, fan, swing and preset controls.
- `true` / `chip` / `false` visibility behavior.
- Smart current temperature/humidity display.
- HVAC icon animations and centered expandable chips.

## Legacy history

### [v7.1] — 2025-10-12
- Smart temperature/humidity display.
- Refined Virtual AC layout, alignment and icon animation behavior.
- Fixed friendly-name sync and duplicate registration behavior.

### [v7.0] — 2025-10-11
- Virtual AC layout rewrite.
- Added `true` / `chip` / `false` controls.
- Reimplemented HVAC, fan, swing and preset rows.

### [v6.x] — 2025-10-10
- Added chip panels and HVAC animations.

### [v5.x] — 2025-09-30
- Initial combined Mushroom-inspired thermostat implementation.
