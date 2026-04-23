import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as Logger from '../logger.js';
import { hideMouse, showMouse } from '../toggle-mouse.js';

let _overlay = null;
let _monitorsChangedId = 0;

/**
 *
 */
function syncOverlayGeometry() {
    if (!_overlay) return;

    const width = global.stage?.width ?? Main.layoutManager.primaryMonitor?.width ?? 1;
    const height = global.stage?.height ?? Main.layoutManager.primaryMonitor?.height ?? 1;

    _overlay.set_position(0, 0);
    _overlay.set_size(width, height);
    Logger.debug(`ScreenOffOverlay: sync geometry ${width}x${height}`);
}

/**
 *
 */
function ensureOverlay() {
    if (_overlay) {
        syncOverlayGeometry();
        return;
    }

    _overlay = new St.Widget({
        reactive: false,
        visible: false,
        style: 'background-color: #000000;',
    });

    syncOverlayGeometry();

    if (!_monitorsChangedId) {
        _monitorsChangedId = Main.layoutManager.connect('monitors-changed', () => syncOverlayGeometry());
    }
}

/**
 *
 */
export function showOverlay() {
    ensureOverlay();

    if (!_overlay.get_parent()) {
        Main.layoutManager.addTopChrome(_overlay, {
            affectsInputRegion: false,
            trackFullscreen: true,
        });
    }

    syncOverlayGeometry();
    hideMouse();
    _overlay.show();
    Logger.info('ScreenOffOverlay: shown');
}

/**
 *
 */
export function hideOverlay() {
    if (!_overlay) return;

    _overlay.hide();
    showMouse();
    if (_overlay.get_parent()) {
        Main.layoutManager.removeChrome(_overlay);
    }
    Logger.info('ScreenOffOverlay: hidden');
}

/**
 *
 */
export function destroyOverlay() {
    hideOverlay();

    if (_monitorsChangedId) {
        Main.layoutManager.disconnect(_monitorsChangedId);
        _monitorsChangedId = 0;
    }

    if (_overlay) {
        _overlay.destroy();
        _overlay = null;
    }
}

/**
 *
 */
export function isOverlayVisible() {
    return Boolean(_overlay?.visible);
}
