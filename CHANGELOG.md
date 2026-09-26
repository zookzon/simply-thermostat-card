# Changelog

All notable changes to **Simply Thermostat Card** are documented here.

## [v2.0.6] — 2026-09-26

### Licensing
- First release under the **Simply Thermostat Card Non-Commercial License 1.0**.
- Personal, educational, research, hobby and other non-commercial use remains permitted.
- Non-commercial modification, forking and redistribution remain permitted subject to the license terms.
- Commercial use requires prior written permission from the copyright holder.
- Versions previously released under the MIT License remain licensed under the MIT terms that applied to those versions.

### Changed
- Updated the runtime version to `2.0.6`.
- No intentional card behavior or layout changes from v2.0.5.

## [v2.0.5] — 2026-09-26

### Fixed
- Set the Home Assistant Sections defaults to the layout verified to prevent expandable panels from overlapping cards below.
- Default Sections layout now requests `columns: "full"` and `rows: "auto"`.

### Changed
- Full width is enabled by default for new card layouts.
- Auto height is enabled by default so Fan, Swing, Preset and HVAC chip panels can expand the card naturally.
- The layout keeps a 4-column minimum and 1-row minimum, matching the intended 1×4 baseline layout.
- Precise/fixed sizing is not requested by the card defaults.

### Note
- Existing dashboard cards can retain layout values previously saved by Home Assistant. If an older card still has fixed sizing, enable Auto height and Full width in its Layout settings.

## [v2.0.4] — 2026-09-26

### Fixed
- Restored the v2.0.1 implementation as the code baseline after the unsuccessful v2.0.2/v2.0.3 layout experiments.
- Home Assistant Sections now requests `rows: "auto"` together with the standard 4-column width so expandable chip panels can use automatic row height.

### Preserved from v2.0.1
- 4-column default Sections width.
- Adaptive fan-speed controls for 4-speed, 7-speed and other fan configurations.
- Fan → Swing → Preset chip ordering.
- Normal font weight for expanded Fan, Swing and Preset options.
- Fan green, Swing gold and Preset cyan active colors.

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
