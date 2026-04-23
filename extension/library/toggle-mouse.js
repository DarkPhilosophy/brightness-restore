'use strict';

let _mouseHidden = false;

/**
 * Resolve the GNOME Shell cursor tracker when available.
 *
 * @returns {object|null} Cursor tracker instance, or null if unavailable.
 */
function getCursorTracker() {
    if (global.backend?.get_cursor_tracker) {
        return global.backend.get_cursor_tracker();
    }

    return null;
}

/**
 * Hide the mouse cursor through the shell cursor tracker.
 *
 * @returns {boolean} True when the request was applied.
 */
export function hideMouse() {
    const tracker = getCursorTracker();
    if (!tracker || typeof tracker.inhibit_cursor_visibility !== 'function') return false;

    tracker.inhibit_cursor_visibility();
    _mouseHidden = true;
    return true;
}

/**
 * Show the mouse cursor through the shell cursor tracker.
 *
 * @returns {boolean} True when the request was applied.
 */
export function showMouse() {
    const tracker = getCursorTracker();
    if (!tracker || typeof tracker.uninhibit_cursor_visibility !== 'function') return false;

    tracker.uninhibit_cursor_visibility();
    _mouseHidden = false;
    return true;
}

/**
 * Toggle mouse visibility or force it to a specific state.
 *
 * @param {boolean|undefined} visible - Optional target visibility state.
 * @returns {boolean} True when the request was applied.
 */
export function toggleMouse(visible) {
    if (typeof visible === 'boolean') {
        return visible ? showMouse() : hideMouse();
    }

    return _mouseHidden ? showMouse() : hideMouse();
}

/**
 * Check the locally tracked mouse hidden state.
 *
 * @returns {boolean} True when the mouse is currently hidden.
 */
export function isMouseHidden() {
    return _mouseHidden;
}
