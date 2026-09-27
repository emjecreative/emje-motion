/**
 * Strip dangerous HTML before re-injection (defense-in-depth).
 *
 * Single-pass tokenizer: tags, comments and attributes are parsed linearly
 * character by character (no regex filtering), so nested or overlapping
 * payloads cannot slip through repeated replacements. Elements that can
 * execute code are dropped with their whole subtree, unknown elements are
 * unwrapped, and only allowlisted tags and attributes survive. Event
 * handlers, style attributes and unsafe URL schemes never pass.
 *
 * Input is the page's own serialized markup, so text nodes and quoted
 * attribute values are passed through verbatim.
 *
 * @param {string} html
 * @returns {string}
 */
export function sanitizeHtml(html) {
    if (typeof html !== 'string' || html === '') {
        return html;
    }

    let out = '';
    let i = 0;
    const n = html.length;

    while (i < n) {
        if (html.charCodeAt(i) !== 60) { // '<'
            out += html[i];
            i += 1;
            continue;
        }

        const next = i + 1 < n ? html[i + 1] : '';
        if (next === '!' && html[i + 2] === '-' && html[i + 3] === '-') {
            i = skipComment(html, i);
            continue;
        }
        if (next === '!' || next === '?') {
            i = skipBogus(html, i);
            continue;
        }
        if (next === '/') {
            const parsed = parseTag(html, i + 2, 'close');
            if (parsed === null) {
                out += '&lt;';
                i += 1;
                continue;
            }
            if (ALLOWED_TAGS.has(parsed.name) && !VOID_TAGS.has(parsed.name)) {
                out += '</' + parsed.name + '>';
            }
            i = parsed.after;
            continue;
        }
        if (isAsciiLetter(next)) {
            const parsed = parseTag(html, i + 1, 'open');
            if (parsed === null) {
                out += '&lt;';
                i += 1;
                continue;
            }
            if (DROP_SUBTREE_TAGS.has(parsed.name)) {
                i = skipSubtree(html, parsed.name, parsed.after);
                continue;
            }
            if (!ALLOWED_TAGS.has(parsed.name)) {
                i = parsed.after; // unwrap: drop the tag, keep parsing children
                continue;
            }
            out += renderOpen(parsed.name, parsed.attrs);
            i = parsed.after;
            continue;
        }

        out += '&lt;';
        i += 1;
    }

    return out;
}

const ALLOWED_TAGS = new Set([
    'a', 'abbr', 'b', 'bdi', 'bdo', 'blockquote', 'br', 'cite', 'code',
    'dd', 'del', 'dfn', 'dl', 'dt', 'em', 'h1', 'h2', 'h3', 'h4', 'h5',
    'h6', 'hr', 'i', 'img', 'ins', 'kbd', 'li', 'mark', 'ol', 'p',
    'pre', 'q', 's', 'samp', 'small', 'span', 'strike', 'strong', 'sub',
    'sup', 'time', 'u', 'ul', 'var', 'wbr',
]);

// Dropped with their whole subtree (script-like, embedded, form and
// structural elements have no place in animated text).
const DROP_SUBTREE_TAGS = new Set([
    'applet', 'audio', 'base', 'bgsound', 'button', 'canvas', 'datalist',
    'embed', 'fieldset', 'form', 'frame', 'frameset', 'iframe', 'input',
    'keygen', 'label', 'legend', 'link', 'map', 'math', 'meta', 'noembed',
    'noframes', 'object', 'optgroup', 'option', 'output', 'param', 'script',
    'select', 'slot', 'source', 'style', 'svg', 'template', 'textarea',
    'track', 'video',
]);

const VOID_TAGS = new Set(['br', 'hr', 'img', 'wbr']);

const GLOBAL_ATTRS = new Set(['class', 'id', 'title', 'lang', 'dir']);
const SAFE_SCHEMES = new Set(['http', 'https', 'mailto', 'tel']);
const TARGET_VALUES = new Set(['_self', '_blank', '_parent', '_top']);
const LIST_TYPES = new Set(['1', 'a', 'A', 'i', 'I']);

function isAsciiLetter(ch) {
    const c = ch.charCodeAt(0);
    return (c >= 65 && c <= 90) || (c >= 97 && c <= 122);
}

function isAsciiLetterCode(c) {
    return (c >= 65 && c <= 90) || (c >= 97 && c <= 122);
}

function isDigitCode(c) {
    return c >= 48 && c <= 57;
}

