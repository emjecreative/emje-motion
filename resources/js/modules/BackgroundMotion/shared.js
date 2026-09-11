/**
 * Shared helpers for Background Motion effects (ASCII / Pixel / Dither).
 * Single source of truth — do not duplicate into effect files.
 */
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
};

export function clampNum(value, range, fallback) {
    const n = parseFloat(value);
    if (Number.isNaN(n)) {
        return fallback;
    }
    return Math.max(range[0], Math.min(range[1], n));
}
export function smoothstep(edge0, edge1, x) {
    if (edge1 <= edge0) {
        return x < edge0 ? 0 : 1;
    }
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
}

export function isEditMode() {
    if (document.body.classList.contains('elementor-editor-active')) {
        return true;
    }
    if (typeof window.elementorFrontend !== 'undefined' && window.elementorFrontend.isEditMode) {
        try { return window.elementorFrontend.isEditMode(); } catch (_e) { return false; }
    }
    return false;
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
