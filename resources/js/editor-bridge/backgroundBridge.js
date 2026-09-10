import { getPreviewWindow, getPreviewDocument, editorDisableOnMobile, isValidEditorColor, findTarget } from './utils.js';

export function buildBackgroundConfig(settings) {
    var get = function(k, d) { var v = settings.get(k); return v !== undefined && v !== null ? v : d; };
    var enable = get('emje_background_enable', '') === 'yes';
    var live = get('emje_background_live_preview', '') === 'yes';
    if (!enable) {
        return { enable: enable, effect: 'ascii', livePreview: live };
    }
    var effect = get('emje_background_effect', 'ascii');
    if (effect === 'ascii-interactive') effect = 'ascii'; // legacy value
    if (effect !== 'ascii' && effect !== 'pixel') effect = 'ascii';
    if (effect === 'pixel') {
        return buildPixelConfig(settings, live);
    }
    var num = function(k, def, min, max) {
        var v = get(k, null);
        if (v && typeof v === 'object' && v.size !== undefined) v = v.size;
        var n = parseFloat(v);
        if (isNaN(n)) return def;
        return Math.max(min, Math.min(max, n));
    };
    var isValidColor = isValidEditorColor;
    var color = get('emje_background_ascii_color', '#3B82F6');
    if (typeof color !== 'string') color = '#3B82F6';
    var globals = get('__globals__', null);
    if (globals && typeof globals === 'object' && globals['emje_background_ascii_color']) {
        var gv = globals['emje_background_ascii_color'];
        if (typeof gv === 'string' && gv.indexOf('globals/colors') !== -1) {
            var m = gv.match(/id=([^&]+)/);
            if (m) gv = 'var(--e-global-color-' + m[1].replace(/[^a-zA-Z0-9_-]/g, '') + ')';
        }
        if (isValidColor(gv)) color = gv;
    }
    if (!isValidColor(color)) color = '#3B82F6';
    var charset = get('emje_background_ascii_charset', 'full');
    if (['full', 'simple'].indexOf(charset) === -1) charset = 'full';
    return {
        enable: true,
        effect: 'ascii',
        livePreview: live,
        color: color,
        charset: charset,
        cellW: num('emje_background_ascii_cell_w', 22, 8, 60),
        cellH: num('emje_background_ascii_cell_h', 26, 8, 60),
        fontSize: num('emje_background_ascii_font', 14, 6, 32),
        radius: num('emje_background_ascii_radius', 360, 100, 600),
        innerRadius: num('emje_background_ascii_inner', 30, 0, 200),
        maxOpacity: num('emje_background_ascii_opacity', 0.35, 0, 1),
        fade: num('emje_background_ascii_fade', 10, 0, 30),
        disableOnMobile: editorDisableOnMobile()
    };
}

export function buildPixelConfig(settings, live) {
    var get = function(k, d) { var v = settings.get(k); return v !== undefined && v !== null ? v : d; };
    var num = function(k, def, min, max) {
        var v = get(k, null);
        if (v && typeof v === 'object' && v.size !== undefined) v = v.size;
        var n = parseFloat(v);
        if (isNaN(n)) return def;
        return Math.max(min, Math.min(max, n));
    };
    var isValidColor = isValidEditorColor;
    var pickColor = function(key, fallback) {
        var c = get(key, fallback);
        if (typeof c !== 'string') c = fallback;
        var globals = get('__globals__', null);
        if (globals && typeof globals === 'object' && globals[key]) {
            var gv = globals[key];
            if (typeof gv === 'string' && gv.indexOf('globals/colors') !== -1) {
                var m = gv.match(/id=([^&]+)/);
                if (m) gv = 'var(--e-global-color-' + m[1].replace(/[^a-zA-Z0-9_-]/g, '') + ')';
            }
            if (isValidColor(gv)) c = gv;
        }
        if (!isValidColor(c)) c = fallback;
        return c;
    };
    var fit = get('emje_background_pixel_fit', 'stretch');
    if (['stretch', 'crop'].indexOf(fit) === -1) fit = 'stretch';
    return {
        enable: true,
        effect: 'pixel',
        livePreview: live,
        base: pickColor('emje_background_pixel_base', 'rgba(255, 255, 255, 0.08)'),
        active: pickColor('emje_background_pixel_active', '#3B82F6'),
        fit: fit,
        cellSize: num('emje_background_pixel_size', 56, 24, 96),
        gap: num('emje_background_pixel_gap', 2, 0, 12),
        borderW: num('emje_background_pixel_border_w', 1, 0, 2),
        border: pickColor('emje_background_pixel_border', 'rgba(255, 255, 255, 0.15)'),
        speed: num('emje_background_pixel_speed', 0.15, 0.05, 0.5),
        radius: num('emje_background_pixel_radius', 120, 0, 300),
        trail: num('emje_background_pixel_trail', 0.4, 0, 1.5),
        fade: num('emje_background_pixel_fade', 10, 0, 30),
        disableOnMobile: editorDisableOnMobile()
    };
}

