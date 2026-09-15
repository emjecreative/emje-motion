import { getPreviewWindow, getPreviewDocument, findTarget, collectContainerModels, destroyLayerInstance } from './utils.js';
import { buildHoverConfig, buildCursorConfig, buildInteractionConfig, serializeHoverPayload, serializeCursorPayload } from './interactionBridge.js';
import { hookBackgroundPreviewRender, buildBackgroundConfig, applyBackgroundToTarget, destroyBackgroundOnTarget } from './backgroundBridge.js';

export function bindKitChange() {
    var syncKit = function() {
        var win = getPreviewWindow();
        var doc = getPreviewDocument();
        if (!win || !doc) return;
        try {
            var allModels = [];
            if (window.elementor && window.elementor.elements && window.elementor.elements.models) {
                allModels = collectContainerModels(window.elementor.elements.models);
            }
            allModels.forEach(function(m){
                try {
                    var s = m.get('settings');
                    if (!s || typeof s.get !== 'function') return;
                    var wid = m.get('id');
                    var win2 = getPreviewWindow();
                    var doc2 = getPreviewDocument();
                    if (!win2 || !doc2) return;
                    var cfg = buildInteractionConfig(s);
                    if (!cfg.enable || !cfg.livePreview) return;
                    if (cfg.effect !== 'interactive-cursor') return;
                    var target = findTarget(doc2, wid, 'data-emje-cursor') || doc2.querySelector('[data-id="' + wid + '"]');
                    if (!target) return;
                    try { target.setAttribute('data-emje-cursor', JSON.stringify(serializeCursorPayload(cfg))); } catch(e){}
                    if (win2.EmjeMotionCursor && win2.EmjeMotionCursor.reInit) win2.EmjeMotionCursor.reInit(target);
                } catch(e){}
            });
        } catch(e){}
    };
    try {
        if (window.elementor && window.elementor.settings && window.elementor.settings.page) {
            window.elementor.settings.page.on('change', function(){ setTimeout(syncKit, 250); });
        }
    } catch(e){}
    try {
        if (window.elementor && window.elementor.channels && window.elementor.channels.data) {
            window.elementor.channels.data.on('globals:colors:change', function(){ setTimeout(syncKit, 250); });
            window.elementor.channels.data.on('globals:typography:change', function(){ setTimeout(syncKit, 250); });
        }
    } catch(e){}
}

