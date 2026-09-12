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

/**
 * Pick an editor color setting with Elementor Global Color support.
 * Single source of truth for the `globals/colors → var(--e-global-color-)`
 * mapping previously duplicated in every bridge config builder.
 * `get` is the settings getter `(key, fallback) => value`.
 */
export function pickEditorColor(get, key, fallback) {
    var c = get(key, fallback);
    if (typeof c !== 'string') c = fallback;
    var globals = get('__globals__', null);
    if (globals && typeof globals === 'object' && globals[key]) {
        var gv = globals[key];
        if (typeof gv === 'string' && gv.indexOf('globals/colors') !== -1) {
            var m = gv.match(/id=([^&]+)/);
            if (m) gv = 'var(--e-global-color-' + m[1].replace(/[^a-zA-Z0-9_-]/g, '') + ')';
        }
        if (isValidEditorColor(gv)) c = gv;
    }
    if (!isValidEditorColor(c)) c = fallback;
    return c;
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

/**
 * Walk an Elementor elements tree and collect container models.
 * Single source of truth for the model walk previously duplicated in
 * previewSync (kit sync + preview-loaded sync).
 */
export function collectContainerModels(models) {
    var out = [];
    var walk = function(collection) {
        if (!collection) return;
        var list = collection.models || collection;
        if (!list || !list.length) return;
        for (var i = 0; i < list.length; i++) {
            var m = list[i];
            if (!m || typeof m.get !== 'function') continue;
            if (m.get('elType') === 'container') out.push(m);
            var ch = m.get('elements');
            if (ch) walk(ch);
        }
    };
    walk(models);
    return out;
}

/**
 * Destroy a layer instance tracked in a module namespace's _instances map
 * (target → {destroy}) and clear its initialized flag. Returns true when
 * something was actually destroyed. Single source of truth for the
 * get → destroy → delete → flag-delete dance previously copied across
 * every bridge file.
 */
export function destroyLayerInstance(holder, target, flag) {
    try {
        if (holder && holder._instances && holder._instances.get(target)) {
            var old = holder._instances.get(target);
            if (old && typeof old.destroy === 'function') old.destroy();
            holder._instances.delete(target);
            if (flag && target.dataset) delete target.dataset[flag];
            return true;
        }
    } catch (e) {}
    return false;
}
