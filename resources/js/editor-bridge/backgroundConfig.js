/**
 * Background Motion config builders + payload serializer.
 * Pure settings-to-config mapping (no DOM, no Elementor channels).
 */
import { pickEditorColor } from './utils.js';
import { DEFAULT_COLORS, LEGACY_PRESETS as LEGACY_MESH_PRESETS } from '../modules/BackgroundMotion/shared';

export function buildBackgroundConfig(settings) {
    var get = function(k, d) { var v = settings.get(k); return v !== undefined && v !== null ? v : d; };
    var enable = get('emje_background_enable', '') === 'yes';
    var live = get('emje_background_live_preview', '') === 'yes';
    if (!enable) {
        return { enable: enable, effect: 'ascii', livePreview: live };
    }
    var effect = get('emje_background_effect', 'ascii');
    if (effect === 'ascii-interactive') effect = 'ascii'; // legacy value
    if (effect !== 'ascii' && effect !== 'pixel' && effect !== 'dither' && effect !== 'mesh') effect = 'ascii';
    if (effect === 'pixel') {
        return buildPixelConfig(settings, live);
    }
    if (effect === 'dither') {
        return buildDitherConfig(settings, live);
    }
    if (effect === 'mesh') {
        return buildMeshConfig(settings, live);
    }
    var num = function(k, def, min, max) {
        var v = get(k, null);
        if (v && typeof v === 'object' && v.size !== undefined) v = v.size;
        var n = parseFloat(v);
        if (isNaN(n)) return def;
        return Math.max(min, Math.min(max, n));
    };
    var color = pickEditorColor(get, 'emje_background_ascii_color', '#1227E2');
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
        disableOnMobile: get('emje_background_ascii_disable_mobile', 'yes') === 'yes'
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
    var fit = get('emje_background_pixel_fit', 'stretch');
    if (['stretch', 'crop'].indexOf(fit) === -1) fit = 'stretch';
    return {
        enable: true,
        effect: 'pixel',
        livePreview: live,
        base: pickEditorColor(get, 'emje_background_pixel_base', '#1227E21A'),
        active: pickEditorColor(get, 'emje_background_pixel_active', '#1227E2'),
        fit: fit,
        cellSize: num('emje_background_pixel_size', 56, 24, 96),
        gap: num('emje_background_pixel_gap', 2, 0, 12),
        borderW: num('emje_background_pixel_border_w', 1, 0, 2),
        border: pickEditorColor(get, 'emje_background_pixel_border', '#1227E21A'),
        speed: num('emje_background_pixel_speed', 0.15, 0.05, 0.5),
        radius: num('emje_background_pixel_radius', 120, 0, 300),
        trail: num('emje_background_pixel_trail', 0.4, 0, 1.5),
        fade: num('emje_background_pixel_fade', 0, 0, 30),
        disableOnMobile: get('emje_background_pixel_disable_mobile', 'yes') === 'yes'
    };
}

export function buildDitherConfig(settings, live) {
    var get = function(k, d) { var v = settings.get(k); return v !== undefined && v !== null ? v : d; };
    var num = function(k, def, min, max) {
        var v = get(k, null);
        if (v && typeof v === 'object' && v.size !== undefined) v = v.size;
        var n = parseFloat(v);
        if (isNaN(n)) return def;
        return Math.max(min, Math.min(max, n));
    };
    return {
        enable: true,
        effect: 'dither',
        livePreview: live,
        fg: pickEditorColor(get, 'emje_background_dither_fg', '#1227E2'),
        bg: pickEditorColor(get, 'emje_background_dither_bg', '#1227E21A'),
        pixel: num('emje_background_dither_pixel', 8, 4, 32),
        density: num('emje_background_dither_density', 0.5, 0, 1),
        scale: num('emje_background_dither_scale', 1.5, 0.5, 4),
        speed: num('emje_background_dither_speed', 0.6, 0, 2),
        ripple: get('emje_background_dither_ripple', 'yes') === 'yes',
        rippleStrength: num('emje_background_dither_ripple_strength', 0.6, 0, 1),
        rippleWidth: num('emje_background_dither_ripple_width', 140, 20, 400),
        rippleSpeed: num('emje_background_dither_ripple_speed', 420, 100, 1200),
        fade: num('emje_background_dither_fade', 0, 0, 30),
        disableOnMobile: get('emje_background_dither_disable_mobile', '') === 'yes'
    };
}

export function buildMeshConfig(settings, live) {
    var get = function(k, d) { var v = settings.get(k); return v !== undefined && v !== null ? v : d; };
    var num = function(k, def, min, max) {
        var v = get(k, null);
        if (v && typeof v === 'object' && v.size !== undefined) v = v.size;
        var n = parseFloat(v);
        if (isNaN(n)) return def;
        return Math.max(min, Math.min(max, n));
    };
    // Removed preset control: saved pages may still carry a preset value,
    // used here only as color fallback so old sections look the same.
    var legacyPreset = get('emje_background_mesh_preset', '');
    var legacyFallbacks = LEGACY_MESH_PRESETS[legacyPreset] || DEFAULT_COLORS;
    var motion = get('emje_background_mesh_motion', 'drift');
    if (['drift', 'swirl', 'pulse', 'flow'].indexOf(motion) === -1) motion = 'drift';
    var quality = get('emje_background_mesh_quality', 'balanced');
    if (['low', 'balanced', 'high'].indexOf(quality) === -1) quality = 'balanced';
    return {
        enable: true,
        effect: 'mesh',
        livePreview: live,
        motion: motion,
        colors: [
            pickEditorColor(get, 'emje_background_mesh_c1', legacyFallbacks[0]),
            pickEditorColor(get, 'emje_background_mesh_c2', legacyFallbacks[1]),
            pickEditorColor(get, 'emje_background_mesh_c3', legacyFallbacks[2]),
            pickEditorColor(get, 'emje_background_mesh_c4', legacyFallbacks[3])
        ],
        speed: num('emje_background_mesh_speed', 2, 0, 4),
        quality: quality,
        opacity: num('emje_background_mesh_opacity', 1, 0, 1),
        fade: num('emje_background_mesh_fade', 0, 0, 30),
        disableOnMobile: get('emje_background_mesh_disable_mobile', '') === 'yes'
    };
}

export function buildBackgroundPayload(cfg) {
    if (cfg.effect === 'mesh') {
        return {
            effect: 'mesh',
            motion: cfg.motion,
            colors: cfg.colors,
            speed: cfg.speed,
            quality: cfg.quality,
            opacity: cfg.opacity,
            fade: cfg.fade,
            disableOnMobile: cfg.disableOnMobile,
            livePreview: cfg.livePreview
        };
    }
    if (cfg.effect === 'dither') {
        return {
            effect: 'dither',
            fg: cfg.fg,
            bg: cfg.bg,
            pixel: cfg.pixel,
            density: cfg.density,
            scale: cfg.scale,
            speed: cfg.speed,
            ripple: cfg.ripple,
            rippleStrength: cfg.rippleStrength,
            rippleWidth: cfg.rippleWidth,
            rippleSpeed: cfg.rippleSpeed,
            fade: cfg.fade,
            disableOnMobile: cfg.disableOnMobile,
            livePreview: cfg.livePreview
        };
    }
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