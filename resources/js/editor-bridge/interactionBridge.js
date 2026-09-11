import { sanitizeImageUrl, getPreviewWindow, getPreviewDocument, isValidEditorColor, safeCssEnum, safeCssMeasure, findTarget } from './utils.js';
import { buildTextMotionConfig } from './textMotionBridge.js';

export function buildHoverConfig(settings) {
    var get = function(k, d) { var v = settings.get(k); return v !== undefined && v !== null ? v : d; };
    var img = get('emje_hover_reveal_image', null);
    var url = '';
    if (img && typeof img === 'object' && img.url) url = sanitizeImageUrl(img.url);
    else if (typeof img === 'string') url = sanitizeImageUrl(img);

    var follow = parseFloat(get('emje_hover_reveal_follow_speed', 0.12));
    if (isNaN(follow)) follow = 0.12;
    follow = Math.max(0.05, Math.min(0.3, follow));

    var scale = parseFloat(get('emje_hover_reveal_scale', 1));
    if (isNaN(scale)) scale = 1;
    scale = Math.max(0.8, Math.min(1.2, scale));

    var anim = get('emje_hover_reveal_animation', 'fade');
    if (['fade', 'scale', 'clip'].indexOf(anim) === -1) anim = 'fade';

    var trigger = get('emje_hover_reveal_trigger_area', 'container');
    if (['container', 'heading'].indexOf(trigger) === -1) trigger = 'container';

    var size = get('emje_hover_reveal_image_size', 'medium');
    if (['thumbnail', 'medium', 'large', 'full'].indexOf(size) === -1) size = 'medium';

    // Legacy PHP hardcodes these (HoverRevealFrontend); mirror for preview parity.
    return {
        imageUrl: url,
        imageSize: size,
        followSpeed: follow,
        scale: scale,
        animation: anim,
        triggerArea: trigger,
        offsetX: 0,
        offsetY: 0,
        rotate: 0,
        rotateHover: 15,
        // Legacy retired controls predate the per-effect toggle — keep the
        // historical hidden-on-touch behavior.
        disableOnMobile: true,
        livePreview: get('emje_hover_reveal_live_preview', '') === 'yes'
    };
}

export function buildCursorConfig(settings) {
    var get = function(k, d) { var v = settings.get(k); return v !== undefined && v !== null ? v : d; };
    var type = get('emje_cursor_type', 'dot-ring');
    if (['dot', 'ring', 'dot-ring'].indexOf(type) === -1) type = 'dot-ring';

    var size = 20;
    var rawSize = get('emje_cursor_size', null);
    if (rawSize && typeof rawSize === 'object' && rawSize.size !== undefined) size = parseInt(rawSize.size, 10);
    else if (!isNaN(parseInt(rawSize, 10))) size = parseInt(rawSize, 10);
    size = Math.max(12, Math.min(40, size));

    var color = get('emje_cursor_color', '#000000');
    if (!color || typeof color !== 'string') color = '#000000';
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(color)) color = '#000000';

    var scale = parseFloat(get('emje_cursor_hover_scale', 1.5));
    if (isNaN(scale)) scale = 1.5;
    scale = Math.max(1.2, Math.min(2, scale));

    var hide = get('emje_cursor_hide_native', 'yes') === 'yes';
    var label = get('emje_cursor_text_label', '');
    if (typeof label !== 'string') label = String(label);
    if (label.length > 20) label = label.substring(0, 20);

    return {
        type: type,
        size: size,
        color: color,
        hoverScale: scale,
        hideNative: hide,
        label: label,
        livePreview: get('emje_cursor_live_preview', '') === 'yes'
    };
}

