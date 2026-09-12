import { tmpUrl, eq } from './helpers.mjs';

const { default: BackgroundMotion } =
    await import(tmpUrl('mod-backgroundmotion.mjs'));
const MeshGradient =
    (await import(tmpUrl('mod-meshgradient.mjs'))).default;

// reInit against a bare-bones DOM: force edit mode so MeshGradient.init()
// fails cleanly on livePreview:false (no canvas needed).
const realDocument = globalThis.document;
globalThis.document = {
    body: { classList: { contains: () => true } },
    createElement: () => ({ className: '', setAttribute() {}, appendChild() {}, style: {} }),
};

const mockEl = (payload) => {
    let attrs = { 'data-emje-background': payload };
    return {
        dataset: {},
        getAttribute: (k) => (k in attrs ? attrs[k] : null),
        setAttribute: (k, v) => { attrs[k] = String(v); },
        removeAttribute: (k) => { delete attrs[k]; },
        read: () => attrs['data-emje-background'],
    };
};

const meshPayload = JSON.stringify({
    effect: 'mesh', motion: 'drift',
    colors: ['#0C4A6E', '#0284C7', '#5EEAD4', '#F0FDFA'],
    speed: 0, quality: 'balanced', opacity: 1, fade: 0,
    livePreview: false, disableOnMobile: false,
});

// init() returns false (edit mode, live preview off) → the attribute must
// be removed so later passes don't mistake the node for a live layer.
const zombie = mockEl(meshPayload);
BackgroundMotion.reInit(zombie);
eq('lifecycle-zombie-attr', zombie.read(), undefined);
eq('lifecycle-zombie-flag', zombie.dataset.emjeBackgroundInitialized, undefined);
eq('lifecycle-zombie-instance', BackgroundMotion._instances.get(zombie), undefined);

// Corrupt JSON → attribute removed, silent return.
const corrupt = mockEl('{not-json');
BackgroundMotion.reInit(corrupt);
eq('lifecycle-corrupt-attr', corrupt.read(), undefined);

// Unknown effect falls back to ASCII per the dispatcher (no throw).
const asciiEl = mockEl(JSON.stringify({ effect: 'nope', livePreview: false }));
BackgroundMotion.reInit(asciiEl);
eq('lifecycle-unknown-effect', asciiEl.read(), undefined);

// init() on a detached container refuses before touching the DOM.
const detachedEl = mockEl(meshPayload);
detachedEl.isConnected = false;
BackgroundMotion.reInit(detachedEl);
eq('lifecycle-detached-attr', detachedEl.read(), undefined);

// build() sweeps stale wrappers: one container, one layer, ever.
const removed = [];
const staleWrapper = { parentNode: { removeChild: (c) => removed.push(c) } };
const inserted = [];
const sweepContainer = {
    isConnected: true,
    querySelectorAll: () => [staleWrapper],
    insertBefore: (node) => inserted.push(node),
    classList: { add() {} },
    clientWidth: 200,
    clientHeight: 120,
    ownerDocument: null,
};
const sweepInst = new MeshGradient(sweepContainer, { motion: 'drift', speed: 0 });
sweepInst.build();
eq('lifecycle-sweep-removed', removed, [staleWrapper]);
eq('lifecycle-sweep-inserted', inserted.length, 1);
eq('lifecycle-sweep-class', inserted[0].className, 'emje-mesh');

// A tick on a detached container stops the loop instead of burning
// rAF + GL context on a node nobody sees.
const tickInst = new MeshGradient(sweepContainer, { motion: 'drift', speed: 2 });
tickInst.running = true;
tickInst.visible = true;
tickInst.container = { isConnected: false };
tickInst.tick(1000);
eq('lifecycle-tick-stops', tickInst.running, false);
eq('lifecycle-tick-hidden', tickInst.visible, false);

globalThis.document = realDocument;
