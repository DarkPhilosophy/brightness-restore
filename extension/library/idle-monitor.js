import GLib from 'gi://GLib';
import * as Logger from './logger.js';

let _idlePollId = 0;
let _wakePollId = 0;
let _idleCallback = null;
let _activeCallback = null;
let _idleTimeoutMs = 0;
let _idleTriggered = false;
let _lastIdleMs = 0;

/**
 * Resolve the GNOME Shell idle monitor implementation for the current shell.
 *
 * @returns {object|null} Idle monitor object when available, otherwise null.
 */
function getIdleMonitor() {
    if (global.backend?.get_core_idle_monitor) {
        return global.backend.get_core_idle_monitor();
    }

    if (global.display?.get_idle_monitor) {
        return global.display.get_idle_monitor();
    }

    return null;
}

/**
 * Read the current idle time in milliseconds.
 *
 * @returns {number} Idle time in milliseconds, or 0 when unavailable.
 */
function getIdleTimeMs() {
    const monitor = getIdleMonitor();
    if (!monitor) return 0;

    try {
        return monitor.get_idletime();
    } catch {
        return 0;
    }
}

/**
 * Stop a GLib timeout source if it is active.
 *
 * @param {number} id - GLib source ID returned by timeout_add.
 */
function stopPoll(id) {
    if (id > 0) {
        GLib.source_remove(id);
    }
}

/**
 * Stop all idle and wake monitoring state.
 *
 * @returns {void}
 */
export function stopIdleMonitor() {
    Logger.debug(`IdleMonitor: stop idlePoll=${_idlePollId} wakePoll=${_wakePollId} triggered=${_idleTriggered}`);
    stopPoll(_idlePollId);
    stopPoll(_wakePollId);
    _idlePollId = 0;
    _wakePollId = 0;
    _idleCallback = null;
    _activeCallback = null;
    _idleTimeoutMs = 0;
    _idleTriggered = false;
    _lastIdleMs = 0;
}

/**
 * Start polling for user activity after a screen-off action has fired.
 *
 * @param {() => void} activeCallback - Callback invoked when activity is detected.
 * @returns {void}
 */
export function startWakeMonitoring(activeCallback) {
    stopPoll(_wakePollId);
    _lastIdleMs = getIdleTimeMs();
    Logger.debug(`IdleMonitor: start wake polling lastIdleMs=${_lastIdleMs}`);

    _wakePollId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 200, () => {
        const idleMs = getIdleTimeMs();
        Logger.debug(`IdleMonitor: wake poll idleMs=${idleMs} lastIdleMs=${_lastIdleMs}`);
        if (idleMs + 500 < _lastIdleMs) {
            Logger.debug(`IdleMonitor: wake detected idleMs=${idleMs} lastIdleMs=${_lastIdleMs}`);
            _wakePollId = 0;
            if (activeCallback) {
                activeCallback();
            }
            return GLib.SOURCE_REMOVE;
        }

        _lastIdleMs = idleMs;
        return GLib.SOURCE_CONTINUE;
    });
}

/**
 * Start idle monitoring and invoke callbacks when the threshold is crossed.
 *
 * @param {number} timeoutSeconds - Idle threshold in seconds before triggering.
 * @param {() => void} idleCallback - Callback invoked when the idle threshold is reached.
 * @param {() => void | null} activeCallback - Callback invoked when activity resumes.
 * @returns {void}
 */
export function startIdleMonitoring(timeoutSeconds, idleCallback, activeCallback = null) {
    stopIdleMonitor();

    _idleCallback = idleCallback;
    _activeCallback = activeCallback;
    _idleTimeoutMs = timeoutSeconds * 1000;
    Logger.debug(`IdleMonitor: start idle polling timeoutMs=${_idleTimeoutMs}`);

    _idlePollId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
        const idleMs = getIdleTimeMs();
        Logger.debug(`IdleMonitor: idle poll idleMs=${idleMs} timeoutMs=${_idleTimeoutMs} triggered=${_idleTriggered}`);

        if (!_idleTriggered && idleMs >= _idleTimeoutMs) {
            _idleTriggered = true;
            _lastIdleMs = idleMs;
            Logger.info(`IdleMonitor: threshold reached idleMs=${idleMs} timeoutMs=${_idleTimeoutMs}`);
            if (_idleCallback) {
                _idleCallback();
            }
        } else if (_idleTriggered && idleMs < _lastIdleMs) {
            _idleTriggered = false;
            Logger.info(`IdleMonitor: activity detected after trigger idleMs=${idleMs}`);
            if (_activeCallback) {
                _activeCallback();
            }
        }

        _lastIdleMs = idleMs;

        return GLib.SOURCE_CONTINUE;
    });
}

/**
 * Check whether idle monitoring is currently active.
 *
 * @returns {boolean} True when the idle monitor poll is active.
 */
export function isIdleMonitoringActive() {
    return _idlePollId > 0;
}
