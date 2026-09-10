// Shared editor-bridge helpers (preview window, colors, targets, debug).

/**
 * Whitelist image URL schemes (mirror PHP esc_url_raw) so a crafted
 * setting can never inject javascript:/data: into the preview.
 */
export function sanitizeImageUrl(url) {
    if (typeof url !== 'string') return '';
    if (/^(https?:)?\/\//i.test(url)) return url;
    if (/^https?:/i.test(url)) return url;
    return '';
}

export function getPreviewWindow() {
    var iframe = document.getElementById('elementor-preview-iframe');
    return iframe && iframe.contentWindow ? iframe.contentWindow : null;
}

export function getPreviewDocument() {
    var win = getPreviewWindow();
    return win ? win.document : null;
}

export function editorDisableOnMobile() {
    try {
        var g = window.EmjeMotionEditorGlobals;
        if (g && typeof g.disableInteractionOnMobile !== 'undefined') {
            return !!g.disableInteractionOnMobile;
        }
    } catch (e) {}
    return true;
}

export function isValidEditorColor(c) {
    // Mirror PHP ColorResolver::sanitizeColor(): reject anything that
    // could break out of a CSS value context first.
    if (!c || typeof c !== 'string') return false;
    c = c.trim();
    if (/[;{}<>"']|url\(/i.test(c)) return false;
    if (/^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(c)) return true;
    if (/^(?:rgba?|hsla?)\s*\([0-9.,%\s\/]+\)$/i.test(c)) return true;
    if (/^var\(\s*--[a-zA-Z0-9_-]+\s*\)$/i.test(c)) return true;
    if (/^[a-zA-Z]+$/.test(c)) return true;
    return false;
}

export function safeCssEnum(v, re, fallback) {
    // Allowlisted CSS keyword; rejects any break-out characters.
    if (typeof v !== 'string') return fallback;
    v = v.trim();
    if (/[;{}<>"']/.test(v)) return fallback;
    return re.test(v) ? v : fallback;
}

export function safeCssMeasure(v, fallback) {
    // Numeric measurement with a known unit, or a plain number.
    if (v === null || v === undefined) return fallback;
    var s = String(v).trim();
    if (/[;{}<>"']|url\(/i.test(s)) return fallback;
    if (/^[0-9]*\.?[0-9]+(px|em|rem|%|ex|ch|vw|vh)?$/.test(s)) return s;
    return fallback;
}

export function findTarget(previewDoc, widgetId, attr) {
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
        return null;
    }
    return fallback;
}
