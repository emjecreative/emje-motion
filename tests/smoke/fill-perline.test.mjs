import { tmpUrl, eq } from './helpers.mjs';

// Minimal fake DOM: just enough for TextSplitter line grouping +
// fillBuild visual-line measurement (2 visual rows).
globalThis.Node = { TEXT_NODE: 3, ELEMENT_NODE: 1 };

let wordSeq = 0;

function textOf(n) {
    if (!n) return '';
    if (n.nodeType === 3) return n.textContent;
    return (n.childNodes || []).map(textOf).join('');
}

function serialize(n) {
    if (!n) return '';
    if (n.nodeType === 3) return n.textContent;
    if (n.nodeType === 11) return (n.childNodes || []).map(serialize).join('');
    const tag = String(n.tagName || 'div').toLowerCase();
    return `<${tag} class="${n.className || ''}">${(n.childNodes || []).map(serialize).join('')}</${tag}>`;
}

function detach(c) {
    const p = c.parentNode;
    if (!p) return;
    p.childNodes = (p.childNodes || []).filter((x) => x !== c);
    p.children = (p.children || []).filter((x) => x !== c);
    p._dirty = true;
    c.parentNode = null;
}

function replaceWith(...nodes) {
    const flat = [];
    nodes.forEach((n) => {
        if (n && n.nodeType === 11) flat.push(...(n.childNodes || []));
        else flat.push(n);
    });
    const p = this.parentNode;
    if (!p) return;
    const i = (p.childNodes || []).indexOf(this);
    flat.forEach((n) => { detach(n); n.parentNode = p; });
    if (i === -1) {
        flat.forEach((n) => { p.childNodes.push(n); });
    } else {
        p.childNodes.splice(i, 1, ...flat);
    }
    p.children = (p.childNodes || []).filter((x) => x && x.nodeType === 1);
    p._dirty = true;
}

function makeText(t) {
    return { nodeType: 3, textContent: String(t), parentNode: null, replaceWith };
}

function matchSel(n, sel) {
    if (!n || n.nodeType !== 1) return false;
    if (sel[0] === '.') return String(n.className || '').split(/\s+/).includes(sel.slice(1));
    return String(n.tagName || '').toLowerCase() === sel.toLowerCase();
}

function makeEl(tag) {
    const el = {
        nodeType: 1,
        tagName: String(tag).toUpperCase(),
        className: '',
        _raw: '',
        _dirty: false,
        style: {},
        children: [],
        childNodes: [],
        parentNode: null,
        dataset: {},
        _attrs: {},
        set innerHTML(v) {
            const s = String(v);
            this._raw = s;
            this._dirty = false;
            this.children = [];
            this.childNodes = [];
            if (s !== '') this.appendChild(makeText(s));
        },
        get innerHTML() {
            if (this._dirty) return this.children.map(serialize).join('');
            return this._raw;
        },
        set textContent(v) {
            this.innerHTML = String(v);
        },
        get textContent() {
            return textOf(this);
        },
        appendChild(c) {
            detach(c);
            c.parentNode = this;
            this.children.push(c);
            this.childNodes.push(c);
            this._dirty = true;
            return c;
        },
        removeChild(c) {
            detach(c);
            return c;
        },
        insertBefore(n, ref) {
            detach(n);
            n.parentNode = this;
            const i = (this.childNodes || []).indexOf(ref);
            if (i === -1) this.childNodes.push(n);
            else this.childNodes.splice(i, 0, n);
            this.children = (this.childNodes || []).filter((x) => x && x.nodeType === 1);
            this._dirty = true;
            return n;
        },
        replaceWith,
        setAttribute(k, v) {
            this._attrs[k] = String(v);
        },
        getAttribute(k) {
            return this._attrs[k];
        },
        querySelector(sel) {
            const walk = (n) => {
                for (const c of n.childNodes || []) {
                    if (matchSel(c, sel)) return c;
                    const f = walk(c);
                    if (f) return f;
                }
                return null;
            };
            return walk(this);
        },
        querySelectorAll(sel) {
            const out = [];
            const walk = (n) => {
                for (const c of n.childNodes || []) {
                    if (matchSel(c, sel)) out.push(c);
                    walk(c);
                }
            };
            walk(this);
            return out;
        },
        contains(n) {
            if (n === this) return true;
            return !!this.querySelectorAll('*').includes(n) || (function walk(x) {
                for (const c of x.childNodes || []) {
                    if (c === n || walk(c)) return true;
                }
                return false;
            })(this);
        },
        getBoundingClientRect() {
            if (this.className === 'emje-motion-word') {
                const t = wordSeq < 2 ? 0 : 20;
                wordSeq += 1;
                return { width: 40, top: t };
            }
            return { width: 300, top: 0 };
        },
    };
    return el;
}

