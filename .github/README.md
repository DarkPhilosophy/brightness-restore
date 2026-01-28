# Brightness Restore for GNOME Shell

[![Extension CI](https://github.com/DarkPhilosophy/brightness-restore/actions/workflows/ci.yml/badge.svg)](https://github.com/DarkPhilosophy/brightness-restore/actions/workflows/ci.yml)
[![GNOME Extensions](https://img.shields.io/badge/GNOME-Extensions-orange.svg)](https://extensions.gnome.org/extension/9214/brightness-restore/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![GNOME 45-49](https://img.shields.io/badge/GNOME-45--49-blue.svg)](https://www.gnome.org/)

**Brightness Restore** - A GNOME Shell extension that solves the "missing persistence" issue for software brightness controls (especially on external monitors combined with OLED/Wayland setups).

It automatically saves your local brightness adjustments and restores them upon login, ensuring your preferred brightness level is always maintained.

**Status**: **Live** on GNOME Extensions (ID: 9214).
<!-- EGO-VERSION-START -->
[![Status: Pending](https://img.shields.io/badge/Status-Pending-yellow)](https://extensions.gnome.org/extension/9214/brightness-restore/) ![GitHub](https://img.shields.io/badge/GitHub-v2-blue) ![GNOME](https://img.shields.io/badge/GNOME-N%2FA-gray)
<!-- EGO-VERSION-END -->

## Features

-   **Persistence**: Automatically saves the last known brightness level to disk.
-   **Auto-Restore**: Applies the saved brightness level immediately upon session startup.
-   **Integration**: Connects directly to Gnome Shell's internal `brightnessManager`.
-   **Indicator**: Shows a simple percentage indicator in the panel (configurable).
-   **Positioning**: Choose to place the indicator on the Left or Right of the QuickSettings area.

## Validation Status

<!-- LINT-RESULT-START -->
### Linting Status
> **Status**: ✅ **Passing**  
> **Last Updated**: 2026-01-28 12:06:09 UTC  
> **Summary**: 0 errors, 0 warnings

<details>
<summary>Click to view full lint output</summary>

```
> brightness-restore@2.0.0 lint:fix
> eslint --fix extension .scripts --format stylish
```

</details>
<!-- LINT-RESULT-END -->

<!-- LATEST-VERSION-START -->
<details open>
<summary><strong>Latest Update (v2)</strong></summary>

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

</details>
<!-- LATEST-VERSION-END -->

## Configuration

You can configure the extension using standard Gnome Extensions settings (or `dconf`).

| Setting | Default | Description |
| :--- | :--- | :--- |
| **Restore on Startup** | `true` | Whether to restore the saved value on login. |
| **Indicator Style** | `quick-settings` | `standalone` (Panel Button) or `quick-settings` (Pill). |
| **Indicator Position** | `right` | `left`, `right`, or `default` (Only for Quick Settings). |
| **Interval** | `2` | Internal update interval (debounced save). |

## Install

### Local Build
```bash
./build.sh
```

### Manual
Copy the `extension/` folder to `~/.local/share/gnome-shell/extensions/brightness-restore@DarkPhilosophy`.

## Contributing

- [Changelog](CHANGELOG.md)
- [Contributing](CONTRIBUTING.md)
- [License](../LICENSE)
