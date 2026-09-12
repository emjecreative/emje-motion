import { tmpUrl, eq } from './helpers.mjs';

const { pickEditorColor, collectContainerModels, destroyLayerInstance } =
    await import(tmpUrl('eb-utils.mjs'));

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
