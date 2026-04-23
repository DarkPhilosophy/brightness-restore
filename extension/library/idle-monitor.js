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
 *
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
 *
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
 *
 * @param id
 */
function stopPoll(id) {
    if (id > 0) {
        GLib.source_remove(id);
    }
}

/**
 *
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
 *
 * @param activeCallback
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
 *
 * @param timeoutSeconds
 * @param idleCallback
 * @param activeCallback
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
            Logger.info(`IdleMonitor: threshold reached idleMs=${idleMs} timeoutMs=${_idleTimeoutMs}`);
            if (_idleCallback) {
                _idleCallback();
            }
        } else if (_idleTriggered && idleMs < 1000) {
            _idleTriggered = false;
            Logger.info(`IdleMonitor: activity detected after trigger idleMs=${idleMs}`);
            if (_activeCallback) {
                _activeCallback();
            }
        }

        return GLib.SOURCE_CONTINUE;
    });
}

/**
 *
 */
export function isIdleMonitoringActive() {
    return _idlePollId > 0;
}
