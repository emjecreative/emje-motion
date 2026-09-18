/**
 * Mesh Gradient color + motion-type helpers (pure, no GL).
 */
import { DEFAULT_COLORS, LEGACY_PRESETS, resolveCssVar } from './shared.js';

// Motion Type → shader branch index for `u_motion`.
export const MOTIONS = {
    drift: 0,
    swirl: 1,
    pulse: 2,
    flow: 3,
};

// Render resolution per quality setting (fraction of container size).
export const QUALITY_SCALE = {
    low: 0.5,
    balanced: 0.75,
    high: 1.0,
};
/**
 * Parse a CSS color into [r, g, b] 0-1. Supports #RGB, #RGBA, #RRGGBB,
 * #RRGGBBAA (alpha ignored — opacity has its own control),
 * rgb()/rgba() (numeric or % channels), and hsl()/hsla().
 * Returns null when unparseable.
 */
export function parseCssColor(color) {
    if (typeof color !== 'string') {
        return null;
    }
    const c = color.trim().toLowerCase();
    let m = c.match(/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/);
    if (m) {
        let hex = m[1];
        if (hex.length === 3 || hex.length === 4) {
            hex = hex.split('').map((ch) => ch + ch).join('');
        }
        return [
            parseInt(hex.slice(0, 2), 16) / 255,
            parseInt(hex.slice(2, 4), 16) / 255,
            parseInt(hex.slice(4, 6), 16) / 255,
        ];
    }
    m = c.match(/^rgba?\(\s*([0-9.%]+)\s*,\s*([0-9.%]+)\s*,\s*([0-9.%]+)/);
    if (m) {
        const conv = (v) => (v.indexOf('%') !== -1
            ? parseFloat(v) / 100
            : parseFloat(v) / 255);
        const parts = [m[1], m[2], m[3]].map(conv);
        if (parts.every((v) => !Number.isNaN(v))) {
            return [Math.min(1, Math.max(0, parts[0])), Math.min(1, Math.max(0, parts[1])), Math.min(1, Math.max(0, parts[2]))];
        }
    }
    m = c.match(/^hsla?\(\s*([0-9.+-]+)\s*,\s*([0-9.]+)%\s*,\s*([0-9.]+)%/);
    if (m) {
        const h = parseFloat(m[1]);
        const s = parseFloat(m[2]) / 100;
        const l = parseFloat(m[3]) / 100;
        if (!Number.isNaN(h) && !Number.isNaN(s) && !Number.isNaN(l)) {
            return hslToRgb(h, s, l);
        }
    }
    return null;
}
function hslToRgb(h, s, l) {
    const hh = (((h % 360) + 360) % 360) / 360;
    const ss = Math.min(1, Math.max(0, s));
    const ll = Math.min(1, Math.max(0, l));
    if (ss === 0) {
        return [ll, ll, ll];
    }
    const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
    const p = 2 * ll - q;
    const tc = (t) => {
        let tt = t;
        if (tt < 0) tt += 1;
        if (tt > 1) tt -= 1;
        if (tt < 1 / 6) return p + (q - p) * 6 * tt;
        if (tt < 1 / 2) return q;
        if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
        return p;
    };
    return [tc(hh + 1 / 3), tc(hh), tc(hh - 1 / 3)];
}
export function resolveColors(customColors, legacyPreset, doc, el) {
    const legacy = (typeof legacyPreset === 'string' && LEGACY_PRESETS[legacyPreset])
        ? LEGACY_PRESETS[legacyPreset]
        : null;
    return DEFAULT_COLORS.map((fallback, i) => {
        let raw = Array.isArray(customColors) ? customColors[i] : null;
        if (typeof raw === 'string') {
            const resolved = resolveCssVar(raw, doc, el);
            if (resolved !== null) {
                raw = resolved;
            }
        }
        const fromCustom = parseCssColor(raw);
        if (fromCustom) {
            return fromCustom;
        }
        if (legacy) {
            const fromLegacy = parseCssColor(legacy[i]);
            if (fromLegacy) {
                return fromLegacy;
            }
        }
        return parseCssColor(fallback);
    });
}
export function resolveMotion(motion) {
    return (typeof motion === 'string' && MOTIONS[motion] !== undefined) ? motion : 'drift';
}
export function rgbToCss(rgb) {
    const ch = (v) => Math.max(0, Math.min(255, Math.round(v * 255)));
    return `rgb(${ch(rgb[0])}, ${ch(rgb[1])}, ${ch(rgb[2])})`;
}