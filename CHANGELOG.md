# Changelog

All notable changes to **Simply Thermostat Card** are documented here.

## [v2.0.0] — 2026-09-26

### Licensing
- Distributed under the **GNU General Public License v3.0 (GPL-3.0-only)**.

### Added
- Built-in Home Assistant visual card editor.
- Card picker registration and climate entity suggestion.
- Automatic `target_temp_step` support with configurable override.
- Temperature clamping using entity `min_temp` and `max_temp`.
- Native button controls with keyboard focus and ARIA labels.
- Responsive mobile layout and `prefers-reduced-motion` support.
- Distinct colors for active HVAC mode buttons: Cool blue, Heat red, Dry yellow, Fan Only cyan, Auto green, Heat/Cool purple, and Off gray with 28% mode-color background tint.
- Adaptive fan-speed controls based on each entity's `fan_modes` (supporting 4-speed, 7-speed, and custom fan levels).

### Changed
- Rebuilt the card as a native Web Component to avoid depending on Home Assistant's private Lit implementation.
- Replaced legacy `mwc-icon-button` controls with native accessible buttons and `ha-icon`.
- Operating status now uses `hvac_action`; HVAC mode remains based on entity state.
- Migrated neutral UI colors to Home Assistant theme variables for light/dark/custom theme compatibility.
- Set default Home Assistant Sections layout to Full width and Auto height (4-column min, 1-row min) preventing chip panels from overlapping cards below.
- Manual installation consistently uses `simply-thermostat-card.js`.

### Preserved
- HVAC, fan, swing, and preset controls with `true` / `chip` / `false` visibility options.
- Smart current temperature and humidity display.
- Animated HVAC icon with reduced-motion support.

## [v1.0.0] — 2025-10-02

### Added
- Initial release of Simply Thermostat Card for Home Assistant Lovelace dashboards.
- Compact thermostat card with fan, swing, and preset mode controls.
