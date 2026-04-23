'use strict';

let _mouseHidden = false;

/**
 *
 */
function getCursorTracker() {
    if (global.backend?.get_cursor_tracker) {
        return global.backend.get_cursor_tracker();
    }

    return null;
}

/**
 *
 */
export function hideMouse() {
    const tracker = getCursorTracker();
    if (!tracker || typeof tracker.inhibit_cursor_visibility !== 'function') return false;

    tracker.inhibit_cursor_visibility();
    _mouseHidden = true;
    return true;
}

/**
 *
 */
export function showMouse() {
    const tracker = getCursorTracker();
    if (!tracker || typeof tracker.uninhibit_cursor_visibility !== 'function') return false;

    tracker.uninhibit_cursor_visibility();
    _mouseHidden = false;
    return true;
}

/**
 *
 * @param visible
 */
export function toggleMouse(visible) {
    if (typeof visible === 'boolean') {
        return visible ? showMouse() : hideMouse();
    }

    return _mouseHidden ? showMouse() : hideMouse();
}

/**
 *
 */
export function isMouseHidden() {
    return _mouseHidden;
}
