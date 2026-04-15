# Brightness Restore for GNOME Shell

[![Extension CI](https://github.com/DarkPhilosophy/brightness-restore/actions/workflows/ci.yml/badge.svg)](https://github.com/DarkPhilosophy/brightness-restore/actions/workflows/ci.yml)
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/DarkPhilosophy/brightness-restore?utm_source=oss&utm_medium=github&utm_campaign=DarkPhilosophy%2Fbrightness-restore&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)
[![GNOME Extensions](https://img.shields.io/badge/GNOME-Extensions-orange.svg)](https://extensions.gnome.org/extension/9214/brightness-restore/) <!-- GNOME-SHELL-VERSIONS-START --> [![GNOME 45-50](https://img.shields.io/badge/GNOME-45--50-blue.svg)](https://www.gnome.org/) <!-- GNOME-SHELL-VERSIONS-END -->
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

**Brightness Restore** - A GNOME Shell extension that solves the "missing persistence" issue for software brightness controls (especially on external monitors combined with OLED/Wayland setups).

It automatically saves your local brightness adjustments and restores them upon login, ensuring your preferred brightness level is always maintained.

**Status**: **Live** on GNOME Extensions (ID: 9214).
<!-- EGO-VERSION-START -->
[![Status: Pending](https://img.shields.io/badge/Status-Pending-yellow)](https://extensions.gnome.org/extension/9214/brightness-restore/) ![GitHub](https://img.shields.io/badge/GitHub-v4-blue) ![GNOME](https://img.shields.io/badge/GNOME-v3-green)
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
> **Last Updated**: 2026-04-15 16:36:39 UTC  
> **Summary**: 0 errors, 0 warnings

<details>
<summary>Click to view full lint output</summary>

```text
> brightness-restore@4.0.0 lint:fix
> eslint --fix extension .scripts --format stylish || true; echo LINT_DONE

LINT_DONE
```

</details>
<!-- LINT-RESULT-END -->

<!-- LATEST-VERSION-START -->
<details open>
<summary><strong>Latest Update (v4)</strong></summary>

- Add the new extension icon asset for the next release cycle.

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