export function buildBackgroundPayload(cfg) {
    if (cfg.effect === 'pixel') {
        return {
            effect: 'pixel',
            base: cfg.base,
            active: cfg.active,
            cellSize: cfg.cellSize,
            gap: cfg.gap,
            borderW: cfg.borderW,
            border: cfg.border,
            speed: cfg.speed,
            radius: cfg.radius,
            trail: cfg.trail,
            fit: cfg.fit,
            fade: cfg.fade,
            disableOnMobile: cfg.disableOnMobile,
            livePreview: cfg.livePreview
        };
    }
    return {
        effect: 'ascii',
        color: cfg.color,
        charset: cfg.charset,
        cellW: cfg.cellW,
        cellH: cfg.cellH,
        fontSize: cfg.fontSize,
        radius: cfg.radius,
        innerRadius: cfg.innerRadius,
        maxOpacity: cfg.maxOpacity,
        fade: cfg.fade,
        disableOnMobile: cfg.disableOnMobile,
        livePreview: cfg.livePreview
    };
}

function bgDebug() {
    // Opt-in tracing: run `window._emjeBgDebug = true` in the editor
    // top-frame console, then reproduce. Zero overhead when off.
    try {
        if (!window._emjeBgDebug) return;
        var args = Array.prototype.slice.call(arguments);
        args.unshift('[emje-bg]');
        if (window.console && window.console.log) window.console.log.apply(window.console, args);
    } catch (e) {}
}

export function backgroundLayerPresent(target) {
    try {
        if (!target) return false;
        if (target.dataset && target.dataset.emjeBackgroundInitialized === 'true') return true;
        if (target.querySelector && target.querySelector('.emje-ascii, .emje-pixel')) return true;
    } catch (e) {}
    return false;
}

export function scheduleBackgroundVerify(settings, widgetId, attempt) {
    // Verify-and-repair: Elementor's template re-render can land AFTER
    // our debounced apply and wipe the attribute + layer. Re-resolve the
    // CURRENT node by data-id and re-apply when the model says live is on
    // but the layer is missing. Bounded retries, never loops forever.
    try {
        var tries = attempt || 0;
        setTimeout(function() {
            try {
                var win2 = getPreviewWindow();
                var doc2 = getPreviewDocument();
                if (!win2 || !doc2) return;
                var cfg2 = buildBackgroundConfig(settings);
                if (!cfg2.enable || !cfg2.livePreview) return;
                var node = widgetId ? doc2.querySelector('[data-id="' + widgetId + '"]') : null;
                if (!node) {
                    bgDebug('verify', { id: widgetId, try: tries, result: 'node-missing' });
                    if (tries < 2) scheduleBackgroundVerify(settings, widgetId, tries + 1);
                    return;
                }
                var hasAttr = node.hasAttribute('data-emje-background');
                var hasLayer = backgroundLayerPresent(node);
                if (!hasAttr || !hasLayer) {
                    bgDebug('verify', { id: widgetId, try: tries, result: 're-apply', attr: hasAttr, layer: hasLayer });
                    applyBackgroundToTarget(win2, node, cfg2);
                    if (tries < 2) scheduleBackgroundVerify(settings, widgetId, tries + 1);
                } else {
                    bgDebug('verify', { id: widgetId, try: tries, result: 'ok' });
                }
            } catch (e) {}
        }, 450);
    } catch (e) {}
}

export function syncBackgroundPreview(settings, widgetId, win, doc) {
    var cfg = buildBackgroundConfig(settings);
    var target = findTarget(doc, widgetId, 'data-emje-background');
    if (!target && widgetId) {
        target = doc.querySelector('[data-id="' + widgetId + '"]');
    }
    bgDebug('sync', { id: widgetId, enable: cfg.enable, live: cfg.livePreview, effect: cfg.effect, target: !!target });
    if (!target) return;
    if (!cfg.enable || !cfg.livePreview) {
        destroyBackgroundOnTarget(win, target);
        return;
    }
    // applyBackgroundToTarget already re-inits the layer.
    applyBackgroundToTarget(win, target, cfg);
    scheduleBackgroundVerify(settings, widgetId, 0);
}

