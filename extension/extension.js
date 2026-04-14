import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import * as Logger from './library/logger.js';
import { setPercentLabel } from './library/label.js';
import { BrightnessPanelIndicator } from './library/indicators/panel.js';
import { BrightnessQuickSettingsIndicator } from './library/indicators/quick-settings.js';
import {
    getIndicatorStyle,
    getLastBrightness,
    isDebugEnabled,
    isRestoreOnStartup,
    setLastBrightness,
} from './library/settings.js';

/**
 *
 * @param priority
 * @param delayMs
 * @param callback
 */
function scheduleTimeoutOnce(priority, delayMs, callback) {
    if (typeof GLib.timeout_add_once === 'function') {
        return GLib.timeout_add_once(priority, delayMs, callback);
    }

    return GLib.timeout_add(priority, delayMs, () => {
        callback();
        return GLib.SOURCE_REMOVE;
    });
}

export default class BrightnessRestoreExtension extends Extension {
    enable() {
        this._settings = this.getSettings();

        // Initialize Logger
        Logger.init('Brightness Restore');
        Logger.updateSettings(this._settings);

        Logger.info('Enabling Brightness Restore...');

        // Setup UI based on Settings
        this._setupUI();

        // Connect Settings Listener
        this._settingsSignal = this._settings.connect('changed', (_settings, key) => {
            if (['debug', 'loglevel', 'logtofile', 'logfilepath'].includes(key)) {
                Logger.updateSettings(this._settings);
                if (key === 'debug') this._startWatchdog();
            } else if (key === 'last-brightness') {
                this._onManualBrightnessRequest(); // Sync external changes
            } else if (key === 'indicator-position') {
                if (this._ui && this._ui.ensurePosition) this._ui.ensurePosition();
            } else if (key === 'indicator-style') {
                Logger.info('Indicator style changed. Reloading UI...');
                this._teardownUI();
                this._setupUI();
                this._onChanged(); // Refresh value
            }
        });

        // Connect Brightness & Restore
        // Wait for system to settle slightly
        this._timeoutId = scheduleTimeoutOnce(GLib.PRIORITY_DEFAULT, 1000, () => {
            this._timeoutId = null;
            this._connectBrightness();
        });
    }

    _setupUI() {
        const style = getIndicatorStyle(this._settings);
        Logger.info(`Initializing UI Mode: ${style}`);

        if (style === 'standalone') {
            // Revert strict equality if unknown string comes in? No, standard enum or fallback.
            // Using existing class
            this._ui = new BrightnessPanelIndicator(this);
            Main.panel.addToStatusArea('brightness-restore', this._ui);
            this._ui.ensurePosition();
        } else {
            // Default: Quick Settings
            this._ui = new BrightnessQuickSettingsIndicator(this);
        }
    }

    _teardownUI() {
        if (this._ui) {
            this._ui.destroy();
            this._ui = null;
        }
    }

    async _connectBrightness() {
        // GNOME 49+ moved monitor brightness management into Main.brightnessManager.
        const bm = Main.brightnessManager;
        if (bm?.globalScale) {
            this._mode = 'software';
            this._proxy = bm.globalScale;
            Logger.info(`Connected via Main.brightnessManager (Software). Current Value: ${this._proxy.value}`);
            this._proxyId = this._proxy.connect('notify::value', () => this._onChanged());
        }

        // Older shells still expose the gsd D-Bus interface.
        if (!this._proxy) {
            try {
                this._mode = 'hardware';
                this._proxy = new Gio.DBusProxy({
                    g_connection: Gio.DBus.session,
                    g_name: 'org.gnome.SettingsDaemon.Power',
                    g_object_path: '/org/gnome/SettingsDaemon/Power',
                    g_interface_name: 'org.gnome.SettingsDaemon.Power.Screen',
                    g_flags: Gio.DBusProxyFlags.NONE,
                });

                await this._proxy.init_async(GLib.PRIORITY_DEFAULT, null);

                const brightness = this._proxy.get_cached_property('Brightness');
                if (brightness === null) {
                    throw new Error('No Brightness property on DBus interface');
                }

                Logger.info(`Connected via DBus (Hardware). Current Brightness: ${brightness.get_int32()}%`);
                this._proxyId = this._proxy.connect('g-properties-changed', () => this._onChanged());
            } catch (e) {
                Logger.warn(`Brightness connection failed: ${e.message}.`);
                this._proxy = null;
                this._mode = null;
            }
        }

        if (!this._proxy) {
            Logger.warn('No usable brightness backend found.');
            if (this._ui) this._ui.update('Err', 0);
            return;
        }

        // Perform Logic (Restore & Watchdog)
        if (this._proxy) {
            this._restoreBrightness();
            this._onChanged(); // Initial Sync
        }

        this._startWatchdog();
    }

    _restoreBrightness() {
        if (!isRestoreOnStartup(this._settings)) return;

        const saved = getLastBrightness(this._settings); // Saved as 0.0 - 1.0
        if (saved < 0 || saved > 1.0) return;

        Logger.info(`Restoring brightness to ${Math.round(saved * 100)}% (${this._mode})`);
        this._setBrightness(saved);
    }

