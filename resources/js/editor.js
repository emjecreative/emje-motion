/**
 * Editor bridge for Emje Motion live preview.
 * Loaded in Elementor editor top frame via elementor/editor/before_enqueue_scripts.
 * TODO: Split God File 1030 LOC → editor/textMotionBridge.js, editor/interactionBridge.js, editor/tooltip.js, editor/previewSync.js
 */
(function() {
    'use strict';

    if (typeof window.elementor === 'undefined' || typeof window.jQuery === 'undefined') {
        return;
    }

    var $ = window.jQuery;

    function getPreviewWindow() {
        var iframe = document.getElementById('elementor-preview-iframe');
        return iframe && iframe.contentWindow ? iframe.contentWindow : null;
    }

    function getPreviewDocument() {
        var win = getPreviewWindow();
        return win ? win.document : null;
    }

    function findTarget(previewDoc, widgetId, attr) {
        if (!previewDoc) return null;
        if (widgetId) {
            var container = previewDoc.querySelector('[data-id="' + widgetId + '"]');
            if (container) {
                var inner = container.querySelector('[' + attr + ']');
                if (inner) return inner;
                if (container.hasAttribute(attr)) return container;
                var wrapper = container.querySelector('.elementor-widget-container');
                if (wrapper) {
                    var wInner = wrapper.querySelector('[' + attr + ']');
                    if (wInner) return wInner;
                }
                var deep = container.querySelector('*[' + attr + ']');
                if (deep) return deep;
                return container;
            }
            var byClass = previewDoc.querySelector('.elementor-element-' + widgetId + ' [' + attr + ']');
            if (byClass) return byClass;
            var byClassSelf = previewDoc.querySelector('.elementor-element-' + widgetId);
            if (byClassSelf) return byClassSelf;
        }
        var fallback = previewDoc.querySelector('[' + attr + ']');
        if (!fallback) {
            var first = previewDoc.querySelector('[data-id]');
            if (first) return first;
        }
        return fallback;
    }

    function buildTextMotionConfig(settings) {
        var get = function(key, def) {
            var v = settings.get(key);
            return v !== undefined && v !== null ? v : def;
        };

        var customChars = get('emje_motion_scramble_custom_characters', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
        if (typeof customChars !== 'string') customChars = String(customChars);
        if (customChars.length > 200) customChars = customChars.substring(0, 200);
        if (customChars === '') customChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

        var scrambleSpeed = parseFloat(get('emje_motion_scramble_speed', 1));
        if (isNaN(scrambleSpeed)) scrambleSpeed = 1;
        scrambleSpeed = Math.max(0.5, Math.min(5, scrambleSpeed));

        var duration = parseFloat(get('emje_motion_duration', 1));
        if (isNaN(duration)) duration = 1;
        duration = Math.max(0, duration);

        var delay = parseFloat(get('emje_motion_delay', 0));
        if (isNaN(delay)) delay = 0;
        delay = Math.max(0, delay);

        var stagger = parseFloat(get('emje_motion_unfold_stagger', 0.04));
        if (isNaN(stagger)) stagger = 0.04;
        stagger = Math.max(0, Math.min(0.5, stagger));

        var splitBy = get('emje_motion_unfold_split_by', 'words');
        if (['words', 'characters'].indexOf(splitBy) === -1) splitBy = 'words';

        var bgOpacity = 0.25;
        var rawOpacity = get('emje_motion_fill_bg_opacity', null);
        if (rawOpacity !== null) {
            if (typeof rawOpacity === 'object' && rawOpacity.size !== undefined) {
                bgOpacity = parseFloat(rawOpacity.size);
            } else if (!isNaN(parseFloat(rawOpacity))) {
                bgOpacity = parseFloat(rawOpacity);
            }
        }
        bgOpacity = Math.max(0, Math.min(1, bgOpacity));

        var fillStagger = parseFloat(get('emje_motion_fill_stagger', 0.15));
        if (isNaN(fillStagger)) fillStagger = 0.15;
        fillStagger = Math.max(0, Math.min(0.5, fillStagger));

        var animation = get('emje_motion_animation', 'scramble-text');
        if (['scramble-text', 'text-unfold', 'fill-reveal'].indexOf(animation) === -1) animation = 'scramble-text';

        var trigger = get('emje_motion_trigger', 'load');
        if (['load', 'viewport', 'hover', 'scroll'].indexOf(trigger) === -1) trigger = 'load';

        var ease = get('emje_motion_ease', 'power2.out');

        // Play Once only for viewport, others always replay (UX)
        var rawPlayOnce = get('emje_motion_play_once', null);
        var playOnce;
        if (trigger === 'viewport') {
            playOnce = (rawPlayOnce === null ? '' : rawPlayOnce) === 'yes'; // default No for viewport
        } else {
            playOnce = false;
        }

        return {
            animation: animation,
            characterSet: get('emje_motion_scramble_character_set', 'letters-numbers'),
            customCharacters: customChars,
            revealOrder: get('emje_motion_scramble_reveal_order', 'left-to-right'),
            scrambleSpeed: scrambleSpeed,
            duration: duration,
            delay: delay,
            ease: ease,
            trigger: trigger,
            playOnce: playOnce,
            splitBy: splitBy,
            stagger: stagger,
            fillBgOpacity: bgOpacity,
            fillStagger: fillStagger,
            livePreview: get('emje_motion_live_preview', 'yes') === 'yes'
        };
    }

    function buildHoverConfig(settings) {
        var get = function(k, d) { var v = settings.get(k); return v !== undefined && v !== null ? v : d; };
        var img = get('emje_hover_reveal_image', null);
        var url = '';
        if (img && typeof img === 'object' && img.url) url = img.url;
        else if (typeof img === 'string') url = img;

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

        return {
            imageUrl: url,
            imageSize: size,
            followSpeed: follow,
            scale: scale,
            animation: anim,
            triggerArea: trigger,
            livePreview: get('emje_hover_reveal_live_preview', '') === 'yes'
        };
    }

    function buildCursorConfig(settings) {
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

        var blend = get('emje_cursor_blend_mode', 'normal');
        if (['normal', 'difference'].indexOf(blend) === -1) blend = 'normal';

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
            blendMode: blend,
            hoverScale: scale,
            hideNative: hide,
            label: label,
            livePreview: get('emje_cursor_live_preview', '') === 'yes'
        };
    }

    function buildInteractionConfig(settings) {
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
            if (img && typeof img === 'object' && img.url) url = img.url;
            else if (typeof img === 'string') url = img;
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
                rotateHover: rotateHover
            };
        } else {
            var type2 = get('emje_interaction_cursor_type', 'text-follow');
            if (type2 === 'dot' || type2 === 'ring') type2 = 'dot-ring';
            if (['dot-ring', 'text-follow', 'trail'].indexOf(type2) === -1) type2 = 'text-follow';
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
            var isValidColor = function(c){ if(!c||typeof c!=='string')return false; c=c.trim(); return /^#([0-9A-F]{3,8})$/i.test(c) || /^(rgba?|hsla?|var)\s*\(.*\)$/i.test(c) || c.indexOf('var(')===0 || /^[a-zA-Z]+$/.test(c); };
            var resolveGlobalColor = function(g){ if(!g||typeof g!=='string')return g; if(g.indexOf('globals/colors')!==-1){ var m=g.match(/id=([^&]+)/); if(m) return 'var(--e-global-color-'+m[1].replace(/[^a-zA-Z0-9_-]/g,'')+')'; } if(g.indexOf('var(')===0) return g; return g; };
            var color2 = get('emje_interaction_cursor_color', '#000000');
            if (!color2 || typeof color2 !== 'string') color2 = '#000000';
            var globalsColorDot = get('__globals__', null);
            if (globalsColorDot && typeof globalsColorDot === 'object' && globalsColorDot['emje_interaction_cursor_color']) {
                var gvColorDot = resolveGlobalColor(globalsColorDot['emje_interaction_cursor_color']);
                if (isValidColor(gvColorDot)) color2 = gvColorDot;
            }
            if (!isValidColor(color2)) color2 = '#000000';
            var blend2 = 'normal';
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
                var legacyFs = getSlider('emje_interaction_cursor_font_size', 14, 10, 24);
                typo.fontSize = legacyFs;
                typo.fontSizeUnit = 'px';
            }
            var typoWeight = get('emje_interaction_cursor_typography_font_weight', '600');
            typo.fontWeight = typoWeight || '600';
            var typoTransform = get('emje_interaction_cursor_typography_text_transform', '');
            typo.textTransform = typoTransform || '';
            var typoStyle = get('emje_interaction_cursor_typography_font_style', '');
            typo.fontStyle = typoStyle || '';
            var typoLineH = get('emje_interaction_cursor_typography_line_height', '');
            if (typoLineH && typeof typoLineH === 'object' && typoLineH.size !== undefined) typo.lineHeight = typoLineH.size + (typoLineH.unit || '');
            else if (typoLineH) typo.lineHeight = String(typoLineH);
            var typoLetter = get('emje_interaction_cursor_typography_letter_spacing', '');
            if (typoLetter && typeof typoLetter === 'object' && typoLetter.size !== undefined) typo.letterSpacing = typoLetter.size + (typoLetter.unit || 'px');
            else if (typoLetter) typo.letterSpacing = String(typoLetter);
            var entrance2 = 'scale';
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
                boxShadowStr = h + 'px ' + v2 + 'px ' + blur + 'px ' + spread + 'px ' + col;
            }
            var legacyShadow = get('emje_interaction_cursor_shadow', 'yes') === 'yes';
            var legacyBlur = getSlider('emje_interaction_cursor_shadow_blur', 32, 0, 60);
            if (boxShadowStr === '0px 8px 32px 0px rgba(0, 0, 0, 0.12)' && !legacyShadow) {
                boxShadowStr = 'none';
            }
            var trailDotsRaw = get('emje_interaction_cursor_trail_dots', null);
            var trailDots = 6;
            if (trailDotsRaw && typeof trailDotsRaw === 'object' && trailDotsRaw.size !== undefined) trailDots = parseInt(trailDotsRaw.size, 10);
            else if (!isNaN(parseInt(trailDotsRaw, 10))) trailDots = parseInt(trailDotsRaw, 10);
            trailDots = Math.max(3, Math.min(12, trailDots));
            var trailSizeRaw = get('emje_interaction_cursor_trail_size', null);
            var trailSize = 20;
            if (trailSizeRaw && typeof trailSizeRaw === 'object' && trailSizeRaw.size !== undefined) trailSize = parseInt(trailSizeRaw.size, 10);
            else if (!isNaN(parseInt(trailSizeRaw, 10))) trailSize = parseInt(trailSizeRaw, 10);
            trailSize = Math.max(4, Math.min(24, trailSize));
            var headColor = get('emje_interaction_cursor_trail_head_color', '#111111');
            var tailColor = get('emje_interaction_cursor_trail_tail_color', '#FF4D5A');
            if (globals && typeof globals === 'object') {
                if (globals['emje_interaction_cursor_trail_head_color']) {
                    var gvHead = resolveGlobalColor(globals['emje_interaction_cursor_trail_head_color']);
                    if (isValidColor(gvHead)) headColor = gvHead;
                }
                if (globals['emje_interaction_cursor_trail_tail_color']) {
                    var gvTail = resolveGlobalColor(globals['emje_interaction_cursor_trail_tail_color']);
                    if (isValidColor(gvTail)) tailColor = gvTail;
                }
            }
            if (!isValidColor(headColor)) headColor = '#111111';
            if (!isValidColor(tailColor)) tailColor = '#FF4D5A';
            var trailLagRaw = get('emje_interaction_cursor_trail_lag', null);
            var trailLag = 0.35;
            if (trailLagRaw && typeof trailLagRaw === 'object' && trailLagRaw.size !== undefined) trailLag = parseFloat(trailLagRaw.size);
            else if (!isNaN(parseFloat(trailLagRaw))) trailLag = parseFloat(trailLagRaw);
            if (isNaN(trailLag)) trailLag = 0.35;
            trailLag = Math.max(0.1, Math.min(0.5, trailLag));
            var trailFade = get('emje_interaction_cursor_trail_fade', 'yes') === 'yes';
            return {
                enable: true,
                effect: effect,
                livePreview: live,
                type: type2,
                size: size2b,
                color: color2,
                blendMode: blend2,
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
                trailDots: trailDots,
                trailSize: trailSize,
                trailHeadColor: headColor,
                trailTailColor: tailColor,
                trailLag: trailLag,
                trailFade: trailFade
            };
        }
    }

    $(document).on('click', '.emje-motion-preview-btn', function(e) {
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

    function bindEditorChange() {
        if (!window.elementor.channels || !window.elementor.channels.editor) return;

        // Global colors live preview for Comet Trail & Interactive Cursor
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
                    globals['emje_interaction_cursor_trail_head_color'] !== undefined ||
                    globals['emje_interaction_cursor_trail_tail_color'] !== undefined ||
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
                try { target.setAttribute('data-emje-cursor', JSON.stringify({type: cfg.type, size: cfg.size, color: cfg.color, blendMode: cfg.blendMode, hoverScale: cfg.hoverScale, hideNative: cfg.hideNative, label: cfg.label, bgColor: cfg.bgColor, textColor: cfg.textColor, paddingY: cfg.paddingY, paddingX: cfg.paddingX, radius: cfg.radius, fontSize: cfg.fontSize, typography: cfg.typography, entrance: cfg.entrance, followSmoothness: cfg.followSmoothness, boxShadow: cfg.boxShadow, shadow: cfg.shadow, shadowBlur: cfg.shadowBlur, trailDots: cfg.trailDots, trailSize: cfg.trailSize, trailHeadColor: cfg.trailHeadColor, trailTailColor: cfg.trailTailColor, trailLag: cfg.trailLag, trailFade: cfg.trailFade, livePreview: cfg.livePreview})); } catch(e){}
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
                            try { targetC.setAttribute('data-emje-cursor', JSON.stringify({type: cfg.type, size: cfg.size, color: cfg.color, blendMode: cfg.blendMode, hoverScale: cfg.hoverScale, hideNative: cfg.hideNative, label: cfg.label, bgColor: cfg.bgColor, textColor: cfg.textColor, paddingY: cfg.paddingY, paddingX: cfg.paddingX, radius: cfg.radius, fontSize: cfg.fontSize, typography: cfg.typography, entrance: cfg.entrance, followSmoothness: cfg.followSmoothness, boxShadow: cfg.boxShadow, shadow: cfg.shadow, shadowBlur: cfg.shadowBlur, trailDots: cfg.trailDots, trailSize: cfg.trailSize, trailHeadColor: cfg.trailHeadColor, trailTailColor: cfg.trailTailColor, trailLag: cfg.trailLag, trailFade: cfg.trailFade, livePreview: cfg.livePreview})); } catch(e){}
                            if (win.EmjeMotionCursor && win.EmjeMotionCursor.reInit) win.EmjeMotionCursor.reInit(targetC);
                        }
                    }, 150);
                    if (editedView) editedView._emjeInteractionTimeout = interTimer;
                    else view._emjeInteractionTimeout = interTimer;
                })();
            }
        });
    }

    function bindTooltips() {
        var process = function() {
            document.querySelectorAll('.emje-control--has-tooltip').forEach(function(ctrl) {
                if (ctrl.querySelector('.emje-tooltip')) return;
                var desc = ctrl.querySelector('.elementor-control-field-description');
                if (!desc) return;
                var text = (desc.textContent || '').trim();
                if (!text) return;
                var titleEl = ctrl.querySelector('.elementor-control-title');
                if (!titleEl) return;
                var tip = document.createElement('span');
                tip.className = 'emje-tooltip';
                tip.setAttribute('tabindex', '0');
                tip.setAttribute('aria-label', text);
                var icon = document.createElement('span');
                icon.className = 'emje-tooltip__icon';
                icon.textContent = 'i';
                var bubble = document.createElement('span');
                bubble.className = 'emje-tooltip__bubble';
                bubble.setAttribute('role', 'tooltip');
                bubble.textContent = text;
                tip.appendChild(icon);
                tip.appendChild(bubble);
                titleEl.appendChild(tip);

                // Position bubble with margin from viewport edges (never cut off left/right)
                var positionBubble = function() {
                    var rect = tip.getBoundingClientRect();
                    var bw = bubble.offsetWidth || 180;
                    var bh = bubble.offsetHeight || 60;
                    var vw = document.documentElement.clientWidth || window.innerWidth;
                    var vh = document.documentElement.clientHeight || window.innerHeight;
                    var margin = 12;
                    // Centered above the icon, clamped with 12px margin so it never touches sidebar edges
                    var left = rect.left + rect.width / 2 - bw / 2;
                    left = Math.max(margin, Math.min(left, vw - bw - margin));
                    var top = rect.top - bh - 8;
                    if (top < margin) {
                        top = rect.bottom + 8;
                    }
                    bubble.style.left = left + 'px';
                    bubble.style.top = top + 'px';
                    bubble.style.transform = 'none';
                };
                tip.addEventListener('mouseenter', positionBubble);
                tip.addEventListener('focus', positionBubble);
                tip.addEventListener('mouseleave', function() {
                    bubble.style.left = '';
                    bubble.style.top = '';
                });
            });
        };
        process();
        // Observe panel for re-render (condition changes)
        try {
            var panel = document.querySelector('#elementor-panel');
            if (panel && typeof MutationObserver !== 'undefined') {
                var obs = new MutationObserver(function() { process(); });
                obs.observe(panel, { childList: true, subtree: true });
            }
        } catch (e) {}
        try {
            if (window.elementor && window.elementor.hooks) {
                window.elementor.hooks.addAction('panel/open_editor/container', process);
                window.elementor.hooks.addAction('panel/open_editor/heading', process);
                window.elementor.hooks.addAction('panel/open_editor/text-editor', process);
            }
        } catch (e) {}
        // Also re-run on elementor init
        try {
            if (window.jQuery) {
                window.jQuery(window).on('elementor:init', process);
            }
        } catch (e) {}
    }

    function bindHeadingIcons() {
        var logoUrl = (window.EmjeMotionConfig && window.EmjeMotionConfig.logoUrl) ? window.EmjeMotionConfig.logoUrl : (window.EMJE_MOTION_URL ? window.EMJE_MOTION_URL + 'assets/images/emje-motion-logo.svg' : 'assets/images/emje-motion-logo.svg');
        var inject = function() {
            var headings = document.querySelectorAll('#elementor-panel .elementor-panel__heading, #elementor-panel .elementor-panel-heading');
            headings.forEach(function(h) {
                var titleEl = h.querySelector('.elementor-panel-heading__title, .elementor-panel__heading-title, .elementor-panel-heading-title-wrapper, .elementor-panel__heading-title');
                var text = (titleEl ? titleEl.textContent : h.textContent).trim();
                var isText = text === 'Text Motion' || text.indexOf('Text Motion') === 0;
                var isInter = text === 'Interaction Motion' || text.indexOf('Interaction Motion') === 0;
                if (!isText && !isInter) return;
                if (h.querySelector('.emje-panel-heading-icon')) return;
                var img = document.createElement('img');
                img.className = 'emje-panel-heading-icon';
                img.src = logoUrl;
                img.alt = '';
                img.width = 16;
                img.height = 16;
                img.loading = 'eager';
                img.decoding = 'async';
                // Place icon after arrow on left: [arrow] [icon] [Text Motion]
                var arrow = h.querySelector('.elementor-panel__heading__toggle, .elementor-panel-heading__toggle, .eicon-chevron-down, .eicon-chevron-up, .eicon, i');
                try { h.style.display = 'flex'; h.style.alignItems = 'center'; h.style.gap = '6px'; } catch (e) {}
                if (arrow && arrow.parentNode === h && titleEl) {
                    // Insert icon right after arrow, before title
                    if (arrow.nextSibling) {
                        h.insertBefore(img, arrow.nextSibling);
                    } else {
                        h.appendChild(img);
                    }
                    // Ensure order [arrow][icon][title] even if title was before
                    try { if (h.contains(titleEl)) h.appendChild(titleEl); } catch (e) {}
                } else if (titleEl && titleEl.parentNode === h) {
                    // Fallback: insert before title (still between arrow and text if arrow is pseudo)
                    h.insertBefore(img, titleEl);
                } else if (arrow && arrow.parentNode === h) {
                    arrow.parentNode.insertBefore(img, arrow.nextSibling);
                } else {
                    h.insertBefore(img, h.firstChild);
                }
            });
        };
        var debounced = function() { clearTimeout(debounced._t); debounced._t = setTimeout(inject, 80); };
        try {
            if (window.elementor && window.elementor.hooks) {
                window.elementor.hooks.addAction('panel/open_editor/container', debounced);
                window.elementor.hooks.addAction('panel/open_editor/heading', debounced);
                window.elementor.hooks.addAction('panel/open_editor/text-editor', debounced);
            }
        } catch (e) {}
        try {
            var panel = document.querySelector('#elementor-panel');
            if (panel && typeof MutationObserver !== 'undefined') {
                var obs = new MutationObserver(debounced);
                obs.observe(panel, { childList: true, subtree: true });
            }
        } catch (e) {}
        try { if (window.jQuery) window.jQuery(window).on('elementor:init', debounced); } catch (e) {}
        debounced();
    }

    function initBridge() {
        bindEditorChange();
        bindPreviewLoaded();
        bindTooltips();
        bindContainerGlobalsListener();
        bindKitChange();
        bindHeadingIcons();
    }

    function bindContainerGlobalsListener() {
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
                                    type: cfg.type, size: cfg.size, color: cfg.color, blendMode: cfg.blendMode,
                                    hoverScale: cfg.hoverScale, hideNative: cfg.hideNative, label: cfg.label,
                                    bgColor: cfg.bgColor, textColor: cfg.textColor, paddingY: cfg.paddingY, paddingX: cfg.paddingX,
                                    radius: cfg.radius, fontSize: cfg.fontSize, typography: cfg.typography,
                                    entrance: cfg.entrance, followSmoothness: cfg.followSmoothness, boxShadow: cfg.boxShadow,
                                    shadow: cfg.shadow, shadowBlur: cfg.shadowBlur, trailDots: cfg.trailDots, trailSize: cfg.trailSize, trailHeadColor: cfg.trailHeadColor, trailTailColor: cfg.trailTailColor, trailLag: cfg.trailLag, trailFade: cfg.trailFade, livePreview: cfg.livePreview
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
                    // Comet Trail
                    settings.on('change:emje_interaction_cursor_trail_head_color', debouncedSync);
                    settings.on('change:emje_interaction_cursor_trail_tail_color', debouncedSync);
                    settings.on('change:emje_interaction_cursor_trail_dots', debouncedSync);
                    settings.on('change:emje_interaction_cursor_trail_size', debouncedSync);
                    settings.on('change:emje_interaction_cursor_trail_lag', debouncedSync);
                    settings.on('change:emje_interaction_cursor_trail_fade', debouncedSync);
                    settings.on('change:emje_interaction_cursor_type', debouncedSync);
                    settings.on('change:__globals__', debouncedSync);
                    // Fallback generic
                    settings.on('change', function(m) {
                        var ch = m.changed || {};
                        if (ch['__globals__'] !== undefined ||
                            ch['emje_interaction_cursor_color'] !== undefined ||
                            ch['emje_interaction_cursor_bg_color'] !== undefined ||
                            ch['emje_interaction_cursor_text_color'] !== undefined ||
                            ch['emje_interaction_cursor_trail_head_color'] !== undefined ||
                            ch['emje_interaction_cursor_trail_tail_color'] !== undefined ||
                            ch['emje_interaction_cursor_typography_typography'] !== undefined ||
                            ch['emje_interaction_cursor_typography_font_family'] !== undefined ||
                            ch['emje_interaction_cursor_box_shadow_box_shadow'] !== undefined) {
                            debouncedSync();
                        }
                    });
                } catch(e){}
            });
        } catch(e){}
    }

    function bindKitChange() {
        var syncKit = function() {
            var win = getPreviewWindow();
            var doc = getPreviewDocument();
            if (!win || !doc) return;
            try {
                var allModels = [];
                var collect = function(collection) {
                    if (!collection) return;
                    var models = collection.models || collection;
                    if (!models || !models.length) return;
                    for (var i = 0; i < models.length; i++) {
                        var m = models[i];
                        if (!m || typeof m.get !== 'function') continue;
                        if (m.get('elType') === 'container') allModels.push(m);
                        var ch = m.get('elements');
                        if (ch) collect(ch);
                    }
                };
                if (window.elementor && window.elementor.elements && window.elementor.elements.models) {
                    collect(window.elementor.elements.models);
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
                        try { target.setAttribute('data-emje-cursor', JSON.stringify({type: cfg.type, size: cfg.size, color: cfg.color, blendMode: cfg.blendMode, hoverScale: cfg.hoverScale, hideNative: cfg.hideNative, label: cfg.label, bgColor: cfg.bgColor, textColor: cfg.textColor, paddingY: cfg.paddingY, paddingX: cfg.paddingX, radius: cfg.radius, fontSize: cfg.fontSize, typography: cfg.typography, entrance: cfg.entrance, followSmoothness: cfg.followSmoothness, boxShadow: cfg.boxShadow, shadow: cfg.shadow, shadowBlur: cfg.shadowBlur, trailDots: cfg.trailDots, trailSize: cfg.trailSize, trailHeadColor: cfg.trailHeadColor, trailTailColor: cfg.trailTailColor, trailLag: cfg.trailLag, trailFade: cfg.trailFade, livePreview: cfg.livePreview})); } catch(e){}
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

    function bindPreviewLoaded() {
        // Ensure live preview is applied on editor open / preview reload, not only on change
        var doPreviewSync = function() {
            var win = getPreviewWindow();
            var doc = getPreviewDocument();
            if (!win || !doc) return;

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
                                try {
                                    if (win2.EmjeMotionHoverReveal && win2.EmjeMotionHoverReveal._instances && win2.EmjeMotionHoverReveal._instances.get(t)) {
                                        var oh = win2.EmjeMotionHoverReveal._instances.get(t);
                                        if (oh && typeof oh.destroy === 'function') oh.destroy();
                                        win2.EmjeMotionHoverReveal._instances.delete(t);
                                        delete t.dataset.emjeHoverRevealInitialized;
                                    }
                                } catch(e){}
                                try {
                                    if (win2.EmjeMotionCursor && win2.EmjeMotionCursor._instances && win2.EmjeMotionCursor._instances.get(t)) {
                                        var oc = win2.EmjeMotionCursor._instances.get(t);
                                        if (oc && typeof oc.destroy === 'function') oc.destroy();
                                        win2.EmjeMotionCursor._instances.delete(t);
                                        delete t.dataset.emjeCursorInitialized;
                                    }
                                } catch(e){}
                            });
                            return;
                        }
                        var cfgNew = buildInteractionConfig(settings);
                        if (!cfgNew.enable) return;
                        if (cfgNew.effect === 'hover-reveal') {
                            var targetH = findTarget(doc2, widgetId, 'data-emje-hover-reveal') || findTarget(doc2, widgetId, 'data-emje-cursor') || (widgetId ? doc2.querySelector('[data-id="' + widgetId + '"]') : null);
                            if (!targetH) return;
                            // Clean cursor if switching
                            try {
                                if (win2.EmjeMotionCursor && win2.EmjeMotionCursor._instances && win2.EmjeMotionCursor._instances.get(targetH)) {
                                    var oc3 = win2.EmjeMotionCursor._instances.get(targetH);
                                    if (oc3 && typeof oc3.destroy === 'function') oc3.destroy();
                                    win2.EmjeMotionCursor._instances.delete(targetH);
                                    delete targetH.dataset.emjeCursorInitialized;
                                    targetH.removeAttribute('data-emje-cursor');
                                }
                            } catch(e){}
                            if (!cfgNew.imageUrl) {
                                try { targetH.removeAttribute('data-emje-hover-reveal'); } catch(e){}
                                return;
                            }
                            try { targetH.setAttribute('data-emje-hover-reveal', JSON.stringify({imageUrl: cfgNew.imageUrl, imageSize: cfgNew.imageSize, followSpeed: cfgNew.followSpeed, scale: cfgNew.scale, animation: cfgNew.animation, triggerArea: cfgNew.triggerArea, livePreview: cfgNew.livePreview, offsetX: cfgNew.offsetX, offsetY: cfgNew.offsetY, rotate: cfgNew.rotate, rotateHover: cfgNew.rotateHover})); } catch(e){}
                            if (win2.EmjeMotionHoverReveal && win2.EmjeMotionHoverReveal.reInit) win2.EmjeMotionHoverReveal.reInit(targetH);
                        } else {
                            var targetC = findTarget(doc2, widgetId, 'data-emje-cursor') || findTarget(doc2, widgetId, 'data-emje-hover-reveal') || (widgetId ? doc2.querySelector('[data-id="' + widgetId + '"]') : null);
                            if (!targetC) return;
                            try {
                                if (win2.EmjeMotionHoverReveal && win2.EmjeMotionHoverReveal._instances && win2.EmjeMotionHoverReveal._instances.get(targetC)) {
                                    var oh3 = win2.EmjeMotionHoverReveal._instances.get(targetC);
                                    if (oh3 && typeof oh3.destroy === 'function') oh3.destroy();
                                    win2.EmjeMotionHoverReveal._instances.delete(targetC);
                                    delete targetC.dataset.emjeHoverRevealInitialized;
                                    targetC.removeAttribute('data-emje-hover-reveal');
                                }
                            } catch(e){}
                            try { targetC.setAttribute('data-emje-cursor', JSON.stringify({type: cfgNew.type, size: cfgNew.size, color: cfgNew.color, blendMode: cfgNew.blendMode, hoverScale: cfgNew.hoverScale, hideNative: cfgNew.hideNative, label: cfgNew.label, bgColor: cfgNew.bgColor, textColor: cfgNew.textColor, paddingY: cfgNew.paddingY, paddingX: cfgNew.paddingX, radius: cfgNew.radius, fontSize: cfgNew.fontSize, typography: cfgNew.typography, entrance: cfgNew.entrance, followSmoothness: cfgNew.followSmoothness, boxShadow: cfgNew.boxShadow, shadow: cfgNew.shadow, shadowBlur: cfgNew.shadowBlur, trailDots: cfgNew.trailDots, trailSize: cfgNew.trailSize, trailHeadColor: cfgNew.trailHeadColor, trailTailColor: cfgNew.trailTailColor, trailLag: cfgNew.trailLag, trailFade: cfgNew.trailFade, livePreview: cfgNew.livePreview})); } catch(e){}
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
                            try {
                                if (win2.EmjeMotionHoverReveal && win2.EmjeMotionHoverReveal._instances && win2.EmjeMotionHoverReveal._instances.get(th2)) {
                                    var oh2 = win2.EmjeMotionHoverReveal._instances.get(th2);
                                    if (oh2 && typeof oh2.destroy === 'function') oh2.destroy();
                                    win2.EmjeMotionHoverReveal._instances.delete(th2);
                                    delete th2.dataset.emjeHoverRevealInitialized;
                                }
                            } catch(e){}
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
                            try {
                                if (win2.EmjeMotionCursor && win2.EmjeMotionCursor._instances && win2.EmjeMotionCursor._instances.get(tc2)) {
                                    var oc2 = win2.EmjeMotionCursor._instances.get(tc2);
                                    if (oc2 && typeof oc2.destroy === 'function') oc2.destroy();
                                    win2.EmjeMotionCursor._instances.delete(tc2);
                                    delete tc2.dataset.emjeCursorInitialized;
                                }
                            } catch(e){}
                        }
                    }
                } catch (e) {}
            };

            var syncAllFromModels = function() {
                try {
                    var allModels = [];
                    var collect = function(collection) {
                        if (!collection) return;
                        var models = collection.models || collection;
                        if (!models || !models.length) return;
                        for (var i = 0; i < models.length; i++) {
                            var m = models[i];
                            if (!m || typeof m.get !== 'function') continue;
                            var elType = m.get('elType');
                            if (elType === 'container') {
                                allModels.push(m);
                            }
                            var children = m.get('elements');
                            if (children) collect(children);
                        }
                    };
                    if (window.elementor && window.elementor.elements && window.elementor.elements.models) {
                        collect(window.elementor.elements.models);
                    } else if (window.elementor && window.elementor.getPreviewContainer) {
                        var previewContainer = window.elementor.getPreviewContainer();
                        if (previewContainer && previewContainer.model) {
                            collect([previewContainer.model]);
                        }
                    }
                    // Also try preview window's elementor
                    var winPrev = getPreviewWindow();
                    if (winPrev && winPrev.elementor && winPrev.elementor.elements) {
                        // preview iframe has its own elements? usually not
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
        // Re-bind when elementor:init fires (ensure after editor fully inited)
        try {
            if (window.elementor) {
                window.elementor.on('preview:loaded', doPreviewSync);
            }
        } catch (e) {}
    }

    if (window.elementor && window.elementor.channels && window.elementor.channels.editor) {
        initBridge();
    }
    if (window.jQuery) {
        window.jQuery(window).on('elementor:init', initBridge);
    } else {
        window.addEventListener('elementor:init', initBridge);
    }
})();