function isSpaceCode(c) {
    return c === 32 || c === 9 || c === 10 || c === 12 || c === 13;
}

function lowerOf(s) {
    return s.toLowerCase();
}

// Index of the '>' closing the tag starting at `from` (quotes respected),
// or -1 when the tag never closes.
function findTagEnd(html, from) {
    let quote = '';
    for (let i = from; i < html.length; i += 1) {
        const ch = html[i];
        if (quote !== '') {
            if (ch === quote) quote = '';
            continue;
        }
        if (ch === '"' || ch === "'") {
            quote = ch;
            continue;
        }
        if (ch === '>') return i;
    }
    return -1;
}

function skipComment(html, lt) {
    const end = html.indexOf('-->', lt + 4);
    return end === -1 ? html.length : end + 3;
}

function skipBogus(html, lt) {
    const gt = findTagEnd(html, lt + 2);
    return gt === -1 ? html.length : gt + 1;
}

// Parse `<name ...>` / `</name ...>`; returns { name, attrs, after }
// (after = index past '>') or null when there is no well-formed tag.
function parseTag(html, at, kind) {
    let i = at;
    let name = '';
    while (i < html.length) {
        const c = html.charCodeAt(i);
        if (isAsciiLetterCode(c) || (name !== '' && isDigitCode(c))) {
            name += html[i];
            i += 1;
            continue;
        }
        break;
    }
    if (name === '') return null;

    const gt = findTagEnd(html, i);
    if (gt === -1) return null;

    const attrs = kind === 'open' ? parseAttrs(lowerOf(name), html, i, gt) : [];
    return { name: lowerOf(name), attrs, after: gt + 1 };
}

function parseAttrs(tag, html, from, gt) {
    const kept = [];
    const seen = new Set();
    let i = from;
    const end = html[gt - 1] === '/' ? gt - 1 : gt;

    while (i < end) {
        while (i < end && isSpaceCode(html.charCodeAt(i))) i += 1;
        if (i >= end || html[i] === '/') {
            i += 1;
            continue;
        }

        let name = '';
        while (i < end) {
            const c = html.charCodeAt(i);
            if (isSpaceCode(c) || c === 47 || c === 62 || c === 61 || c === 34 || c === 39 || c === 96) break;
            name += html[i];
            i += 1;
        }
        if (name === '') {
            i += 1;
            continue;
        }
        name = lowerOf(name);

        while (i < end && isSpaceCode(html.charCodeAt(i))) i += 1;
        let value = '';
        if (html[i] === '=') {
            i += 1;
            while (i < end && isSpaceCode(html.charCodeAt(i))) i += 1;
            if (html[i] === '"' || html[i] === "'") {
                const q = html[i];
                i += 1;
                const start = i;
                while (i < end && html[i] !== q) i += 1;
                value = html.slice(start, i);
                i += 1;
            } else {
                const start = i;
                while (i < end && !isSpaceCode(html.charCodeAt(i)) && html[i] !== '>') i += 1;
                value = html.slice(start, i);
            }
        }

        // Browsers keep the first of duplicate attributes.
        if (seen.has(name)) continue;
        seen.add(name);

        const keptValue = filterAttr(tag, name, value);
        if (keptValue !== null) kept.push([name, keptValue]);
    }

    return kept;
}

// Returns the value to emit, or null to drop the attribute.
function filterAttr(tag, name, value) {
    if (name === '' || name === 'style' || name === 'srcset') return null;
    if (!isAttrName(name)) return null;
    if (name.length > 2 && name.charCodeAt(0) === 111 && name.charCodeAt(1) === 110) return null; // on*
    if (GLOBAL_ATTRS.has(name) || name.indexOf('aria-') === 0) return value;

    if (tag === 'a') {
        if (name === 'href') return isSafeUrl(value, false) ? value : null;
        if (name === 'target') {
            const t = lowerOf(value);
            return TARGET_VALUES.has(t) ? t : null;
        }
        if (name === 'rel') return value;
        return null;
    }
    if (tag === 'img') {
        if (name === 'src') return isSafeUrl(value, true) ? value : null;
        if (name === 'alt') return value;
        if (name === 'width' || name === 'height') return isInteger(value) ? value : null;
        if (name === 'loading') {
            const v = lowerOf(value);
            return v === 'lazy' || v === 'eager' || v === 'auto' ? v : null;
        }
        if (name === 'decoding') {
            const v = lowerOf(value);
            return v === 'async' || v === 'sync' || v === 'auto' ? v : null;
        }
        return null;
    }
    if (name === 'cite' && (tag === 'blockquote' || tag === 'q' || tag === 'del' || tag === 'ins')) {
        return isSafeUrl(value, false) ? value : null;
    }
    if (name === 'datetime' && (tag === 'del' || tag === 'ins' || tag === 'time')) return value;
    if (tag === 'ol') {
        if (name === 'start') return isInteger(value) ? value : null;
        if (name === 'type') return value.length === 1 && LIST_TYPES.has(value) ? value : null;
        if (name === 'reversed' && value === '') return '';
        return null;
    }
    if (tag === 'li' && name === 'value') return isInteger(value) ? value : null;
    return null;
}

