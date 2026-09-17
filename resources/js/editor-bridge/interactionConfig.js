/**
 * Interaction Motion config builders + preview payload serializers.
 * Pure settings-to-config mapping (no DOM, no Elementor channels).
 */
import { sanitizeImageUrl, isValidEditorColor, pickEditorColor, safeCssEnum, safeCssMeasure, clampNum, getSliderInt, getSliderFloat } from './utils.js';

/**
 * P4: samakan gambar editor vs web.
 * PHP pakai sized URL (thumbnail/medium/large/full).
 * Editor coba pakai sized URL kalau Elementor menyimpannya,
 * kalau tidak ada tetap pakai url asli (tampilan ukuran tetap sama
 * karena HoverReveal.js pakai sizeMap yang sama di editor + frontend).
 */
function pickHoverImageUrl(img, size) {
    if (!img) return '';
    if (typeof img === 'string') return sanitizeImageUrl(img);
    if (typeof img === 'object') {
        var sizes = img.sizes || img.size_urls || null;
        if (sizes && typeof sizes === 'object' && size && sizes[size]) {
            var s = sizes[size];
            if (typeof s === 'string' && s) return sanitizeImageUrl(s);
            if (s && typeof s === 'object' && s.url) return sanitizeImageUrl(s.url);
        }
        if (img.url) return sanitizeImageUrl(img.url);
    }
    return '';
}

