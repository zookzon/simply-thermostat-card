# Changelog

All notable changes to **Simply Thermostat Card** are documented here.

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
