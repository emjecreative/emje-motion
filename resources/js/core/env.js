/**
 * Environment helpers shared by all frontend modules.
 * Single source of truth — do not duplicate into effect files.
 */
export function isEditMode() {
    if (document.body.classList.contains('elementor-editor-active')) {
        return true;
    }
    if (typeof window.elementorFrontend !== 'undefined' && window.elementorFrontend.isEditMode) {
        try { return window.elementorFrontend.isEditMode(); } catch (_e) { return false; }
    }
    return false;
}