globalThis.document.createElement = (tag) => makeEl(tag);
globalThis.document.createDocumentFragment = () => ({
    nodeType: 11,
    children: [],
    childNodes: [],
    appendChild(c) {
        this.children.push(c);
        this.childNodes.push(c);
        c.parentNode = this;
        return c;
    },
});
globalThis.document.body = makeEl('body');
globalThis.window.getComputedStyle = () => ({
    font: '', fontFamily: '', fontSize: '', fontWeight: '', letterSpacing: '',
    lineHeight: '', wordSpacing: '', textTransform: '', padding: '',
});

const { buildPerLineFill } = await import(tmpUrl('mod-fillBuild.mjs'));
const { default: FillReveal } = await import(tmpUrl('mod-fillReveal.mjs'));

const WORDS7 = 'kata satu dua tiga empat lima enam';
const paint = { fillBgOpacity: 0.5, fillWashColor: '' };

// 1. Plain multi-line heading builds per-line (was always null: dropped args
// meant the measuring box held the literal text "undefined" -> 1 line).
wordSeq = 0;
const flat = makeEl('div');
const vlines = buildPerLineFill(flat, WORDS7, paint);
eq('perline-visual-built', !!vlines, true);
eq('perline-masks', vlines.masks.length, 2);
eq('perline-foregrounds', vlines.foregrounds.length, 2);
eq('perline-lines', vlines.lines.length, 2);
eq('perline-width-kept', vlines.width, 300);
eq('perline-bg-aria-hidden', vlines.lines[0].querySelector('.emje-motion-fill__background').getAttribute('aria-hidden'), 'true');
eq('perline-bg-opacity', vlines.lines[0].querySelector('.emje-motion-fill__background').style.opacity, '0.5');

// 2. Single long paragraph takes the same visual path (second dropped-args site).
wordSeq = 0;
const p = makeEl('p');
p.innerHTML = 'kata satu dua tiga empat lima enam tujuh delapan';
const hostP = makeEl('div');
hostP.appendChild(p);
const plines = buildPerLineFill(hostP, '<p>kata satu dua tiga empat lima enam tujuh delapan</p>', paint);
eq('perline-single-p-built', !!plines, true);
eq('perline-single-p-masks', plines.masks.length, 2);

// 3. FillReveal.build() reaches per-line for plain headings (wires _lastWidth
// for the resize observer).
wordSeq = 0;
const frHost = makeEl('div');
frHost.innerHTML = WORDS7;
const fr = new FillReveal(frHost, {
    duration: 1, delay: 0, ease: 'power2.out', fillLineMode: 'overlap',
    fillStagger: 0.15, fillBgOpacity: 0.25, fillWashColor: '', fillBlur: 0,
});
fr.build();
eq('fill-perline-active', fr.isPerLine, true);
eq('fill-width-tracked', fr._lastWidth, 300);

// 4. destroy() after an external re-render keeps the new content
// (used to clobber it with the stale constructor capture).
const editHost = makeEl('div');
editHost.innerHTML = 'Hello';
const singleCfg = {
    duration: 1, delay: 0, ease: 'power2.out', fillLineMode: 'overlap',
    fillStagger: 0, fillBgOpacity: 0.25, fillWashColor: '', fillBlur: 0,
};
const frEdit = new FillReveal(editHost, singleCfg);
frEdit.build();
eq('fill-built-single', !!editHost.querySelector('.emje-motion-fill'), true);
editHost.innerHTML = 'EDITED';
frEdit.destroy();
eq('fill-external-edit-kept', editHost.innerHTML, 'EDITED');

// 5. destroy() with no external change still restores the original.
const okHost = makeEl('div');
okHost.innerHTML = 'Hello';
const frOk = new FillReveal(okHost, singleCfg);
frOk.build();
frOk.destroy();
eq('fill-destroy-restores', okHost.innerHTML, 'Hello');

// 6. Empty source is never adopted; a later build captures real text.
const lateHost = makeEl('div');
lateHost.innerHTML = '';
const frLate = new FillReveal(lateHost, singleCfg);
frLate.build();
eq('fill-empty-no-build', frLate.dom.wrapper, null);
lateHost.innerHTML = 'Late text here';
frLate.build();
eq('fill-late-build', !!lateHost.querySelector('.emje-motion-fill'), true);
