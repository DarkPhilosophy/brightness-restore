# Brightness Restore for GNOME Shell

[![Extension CI](https://github.com/DarkPhilosophy/brightness-restore/actions/workflows/ci.yml/badge.svg)](https://github.com/DarkPhilosophy/brightness-restore/actions/workflows/ci.yml)
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/DarkPhilosophy/brightness-restore?utm_source=oss&utm_medium=github&utm_campaign=DarkPhilosophy%2Fbrightness-restore&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)
[![GNOME Extensions](https://img.shields.io/badge/GNOME-Extensions-orange.svg)](https://extensions.gnome.org/extension/9214/brightness-restore/) <!-- GNOME-SHELL-VERSIONS-START -->
[![GNOME 45-50](https://img.shields.io/badge/GNOME-45--50-blue.svg)](https://www.gnome.org/)
<!-- GNOME-SHELL-VERSIONS-END --> [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

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
> **Last Updated**: 2026-04-15 23:16:38 UTC  
> **Summary**: 0 errors, 19 warnings

<details>
<summary>Click to view full lint output</summary>

```text
> brightness-restore@4.0.0 lint
> eslint extension .scripts --format stylish || true; echo LINT_DONE


/var/home/alexa/Projects/brightness-restore/extension/library/idle-monitor.js
   12:1  warning  Missing JSDoc comment  jsdoc/require-jsdoc
   24:1  warning  Missing JSDoc comment  jsdoc/require-jsdoc
   35:1  warning  Missing JSDoc comment  jsdoc/require-jsdoc
   41:8  warning  Missing JSDoc comment  jsdoc/require-jsdoc
   54:8  warning  Missing JSDoc comment  jsdoc/require-jsdoc
   76:8  warning  Missing JSDoc comment  jsdoc/require-jsdoc
  106:8  warning  Missing JSDoc comment  jsdoc/require-jsdoc

/var/home/alexa/Projects/brightness-restore/extension/library/indicators/screen-off-overlay.js
  10:1  warning  Missing JSDoc comment  jsdoc/require-jsdoc
  21:1  warning  Missing JSDoc comment  jsdoc/require-jsdoc
  40:8  warning  Missing JSDoc comment  jsdoc/require-jsdoc
  56:8  warning  Missing JSDoc comment  jsdoc/require-jsdoc
  67:8  warning  Missing JSDoc comment  jsdoc/require-jsdoc
  81:8  warning  Missing JSDoc comment  jsdoc/require-jsdoc

/var/home/alexa/Projects/brightness-restore/extension/library/screen-off.js
  20:1  warning  Missing JSDoc comment  jsdoc/require-jsdoc

/var/home/alexa/Projects/brightness-restore/extension/library/toggle-mouse.js
   5:1  warning  Missing JSDoc comment  jsdoc/require-jsdoc
  13:8  warning  Missing JSDoc comment  jsdoc/require-jsdoc
  22:8  warning  Missing JSDoc comment  jsdoc/require-jsdoc
  31:8  warning  Missing JSDoc comment  jsdoc/require-jsdoc
  39:8  warning  Missing JSDoc comment  jsdoc/require-jsdoc

✖ 19 problems (0 errors, 19 warnings)
  0 errors and 19 warnings potentially fixable with the `--fix` option.

LINT_DONE
```

</details>
<!-- LINT-RESULT-END -->

<!-- LATEST-VERSION-START -->
<details open>
<summary><strong>Latest Update (v4)</strong></summary>

- Add the new extension icon asset for the next release cycle.
- 2026-04-16: add Idle Screen Timeout settings and runtime screen-off actions.
- 2026-04-16: add 10-second timeout option for fast testing from preferences.
- 2026-04-16: add manual Screen Control test path handled by the shell process.
- 2026-04-16: fix overlay and D-Bus wake/sleep behavior to avoid freezes and delayed triggers.

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