    _getBrightness() {
        if (!this._proxy) return -1;

        if (this._mode === 'hardware') {
            // DBus returns Variant<int32> (0-100)
            const val = this._proxy.get_cached_property('Brightness');
            return val ? val.get_int32() / 100.0 : 0;
        } else {
            // Software is Float (0.0-1.0)
            return this._proxy.value;
        }
    }

    _setBrightness(targetFloat) {
        if (!this._proxy) return;

        try {
            if (this._mode === 'hardware') {
                const targetInt = Math.round(targetFloat * 100);
                // DBus set property
                this._proxy.set_cached_property('Brightness', new GLib.Variant('i', targetInt));
                this._proxy.call(
                    'org.freedesktop.DBus.Properties.Set',
                    new GLib.Variant('(ssv)', [
                        'org.gnome.SettingsDaemon.Power.Screen',
                        'Brightness',
                        new GLib.Variant('i', targetInt),
                    ]),
                    Gio.DBusCallFlags.NONE,
                    -1,
                    null,
                    (proxy, res) => {
                        try {
                            proxy.call_finish(res);
                        } catch (e) {
                            Logger.error(`DBus Set failed: ${e.message}`);
                        }
                    },
                );
            } else {
                this._proxy.value = targetFloat;
            }
        } catch (e) {
            Logger.error(`Set Brightness (${this._mode}) failed: ${e.message}`);
        }
    }

    _onChanged() {
        const val = this._getBrightness();
        Logger.debug(`_onChanged triggered. Mode: ${this._mode} | Value: ${val}`);
        this._updateUI(val);
        this._saveBrightness(val);
    }

    // Called when the SLIDER is moved by the user in the menu
    _onSliderChanged(value) {
        // Update Hardware immediately
        this._setBrightness(value);

        // Update Label immediately (responsive UI)
        const pct = Math.round(value * 100);
        if (this._ui && this._ui instanceof BrightnessPanelIndicator) {
            setPercentLabel(this._ui._label, pct);
        } else if (this._ui && this._ui instanceof BrightnessQuickSettingsIndicator) {
            if (this._ui._slider) this._ui._slider.label = `Brightness: ${pct}%`;
        }
    }

    _onManualBrightnessRequest() {
        // Triggered by Settings changes (legacy/redundant path now if using slider, but kept for Prefs sync)
        if (!this._proxy) return;

        const target = getLastBrightness(this._settings);
        const current = this._getBrightness();

        if (Math.abs(current - target) > 0.01) {
            Logger.info(`Setting brightness from Prefs to ${target}`);
            this._setBrightness(target);
        }
    }

    _saveBrightness(value) {
        // Save to GSettings (Debounced)
        if (this._saveTimeoutId) GLib.source_remove(this._saveTimeoutId);
        this._saveTimeoutId = scheduleTimeoutOnce(GLib.PRIORITY_LOW, 1000, () => {
            if (!this._settings) return; // Safety check

            const stored = getLastBrightness(this._settings);
            if (Math.abs(stored - value) > 0.01) {
                Logger.info(`Saving new brightness persistence: ${value}`);
                setLastBrightness(this._settings, value);
            }
            this._saveTimeoutId = null;
        });
    }

    _updateUI(value) {
        if (typeof value !== 'number' || isNaN(value)) {
            if (this._ui && this._ui.update) this._ui.update('?', 0);
            return;
        }
        const pct = Math.round(value * 100);
        if (this._ui && this._ui.update) this._ui.update(pct, value);
    }

    _startWatchdog() {
        if (this._watchdogId) {
            GLib.source_remove(this._watchdogId);
            this._watchdogId = null;
        }

        if (!this._settings || !isDebugEnabled(this._settings)) {
            Logger.info('Watchdog stopped (Debug disabled).');
            return;
        }

        Logger.info('Watchdog started (Debug enabled).');
        this._watchdogId = GLib.timeout_add_seconds(GLib.PRIORITY_LOW, 60, () => {
            if (!this._proxy) {
                Logger.error('WATCHDOG: Proxy is NULL! Re-connecting...');
                this._connectBrightness();
                return GLib.SOURCE_CONTINUE;
            }
            // Just a keep-alive check logic
            return GLib.SOURCE_CONTINUE;
        });
    }

    disable() {
        Logger.info('Disabling Brightness Restore...');
        this._teardownUI();

        if (this._settingsSignal) {
            this._settings.disconnect(this._settingsSignal);
            this._settingsSignal = null;
        }

        if (this._saveTimeoutId) {
            GLib.source_remove(this._saveTimeoutId);
            this._saveTimeoutId = null;
        }

        if (this._timeoutId) {
            GLib.source_remove(this._timeoutId);
            this._timeoutId = null;
        }

        if (this._watchdogId) {
            GLib.source_remove(this._watchdogId);
            this._watchdogId = null;
        }

        if (this._proxyId && this._proxy) {
            this._proxy.disconnect(this._proxyId);
            this._proxyId = null;
        }
        this._proxy = null;

        this._settings = null;
    }
}
