/**
 * Screen Off via D-Bus (Mutter PowerSaveMode)
 *
 * Controls display power state using org.gnome.Mutter.DisplayConfig.PowerSaveMode
 * PowerSaveMode: 0=ON, 1=STANDBY, 2=SUSPEND, 3=OFF
 */

import * as Logger from './logger.js';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const DBUS_DEST = 'org.gnome.Mutter.DisplayConfig';
const DBUS_PATH = '/org/gnome/Mutter/DisplayConfig';
const DBUS_IFACE = 'org.gnome.Mutter.DisplayConfig';
const PROPERTIES_IFACE = 'org.freedesktop.DBus.Properties';
const POWER_SAVE_MODE_PROPERTY = 'PowerSaveMode';
const POWER_MODE_ON = 0;
const POWER_MODE_OFF = 3;

/**
 *
 * @param mode
 */
function setPowerSaveModeAsync(mode) {
    try {
        Gio.DBus.session.call(
            DBUS_DEST,
            DBUS_PATH,
            PROPERTIES_IFACE,
            'Set',
            new GLib.Variant('(ssv)', [DBUS_IFACE, POWER_SAVE_MODE_PROPERTY, new GLib.Variant('i', mode)]),
            null,
            Gio.DBusCallFlags.NONE,
            3000,
            null,
            (_connection, result) => {
                try {
                    Gio.DBus.session.call_finish(result);
                    Logger.info(`ScreenOff: PowerSaveMode applied mode=${mode}`);
                } catch (error) {
                    Logger.error(`ScreenOff: PowerSaveMode failed mode=${mode} error=${error.message}`);
                }
            },
        );
        return true;
    } catch (error) {
        Logger.error(`ScreenOff: Failed to launch async PowerSaveMode mode=${mode} error=${error.message}`);
        return false;
    }
}

/**
 * Turn the screen off (blank) using PowerSaveMode=3.
 *
 * @returns {boolean} True on success.
 */
export function screenOff() {
    Logger.debug('ScreenOff: async off request');
    return setPowerSaveModeAsync(POWER_MODE_OFF);
}

/**
 * Turn the screen on (wake) using PowerSaveMode=0.
 *
 * @returns {boolean} True on success.
 */
export function screenOn() {
    Logger.debug('ScreenOff: async on request');
    return setPowerSaveModeAsync(POWER_MODE_ON);
}
