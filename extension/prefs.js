'use strict';

import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import GLib from 'gi://GLib';

import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const BUILD_DATE = '2026-02-28T18:34:55.731Z';
const CHANGELOG = `
PREFERENCES & LOGGING REFINEMENTS

PREFERENCES & LOGGING REFINEMENTS

Attach the first real PreferencesPage to the window (avoids Adw warnings without dummy pages).

Logging UI: Open Log Folder + Clear Log File actions (shown only when debug + file logging enabled).

Log file path resolution now respects custom paths and defaults to cache directory when empty.`;

export default class BrightnessRestorePreferences extends ExtensionPreferences {
    _switchToNavigationSplitViews(window) {
        // Attach first real PreferencesPage to avoid Adw warnings
        this._windowPageAdded = false;

        // Add AdwNavigationSplitView and componenents
        const splitView = new Adw.NavigationSplitView({
            hexpand: true,
            vexpand: true,
            sidebar_width_fraction: 0.3,
        });
        const breakpointBin = new Adw.BreakpointBin({
            width_request: 100,
            height_request: 100,
        });
        const breakpoint = new Adw.Breakpoint();
        breakpoint.set_condition(Adw.BreakpointCondition.parse('max-width: 600px'));
        breakpoint.add_setter(splitView, 'collapsed', true);
        breakpointBin.add_breakpoint(breakpoint);
        breakpointBin.set_child(splitView);
        window.set_content(breakpointBin);

        // AdwNavigationSplitView Sidebar configuration
        const splitViewSidebar = new Adw.NavigationPage({
            title: _('Settings'),
        });
        const sidebarToolbar = new Adw.ToolbarView();
        const sidebarHeader = new Adw.HeaderBar();
        const sidebarBin = new Adw.Bin();
        const sidebarListBox = new Gtk.ListBox();
        sidebarListBox.add_css_class('navigation-sidebar');
        sidebarBin.set_child(sidebarListBox);
        sidebarToolbar.set_content(sidebarBin);
        sidebarToolbar.add_top_bar(sidebarHeader);
        splitViewSidebar.set_child(sidebarToolbar);
        splitView.set_sidebar(splitViewSidebar);

        // Content configuration
        const splitViewContent = new Adw.NavigationPage();
        const contentToastOverlay = new Adw.ToastOverlay();
        const contentToolbar = new Adw.ToolbarView();
        const contentHeader = new Adw.HeaderBar();
        const stack = new Gtk.Stack({
            transition_type: Gtk.StackTransitionType.CROSSFADE,
        });
        contentToolbar.set_content(stack);
        contentToolbar.add_top_bar(contentHeader);
        contentToastOverlay.set_child(contentToolbar);
        splitViewContent.set_child(contentToastOverlay);
        splitView.set_content(splitViewContent);

        let firstPageAdded = false;
        const addPage = page => {
            const row = new Gtk.ListBoxRow();
            row._name = page.get_name ? page.get_name() : 'page';
            row._title = page.get_title();
            row._id = (row._title || 'id').toLowerCase().replace(/\s+/g, '-');
            const rowIcon = new Gtk.Image({ icon_name: page.get_icon_name() });
            const rowLabel = new Gtk.Label({ label: row._title, xalign: 0 });
            const box = new Gtk.Box({
                spacing: 12,
                margin_top: 12,
                margin_bottom: 12,
                margin_start: 12,
                margin_end: 12,
            });
            box.append(rowIcon);
            box.append(rowLabel);
            row.set_child(box);
            row.set_activatable(true);

            stack.add_named(page, row._id);
            sidebarListBox.append(row);

            if (!this._windowPageAdded) {
                window.add(page); // attach real page to satisfy Adw.PreferencesWindow
                this._windowPageAdded = true;
            }

            if (!firstPageAdded) {
                splitViewContent.set_title(row._title);
                firstPageAdded = true;
            }
        };

        sidebarListBox.connect('row-activated', (listBox, row) => {
            if (!row) return;
            splitView.set_show_content(true);
            splitViewContent.set_title(row._title);
            stack.set_visible_child_name(row._id);
        });

        // Return helper so strict mode doesn't complain
        return addPage;
    }

    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        const signalHandlers = [];
        const connectSignal = (obj, signal, handler) => {
            const id = obj.connect(signal, handler);
            signalHandlers.push([obj, id]);
            return id;
        };

