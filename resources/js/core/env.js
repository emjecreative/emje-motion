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

/**
 * Opt-in tracing sink. Zero overhead when the flag is off; single source
 * of truth for the console wrappers previously copied per module.
 */
export function debugLog(enabled, tag, args) {
    try {
        if (!enabled) {
            return;
        }
        var list = Array.prototype.slice.call(args);
        list.unshift(tag);
        if (window.console && window.console.log) {
            window.console.log.apply(window.console, list);
        }
    } catch (_e) {}
}
