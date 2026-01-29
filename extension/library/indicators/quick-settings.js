import Clutter from 'gi://Clutter';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as QuickSettings from 'resource:///org/gnome/shell/ui/quickSettings.js';

import * as Logger from '../logger.js';
import { setPercentLabel } from '../label.js';
import { getIndicatorPosition } from '../settings.js';

export class BrightnessQuickSettingsIndicator {
    constructor(extension) {
        this._extension = extension;
        this._settings = extension._settings;

        this._indicator = new QuickSettings.SystemIndicator();

        this._box = new St.BoxLayout({
            style_class: 'panel-status-indicators-box',
            reactive: true,
        });

        this._icon = new St.Icon({
            icon_name: 'display-brightness-symbolic',
            style_class: 'system-status-icon',
        });

        this._label = new St.Label({
            y_align: Clutter.ActorAlign.CENTER,
            text: '...',
            style_class: 'brightness-label',
        });

        this._box.add_child(this._icon);
        this._box.add_child(this._label);

        this._indicator._addIndicator().add_child(this._box);

        this._indicator.connectObject('notify::allocation', () => this._ensurePosition(), this);

        Main.panel.statusArea.quickSettings.addExternalIndicator(this._indicator);
        Logger.debug('[QuickSettings] Indicator added to external indicators.');

        this._captureDefaultPosition();
        this._ensurePosition();
    }

    update(percent, _valueNormalized) {
        setPercentLabel(this._label, percent);
    }

    destroy() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }

    ensurePosition() {
        this._ensurePosition();
    }

    _captureDefaultPosition() {
        if (!this._indicator) return;
        const actor = this._indicator;
        const parent = actor.get_parent();
        if (!parent || !parent.get_children) return;
        this._defaultParent = parent;
        const children = parent.get_children();
        const index = children.indexOf(actor);
        this._defaultIndex = index >= 0 ? index : null;
    }

    _ensurePosition() {
        if (!this._indicator) return;
        const pos = getIndicatorPosition(this._settings);
        const actor = this._indicator;
        const parent = actor.get_parent();
        if (!parent) return;

        if (pos === 'left') {
            if (parent.set_child_above_sibling) {
                parent.set_child_above_sibling(actor, null);
            } else if (parent.set_child_at_index) {
                parent.set_child_at_index(actor, 0);
            }
        } else if (pos === 'right') {
            if (parent.set_child_below_sibling) {
                parent.set_child_below_sibling(actor, null);
            } else if (parent.get_n_children) {
                parent.set_child_at_index(actor, Math.max(parent.get_n_children() - 1, 0));
            }
        } else if (this._defaultParent === parent && this._defaultIndex !== null && parent.get_n_children) {
            parent.set_child_at_index(actor, Math.min(this._defaultIndex, parent.get_n_children() - 1));
        }
    }
}