        window.connect('close-request', () => {
            for (const [obj, id] of signalHandlers) {
                if (obj) obj.disconnect(id);
            }
            signalHandlers.length = 0;
            return false;
        });

        // Setup custom sidebar layout
        window.set_default_size(900, 700);
        const addPage = this._switchToNavigationSplitViews(window);

        // Helper to add icon to row
        const addIcon = (row, iconName) => {
            const icon = new Gtk.Image({
                icon_name: iconName,
            });
            row.add_prefix(icon);
        };

        const logBaseName = 'Brightness Restore'.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const resolveLogPath = () => {
            const configured = (settings.get_string('logfilepath') || '').trim();
            let fullPath = '';
            if (configured.length === 0) {
                fullPath = `${GLib.get_user_cache_dir()}/${logBaseName}.log`;
            } else if (configured.startsWith('/')) {
                fullPath = configured;
            } else {
                fullPath = `${GLib.get_home_dir()}/${configured}`;
            }

            if (GLib.file_test(fullPath, GLib.FileTest.IS_DIR)) {
                const base = fullPath.replace(/\/$/, '');
                return `${base}/${logBaseName}.log`;
            }

            return fullPath;
        };
        const openFolderChooser = () => {
            const dialog = new Gtk.FileChooserNative({
                title: _('Select Log Folder'),
                action: Gtk.FileChooserAction.SELECT_FOLDER,
                transient_for: window,
                modal: true,
            });
            dialog.connect('response', (d, response) => {
                if (response === Gtk.ResponseType.ACCEPT) {
                    const file = d.get_file();
                    const folderPath = file ? file.get_path() : null;
                    if (folderPath) settings.set_string('logfilepath', folderPath);
                }
                d.destroy();
            });
            dialog.show();
        };

