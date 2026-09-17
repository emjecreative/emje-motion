import { tmpUrl, eq } from './helpers.mjs';

const { pickEditorColor, collectContainerModels, destroyLayerInstance, toNumber, clampNum, resolveEditedModel } =
    await import(tmpUrl('eb-utils.mjs'));

const { serializeCursorPayload, serializeHoverPayload } =
    await import(tmpUrl('eb-interactionBridge.mjs'));

const store = (obj) => ({ get: (k, d) => (k in obj ? obj[k] : d) });

// Plain colors pass through; garbage falls back.
eq('pick-hex', pickEditorColor(store({ c1: '#0C4A6E' }).get, 'c1', '#fff'), '#0C4A6E');
eq('pick-garbage', pickEditorColor(store({ c1: 'not-a-color' }).get, 'c1', '#fff'), '#fff');
eq('pick-missing', pickEditorColor(store({}).get, 'c1', '#fff'), '#fff');
eq('pick-nonstr', pickEditorColor(store({ c1: 42 }).get, 'c1', '#fff'), '#fff');

// Elementor Global Colors resolve to var(--e-global-color-…).
const withGlobal = store({
    c1: '#000000',
    __globals__: { c1: 'globals/colors?id=abcd1234' },
});
eq('pick-global', pickEditorColor(withGlobal.get, 'c1', '#fff'), 'var(--e-global-color-abcd1234)');

// Unresolvable global keeps the settings value; truly unparseable → fallback.
const badGlobal = store({ c1: '#111111', __globals__: { c1: '!!!not-a-color!!!' } });
eq('pick-badglobal-keeps', pickEditorColor(badGlobal.get, 'c1', '#fff'), '#111111');
const badBoth = store({ c1: '!!!bogus!!!', __globals__: { c1: '???also-bogus???' } });
eq('pick-badboth', pickEditorColor(badBoth.get, 'c1', '#fff'), '#fff');

// Container model walk: nested Backbone-style collections, skips others.
const leaf = (id, type) => ({ get: (k) => (k === 'id' ? id : k === 'elType' ? type : undefined) });
const branch = (id, type, kids) => ({
    get: (k) => (k === 'id' ? id : k === 'elType' ? type : k === 'elements' ? kids : undefined),
});
const models = [
    branch('a', 'container', [leaf('a1', 'widget'), branch('a2', 'container', [leaf('a3', 'container')])]),
    leaf('b', 'section'),
    null,
    { nope: true },
];
eq('collect-ids', collectContainerModels(models).map((m) => m.get('id')), ['a', 'a2', 'a3']);
eq('collect-wrapped', collectContainerModels({ models }).map((m) => m.get('id')), ['a', 'a2', 'a3']);
eq('collect-empty', collectContainerModels(null), []);
eq('collect-garbage', collectContainerModels([null, 42, 'x']), []);

// Layer destroy: tears down, clears flag, reports; safe no-ops otherwise.
let destroyed = 0;
const target = { dataset: { emjeCursorInitialized: 'true' } };
const holder = {
    _instances: {
        get: () => ({ destroy: () => { destroyed++; } }),
        delete: () => {},
    },
};
eq('destroy-yes', destroyLayerInstance(holder, target, 'emjeCursorInitialized'), true);
eq('destroy-called', destroyed, 1);
eq('destroy-flag', target.dataset.emjeCursorInitialized, undefined);
eq('destroy-missing', destroyLayerInstance({ _instances: { get: () => undefined } }, {}, 'f'), false);
eq('destroy-noholder', destroyLayerInstance(null, {}, 'f'), false);
eq('destroy-throws', destroyLayerInstance({ _instances: { get: () => { throw new Error('x'); } } }, {}, 'f'), false);

