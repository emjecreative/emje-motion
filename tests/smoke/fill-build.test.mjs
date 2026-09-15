import { tmpUrl, eq } from './helpers.mjs';

const { buildSingleFill, buildPerLineFill } = await import(tmpUrl('mod-fillBuild.mjs'));

function fakeEl(tag, extra) {
    const el = Object.assign({
        tagName: String(tag).toUpperCase(),
        className: '',
        innerHTML: '',
        textContent: '',
        style: {},
        children: [],
        dataset: {},
        appendChild(c) { this.children.push(c); return c; },
        removeChild(c) {
            const i = this.children.indexOf(c);
            if (i !== -1) this.children.splice(i, 1);
            return c;
        },
        setAttribute() {},
        insertBefore() {},
        querySelector() { return null; },
        querySelectorAll() { return []; },
        getBoundingClientRect() { return { width: 0, top: 0 }; },
    }, extra || {});
    return el;
}

globalThis.document.createElement = fakeEl;
globalThis.document.body = fakeEl('body');
globalThis.getComputedStyle = () => ({
    font: '', fontFamily: '', fontSize: '', fontWeight: '', letterSpacing: '',
    lineHeight: '', wordSpacing: '', textTransform: '', padding: '',
});

// Single build: wrapper[bg, mask>fg], element cleared + adopted.
const host = fakeEl('div');
const single = buildSingleFill(host, 'Hello', {});
eq('single-masks', single.masks.length, 1);
eq('single-fgs', single.foregrounds.length, 1);
eq('single-mask-child', single.masks[0].children[0], single.foregrounds[0]);
eq('single-wrapper-kids', single.dom.wrapper.children.length, 2);
eq('single-host-cleared', host.innerHTML, '');
eq('single-host-child', host.children[0], single.dom.wrapper);
eq('single-fg-html', single.foregrounds[0].innerHTML, 'Hello');

// Wash color + opacity land on the background layer only.
const host2 = fakeEl('div');
const painted = buildSingleFill(host2, 'Hi', { fillWashColor: '#1227E2', fillBgOpacity: 0.5 });
eq('wash-color', painted.dom.background.style.color, '#1227E2');
eq('wash-opacity', painted.dom.background.style.opacity, '0.5');
eq('wash-fg-clean', ('color' in painted.dom.foreground.style), false);

const host3 = fakeEl('div');
const plain = buildSingleFill(host3, 'Hi', {});
eq('wash-empty', ('color' in plain.dom.background.style), false);

// No paragraphs + zero width: visual-line path bails out -> null.
const flat = fakeEl('div');
eq('perline-no-p', buildPerLineFill(flat, 'Hello world and more words here', {}), null);

// Single short paragraph falls back the same way.
const p = fakeEl('p', { innerHTML: 'Hi', textContent: 'Hi' });
const para = fakeEl('div');
para.querySelector = () => p;
para.querySelectorAll = () => [p];
eq('perline-short-p', buildPerLineFill(para, '<p>Hi</p>', {}), null);
