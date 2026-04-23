const INDICATOR_STYLES = new Set(['standalone', 'quick-settings']);
const INDICATOR_POSITIONS = new Set(['left', 'right', 'default']);
const IDLE_ACTIONS = new Set(['overlay', 'dbus']);

/**
 * Normalize indicator style to a valid value.
 *
 * @param {string} value - Raw setting value.
 * @returns {string} Normalized style string.
 */
function normalizeIndicatorStyle(value) {
    return INDICATOR_STYLES.has(value) ? value : 'quick-settings';
}

/**
 * Normalize indicator position to a valid value.
 *
 * @param {string} value - Raw setting value.
 * @returns {string} Normalized position string.
 */
function normalizeIndicatorPosition(value) {
    return INDICATOR_POSITIONS.has(value) ? value : 'right';
}

/**
 * Clamp brightness to 0..1 and preserve -1 sentinel.
 *
 * @param {number} value - Raw brightness value.
 * @returns {number} Clamped brightness value.
 */
function clampBrightness(value) {
    if (typeof value !== 'number' || Number.isNaN(value)) return -1;
    if (value < 0) return -1;
    return Math.max(0, Math.min(1, value));
}

/**
 * Build a normalized settings snapshot for hot paths.
 *
 * @param {object} settings - GSettings object.
 * @returns {object} Snapshot of normalized settings values.
 */
export function getSettingsSnapshot(settings) {
    const indicatorStyle = normalizeIndicatorStyle(settings.get_string('indicator-style'));
    const indicatorPosition = normalizeIndicatorPosition(settings.get_string('indicator-position'));
    const lastBrightness = clampBrightness(settings.get_double('last-brightness'));
    const restoreOnStartup = settings.get_boolean('restore-on-startup');
    const debug = settings.get_boolean('debug');

    return {
        indicatorStyle,
        indicatorPosition,
        lastBrightness,
        restoreOnStartup,
        debug,
    };
}

/**
 * Get normalized indicator style.
 *
 * @param {object} settings - GSettings object.
 * @returns {string} Indicator style.
 */
export function getIndicatorStyle(settings) {
    return normalizeIndicatorStyle(settings.get_string('indicator-style'));
}

/**
 * Get normalized indicator position.
 *
 * @param {object} settings - GSettings object.
 * @returns {string} Indicator position.
 */
export function getIndicatorPosition(settings) {
    return normalizeIndicatorPosition(settings.get_string('indicator-position'));
}

/**
 * Get last brightness value.
 *
 * @param {object} settings - GSettings object.
 * @returns {number} Brightness value (0..1 or -1).
 */
export function getLastBrightness(settings) {
    return clampBrightness(settings.get_double('last-brightness'));
}

/**
 * Set last brightness value.
 *
 * @param {object} settings - GSettings object.
 * @param {number} value - Brightness value.
 */
export function setLastBrightness(settings, value) {
    settings.set_double('last-brightness', clampBrightness(value));
}

/**
 * Check if restore-on-startup is enabled.
 *
 * @param {object} settings - GSettings object.
 * @returns {boolean} True if restore is enabled.
 */
export function isRestoreOnStartup(settings) {
    return settings.get_boolean('restore-on-startup');
}

/**
 * Check if debug logging is enabled.
 *
 * @param {object} settings - GSettings object.
 * @returns {boolean} True if debug is enabled.
 */
export function isDebugEnabled(settings) {
    return settings.get_boolean('debug');
}

/**
 * Normalize idle timeout action to a valid value.
 *
 * @param {string} value - Raw setting value.
 * @returns {string} Normalized action string.
 */
function normalizeIdleAction(value) {
    return IDLE_ACTIONS.has(value) ? value : 'overlay';
}

/**
 * Get idle timeout enabled state.
 *
 * @param {object} settings - GSettings object.
 * @returns {boolean} True if idle timeout is enabled.
 */
export function isIdleTimeoutEnabled(settings) {
    return settings.get_boolean('idle-timeout-enabled');
}

/**
 * Get idle timeout duration in seconds.
 *
 * @param {object} settings - GSettings object.
 * @returns {number} Idle timeout in seconds.
 */
export function getIdleTimeoutSeconds(settings) {
    const value = settings.get_int('idle-timeout-seconds');
    return typeof value === 'number' && value > 0 ? value : 300;
}

/**
 * Get idle timeout action.
 *
 * @param {object} settings - GSettings object.
 * @returns {string} Action: 'overlay' or 'dbus'.
 */
export function getIdleTimeoutAction(settings) {
    return normalizeIdleAction(settings.get_string('idle-timeout-action'));
}

/**
 * Get debug screen test action.
 *
 * @param {object} settings - GSettings object.
 * @returns {string} Action: 'overlay' or 'dbus'.
 */
export function getScreenTestAction(settings) {
    return normalizeIdleAction(settings.get_string('screen-test-action'));
}