export function bindPreviewLoaded() {
    // Ensure live preview is applied on editor open / preview reload, not only on change
    var doPreviewSync = function() {
        var win = getPreviewWindow();
        var doc = getPreviewDocument();
        if (!win || !doc) return;

        // (Re)hook container re-renders in preview for Background Motion.
        hookBackgroundPreviewRender();

        // Helper to sync a single container model to preview
        var syncContainerFromModel = function(model) {
            try {
                var settings = model.get('settings');
                if (!settings || typeof settings.get !== 'function') return;
                var widgetId = model.get('id');
                var win2 = getPreviewWindow();
                var doc2 = getPreviewDocument();
                if (!win2 || !doc2) return;
                // Check new unified first
                var hasNew = settings.get('emje_interaction_effect') !== undefined || settings.get('emje_interaction_enable') !== undefined;
                if (hasNew) {
                    var enableNew = settings.get('emje_interaction_enable') === 'yes';
                    var liveNew = settings.get('emje_interaction_live_preview') === 'yes';
                    if (!enableNew || !liveNew) {
                        // Destroy both if off
                        var t1 = findTarget(doc2, widgetId, 'data-emje-hover-reveal');
                        var t2 = findTarget(doc2, widgetId, 'data-emje-cursor');
                        var anyT = t1 || t2 || (widgetId ? doc2.querySelector('[data-id="' + widgetId + '"]') : null);
                        [t1, t2, anyT].forEach(function(t){
                            if (!t) return;
                            try { t.removeAttribute('data-emje-hover-reveal'); } catch(e){}
                            try { t.removeAttribute('data-emje-cursor'); } catch(e){}
                            destroyLayerInstance(win2.EmjeMotionHoverReveal, t, 'emjeHoverRevealInitialized');
                            destroyLayerInstance(win2.EmjeMotionCursor, t, 'emjeCursorInitialized');
                        });
                        return;
                    }
                    var cfgNew = buildInteractionConfig(settings);
                    if (!cfgNew.enable) return;
                    if (cfgNew.effect === 'hover-reveal') {
                        var targetH = findTarget(doc2, widgetId, 'data-emje-hover-reveal') || findTarget(doc2, widgetId, 'data-emje-cursor') || (widgetId ? doc2.querySelector('[data-id="' + widgetId + '"]') : null);
                        if (!targetH) return;
                        // Clean cursor if switching
                        if (destroyLayerInstance(win2.EmjeMotionCursor, targetH, 'emjeCursorInitialized')) {
                            try { targetH.removeAttribute('data-emje-cursor'); } catch(e){}
                        }
                        if (!cfgNew.imageUrl) {
                            try { targetH.removeAttribute('data-emje-hover-reveal'); } catch(e){}
                            return;
                        }
                        try { targetH.setAttribute('data-emje-hover-reveal', JSON.stringify(serializeHoverPayload(cfgNew))); } catch(e){}
                        if (win2.EmjeMotionHoverReveal && win2.EmjeMotionHoverReveal.reInit) win2.EmjeMotionHoverReveal.reInit(targetH);
                    } else {
                        var targetC = findTarget(doc2, widgetId, 'data-emje-cursor') || findTarget(doc2, widgetId, 'data-emje-hover-reveal') || (widgetId ? doc2.querySelector('[data-id="' + widgetId + '"]') : null);
                        if (!targetC) return;
                        if (destroyLayerInstance(win2.EmjeMotionHoverReveal, targetC, 'emjeHoverRevealInitialized')) {
                            try { targetC.removeAttribute('data-emje-hover-reveal'); } catch(e){}
                        }
                        try { targetC.setAttribute('data-emje-cursor', JSON.stringify(serializeCursorPayload(cfgNew))); } catch(e){}
                        if (win2.EmjeMotionCursor && win2.EmjeMotionCursor.reInit) win2.EmjeMotionCursor.reInit(targetC);
                    }
                    return;
                }
                // Legacy fallback: hover and cursor separate
                var hoverEnable = settings.get('emje_hover_reveal_enable') === 'yes';
                var hoverLive = settings.get('emje_hover_reveal_live_preview') === 'yes';
                var cursorEnable = settings.get('emje_cursor_enable') === 'yes';
                var cursorLive = settings.get('emje_cursor_live_preview') === 'yes';
                // Hover
                if (hoverEnable && hoverLive) {
                    var th = findTarget(doc2, widgetId, 'data-emje-hover-reveal');
                    if (!th) th = widgetId ? doc2.querySelector('[data-id="' + widgetId + '"]') : null;
                    if (th) {
                        var cfgH = buildHoverConfig(settings);
                        if (cfgH.imageUrl) {
                            try { th.setAttribute('data-emje-hover-reveal', JSON.stringify(cfgH)); } catch(e){}
                            if (win2.EmjeMotionHoverReveal && win2.EmjeMotionHoverReveal.reInit) win2.EmjeMotionHoverReveal.reInit(th);
                        }
                    }
                } else if (hoverEnable || settings.get('emje_hover_reveal_enable') !== undefined) {
                    var th2 = findTarget(doc2, widgetId, 'data-emje-hover-reveal');
                    if (th2) {
                        try { th2.removeAttribute('data-emje-hover-reveal'); } catch(e){}
                        destroyLayerInstance(win2.EmjeMotionHoverReveal, th2, 'emjeHoverRevealInitialized');
                    }
                }
                // Cursor
                if (cursorEnable && cursorLive) {
                    var tc = findTarget(doc2, widgetId, 'data-emje-cursor');
                    if (!tc) tc = widgetId ? doc2.querySelector('[data-id="' + widgetId + '"]') : null;
                    if (tc) {
                        var cfgC = buildCursorConfig(settings);
                        try { tc.setAttribute('data-emje-cursor', JSON.stringify(cfgC)); } catch(e){}
                        if (win2.EmjeMotionCursor && win2.EmjeMotionCursor.reInit) win2.EmjeMotionCursor.reInit(tc);
                    }
                } else if (cursorEnable || settings.get('emje_cursor_enable') !== undefined) {
                    var tc2 = findTarget(doc2, widgetId, 'data-emje-cursor');
                    if (tc2) {
                        try { tc2.removeAttribute('data-emje-cursor'); } catch(e){}
                        destroyLayerInstance(win2.EmjeMotionCursor, tc2, 'emjeCursorInitialized');
                    }
                }
                // Background Motion — sync from model for unsaved drafts.
                try {
                    var bgEn = settings.get('emje_background_enable');
                    var bgLive = settings.get('emje_background_live_preview') === 'yes';
                    var bgTarget = findTarget(doc2, widgetId, 'data-emje-background') || (widgetId ? doc2.querySelector('[data-id="' + widgetId + '"]') : null);
                    if (bgTarget) {
                        if (bgEn === 'yes' && bgLive) {
                            var bgCfg = buildBackgroundConfig(settings);
                            if (bgCfg.enable) {
                                applyBackgroundToTarget(win2, bgTarget, bgCfg);
                            } else {
                                destroyBackgroundOnTarget(win2, bgTarget);
                            }
                        } else if (bgEn !== undefined) {
                            destroyBackgroundOnTarget(win2, bgTarget);
                        }
                    }
                } catch (e) {}
            } catch (e) {}
        };

        var syncAllFromModels = function() {
            try {
                var allModels = [];
                if (window.elementor && window.elementor.elements && window.elementor.elements.models) {
                    allModels = collectContainerModels(window.elementor.elements.models);
                } else if (window.elementor && window.elementor.getPreviewContainer) {
                    var previewContainer = window.elementor.getPreviewContainer();
                    if (previewContainer && previewContainer.model) {
                        allModels = collectContainerModels([previewContainer.model]);
                    }
                }
                allModels.forEach(function(m) { syncContainerFromModel(m); });
            } catch (e) {}
        };

        // Fallback: initAll any existing data attributes in preview (covers PHP-rendered, idempotent safe to poll)
        var initAllFromPreview = function() {
            var win2 = getPreviewWindow();
            var doc2 = getPreviewDocument();
            if (!win2 || !doc2) return;
            if (win2.EmjeMotionHoverReveal && typeof win2.EmjeMotionHoverReveal.initAll === 'function') {
                win2.EmjeMotionHoverReveal.initAll();
            }
            if (win2.EmjeMotionCursor && typeof win2.EmjeMotionCursor.initAll === 'function') {
                win2.EmjeMotionCursor.initAll();
            }
            if (win2.EmjeMotionBackground && typeof win2.EmjeMotionBackground.initAll === 'function') {
                win2.EmjeMotionBackground.initAll();
            }
        };

        // Poll until preview is ready (handles late DOM/model population on editor reopen)
        var attempts = 0;
        var pollTimer = setInterval(function() {
            initAllFromPreview();
            attempts++;
            if (attempts >= 12) {
                clearInterval(pollTimer);
            }
        }, 400);
        // Model sync runs once (handles unsaved draft state)
        setTimeout(syncAllFromModels, 500);
    };

    // Listen to Elementor preview:loaded (top frame)
    try {
        if (window.elementor && window.elementor.channels && window.elementor.channels.data) {
            window.elementor.channels.data.on('preview:loaded', doPreviewSync);
        }
    } catch (e) {}
    try {
        if (window.elementor && typeof window.elementor.on === 'function') {
            window.elementor.on('preview:loaded', doPreviewSync);
        }
    } catch (e) {}
    // Also listen to iframe load
    try {
        var iframe = document.getElementById('elementor-preview-iframe');
        if (iframe) {
            iframe.addEventListener('load', function() {
                setTimeout(doPreviewSync, 400);
            });
        }
        // If already loaded
        setTimeout(doPreviewSync, 800);
    } catch (e) {}
}

/**
 * Register preview reload sync.
 */
export function initPreviewSync() {
    bindKitChange();
    bindPreviewLoaded();
}