export function bindBackgroundBridge() {
    if (!window.elementor || !window.elementor.channels || !window.elementor.channels.editor) return;
    window.elementor.channels.editor.on('change', function(view) {
        // NOTE: `view` here is often the CONTROL view (view.model = the
        // control model), not the element — same pitfall already handled
        // in bindEditorChange. Resolve via editedElementView first.
        var editedView = null;
        try {
            editedView = window.elementor.channels.editor.request('editedElementView');
        } catch (err) {}
        var model = null;
        var settings = null;
        var widgetType = null;
        var widgetId = null;
        if (editedView && editedView.model) {
            model = editedView.model;
            settings = model.get('settings');
            widgetType = model.get('widgetType') || model.get('elType');
            widgetId = model.get('id');
        } else if (view && view.model) {
            model = view.model;
            settings = model.get('settings');
            if (settings && typeof settings.get !== 'function') {
                settings = view.model.get('settings');
            }
            widgetType = model.get('widgetType') || model.get('elType');
            widgetId = model.get('id');
            if (!widgetType && view.container) {
                var containerSettings = view.container.settings;
                if (containerSettings) {
                    settings = containerSettings;
                    model = view.container.model || model;
                    widgetType = model.get('widgetType') || model.get('elType');
                    widgetId = model.get('id');
                }
            }
        }
        bgDebug('bridge change', {
            via: editedView ? 'editedElementView' : 'view',
            type: widgetType, id: widgetId,
            hasSettings: !!(settings && typeof settings.get === 'function'),
            enable: settings && typeof settings.get === 'function' ? settings.get('emje_background_enable') : '(n/a)'
        });
        if (!settings || typeof settings.get !== 'function') return;
        if (widgetType !== 'container') return;
        if (settings.get('emje_background_enable') === undefined) return;
        var win = getPreviewWindow();
        var doc = getPreviewDocument();
        if (!win || !doc) return;
        // The per-setting Backbone listener (bindBackgroundSettingsListener,
        // 120ms) is the primary change path. This channel handler is only
        // a fallback for changes that never reach it: skip when the
        // primary path just synced the same settings object.
        clearTimeout(bindBackgroundBridge._t);
        bindBackgroundBridge._t = setTimeout(function() {
            try {
                var last = settings._emjeBgAppliedAt || 0;
                if (Date.now() - last < 600) {
                    bgDebug('bridge change', { id: widgetId, skipped: 'primary-path-fresh' });
                    return;
                }
            } catch (e) {}
            syncBackgroundPreview(settings, widgetId, win, doc);
        }, 150);
    });
}

export function findContainerModel(dataId) {
    try {
        var found = null;
        var search = function(models) {
            if (!models || found) return;
            for (var i = 0; i < models.length; i++) {
                var m = models[i];
                if (!m || typeof m.get !== 'function') continue;
                if (m.get('id') === dataId) { found = m; return; }
                var ch = m.get('elements');
                if (ch) {
                    var arr = ch.models || ch;
                    if (arr && arr.length) search(arr);
                }
                if (found) return;
            }
        };
        if (window.elementor && window.elementor.elements && window.elementor.elements.models) {
            search(window.elementor.elements.models);
        }
        return found;
    } catch (e) { return null; }
}

export function applyBackgroundToTarget(win, target, cfg) {
    try {
        target.setAttribute('data-emje-background', JSON.stringify(buildBackgroundPayload(cfg)));
    } catch (e) {}
    if (win.EmjeMotionBackground && win.EmjeMotionBackground.reInit) {
        win.EmjeMotionBackground.reInit(target);
    }
}

export function destroyBackgroundOnTarget(win, target) {
    try { target.removeAttribute('data-emje-background'); } catch (e) {}
    try {
        if (win.EmjeMotionBackground && win.EmjeMotionBackground._instances && win.EmjeMotionBackground._instances.get(target)) {
            var old = win.EmjeMotionBackground._instances.get(target);
            if (old && typeof old.destroy === 'function') old.destroy();
            win.EmjeMotionBackground._instances.delete(target);
            delete target.dataset.emjeBackgroundInitialized;
        }
    } catch (e) {}
}