function isAttrName(name) {
    for (let i = 0; i < name.length; i += 1) {
        const c = name.charCodeAt(i);
        const ok = (c >= 97 && c <= 122) || (c >= 48 && c <= 57)
            || c === 45 || c === 95 || c === 46 || c === 58; // - _ . :
        if (!ok) return false;
    }
    return name !== '';
}

function isInteger(value) {
    if (value === '') return false;
    let i = value.charCodeAt(0) === 45 ? 1 : 0; // leading '-'
    if (i === 1 && value.length === 1) return false;
    for (; i < value.length; i += 1) {
        if (!isDigitCode(value.charCodeAt(i))) return false;
    }
    return true;
}

// True for relative URLs, #fragments and allowlisted schemes. Control
// characters and stray '&' inside the scheme segment (entity smuggling
// such as `javascript&colon;`) make the URL unsafe.
function isSafeUrl(raw, allowDataImage) {
    let flat = '';
    for (let i = 0; i < raw.length; i += 1) {
        const c = raw.charCodeAt(i);
        if (c === 9 || c === 10 || c === 13) continue;
        flat += raw[i];
    }
    const v = flat.trim();
    if (v === '' || v.charCodeAt(0) === 35) return v !== '';

    let i = 0;
    if (!isAsciiLetterCode(v.charCodeAt(0))) return true; // relative URL
    i = 1;
    while (i < v.length) {
        const c = v.charCodeAt(i);
        if (c === 58) { // ':'
            const scheme = lowerOf(v.slice(0, i));
            if (SAFE_SCHEMES.has(scheme)) return true;
            if (allowDataImage && scheme === 'data') {
                return lowerOf(v.slice(i + 1, i + 12)) === 'image/';
            }
            return false;
        }
        if (!isAsciiLetterCode(c) && !isDigitCode(c) && c !== 43 && c !== 45 && c !== 46) {
            return c === 38 ? false : true; // '&' in scheme segment: unsafe; else relative
        }
        i += 1;
    }
    return true; // no scheme: relative URL
}

function renderOpen(name, attrs) {
    let tagAttrs = attrs;
    if (name === 'a') tagAttrs = withNoopener(attrs);
    let s = '<' + name;
    for (const [k, v] of tagAttrs) {
        s += v === '' ? ' ' + k : ' ' + k + '="' + v + '"';
    }
    return s + '>';
}

// target="_blank" without rel=noopener is reverse tabnabbing.
function withNoopener(attrs) {
    let blank = false;
    let relIndex = -1;
    for (let i = 0; i < attrs.length; i += 1) {
        if (attrs[i][0] === 'target' && attrs[i][1] === '_blank') blank = true;
        if (attrs[i][0] === 'rel') relIndex = i;
    }
    if (!blank) return attrs;
    if (relIndex === -1) return attrs.concat([['rel', 'noopener']]);
    const tokens = attrs[relIndex][1].split(' ');
    if (tokens.indexOf('noopener') !== -1) return attrs;
    tokens.push('noopener');
    const next = attrs.slice();
    next[relIndex] = ['rel', tokens.join(' ')];
    return next;
}

// Drop everything up to the matching close tag (first one wins, like HTML
// raw-text elements). Returns the index past it, or end of input.
function skipSubtree(html, name, from) {
    const lower = lowerOf(html);
    const needle = '</' + name;
    let at = lower.indexOf(needle, from);
    while (at !== -1) {
        let i = at + needle.length;
        while (i < html.length && isSpaceCode(html.charCodeAt(i))) i += 1;
        if (html[i] === '>') return i + 1;
        if (html[i] === '/' && html[i + 1] === '>') return i + 2;
        at = lower.indexOf(needle, at + needle.length);
    }
    return html.length;
}