// Numeric helpers: explicit 0 survives, garbage falls back, clamps hold.
eq('tonum-zero', toNumber(0, 99), 0);
eq('tonum-str', toNumber('0.5', 99), 0.5);
eq('tonum-garbage', toNumber('abc', 99), 99);
eq('clamp-ok', clampNum(0.2, 0.05, 0.3, 0.12), 0.2);
eq('clamp-hi', clampNum(9, 0.05, 0.3, 0.12), 0.3);
eq('clamp-lo', clampNum(-5, 0.05, 0.3, 0.12), 0.05);
eq('clamp-garbage', clampNum('xx', 0.05, 0.3, 0.12), 0.12);
eq('clamp-zero', clampNum(0, 0, 20, 5), 0);

// Edited-model resolution: editedElementView wins; control-view fallback works.
globalThis.window.elementor.channels.editor.request = () => null;
const edSettings = { get: () => 'yes' };
const edModel = { get: (k) => (k === 'settings' ? edSettings : k === 'id' ? 'w1' : 'container') };
globalThis.window.elementor.channels.editor.request = () => ({ model: edModel });
eq('resolve-edited', resolveEditedModel({}), { editedView: { model: edModel }, model: edModel, settings: edSettings, widgetType: 'container', widgetId: 'w1' });
globalThis.window.elementor.channels.editor.request = () => { throw new Error('nope'); };
const ctrlSettings = { get: () => 'no' };
const ctrlView = { model: { get: (k) => (k === 'settings' ? ctrlSettings : k === 'id' ? 'w2' : 'heading') } };
eq('resolve-control', resolveEditedModel(ctrlView).settings, ctrlSettings);
eq('resolve-empty', resolveEditedModel(null), { editedView: null, model: null, settings: null, widgetType: null, widgetId: null });

// Payload serializers: exact key sets the runtime consumes.
const cursorPayload = serializeCursorPayload({
    type: 'text-follow', size: 20, color: '#000', hoverScale: 1.5, hideNative: false,
    label: 'View', bgColor: '#fff', textColor: '#111', paddingY: 40, paddingX: 32,
    radius: 99, fontSize: 14, typography: {}, entrance: 'scale', followSmoothness: 0.5,
    boxShadow: 'none', shadow: false, shadowBlur: 32, disableOnMobile: false, livePreview: true,
});
eq('cursor-payload-mobile', cursorPayload.disableOnMobile, false);
eq('cursor-payload-keys', Object.keys(cursorPayload).length, 20);
const cursorLegacy = serializeCursorPayload({ type: 'text-follow', livePreview: true });
eq('cursor-payload-legacy-mobile', cursorLegacy.disableOnMobile, true);

const hoverPayload = serializeHoverPayload({
    imageUrl: 'x', imageSize: 'medium', followSpeed: 0.12, scale: 1, animation: 'clip',
    clipDirection: 'right', duration: 0.6, cols: 8, rows: 9, blockOrder: 'rows', blockSpeed: 0.03,
    triggerArea: 'container', livePreview: true, offsetX: 0, offsetY: 0, rotate: 0,
    rotateHover: 15, disableOnMobile: true,
});
eq('hover-payload-mobile', hoverPayload.disableOnMobile, true);
eq('hover-payload-keys', Object.keys(hoverPayload).length, 18);
eq('hover-payload-dir', hoverPayload.clipDirection, 'right');
eq('hover-payload-dur', hoverPayload.duration, 0.6);
eq('hover-payload-grid', [hoverPayload.cols, hoverPayload.rows, hoverPayload.blockOrder, hoverPayload.blockSpeed], [8, 9, 'rows', 0.03]);
const hoverLegacy = serializeHoverPayload({ animation: 'fade', livePreview: true });
eq('hover-payload-legacy-dir', hoverLegacy.clipDirection, 'left');
eq('hover-payload-legacy-dur', hoverLegacy.duration, 0.25);
eq('hover-payload-legacy-grid', [hoverLegacy.cols, hoverLegacy.rows, hoverLegacy.blockOrder, hoverLegacy.blockSpeed], [5, 7, 'random', 0.02]);
