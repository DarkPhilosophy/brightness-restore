# Brightness Restore for GNOME Shell

[![Extension CI](https://github.com/DarkPhilosophy/brightness-restore/actions/workflows/ci.yml/badge.svg)](https://github.com/DarkPhilosophy/brightness-restore/actions/workflows/ci.yml)
[![GNOME Extensions](https://img.shields.io/badge/GNOME-Extensions-orange.svg)](https://extensions.gnome.org/extension/9214/brightness-restore/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![GNOME 45-49](https://img.shields.io/badge/GNOME-45--49-blue.svg)](https://www.gnome.org/)

**Brightness Restore** - A GNOME Shell extension that solves the "missing persistence" issue for software brightness controls (especially on external monitors combined with OLED/Wayland setups).

It automatically saves your local brightness adjustments and restores them upon login, ensuring your preferred brightness level is always maintained.

**Status**: **Live** on GNOME Extensions (ID: 9214).
<!-- EGO-VERSION-START -->
[![Status: Pending](https://img.shields.io/badge/Status-Pending-yellow)](https://extensions.gnome.org/extension/9214/brightness-restore/) ![GitHub](https://img.shields.io/badge/GitHub-v1-blue) ![GNOME](https://img.shields.io/badge/GNOME-v1-green)
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
> **Last Updated**: 2026-01-26 22:16:42 UTC  
> **Summary**: 0 errors, 0 warnings

<details>
<summary>Click to view full lint output</summary>

```
> brightness-restore@1.0.0 lint:fix
> eslint --fix extension .scripts --format stylish
```

</details>
<!-- LINT-RESULT-END -->

<!-- LATEST-VERSION-START -->
<details open>
<summary><strong>Latest Update (v1)</strong></summary>

- **Persistence**: Automatically remembers visual brightness level across reboots.
- **Architecture**: Syncs directly with Gnome Shell's brightnessManager.
- **UI**: Simple panel indicator with position control.
- **Settings**: Refactored "Beautiful" settings menu with Debug/Logging capabilities.

</details>
<!-- LATEST-VERSION-END -->

## Configuration

You can configure the extension using standard Gnome Extensions settings (or `dconf`).

| Setting | Default | Description |
| :--- | :--- | :--- |
| **Restore on Startup** | `true` | Whether to restore the saved value on login. |
| **Indicator Position** | `right` | `left`, `right`, or `default`. |
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