export function buildHoverConfig(settings) {
    var get = function(k, d) { var v = settings.get(k); return v !== undefined && v !== null ? v : d; };
    var img = get('emje_hover_reveal_image', null);
    var size = get('emje_hover_reveal_image_size', 'medium');
    if (['thumbnail', 'medium', 'large', 'full'].indexOf(size) === -1) size = 'medium';
    var url = pickHoverImageUrl(img, size);

    var follow = clampNum(get('emje_hover_reveal_follow_speed', 0.12), 0.05, 0.3, 0.12);

    var scale = clampNum(get('emje_hover_reveal_scale', 1), 0.8, 1.2, 1);

    var anim = get('emje_hover_reveal_animation', 'fade');
    // 'scale' dihapus: nilai lama otomatis jadi 'fade'.
    if (['fade', 'clip', 'blocks'].indexOf(anim) === -1) anim = 'fade';

    var trigger = get('emje_hover_reveal_trigger_area', 'container');
    if (['container', 'heading'].indexOf(trigger) === -1) trigger = 'container';

    // Legacy PHP hardcodes these (InteractionMotionFrontend); mirror for preview parity.
    return {
        imageUrl: url,
        imageSize: size,
        followSpeed: follow,
        scale: scale,
        animation: anim,
        clipDirection: 'left',
        duration: anim === 'clip' ? 0.4 : 0.25,
        cols: 5,
        rows: 7,
        blockOrder: 'random',
        blockSpeed: 0.02,
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
    // Same canonical defaults as the PHP legacy branch
    // (InteractionMotionFrontend): unknown types fall to text-follow,
    // native cursor visible unless explicitly hidden, label 'View'.
    var type = get('emje_cursor_type', 'text-follow');
    if (type === 'dot' || type === 'ring') type = 'dot-ring';
    if (['dot-ring', 'text-follow'].indexOf(type) === -1) type = 'text-follow';

    var size = getSliderInt(get, 'emje_cursor_size', 20, 12, 40);

    var color = get('emje_cursor_color', '#000000');
    if (!color || typeof color !== 'string') color = '#000000';
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(color)) color = '#000000';

    var scale = clampNum(get('emje_cursor_hover_scale', 1.5), 1.2, 2, 1.5);

    var hide = get('emje_cursor_hide_native', '') === 'yes';
    var label = get('emje_cursor_text_label', 'View');
    if (typeof label !== 'string') label = String(label);
    if (label === '') label = 'View';
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
        var size2 = get('emje_interaction_hover_image_size', 'medium');
        if (['thumbnail', 'medium', 'large', 'full'].indexOf(size2) === -1) size2 = 'medium';
        var img = get('emje_interaction_hover_image', null);
        var url = pickHoverImageUrl(img, size2);
        var follow = clampNum(get('emje_interaction_hover_follow_speed', 0.12), 0.05, 0.3, 0.12);
        // Kontrol 'Scale on Hover' dihapus dari panel, tapi nilai yang
        // sudah tersimpan di halaman lama tetap dibaca (back-compat).
        var scale2 = clampNum(get('emje_interaction_hover_scale', 1), 0.8, 1.2, 1);
        var anim = get('emje_interaction_hover_animation', 'fade');
        // 'scale' dihapus: nilai lama otomatis jadi 'fade'.
        if (['fade', 'clip', 'blocks'].indexOf(anim) === -1) anim = 'fade';
        var trigger = get('emje_interaction_hover_trigger_area', 'container');
        if (['container', 'heading'].indexOf(trigger) === -1) trigger = 'container';
        var clipDir = get('emje_interaction_hover_clip_direction', 'left');
        if (['left', 'right', 'top', 'bottom'].indexOf(clipDir) === -1) clipDir = 'left';
        // Durasi bawaan = perilaku lama per animasi. Kontrol baru default 0.3.
        var durDef = anim === 'clip' ? 0.4 : 0.25;
        var duration = getSliderFloat(get, 'emje_interaction_hover_duration', durDef, 0.1, 1);
        var cols = getSliderInt(get, 'emje_interaction_hover_blocks_columns', 5, 2, 10);
        var rows = getSliderInt(get, 'emje_interaction_hover_blocks_rows', 7, 2, 12);
        var order = get('emje_interaction_hover_blocks_order', 'random');
        if (['random', 'rows'].indexOf(order) === -1) order = 'random';
        var blockSpeed = getSliderFloat(get, 'emje_interaction_hover_blocks_speed', 0.02, 0.005, 0.06);
        var offsetX = getSliderInt(get, 'emje_interaction_hover_offset_x', 0, -200, 200);
        var offsetY = getSliderInt(get, 'emje_interaction_hover_offset_y', 0, -200, 200);
        var rotate = getSliderInt(get, 'emje_interaction_hover_rotate', 0, -360, 360);
        var rotateHover = getSliderInt(get, 'emje_interaction_hover_rotate_hover', 15, -360, 360);
        return {
            enable: true,
            effect: effect,
            livePreview: live,
            imageUrl: url,
            imageSize: size2,
            followSpeed: follow,
            scale: scale2,
            animation: anim,
            clipDirection: clipDir,
            duration: duration,
            cols: cols,
            rows: rows,
            blockOrder: order,
            blockSpeed: blockSpeed,
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
        var size2b = getSliderInt(get, 'emje_interaction_cursor_size', 20, 12, 40);
        var color2 = pickEditorColor(get, 'emje_interaction_cursor_color', '#000000');
        var scale2b = clampNum(get('emje_interaction_cursor_hover_scale', 1.5), 1.2, 2, 1.5);
        var hide2 = get('emje_interaction_cursor_hide_native', '') === 'yes';
        var label2 = '';
        if (type2 === 'text-follow') {
            label2 = get('emje_interaction_cursor_text_label', 'View');
            if (typeof label2 !== 'string') label2 = String(label2);
            if (label2 === '') label2 = 'View';
            if (label2.length > 30) label2 = label2.substring(0, 30);
        }
        var bg2 = pickEditorColor(get, 'emje_interaction_cursor_bg_color', '#FFFFFF');
        var textColor2 = pickEditorColor(get, 'emje_interaction_cursor_text_color', '#111111');
        var padY2 = getSliderInt(get, 'emje_interaction_cursor_padding_y', 40, 8, 48);
        var padX2 = getSliderInt(get, 'emje_interaction_cursor_padding_x', 32, 12, 56);
        var radius2 = getSliderInt(get, 'emje_interaction_cursor_radius', 99, 0, 100);
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
            var legacyFs = getSliderInt(get, 'emje_interaction_cursor_font_size', 14, 10, 24);
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
        var smooth2 = getSliderFloat(get, 'emje_interaction_cursor_follow_smoothness', 0.5, 0.05, 0.6);
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
        var legacyBlur = getSliderInt(get, 'emje_interaction_cursor_shadow_blur', 32, 0, 60);
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

/**
 * Serialize a cursor config to the exact data-attribute payload the
 * frontend runtime consumes. Single source of truth for the object
 * previously copied inline at every preview sync site (which drifted:
 * some copies omitted disableOnMobile).
 */
export function serializeCursorPayload(cfg) {
    return {
        type: cfg.type, size: cfg.size, color: cfg.color,
        hoverScale: cfg.hoverScale, hideNative: cfg.hideNative, label: cfg.label,
        bgColor: cfg.bgColor, textColor: cfg.textColor, paddingY: cfg.paddingY, paddingX: cfg.paddingX,
        radius: cfg.radius, fontSize: cfg.fontSize, typography: cfg.typography,
        entrance: cfg.entrance, followSmoothness: cfg.followSmoothness, boxShadow: cfg.boxShadow,
        shadow: cfg.shadow, shadowBlur: cfg.shadowBlur, disableOnMobile: cfg.disableOnMobile !== false,
        livePreview: cfg.livePreview
    };
}

/**
 * Serialize a hover-reveal config to its data-attribute payload.
 * See serializeCursorPayload for why this lives in one place.
 */
export function serializeHoverPayload(cfg) {
    return {
        imageUrl: cfg.imageUrl, imageSize: cfg.imageSize, followSpeed: cfg.followSpeed,
        scale: cfg.scale, animation: cfg.animation, clipDirection: cfg.clipDirection || 'left',
        duration: cfg.duration !== undefined ? cfg.duration : (cfg.animation === 'clip' ? 0.4 : 0.25),
        cols: cfg.cols || 5, rows: cfg.rows || 7,
        blockOrder: cfg.blockOrder || 'random', blockSpeed: cfg.blockSpeed || 0.02,
        triggerArea: cfg.triggerArea,
        livePreview: cfg.livePreview, offsetX: cfg.offsetX, offsetY: cfg.offsetY,
        rotate: cfg.rotate, rotateHover: cfg.rotateHover, disableOnMobile: cfg.disableOnMobile !== false
    };
}