export function buildInteractionConfig(settings) {
    var get = function(k, d) { var v = settings.get(k); return v !== undefined && v !== null ? v : d; };
    var enable = get('emje_interaction_enable', '') === 'yes';
    var effect = get('emje_interaction_effect', 'hover-reveal');
    if (['hover-reveal', 'interactive-cursor'].indexOf(effect) === -1) effect = 'hover-reveal';
    var live = get('emje_interaction_live_preview', '') === 'yes';

    if (!enable) {
        return { enable: false, effect: effect, livePreview: live };
    }

    if (effect === 'hover-reveal') {
        var img = get('emje_interaction_hover_image', null);
        var url = '';
        if (img && typeof img === 'object' && img.url) url = sanitizeImageUrl(img.url);
        else if (typeof img === 'string') url = sanitizeImageUrl(img);
        var follow = parseFloat(get('emje_interaction_hover_follow_speed', 0.12));
        if (isNaN(follow)) follow = 0.12;
        follow = Math.max(0.05, Math.min(0.3, follow));
        var scale2 = parseFloat(get('emje_interaction_hover_scale', 1));
        if (isNaN(scale2)) scale2 = 1;
        scale2 = Math.max(0.8, Math.min(1.2, scale2));
        var anim = get('emje_interaction_hover_animation', 'fade');
        if (['fade', 'scale', 'clip'].indexOf(anim) === -1) anim = 'fade';
        var trigger = get('emje_interaction_hover_trigger_area', 'container');
        if (['container', 'heading'].indexOf(trigger) === -1) trigger = 'container';
        var size2 = get('emje_interaction_hover_image_size', 'medium');
        if (['thumbnail', 'medium', 'large', 'full'].indexOf(size2) === -1) size2 = 'medium';
        var getNum = function(k, def, min, max) {
            var v = get(k, null);
            if (v && typeof v === 'object' && v.size !== undefined) v = v.size;
            var n = parseInt(v, 10);
            if (isNaN(n)) return def;
            return Math.max(min, Math.min(max, n));
        };
        var offsetX = getNum('emje_interaction_hover_offset_x', 0, -200, 200);
        var offsetY = getNum('emje_interaction_hover_offset_y', 0, -200, 200);
        var rotate = getNum('emje_interaction_hover_rotate', 0, 0, 360);
        var rotateHover = getNum('emje_interaction_hover_rotate_hover', 15, 0, 360);
        return {
            enable: true,
            effect: effect,
            livePreview: live,
            imageUrl: url,
            imageSize: size2,
            followSpeed: follow,
            scale: scale2,
            animation: anim,
            triggerArea: trigger,
            offsetX: offsetX,
            offsetY: offsetY,
            rotate: rotate,
            rotateHover: rotateHover,
            disableOnMobile: get('emje_interaction_hover_disable_mobile', 'yes') === 'yes'
        };
    } else {
        var type2 = get('emje_interaction_cursor_type', 'text-follow');
        if (type2 === 'dot' || type2 === 'ring') type2 = 'dot-ring';
        // Retired 'trail' (Comet Trail) falls through to text-follow.
        if (['dot-ring', 'text-follow'].indexOf(type2) === -1) type2 = 'text-follow';
        var size2b = 20;
        var rawSize2 = get('emje_interaction_cursor_size', null);
        if (rawSize2 && typeof rawSize2 === 'object' && rawSize2.size !== undefined) size2b = parseInt(rawSize2.size, 10);
        else if (!isNaN(parseInt(rawSize2, 10))) size2b = parseInt(rawSize2, 10);
        size2b = Math.max(12, Math.min(40, size2b));
        var getSlider = function(k, def, min, max) {
            var v = get(k, null);
            if (v && typeof v === 'object' && v.size !== undefined) v = v.size;
            var n = parseInt(v, 10);
            if (isNaN(n)) return def;
            return Math.max(min, Math.min(max, n));
        };
        var isValidColor = isValidEditorColor;
        var resolveGlobalColor = function(g){ if(!g||typeof g!=='string')return g; if(g.indexOf('globals/colors')!==-1){ var m=g.match(/id=([^&]+)/); if(m) return 'var(--e-global-color-'+m[1].replace(/[^a-zA-Z0-9_-]/g,'')+')'; } if(g.indexOf('var(')===0) return g; return g; };
        var color2 = get('emje_interaction_cursor_color', '#000000');
        if (!color2 || typeof color2 !== 'string') color2 = '#000000';
        var globalsColorDot = get('__globals__', null);
        if (globalsColorDot && typeof globalsColorDot === 'object' && globalsColorDot['emje_interaction_cursor_color']) {
            var gvColorDot = resolveGlobalColor(globalsColorDot['emje_interaction_cursor_color']);
            if (isValidColor(gvColorDot)) color2 = gvColorDot;
        }
        if (!isValidColor(color2)) color2 = '#000000';
        var scale2b = parseFloat(get('emje_interaction_cursor_hover_scale', 1.5));
        if (isNaN(scale2b)) scale2b = 1.5;
        scale2b = Math.max(1.2, Math.min(2, scale2b));
        var hide2 = get('emje_interaction_cursor_hide_native', '') === 'yes';
        var label2 = '';
        if (type2 === 'text-follow') {
            label2 = get('emje_interaction_cursor_text_label', 'View');
            if (typeof label2 !== 'string') label2 = String(label2);
            if (label2 === '') label2 = 'View';
            if (label2.length > 30) label2 = label2.substring(0, 30);
        }
        var bg2 = get('emje_interaction_cursor_bg_color', '#FFFFFF');
        var textColor2 = get('emje_interaction_cursor_text_color', '#111111');
        var globals = get('__globals__', null);
        if (globals && typeof globals === 'object') {
            if (globals['emje_interaction_cursor_bg_color']) {
                var gv = resolveGlobalColor(globals['emje_interaction_cursor_bg_color']);
                if (isValidColor(gv)) bg2 = gv;
            }
            if (globals['emje_interaction_cursor_text_color']) {
                var gv2 = resolveGlobalColor(globals['emje_interaction_cursor_text_color']);
                if (isValidColor(gv2)) textColor2 = gv2;
            }
        }
        if (!isValidColor(bg2)) bg2 = '#FFFFFF';
        if (!isValidColor(textColor2)) textColor2 = '#111111';
        var padY2 = getSlider('emje_interaction_cursor_padding_y', 40, 8, 48);
        var padX2 = getSlider('emje_interaction_cursor_padding_x', 32, 12, 56);
        var radius2 = getSlider('emje_interaction_cursor_radius', 99, 0, 100);
        var typo = {};
        var typoFamily = get('emje_interaction_cursor_typography_font_family', '');
        if (typeof typoFamily === 'string') typo.fontFamily = typoFamily;
        var typoSizeRaw = get('emje_interaction_cursor_typography_font_size', null);
        if (typoSizeRaw && typeof typoSizeRaw === 'object' && typoSizeRaw.size !== undefined) {
            typo.fontSize = parseInt(typoSizeRaw.size, 10) || 14;
            typo.fontSizeUnit = typoSizeRaw.unit || 'px';
        } else {
            // Legacy v1.0.0 compat: old pages stored a plain font_size
            // slider with no matching Elementor control.
            var legacyFs = getSlider('emje_interaction_cursor_font_size', 14, 10, 24);
            typo.fontSize = legacyFs;
            typo.fontSizeUnit = 'px';
        }
        var typoWeight = get('emje_interaction_cursor_typography_font_weight', '600');
        typo.fontWeight = safeCssEnum(typoWeight, /^(normal|bold|lighter|bolder|[1-9]00)$/, '600');
        var typoTransform = get('emje_interaction_cursor_typography_text_transform', '');
        typo.textTransform = safeCssEnum(typoTransform, /^(none|capitalize|uppercase|lowercase|full-width)$/, '');
        var typoStyle = get('emje_interaction_cursor_typography_font_style', '');
        typo.fontStyle = safeCssEnum(typoStyle, /^(normal|italic|oblique)$/, '');
        var typoLineH = get('emje_interaction_cursor_typography_line_height', '');
        if (typoLineH && typeof typoLineH === 'object' && typoLineH.size !== undefined) typo.lineHeight = safeCssMeasure(typoLineH.size + (typoLineH.unit || ''), '');
        else if (typoLineH) typo.lineHeight = safeCssMeasure(typoLineH, '');
        var typoLetter = get('emje_interaction_cursor_typography_letter_spacing', '');
        if (typoLetter && typeof typoLetter === 'object' && typoLetter.size !== undefined) typo.letterSpacing = safeCssMeasure(typoLetter.size + (typoLetter.unit || 'px'), '');
        else if (typoLetter) typo.letterSpacing = safeCssMeasure(typoLetter, '');
        var entrance2 = get('emje_interaction_cursor_entrance', 'scale');
        if (['scale', 'scale-bounce', 'none'].indexOf(entrance2) === -1) entrance2 = 'scale';
        var smoothRaw2 = get('emje_interaction_cursor_follow_smoothness', null);
        var smooth2 = 0.5;
        if (smoothRaw2 && typeof smoothRaw2 === 'object' && smoothRaw2.size !== undefined) smooth2 = parseFloat(smoothRaw2.size);
        else if (!isNaN(parseFloat(smoothRaw2))) smooth2 = parseFloat(smoothRaw2);
        if (isNaN(smooth2)) smooth2 = 0.5;
        smooth2 = Math.max(0.05, Math.min(0.6, smooth2));
        var boxShadowType = get('emje_interaction_cursor_box_shadow_box_shadow_type', 'yes');
        var boxShadowVal = get('emje_interaction_cursor_box_shadow_box_shadow', null);
        var boxShadowStr = '0px 8px 32px 0px rgba(0, 0, 0, 0.12)';
        if (boxShadowType === '' || boxShadowType === 'no' || boxShadowType === 'none') {
            boxShadowStr = 'none';
        } else if (boxShadowVal && typeof boxShadowVal === 'object') {
            var h = boxShadowVal.horizontal !== undefined ? parseInt(boxShadowVal.horizontal, 10) : 0;
            var v2 = boxShadowVal.vertical !== undefined ? parseInt(boxShadowVal.vertical, 10) : 8;
            var blur = boxShadowVal.blur !== undefined ? parseInt(boxShadowVal.blur, 10) : 32;
            var spread = boxShadowVal.spread !== undefined ? parseInt(boxShadowVal.spread, 10) : 0;
            var col = boxShadowVal.color || 'rgba(0, 0, 0, 0.12)';
            if (!isValidEditorColor(col)) col = 'rgba(0, 0, 0, 0.12)';
            boxShadowStr = h + 'px ' + v2 + 'px ' + blur + 'px ' + spread + 'px ' + col;
        }
        // Legacy v1.0.0 compat: old pages stored plain shadow
        // settings with no matching Elementor control.
        var legacyShadow = get('emje_interaction_cursor_shadow', 'yes') === 'yes';
        var legacyBlur = getSlider('emje_interaction_cursor_shadow_blur', 32, 0, 60);
        if (boxShadowStr === '0px 8px 32px 0px rgba(0, 0, 0, 0.12)' && !legacyShadow) {
            boxShadowStr = 'none';
        }
        return {
            enable: true,
            effect: effect,
            livePreview: live,
            type: type2,
            size: size2b,
            color: color2,
            hoverScale: scale2b,
            hideNative: hide2,
            label: label2,
            bgColor: bg2,
            textColor: textColor2,
            paddingY: padY2,
            paddingX: padX2,
            radius: radius2,
            fontSize: typo.fontSize,
            typography: typo,
            entrance: entrance2,
            followSmoothness: smooth2,
            boxShadow: boxShadowStr,
            shadow: boxShadowStr !== 'none',
            shadowBlur: legacyBlur,
            disableOnMobile: get('emje_interaction_cursor_disable_mobile', 'yes') === 'yes'
        };
    }
}

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
            try { target.setAttribute('data-emje-cursor', JSON.stringify({type: cfg.type, size: cfg.size, color: cfg.color, hoverScale: cfg.hoverScale, hideNative: cfg.hideNative, label: cfg.label, bgColor: cfg.bgColor, textColor: cfg.textColor, paddingY: cfg.paddingY, paddingX: cfg.paddingX, radius: cfg.radius, fontSize: cfg.fontSize, typography: cfg.typography, entrance: cfg.entrance, followSmoothness: cfg.followSmoothness, boxShadow: cfg.boxShadow, shadow: cfg.shadow, shadowBlur: cfg.shadowBlur, livePreview: cfg.livePreview})); } catch(e){}
            if (win.EmjeMotionCursor && win.EmjeMotionCursor.reInit) win.EmjeMotionCursor.reInit(target);
        });
    } catch(e){}

    window.elementor.channels.editor.on('change', function(view) {
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

        if (!settings || typeof settings.get !== 'function') return;
        var win = getPreviewWindow();
        var doc = getPreviewDocument();
        if (!win || !doc) return;

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
                            if (win.EmjeMotionHoverReveal._instances && win.EmjeMotionHoverReveal._instances.get(hoverTarget)) {
                                var oldHover = win.EmjeMotionHoverReveal._instances.get(hoverTarget);
                                if (oldHover && typeof oldHover.destroy === 'function') oldHover.destroy();
                                win.EmjeMotionHoverReveal._instances.delete(hoverTarget);
                                delete hoverTarget.dataset.emjeHoverRevealInitialized;
                            } else if (hoverTarget.dataset.emjeHoverRevealInitialized === 'true') {
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
                        if (win.EmjeMotionHoverReveal && win.EmjeMotionHoverReveal._instances && win.EmjeMotionHoverReveal._instances.get(target)) {
                            var old2 = win.EmjeMotionHoverReveal._instances.get(target);
                            if (old2 && typeof old2.destroy === 'function') old2.destroy();
                            win.EmjeMotionHoverReveal._instances.delete(target);
                            delete target.dataset.emjeHoverRevealInitialized;
                        }
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
                            if (win.EmjeMotionCursor._instances && win.EmjeMotionCursor._instances.get(cursorTarget)) {
                                var oldCur = win.EmjeMotionCursor._instances.get(cursorTarget);
                                if (oldCur && typeof oldCur.destroy === 'function') oldCur.destroy();
                                win.EmjeMotionCursor._instances.delete(cursorTarget);
                                delete cursorTarget.dataset.emjeCursorInitialized;
                            } else if (cursorTarget.dataset.emjeCursorInitialized === 'true') {
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
                        try {
                            if (win.EmjeMotionHoverReveal && win.EmjeMotionHoverReveal._instances && win.EmjeMotionHoverReveal._instances.get(t)) {
                                var oh = win.EmjeMotionHoverReveal._instances.get(t);
                                if (oh && typeof oh.destroy === 'function') oh.destroy();
                                win.EmjeMotionHoverReveal._instances.delete(t);
                                delete t.dataset.emjeHoverRevealInitialized;
                            }
                        } catch(e){}
                        try {
                            if (win.EmjeMotionCursor && win.EmjeMotionCursor._instances && win.EmjeMotionCursor._instances.get(t)) {
                                var oc = win.EmjeMotionCursor._instances.get(t);
                                if (oc && typeof oc.destroy === 'function') oc.destroy();
                                win.EmjeMotionCursor._instances.delete(t);
                                delete t.dataset.emjeCursorInitialized;
                            }
                        } catch(e){}
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
                        try {
                            if (win.EmjeMotionCursor && win.EmjeMotionCursor._instances && win.EmjeMotionCursor._instances.get(targetH)) {
                                var oc3 = win.EmjeMotionCursor._instances.get(targetH);
                                if (oc3 && typeof oc3.destroy === 'function') oc3.destroy();
                                win.EmjeMotionCursor._instances.delete(targetH);
                                delete targetH.dataset.emjeCursorInitialized;
                                targetH.removeAttribute('data-emje-cursor');
                            }
                        } catch(e){}
                        if (!cfg.imageUrl) {
                            try { targetH.removeAttribute('data-emje-hover-reveal'); } catch(e){}
                            return;
                        }
                        try { targetH.setAttribute('data-emje-hover-reveal', JSON.stringify({imageUrl: cfg.imageUrl, imageSize: cfg.imageSize, followSpeed: cfg.followSpeed, scale: cfg.scale, animation: cfg.animation, triggerArea: cfg.triggerArea, livePreview: cfg.livePreview, offsetX: cfg.offsetX, offsetY: cfg.offsetY, rotate: cfg.rotate, rotateHover: cfg.rotateHover})); } catch(e){}
                        if (win.EmjeMotionHoverReveal && win.EmjeMotionHoverReveal.reInit) win.EmjeMotionHoverReveal.reInit(targetH);
                    } else {
                        var targetC = findTarget(doc, widgetId, 'data-emje-cursor') || anyTarget;
                        if (!targetC) targetC = findTarget(doc, widgetId, 'data-emje-hover-reveal');
                        if (!targetC) return;
                        try {
                            if (win.EmjeMotionHoverReveal && win.EmjeMotionHoverReveal._instances && win.EmjeMotionHoverReveal._instances.get(targetC)) {
                                var oh3 = win.EmjeMotionHoverReveal._instances.get(targetC);
                                if (oh3 && typeof oh3.destroy === 'function') oh3.destroy();
                                win.EmjeMotionHoverReveal._instances.delete(targetC);
                                delete targetC.dataset.emjeHoverRevealInitialized;
                                targetC.removeAttribute('data-emje-hover-reveal');
                            }
                        } catch(e){}
                        try { targetC.setAttribute('data-emje-cursor', JSON.stringify({type: cfg.type, size: cfg.size, color: cfg.color, hoverScale: cfg.hoverScale, hideNative: cfg.hideNative, label: cfg.label, bgColor: cfg.bgColor, textColor: cfg.textColor, paddingY: cfg.paddingY, paddingX: cfg.paddingX, radius: cfg.radius, fontSize: cfg.fontSize, typography: cfg.typography, entrance: cfg.entrance, followSmoothness: cfg.followSmoothness, boxShadow: cfg.boxShadow, shadow: cfg.shadow, shadowBlur: cfg.shadowBlur, livePreview: cfg.livePreview})); } catch(e){}
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
                            target.setAttribute('data-emje-cursor', JSON.stringify({
                                type: cfg.type, size: cfg.size, color: cfg.color,
                                hoverScale: cfg.hoverScale, hideNative: cfg.hideNative, label: cfg.label,
                                bgColor: cfg.bgColor, textColor: cfg.textColor, paddingY: cfg.paddingY, paddingX: cfg.paddingX,
                                radius: cfg.radius, fontSize: cfg.fontSize, typography: cfg.typography,
                                entrance: cfg.entrance, followSmoothness: cfg.followSmoothness, boxShadow: cfg.boxShadow,
                                shadow: cfg.shadow, shadowBlur: cfg.shadowBlur, livePreview: cfg.livePreview
                            }));
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
