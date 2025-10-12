# Changelog

All notable changes to **Simply Thermostat Card** will be documented in this file.

---

## [v7.1] — 2025-10-12
### ✨ Added
- Smart temperature/humidity display logic:
  - Shows both `T: xx°C | H: xx%` if available  
  - Shows only one if the other is missing  
  - Hides entire line if both are missing
- Refined meta line rendering and spacing
- Polished Virtual AC 5 layout and alignment

### 🎨 Improved
- Header alignment and icon animation behavior
- Temperature control centered on the right
- Chips (fan/swing/preset) perfectly centered

### 🧩 Fixed
- Missing sync for `friendly_name` from entity
- Removed redundant temperature/humidity chips
- Resolved double registration issues

---

## [v7.0] — 2025-10-11
### 🚀 New
- Full UI rewrite following Virtual AC 5 style  
- Added flexible `show_*` configs (true / false / chip)
- Added centered chips toggle for fan/swing/preset
- Re-implemented HVAC + Fan + Swing + Preset rows
- Updated animations to match YAML card style

---

## [v6.x] — 2025-10-10
### ✨ Features
- Chip panels for Fan, Swing, Preset
- Animations for cooling/heating/fan/dry
- Improved visual theme compatibility

---

## [v5.x] — 2025-09-30
### 🧱 Base Release
- Initial combined version with YAML-UI compatibility
- Basic HVAC/Fan/Preset controls
- Animated icon ring style
