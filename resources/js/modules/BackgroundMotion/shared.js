/**
 * Shared helpers for Background Motion effects (ASCII / Pixel).
 * Single source of truth — do not duplicate into effect files.
 */
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
