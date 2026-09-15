import { getPreviewWindow, getPreviewDocument, findTarget, destroyLayerInstance, resolveEditedModel } from './utils.js';
import { debugLog } from '../core/env.js';
import { buildBackgroundConfig, buildPixelConfig, buildDitherConfig, buildMeshConfig, buildBackgroundPayload } from './backgroundConfig.js';

// Re-exported for existing importers (previewSync, smoke tests).
export { buildBackgroundConfig, buildPixelConfig, buildDitherConfig, buildMeshConfig, buildBackgroundPayload };

function bgDebug() {
    // Opt-in tracing: run `window._emjeBgDebug = true` in the editor
    // top-frame console, then reproduce. Zero overhead when off.
    debugLog(window._emjeBgDebug, '[emje-bg]', arguments);
}

export function backgroundLayerPresent(target) {
    try {
        if (!target) return false;
        if (target.dataset && target.dataset.emjeBackgroundInitialized === 'true') return true;
        if (target.querySelector && target.querySelector('.emje-ascii, .emje-pixel, .emje-dither, .emje-mesh')) return true;
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
        // control model), not the element — resolved via editedElementView.
        var resolved = resolveEditedModel(view);
        var settings = resolved.settings;
        var widgetType = resolved.widgetType;
        var widgetId = resolved.widgetId;
        bgDebug('bridge change', {
            via: resolved.editedView ? 'editedElementView' : 'view',
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
    var payload = buildBackgroundPayload(cfg);
    // Fast path: same mesh instance, only Motion Type / colors changed —
    // push the new uniforms live instead of re-creating the GL context.
    // Anything else (effect switch, speed, quality, opacity, fade, …)
    // still goes through a full re-init below.
    try {
        var raw = target.getAttribute('data-emje-background');
        var prev = raw ? JSON.parse(raw) : null;
        if (prev && prev.effect === 'mesh' && payload.effect === 'mesh'
            && prev.speed === payload.speed
            && prev.quality === payload.quality
            && prev.opacity === payload.opacity
            && prev.fade === payload.fade
            && prev.disableOnMobile === payload.disableOnMobile
            && prev.livePreview === payload.livePreview
            && win.EmjeMotionBackground && win.EmjeMotionBackground._instances) {
            // Never "succeed" on a node that is no longer in the document
            // (Elementor template re-render replaces it): that would push
            // uniforms into a detached layer while the visible node stays
            // blank. Fall through to a full re-init instead.
            var connected = target.isConnected === undefined || target.isConnected === true;
            var inst = connected ? win.EmjeMotionBackground._instances.get(target) : null;
            // The instance must still own a live canvas; a lost/destroyed
            // GL context silently no-ops uniform writes.
            var canvasOk = !!(inst && inst.canvas && inst.canvas.width > 2 && inst.canvas.height > 2);
            bgDebug('apply', { fastPath: !!(inst && canvasOk), connected: connected, canvasOk: canvasOk, motion: payload.motion });
            if (inst && canvasOk && typeof inst.updateLive === 'function'
                && inst.updateLive({ motion: payload.motion, colors: payload.colors })) {
                try {
                    target.setAttribute('data-emje-background', JSON.stringify(payload));
                } catch (e) {}
                return;
            }
            bgDebug('apply', { fastPath: false, fallback: 're-init' });
        }
    } catch (e) {}
    try {
        target.setAttribute('data-emje-background', JSON.stringify(payload));
    } catch (e) {}
    if (win.EmjeMotionBackground && win.EmjeMotionBackground.reInit) {
        win.EmjeMotionBackground.reInit(target);
    }
}

export function destroyBackgroundOnTarget(win, target) {
    try { target.removeAttribute('data-emje-background'); } catch (e) {}
    destroyLayerInstance(win.EmjeMotionBackground, target, 'emjeBackgroundInitialized');
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
            // The event node may already be stale (a second template
            // re-render can replace it before we run): re-resolve by
            // data-id so we always apply to the live node.
            try {
                var previewDoc = win.document || getPreviewDocument();
                if (dataId && previewDoc && previewDoc.querySelector) {
                    var fresh = previewDoc.querySelector('[data-id="' + dataId + '"]');
                    if (fresh) el = fresh;
                }
            } catch (e) {}
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
    'emje_background_ascii_fade', 'emje_background_ascii_disable_mobile',
    'emje_background_pixel_base', 'emje_background_pixel_active',
    'emje_background_pixel_fit',
    'emje_background_pixel_size', 'emje_background_pixel_gap', 'emje_background_pixel_speed',
    'emje_background_pixel_border_w', 'emje_background_pixel_border',
    'emje_background_pixel_radius', 'emje_background_pixel_trail',
    'emje_background_pixel_fade', 'emje_background_pixel_disable_mobile',
    'emje_background_live_preview',
    'emje_background_dither_fg', 'emje_background_dither_bg',
    'emje_background_dither_pixel',
    'emje_background_dither_density', 'emje_background_dither_scale',
    'emje_background_dither_speed', 'emje_background_dither_ripple',
    'emje_background_dither_ripple_strength', 'emje_background_dither_ripple_width',
    'emje_background_dither_ripple_speed', 'emje_background_dither_fade',
    'emje_background_dither_disable_mobile',
    'emje_background_mesh_c1', 'emje_background_mesh_c2',
    'emje_background_mesh_c3', 'emje_background_mesh_c4', 'emje_background_mesh_motion',
    'emje_background_mesh_speed',
    'emje_background_mesh_quality', 'emje_background_mesh_opacity',
    'emje_background_mesh_fade', 'emje_background_mesh_disable_mobile'
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
