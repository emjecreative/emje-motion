import { getPreviewWindow, getPreviewDocument, findTarget, destroyLayerInstance, resolveEditedModel } from './utils.js';
import { buildTextMotionConfig } from './textMotionBridge.js';
import { buildHoverConfig, buildCursorConfig, buildInteractionConfig, serializeCursorPayload, serializeHoverPayload } from './interactionConfig.js';

// Re-exported for existing importers (previewSync, smoke tests).
export { buildHoverConfig, buildCursorConfig, buildInteractionConfig, serializeCursorPayload, serializeHoverPayload };

window.jQuery(document).on('click', '.emje-motion-preview-btn', function(e) {
    e.preventDefault();
    var editedView = null;
    try {
        editedView = window.elementor.channels.editor.request('editedElementView');
    } catch (err) {}
    if (!editedView) {
        var panelView = window.elementor.getPanelView();
        editedView = panelView ? panelView.getCurrentPageView().getOption('editedElementView') : null;
    }
    var model = editedView ? editedView.model : null;
    if (!model) {
        var panelView2 = window.elementor.getPanelView();
        model = panelView2 ? panelView2.getCurrentPageView().model : null;
    }
    var widgetId = model ? model.get('id') : null;
    var settings = model ? model.get('settings') : null;
    var win = getPreviewWindow();
    var doc = getPreviewDocument();
    if (!win || !doc || !win.EmjeMotion) return;
    var target = widgetId ? findTarget(doc, widgetId, 'data-emje-motion') : doc.querySelector('[data-emje-motion]');
    if (target) {
        if (!target.hasAttribute('data-emje-motion') && settings) {
            var cfg = buildTextMotionConfig(settings);
            try { target.setAttribute('data-emje-motion', JSON.stringify(cfg)); } catch (err) {}
        }
        win.EmjeMotion.refresh(target);
    }
});

