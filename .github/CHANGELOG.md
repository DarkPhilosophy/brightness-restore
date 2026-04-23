# Changelog

## v4 (2026-04-13 - 2026-04-16) - ICON REFRESH & SCREEN CONTROL

> **ICON REFRESH & SCREEN CONTROL**

- Add the new extension icon asset for the next release cycle.
- Add Idle Screen Timeout settings and runtime screen-off actions.
- Add 10-second timeout option for fast testing from preferences.
- Add manual Screen Control test path handled by the shell process.
- Fix overlay and D-Bus wake/sleep behavior to avoid freezes and delayed triggers.

## v3 (2026-01-29) - PREFERENCES & LOGGING REFINEMENTS

> **PREFERENCES & LOGGING REFINEMENTS**

- Attach the first real PreferencesPage to the window (avoids Adw warnings without dummy pages).
- Logging UI: Open Log Folder + Clear Log File actions (shown only when debug + file logging enabled).
- Log file path resolution now respects custom paths and defaults to cache directory when empty.

## v2 (2026-01-28) - DUAL MODES & ROBUSTNESS

> **Major Update: Flexible UI & Robust Hardware Support**

- **Dual UI Modes**:
  - **Quick Settings (Default)**: Integrated seamlessly into the status area pill (no slider, clean look).
  - **Standalone**: Classic panel button with slider menu for direct control.
- **Hybrid Hardware/Software Control**:
  - Prioritizes `org.gnome.SettingsDaemon.Power` (DBus) for hardware control.
  - Automatically falls back to `Main.brightnessManager` (Software) if hardware is unavailable.
- **Preferences Refinement**:
  - Reordered settings for better usability.
  - Conditional visibility for position settings based on selected style.
- **Conditional Watchdog**:
  - Background monitoring process now **only** runs when "Debug Mode" is enabled.
- **Robustness**: Fixed linting issues and duplicate code paths.
- **Cleanup**: Removed unused artifacts and legacy battery/power components.
- **Refactor**: Split monolithic UI logic into focused indicator modules for maintainability.

## v1 (2026-01-26) - INITIAL RELEASE

> **BRIGHTNESS RESTORE**

- **Persistence**: Automatically remembers visual brightness level across reboots.
- **Architecture**: Syncs directly with Gnome Shell's brightnessManager.
- **UI**: Simple panel indicator with position control.
- **Settings**: Refactored "Beautiful" settings menu with Debug/Logging capabilities.
