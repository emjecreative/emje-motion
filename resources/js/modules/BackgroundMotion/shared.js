/**
 * Shared helpers for Background Motion effects (ASCII / Pixel / Dither / Mesh).
 * Single source of truth — do not duplicate into effect files.
 */
export { isEditMode } from '../../core/env';

// Default mesh palette (Lagoon) — also the fallback when a custom color
// is unparseable.
export const DEFAULT_COLORS = ['#0C4A6E', '#0284C7', '#5EEAD4', '#F0FDFA'];

// Legacy mesh preset palettes — kept only so saved pages that still carry
// `preset: beach/sunset/ocean` render the same colors after the preset
// control was removed. New configs use `colors` + `motion` directly.
export const LEGACY_PRESETS = {
    beach: ['#D81F1F', '#0438E4', '#78BB8B', '#FAD8D8'],
    sunset: ['#FF6A3D', '#FF2E63', '#7B2FF7', '#F9CB6B'],
    ocean: ['#03045E', '#0077B6', '#00B4D8', '#CAF0F8'],
};

export const LIMITS = {
    pixel: {
        cellSize: [24, 96],
        gap: [0, 12],
        borderW: [0, 2],
        speed: [0.05, 0.5],
        radius: [0, 300],
        trail: [0, 1.5],
        fade: [0, 30],
        maxCells: 3000,
    },
    ascii: {
        cell: [8, 60],
        fontSize: [6, 32],
        radius: [100, 600],
        innerRadius: [0, 200],
        maxOpacity: [0, 1],
        fade: [0, 30],
        maxCells: 2500,
    },
    dither: {
        pixel: [4, 32],
        density: [0, 1],
        scale: [0.5, 4],
        speed: [0, 2],
        rippleStrength: [0, 1],
        rippleWidth: [20, 400],
        rippleSpeed: [100, 1200],
        fade: [0, 30],
        maxDpr: 1.5,
        maxCells: 12000,
    },
    mesh: {
        speed: [0, 4],
        opacity: [0, 1],
        fade: [0, 30],
    },
};

export function clampNum(value, range, fallback) {
    const n = parseFloat(value);
    if (Number.isNaN(n)) {
        return fallback;
    }
    return Math.max(range[0], Math.min(range[1], n));
}

export function toNumber(value, fallback) {
    const n = parseFloat(value);
    return Number.isNaN(n) ? fallback : n;
}
export function smoothstep(edge0, edge1, x) {
    if (edge1 <= edge0) {
        return x < edge0 ? 0 : 1;
    }
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
}

/**
 * Top/bottom feather so the grid melts into the container background.
 * @param {HTMLElement|null} gridEl
 * @param {number} fade percent 0-30
 */
export function applyEdgeMask(gridEl, fade) {
    if (!gridEl) {
        return;
    }
    if (!fade) {
        gridEl.style.maskImage = '';
        gridEl.style.webkitMaskImage = '';
        return;
    }
    const mask = `linear-gradient(to bottom, transparent 0%, black ${fade}%, black ${100 - fade}%, transparent 100%)`;
    gridEl.style.maskImage = mask;
    gridEl.style.webkitMaskImage = mask;
}

/**
 * Resolve a `var(--name)` / `var(--name, fallback)` reference. Elementor
 * emits Global Colors on kit-scoped selectors (not necessarily `:root`),
 * so candidates are tried nearest-first: the element itself (inherits
 * custom properties from its ancestors), then body, then the root.
 * Returns the resolved string, or null when it cannot be resolved
 * (caller falls back to its default). Canvas 2D cannot resolve var()
 * itself, so runtime modules must call this before painting.
 */
export function resolveCssVar(value, doc, el) {
    if (typeof value !== 'string') {
        return null;
    }
    const m = value.trim().match(/^var\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,\s*(.+?)\s*)?\)$/i);
    if (!m) {
        return null;
    }
    if (typeof getComputedStyle !== 'undefined') {
        try {
            const ownerDoc = doc || (typeof document !== 'undefined' ? document : null);
            const scopes = [];
            if (el && typeof el.getAttribute !== 'undefined') {
                scopes.push(el);
            }
            if (ownerDoc) {
                if (ownerDoc.body) {
                    scopes.push(ownerDoc.body);
                }
                if (ownerDoc.documentElement) {
                    scopes.push(ownerDoc.documentElement);
                }
            }
            for (let i = 0; i < scopes.length; i++) {
                try {
                    const computed = getComputedStyle(scopes[i]).getPropertyValue(m[1]).trim();
                    if (computed !== '') {
                        return computed;
                    }
                } catch (_ignored) {}
            }
        } catch (_e) {}
    }
    return m[2] !== undefined ? m[2].trim() : null;
}