export function bindEditorChange() {
    if (!window.elementor.channels || !window.elementor.channels.editor) return;

    // Global colors live preview for Interactive Cursor
    try {
        window.elementor.channels.editor.on('change:__globals__', function(view) {
            var model = view && view.model ? view.model : null;
            if (!model || typeof model.get !== 'function') return;
            var settings = model.get('settings');
            if (!settings || typeof settings.get !== 'function') return;
            var globals = settings.get('__globals__');
            if (!globals || typeof globals !== 'object') return;
            var hasRelevant = globals['emje_interaction_cursor_bg_color'] !== undefined ||
                globals['emje_interaction_cursor_text_color'] !== undefined ||
                globals['emje_interaction_cursor_color'] !== undefined ||
                globals['emje_interaction_cursor_typography_font_family'] !== undefined ||
                globals['emje_interaction_cursor_typography_typography'] !== undefined;
            if (!hasRelevant) return;
            var win = getPreviewWindow();
            var doc = getPreviewDocument();
            if (!win || !doc) return;
            var widgetId = model.get('id');
            var target = findTarget(doc, widgetId, 'data-emje-cursor') || doc.querySelector('[data-id="' + widgetId + '"]');
            if (!target) return;
            var cfg = buildInteractionConfig(settings);
            if (!cfg.enable || cfg.effect !== 'interactive-cursor' || !cfg.livePreview) return;
            try { target.setAttribute('data-emje-cursor', JSON.stringify(serializeCursorPayload(cfg))); } catch(e){}
            if (win.EmjeMotionCursor && win.EmjeMotionCursor.reInit) win.EmjeMotionCursor.reInit(target);
        });
    } catch(e){}

    window.elementor.channels.editor.on('change', function(view) {
        var resolved = resolveEditedModel(view);
        var editedView = resolved.editedView;
        var model = resolved.model;
        var settings = resolved.settings;
        var widgetType = resolved.widgetType;
        var widgetId = resolved.widgetId;

        if (!settings || typeof settings.get !== 'function') return;
        var win = getPreviewWindow();
        var doc = getPreviewDocument();
        if (!win || !doc) return;

        if (widgetType === 'heading' || widgetType === 'text-editor') {
            // One by One line mode flows best with a Linear ease: when the
            // mode is just switched to sequence and Ease is still the
            // default, move Ease to Linear automatically. One-way only and
            // loop-safe (the follow-up change no longer matches).
            try {
                var changedAttrs = settings.changed || {};
                if (changedAttrs.emje_motion_fill_line_mode === 'sequence'
                    && settings.get('emje_motion_animation') === 'fill-reveal'
                    && (settings.get('emje_motion_ease') || 'power2.out') === 'power2.out'
                    && typeof settings.set === 'function') {
                    settings.set('emje_motion_ease', 'none');
                }
            } catch (e) {}
        }

        if (widgetType === 'heading' || widgetType === 'text-editor') {
            if (settings.get('emje_motion_live_preview') !== 'yes') return;
            if (settings.get('emje_motion_enable') !== 'yes') return;
            var liveView = editedView || view;
            clearTimeout(liveView._emjeLiveTimeout);
            liveView._emjeLiveTimeout = setTimeout(function() {
                var target = findTarget(doc, widgetId, 'data-emje-motion');
                if (!target) return;
                var config = buildTextMotionConfig(settings);
                try {
                    target.setAttribute('data-emje-motion', JSON.stringify(config));
                } catch (err) {}
                if (win.EmjeMotion && win.EmjeMotion.refresh) {
                    win.EmjeMotion.refresh(target);
                }
            }, 100);
        }

        if (widgetType === 'container') {
            // Hover Reveal: handle enable + live preview, destroy when off
            (function() {
                var hoverEnable = settings.get('emje_hover_reveal_enable') === 'yes';
                var hoverLive = settings.get('emje_hover_reveal_live_preview') === 'yes';
                var hoverTarget = findTarget(doc, widgetId, 'data-emje-hover-reveal');
                // If enable off or live off, destroy existing instance
                if (!hoverEnable || !hoverLive) {
                    if (hoverTarget && win.EmjeMotionHoverReveal) {
                        try { hoverTarget.removeAttribute('data-emje-hover-reveal'); } catch (e) {}
                        // Destroy instance if exists
                        try {
                            if (!destroyLayerInstance(win.EmjeMotionHoverReveal, hoverTarget, 'emjeHoverRevealInitialized')
                                && hoverTarget.dataset.emjeHoverRevealInitialized === 'true') {
                                // Fallback: still try reInit with empty to clean
                                if (win.EmjeMotionHoverReveal.reInit) win.EmjeMotionHoverReveal.reInit(hoverTarget);
                                delete hoverTarget.dataset.emjeHoverRevealInitialized;
                            }
                        } catch (e) {}
                    }
                    return;
                }
                // Both on: reInit with new config
                clearTimeout(editedView ? editedView._emjeHoverTimeout : view._emjeHoverTimeout);
                var hoverTimer = setTimeout(function() {
                    var target = findTarget(doc, widgetId, 'data-emje-hover-reveal');
                    if (!target) return;
                    var cfg = buildHoverConfig(settings);
                    if (!cfg.imageUrl) {
                        try { target.removeAttribute('data-emje-hover-reveal'); } catch (e) {}
                        destroyLayerInstance(win.EmjeMotionHoverReveal, target, 'emjeHoverRevealInitialized');
                        return;
                    }
                    try { target.setAttribute('data-emje-hover-reveal', JSON.stringify(cfg)); } catch (e) {}
                    if (win.EmjeMotionHoverReveal && win.EmjeMotionHoverReveal.reInit) {
                        win.EmjeMotionHoverReveal.reInit(target);
                    }
                }, 150);
                if (editedView) editedView._emjeHoverTimeout = hoverTimer;
                else view._emjeHoverTimeout = hoverTimer;
            })();

            // Interactive Cursor: handle enable + live preview, destroy when off
            (function() {
                var cursorEnable = settings.get('emje_cursor_enable') === 'yes';
                var cursorLive = settings.get('emje_cursor_live_preview') === 'yes';
                var cursorTarget = findTarget(doc, widgetId, 'data-emje-cursor');
                if (!cursorEnable || !cursorLive) {
                    if (cursorTarget && win.EmjeMotionCursor) {
                        try { cursorTarget.removeAttribute('data-emje-cursor'); } catch (e) {}
                        try {
                            if (!destroyLayerInstance(win.EmjeMotionCursor, cursorTarget, 'emjeCursorInitialized')
                                && cursorTarget.dataset.emjeCursorInitialized === 'true') {
                                if (win.EmjeMotionCursor.reInit) win.EmjeMotionCursor.reInit(cursorTarget);
                                delete cursorTarget.dataset.emjeCursorInitialized;
                            }
                        } catch (e) {}
                    }
                    return;
                }
                clearTimeout(editedView ? editedView._emjeCursorTimeout : view._emjeCursorTimeout);
                var cursorTimer = setTimeout(function() {
                    var target = findTarget(doc, widgetId, 'data-emje-cursor');
                    if (!target) return;
                    var cfg = buildCursorConfig(settings);
                    try { target.setAttribute('data-emje-cursor', JSON.stringify(cfg)); } catch (e) {}
                    if (win.EmjeMotionCursor && win.EmjeMotionCursor.reInit) {
                        win.EmjeMotionCursor.reInit(target);
                    }
                }, 150);
                if (editedView) editedView._emjeCursorTimeout = cursorTimer;
                else view._emjeCursorTimeout = cursorTimer;
            })();

            // New unified Interaction Motion (1 effect per Container, no both)
            (function() {
                var hasNewEffect = settings.get('emje_interaction_effect') !== undefined;
                var hasNewEnable = settings.get('emje_interaction_enable') !== undefined;
                if (!hasNewEffect && !hasNewEnable) return; // legacy container, already handled above
                var enableNew = settings.get('emje_interaction_enable') === 'yes';
                var liveNew = settings.get('emje_interaction_live_preview') === 'yes';
                var hoverTargetNew = findTarget(doc, widgetId, 'data-emje-hover-reveal');
                var cursorTargetNew = findTarget(doc, widgetId, 'data-emje-cursor');
                var anyTarget = hoverTargetNew || cursorTargetNew || (widgetId ? doc.querySelector('[data-id="' + widgetId + '"]') : null);
                if (!enableNew || !liveNew) {
                    [hoverTargetNew, cursorTargetNew, anyTarget].forEach(function(t){
                        if (!t) return;
                        try { t.removeAttribute('data-emje-hover-reveal'); } catch(e){}
                        try { t.removeAttribute('data-emje-cursor'); } catch(e){}
                        destroyLayerInstance(win.EmjeMotionHoverReveal, t, 'emjeHoverRevealInitialized');
                        destroyLayerInstance(win.EmjeMotionCursor, t, 'emjeCursorInitialized');
                    });
                    return;
                }
                clearTimeout(editedView ? editedView._emjeInteractionTimeout : view._emjeInteractionTimeout);
                var interTimer = setTimeout(function() {
                    var cfg = buildInteractionConfig(settings);
                    if (!cfg.enable) return;
                    if (cfg.effect === 'hover-reveal') {
                        var targetH = findTarget(doc, widgetId, 'data-emje-hover-reveal') || anyTarget;
                        if (!targetH) targetH = findTarget(doc, widgetId, 'data-emje-cursor');
                        if (!targetH) return;
                        if (destroyLayerInstance(win.EmjeMotionCursor, targetH, 'emjeCursorInitialized')) {
                            try { targetH.removeAttribute('data-emje-cursor'); } catch(e){}
                        }
                        if (!cfg.imageUrl) {
                            try { targetH.removeAttribute('data-emje-hover-reveal'); } catch(e){}
                            return;
                        }
                        try { targetH.setAttribute('data-emje-hover-reveal', JSON.stringify(serializeHoverPayload(cfg))); } catch(e){}
                        if (win.EmjeMotionHoverReveal && win.EmjeMotionHoverReveal.reInit) win.EmjeMotionHoverReveal.reInit(targetH);
                    } else {
                        var targetC = findTarget(doc, widgetId, 'data-emje-cursor') || anyTarget;
                        if (!targetC) targetC = findTarget(doc, widgetId, 'data-emje-hover-reveal');
                        if (!targetC) return;
                        if (destroyLayerInstance(win.EmjeMotionHoverReveal, targetC, 'emjeHoverRevealInitialized')) {
                            try { targetC.removeAttribute('data-emje-hover-reveal'); } catch(e){}
                        }
                        try { targetC.setAttribute('data-emje-cursor', JSON.stringify(serializeCursorPayload(cfg))); } catch(e){}
                        if (win.EmjeMotionCursor && win.EmjeMotionCursor.reInit) win.EmjeMotionCursor.reInit(targetC);
                    }
                }, 150);
                if (editedView) editedView._emjeInteractionTimeout = interTimer;
                else view._emjeInteractionTimeout = interTimer;
            })();
        }
    });
}
export function bindContainerGlobalsListener() {
    try {
        if (!window.elementor || !window.elementor.hooks) return;
        window.elementor.hooks.addAction('panel/open_editor/container', function(panel, model, view) {
            try {
                var settings = model.get('settings');
                if (!settings || typeof settings.on !== 'function') return;
                if (settings._emjeGlobalsBound) return;
                settings._emjeGlobalsBound = true;

                var debouncedSync = function() {
                    clearTimeout(settings._emjeGlobalsTimer);
                    settings._emjeGlobalsTimer = setTimeout(function() {
                        var win = getPreviewWindow();
                        var doc = getPreviewDocument();
                        if (!win || !doc || !win.EmjeMotionCursor) return;
                        var widgetId = model.get('id');
                        var target = findTarget(doc, widgetId, 'data-emje-cursor') || doc.querySelector('[data-id="' + widgetId + '"]');
                        if (!target) return;
                        var eff = settings.get('emje_interaction_effect');
                        var en = settings.get('emje_interaction_enable');
                        if (en !== 'yes' || eff !== 'interactive-cursor') return;
                        if (settings.get('emje_interaction_live_preview') !== 'yes') return;
                        var cfg = buildInteractionConfig(settings);
                        if (!cfg.enable || cfg.effect !== 'interactive-cursor') return;
                        try {
                            target.setAttribute('data-emje-cursor', JSON.stringify(serializeCursorPayload(cfg)));
                        } catch(e){}
                        win.EmjeMotionCursor.reInit(target);
                    }, 120);
                };

                // Dot Ring
                settings.on('change:emje_interaction_cursor_color', debouncedSync);
                settings.on('change:emje_interaction_cursor_size', debouncedSync);
                settings.on('change:emje_interaction_cursor_hover_scale', debouncedSync);
                // Text Follow
                settings.on('change:emje_interaction_cursor_bg_color', debouncedSync);
                settings.on('change:emje_interaction_cursor_text_color', debouncedSync);
                settings.on('change:emje_interaction_cursor_text_label', debouncedSync);
                settings.on('change:emje_interaction_cursor_padding_y', debouncedSync);
                settings.on('change:emje_interaction_cursor_padding_x', debouncedSync);
                settings.on('change:emje_interaction_cursor_radius', debouncedSync);
                settings.on('change:emje_interaction_cursor_follow_smoothness', debouncedSync);
                settings.on('change:emje_interaction_cursor_typography_typography', debouncedSync);
                settings.on('change:emje_interaction_cursor_typography_font_family', debouncedSync);
                settings.on('change:emje_interaction_cursor_typography_font_size', debouncedSync);
                settings.on('change:emje_interaction_cursor_typography_font_weight', debouncedSync);
                settings.on('change:emje_interaction_cursor_typography_text_transform', debouncedSync);
                settings.on('change:emje_interaction_cursor_typography_font_style', debouncedSync);
                settings.on('change:emje_interaction_cursor_box_shadow_box_shadow_type', debouncedSync);
                settings.on('change:emje_interaction_cursor_box_shadow_box_shadow', debouncedSync);
                settings.on('change:emje_interaction_cursor_type', debouncedSync);
                settings.on('change:emje_interaction_cursor_disable_mobile', debouncedSync);
                settings.on('change:emje_interaction_hover_disable_mobile', debouncedSync);
                settings.on('change:__globals__', debouncedSync);
                // Fallback generic
                settings.on('change', function(m) {
                    var ch = m.changed || {};
                    if (ch['__globals__'] !== undefined ||
                        ch['emje_interaction_cursor_color'] !== undefined ||
                        ch['emje_interaction_cursor_bg_color'] !== undefined ||
                        ch['emje_interaction_cursor_text_color'] !== undefined ||
                        ch['emje_interaction_cursor_typography_typography'] !== undefined ||
                        ch['emje_interaction_cursor_typography_font_family'] !== undefined ||
                        ch['emje_interaction_cursor_box_shadow_box_shadow'] !== undefined ||
                        ch['emje_interaction_cursor_disable_mobile'] !== undefined ||
                        ch['emje_interaction_hover_disable_mobile'] !== undefined) {
                        debouncedSync();
                    }
                });
            } catch(e){}
        });
    } catch(e){}
}

/**
 * Register all Interaction Motion editor listeners.
 */
export function initInteractionBridge() {
    bindEditorChange();
    bindContainerGlobalsListener();
}