export function hookBackgroundPreviewRender() {
    // Re-apply Background Motion from the edited model whenever Elementor
    // re-renders a container in preview (render_type template wipes our
    // data attribute + layer, so change events alone are not enough).
    var win = getPreviewWindow();
    if (!win || !win.elementorFrontend || !win.elementorFrontend.hooks) {
        // Preview iframe not ready yet — retry instead of giving up
        // silently (otherwise no repair hook ever gets installed).
        window._emjeBgHookTries = (window._emjeBgHookTries || 0) + 1;
        if (window._emjeBgHookTries <= 10) {
            setTimeout(hookBackgroundPreviewRender, 1000);
        }
        return;
    }
    window._emjeBgHookTries = 0;
    if (win._emjeBackgroundHooked) return;
    win._emjeBackgroundHooked = true;
    win.elementorFrontend.hooks.addAction('frontend/element_ready/container', function($el) {
        try {
            var el = ($el && $el[0] && $el[0].getAttribute) ? $el[0] : (($el && $el.getAttribute) ? $el : null);
            if (!el) return;
            var dataId = el.getAttribute('data-id');
            // If the layer survived, just re-init from the attribute.
            if (!dataId) {
                if (el.hasAttribute('data-emje-background') && win.EmjeMotionBackground && win.EmjeMotionBackground.reInit) {
                    win.EmjeMotionBackground.reInit(el);
                }
                return;
            }
            var model = findContainerModel(dataId);
            if (!model) {
                if (el.hasAttribute('data-emje-background') && win.EmjeMotionBackground && win.EmjeMotionBackground.reInit) {
                    win.EmjeMotionBackground.reInit(el);
                }
                return;
            }
            var settings = model.get('settings');
            if (!settings || typeof settings.get !== 'function') return;
            var hEnable = settings.get('emje_background_enable');
            var hLive = settings.get('emje_background_live_preview');
            if (hEnable !== 'yes') { bgDebug('hook render', { id: dataId, action: 'destroy', reason: 'enable!=' + hEnable }); destroyBackgroundOnTarget(win, el); return; }
            if (hLive !== 'yes') { bgDebug('hook render', { id: dataId, action: 'destroy', reason: 'live!=' + hLive }); destroyBackgroundOnTarget(win, el); return; }
            var cfg = buildBackgroundConfig(settings);
            if (!cfg.enable) { destroyBackgroundOnTarget(win, el); return; }
            bgDebug('hook render', { id: dataId, action: 'apply', effect: cfg.effect });
            applyBackgroundToTarget(win, el, cfg);
            scheduleBackgroundVerify(settings, dataId, 0);
        } catch (e) {}
    });
}

var EMJE_BG_KEYS = [
    'emje_background_enable', 'emje_background_effect',
    'emje_background_ascii_color', 'emje_background_ascii_charset',
    'emje_background_ascii_cell_w', 'emje_background_ascii_cell_h', 'emje_background_ascii_font',
    'emje_background_ascii_radius', 'emje_background_ascii_inner', 'emje_background_ascii_opacity',
    'emje_background_ascii_fade',
    'emje_background_pixel_base', 'emje_background_pixel_active',
    'emje_background_pixel_fit',
    'emje_background_pixel_size', 'emje_background_pixel_gap', 'emje_background_pixel_speed',
    'emje_background_pixel_border_w', 'emje_background_pixel_border',
    'emje_background_pixel_radius', 'emje_background_pixel_trail',
    'emje_background_pixel_fade', 'emje_background_live_preview'
];

export function bindBackgroundSettingsListener() {
    // Direct per-setting model listeners — fire reliably for every
    // control (including color picker drags), independent of view plumbing.
    try {
        if (!window.elementor || !window.elementor.hooks) return;
        window.elementor.hooks.addAction('panel/open_editor/container', function(panel, model, view) {
            try {
                var settings = model.get('settings');
                if (!settings || typeof settings.on !== 'function') return;
                bgDebug('panel open container', { id: model.get('id'), bound: !!settings._emjeBgBound });
                if (settings._emjeBgBound) return;
                settings._emjeBgBound = true;
                var debouncedSync = function() {
                    clearTimeout(settings._emjeBgTimer);
                    settings._emjeBgTimer = setTimeout(function() {
                        var win = getPreviewWindow();
                        var doc = getPreviewDocument();
                        if (!win || !doc) return;
                        var widgetId = model.get('id');
                        var target = findTarget(doc, widgetId, 'data-emje-background');
                        if (!target && widgetId) target = doc.querySelector('[data-id="' + widgetId + '"]');
                        var cfg = buildBackgroundConfig(settings);
                        bgDebug('settings sync', { id: widgetId, enable: cfg.enable, live: cfg.livePreview, effect: cfg.effect, target: !!target });
                        if (!target) return;
                        // Stamp every outcome so the fallback channel
                        // handler can tell a fresh primary sync apart
                        // from a missed change.
                        try { settings._emjeBgAppliedAt = Date.now(); } catch (e) {}
                        if (!cfg.enable || !cfg.livePreview) {
                            destroyBackgroundOnTarget(win, target);
                            return;
                        }
                        applyBackgroundToTarget(win, target, cfg);
                        scheduleBackgroundVerify(settings, widgetId, 0);
                    }, 120);
                };
                EMJE_BG_KEYS.forEach(function(k) {
                    settings.on('change:' + k, debouncedSync);
                });
                settings.on('change', function(m) {
                    var ch = (m && m.changed) || {};
                    for (var i = 0; i < EMJE_BG_KEYS.length; i++) {
                        if (ch[EMJE_BG_KEYS[i]] !== undefined) { debouncedSync(); return; }
                    }
                    if (ch['__globals__'] !== undefined) debouncedSync();
                });
            } catch (e) {}
        });
    } catch (e) {}
}

/**
 * Register all Background Motion editor listeners.
 */
export function initBackgroundBridge() {
    bindBackgroundBridge();
    bindBackgroundSettingsListener();
}