        // === PAGE 1: GENERAL ===
        const generalPage = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'preferences-system-symbolic',
        });

        // Group: Persistence
        const behaviorGroup = new Adw.PreferencesGroup({
            title: _('Behavior'),
        });

        const restoreRow = new Adw.ActionRow({
            title: _('Restore on Startup'),
            subtitle: _('Apply last saved brightness when logging in'),
        });
        addIcon(restoreRow, 'view-refresh-symbolic');
        const restoreSwitch = new Gtk.Switch({
            active: settings.get_boolean('restore-on-startup'),
            valign: Gtk.Align.CENTER,
        });
        settings.bind('restore-on-startup', restoreSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
        restoreRow.add_suffix(restoreSwitch);
        behaviorGroup.add(restoreRow);

        const intervalRow = new Adw.ActionRow({
            title: _('Update Interval (seconds)'),
            subtitle: _('Interval to debounce saving brightness'),
        });
        addIcon(intervalRow, 'preferences-system-time-symbolic');
        const intervalSpin = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({ lower: 1, upper: 60, step_increment: 1 }),
            valign: Gtk.Align.CENTER,
        });
        settings.bind('interval', intervalSpin, 'value', Gio.SettingsBindFlags.DEFAULT);
        intervalRow.add_suffix(intervalSpin);
        behaviorGroup.add(intervalRow);

        generalPage.add(behaviorGroup);

        // === PAGE 2: APPEARANCE (Brightness) ===
        const appearancePage = new Adw.PreferencesPage({
            title: _('Appearance'),
            icon_name: 'preferences-desktop-display-symbolic',
        });

        const visualGroup = new Adw.PreferencesGroup({
            title: _('Panel Indicator'),
        });

        // Indicator Style
        const styleRow = new Adw.ActionRow({
            title: _('Indicator Style'),
            subtitle: _('System Indicator (Pill) or Standalone Panel Button'),
        });
        addIcon(styleRow, 'preferences-desktop-apps-symbolic');
        const styleModel = Gtk.StringList.new([_('Standalone (Menu + Slider)'), _('Quick Settings (Integrated)')]);
        const styleDropDown = new Gtk.DropDown({
            valign: Gtk.Align.CENTER,
            model: styleModel,
        });

        // Map string to index
        // default is 'quick-settings' which matches index 1
        const currentStyle = settings.get_string('indicator-style');
        const styleMap = { 'standalone': 0, 'quick-settings': 1 };
        styleDropDown.set_selected(styleMap[currentStyle] !== undefined ? styleMap[currentStyle] : 1);

        styleDropDown.connect('notify::selected', widget => {
            const idx = widget.get_selected();
            const val = ['standalone', 'quick-settings'][idx];
            settings.set_string('indicator-style', val);
        });
        styleRow.add_suffix(styleDropDown);
        visualGroup.add(styleRow);

        // Indicator Position (Conditional Visibility)
        const positionRow = new Adw.ActionRow({
            title: _('Indicator Position'),
            subtitle: _('Where to place the brightness percentage in Quick Settings'),
        });
        addIcon(positionRow, 'view-grid-symbolic'); // Monitor/Grid icon
        const positionModel = Gtk.StringList.new([_('left'), _('right'), _('default')]);
        const positionDropDown = new Gtk.DropDown({
            valign: Gtk.Align.CENTER,
            model: positionModel,
        });

        // Map string to index
        const currentPos = settings.get_string('indicator-position');
        const map = { left: 0, right: 1, default: 2 };
        positionDropDown.set_selected(map[currentPos] !== undefined ? map[currentPos] : 1);

        positionDropDown.connect('notify::selected', widget => {
            const idx = widget.get_selected();
            const val = ['left', 'right', 'default'][idx];
            settings.set_string('indicator-position', val);
        });
        positionRow.add_suffix(positionDropDown);
        visualGroup.add(positionRow);

        // Visibility Logic: Only show Position if Style is 'Quick Settings'
        const updatePositionVisibility = () => {
            const style = settings.get_string('indicator-style');
            positionRow.visible = style === 'quick-settings';
        };
        connectSignal(settings, 'changed::indicator-style', updatePositionVisibility);
        updatePositionVisibility();

        // Manual Control Group
        const controlGroup = new Adw.PreferencesGroup({
            title: _('Control'),
            description: _('Manually adjust system brightness.'),
        });

        const sliderRow = new Adw.ActionRow({
            title: _('Brightness Level'),
        });
        const scale = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment: new Gtk.Adjustment({ lower: 0, upper: 100, step_increment: 1, page_increment: 10 }),
            hexpand: true,
            draw_value: true,
            value_pos: Gtk.PositionType.RIGHT,
        });

        const adjustScaleBy = delta => {
            const current = scale.get_value();
            const next = Math.max(0, Math.min(100, current + delta));
            if (Math.abs(next - current) > 0.01) scale.set_value(next);
        };

        const minusButton = new Gtk.Button({
            label: '-',
            valign: Gtk.Align.CENTER,
            tooltip_text: _('Decrease brightness'),
        });
        minusButton.connect('clicked', () => adjustScaleBy(-5));

        const plusButton = new Gtk.Button({
            label: '+',
            valign: Gtk.Align.CENTER,
            tooltip_text: _('Increase brightness'),
        });
        plusButton.connect('clicked', () => adjustScaleBy(5));

        // Current Value
        scale.set_value(settings.get_double('last-brightness') * 100);

        // Bind? GSettings stores double 0.0-1.0, Scale works 0-100 or 0-1.
        // GSettingsBindFlags.DEFAULT does plain mapping.
        // We'll manual connect to do the conversion safely.

        scale.connect('value-changed', () => {
            const val = scale.get_value() / 100.0;
            settings.set_double('last-brightness', val);
        });

        // Listen for external updates (e.g. from extension)
        connectSignal(settings, 'changed::last-brightness', () => {
            const val = settings.get_double('last-brightness');
            // block signal? or just set_value. set_value triggers value-changed again?
            // Usually GtkScale guards, but let's be safe.
            const currentUI = scale.get_value() / 100.0;
            if (Math.abs(currentUI - val) > 0.01) {
                scale.set_value(val * 100);
            }
        });

        sliderRow.add_suffix(minusButton);
        sliderRow.add_suffix(scale);
        sliderRow.add_suffix(plusButton);
        controlGroup.add(sliderRow);
        appearancePage.add(visualGroup);
        appearancePage.add(controlGroup);

        // === PAGE 3: DEBUG ===
        const debugPage = new Adw.PreferencesPage({
            title: _('Debug'),
            icon_name: 'applications-engineering-symbolic',
        });

        // Advanced Group (Switch)
        const advancedGroup = new Adw.PreferencesGroup({ title: _('Advanced') });
        const debugRow = new Adw.ActionRow({
            title: _('Enable Debug Mode'),
            subtitle: _('Enable verbose logging'),
        });
        addIcon(debugRow, 'utilities-terminal-symbolic');
        const debugSwitch = new Gtk.Switch({
            active: settings.get_boolean('debug'),
            valign: Gtk.Align.CENTER,
        });
        settings.bind('debug', debugSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
        debugRow.add_suffix(debugSwitch);
        advancedGroup.add(debugRow);
        debugPage.add(advancedGroup);

        // Logging Group (Details)
        const loggingGroup = new Adw.PreferencesGroup({ title: _('Logging') });

        const logLevelRow = new Adw.ActionRow({ title: _('Log Level') });
        addIcon(logLevelRow, 'view-list-symbolic');
        const logLevelModel = Gtk.StringList.new([_('Verbose'), _('Debug'), _('Info'), _('Warn'), _('Error')]);
        const logLevelDropDown = new Gtk.DropDown({
            valign: Gtk.Align.CENTER,
            model: logLevelModel,
        });
        logLevelDropDown.set_selected(settings.get_int('loglevel'));
        logLevelDropDown.connect('notify::selected', widget => {
            settings.set_int('loglevel', widget.get_selected());
        });
        logLevelRow.add_suffix(logLevelDropDown);
        loggingGroup.add(logLevelRow);

        const logToFileRow = new Adw.ActionRow({ title: _('Save Logs to File') });
        addIcon(logToFileRow, 'document-save-symbolic');
        const logToFileSwitch = new Gtk.Switch({
            active: settings.get_boolean('logtofile'),
            valign: Gtk.Align.CENTER,
        });
        settings.bind('logtofile', logToFileSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
        logToFileRow.add_suffix(logToFileSwitch);
        loggingGroup.add(logToFileRow);

        const logPathRow = new Adw.ActionRow({
            title: _('Log File Path'),
            subtitle: _('Default: Cache Directory'),
        });
        addIcon(logPathRow, 'folder-symbolic');
        const logPathEntry = new Gtk.Entry({
            text: settings.get_string('logfilepath'),
            valign: Gtk.Align.CENTER,
        });
        settings.bind('logfilepath', logPathEntry, 'text', Gio.SettingsBindFlags.DEFAULT);
        logPathRow.add_suffix(logPathEntry);
        const browseBtn = new Gtk.Button({
            label: _('Browse'),
            valign: Gtk.Align.CENTER,
            icon_name: 'folder-open-symbolic',
        });
        browseBtn.connect('clicked', openFolderChooser);
        logPathRow.add_suffix(browseBtn);
        loggingGroup.add(logPathRow);

        const openReq = new Adw.ActionRow({ title: _('Open Log Folder') });
        addIcon(openReq, 'folder-open-symbolic');
        const openBtn = new Gtk.Button({
            label: _('Open'),
            valign: Gtk.Align.CENTER,
            icon_name: 'folder-open-symbolic',
        });
        openBtn.connect('clicked', () => {
            const path = resolveLogPath();
            const folder = Gio.File.new_for_path(path).get_parent();
            if (folder) Gio.AppInfo.launch_default_for_uri(folder.get_uri(), null);
        });
        openReq.add_suffix(openBtn);
        loggingGroup.add(openReq);

        const clearReq = new Adw.ActionRow({ title: _('Clear Log File') });
        addIcon(clearReq, 'edit-delete-symbolic');
        const clearBtn = new Gtk.Button({
            label: _('Clear'),
            valign: Gtk.Align.CENTER,
            icon_name: 'user-trash-symbolic',
        });
        clearBtn.connect('clicked', () => {
            try {
                Gio.File.new_for_path(resolveLogPath()).delete(null);
            } catch (_e) {
                /* ignore */
            }
        });
        clearReq.add_suffix(clearBtn);
        loggingGroup.add(clearReq);

        debugPage.add(loggingGroup);

        // Visibility Logic for Debug
        const updateDebugVisibility = () => {
            const isDebug = settings.get_boolean('debug');
            const logToFile = settings.get_boolean('logtofile');
            loggingGroup.visible = isDebug;
            logPathRow.visible = isDebug && logToFile;
            browseBtn.visible = isDebug && logToFile;
            openReq.visible = isDebug && logToFile;
            clearReq.visible = isDebug && logToFile;
        };
        connectSignal(settings, 'changed::debug', updateDebugVisibility);
        connectSignal(settings, 'changed::logtofile', updateDebugVisibility);
        updateDebugVisibility();

        // === PAGE 4: CHANGELOG ===
        const changelogPage = new Adw.PreferencesPage({
            title: _('Changelog'),
            icon_name: 'x-office-document-symbolic',
        });
        const changelogGroup = new Adw.PreferencesGroup({
            title: _(`Latest Changes`),
        });
        const changelogLabel = new Gtk.Label({
            label: CHANGELOG,
            wrap: true,
            xalign: 0,
            selectable: true,
            margin_top: 24,
            margin_bottom: 24,
            margin_start: 12,
            margin_end: 12,
        });
        changelogGroup.add(changelogLabel);
        changelogPage.add(changelogGroup);

        // === PAGE 5: ABOUT ===
        const aboutPage = new Adw.PreferencesPage({
            title: _('About'),
            icon_name: 'help-about-symbolic',
        });
        const versionName = this.metadata['version-name'] ?? this.metadata.version ?? 'Unknown';
        const projectGroup = new Adw.PreferencesGroup({
            title: _('Project Information'),
            description: _(`Version: ${versionName}`),
        });

        // Dynamic update for Build Date
        const updateAboutInfo = () => {
            let descriptionText = `Version: ${versionName}`;
            if (settings.get_boolean('debug')) {
                descriptionText += `\nBuild Date: ${BUILD_DATE}`;
            }
            projectGroup.set_description(_(descriptionText));
        };
        connectSignal(settings, 'changed::debug', updateAboutInfo);
        updateAboutInfo();

        const linkRow = new Adw.ActionRow({
            title: _('Project Homepage'),
            subtitle: 'https://github.com/DarkPhilosophy/brightness-restore',
        });
        addIcon(linkRow, 'web-browser-symbolic');
        const linkButton = new Gtk.LinkButton({
            uri: 'https://github.com/DarkPhilosophy/brightness-restore',
            icon_name: 'external-link-symbolic',
            valign: Gtk.Align.CENTER,
        });
        linkRow.add_suffix(linkButton);
        projectGroup.add(linkRow);

        const reportRow = new Adw.ActionRow({
            title: _('Report an Issue'),
            subtitle: _('Found a bug? Let us know!'),
        });
        addIcon(reportRow, 'tools-check-spelling-symbolic');
        const reportButton = new Gtk.LinkButton({
            uri: 'https://github.com/DarkPhilosophy/brightness-restore/issues',
            icon_name: 'external-link-symbolic',
            valign: Gtk.Align.CENTER,
        });
        reportRow.add_suffix(reportButton);
        projectGroup.add(reportRow);

        aboutPage.add(projectGroup);

        addPage(generalPage);
        addPage(appearancePage);
        addPage(debugPage);
        addPage(changelogPage);
        addPage(aboutPage);
    }
}
