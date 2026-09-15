import { tmpUrl, eq } from './helpers.mjs';

const { bindEditorChange } = await import(tmpUrl('eb-interactionBridge.mjs'));

// Capture the global editor change callback.
let changeCb = null;
globalThis.window.elementor.channels.editor.on = (name, fn) => {
    if (name === 'change') changeCb = fn;
};
globalThis.window.elementor.channels.editor.request = () => null;
// Fake preview window so the handler runs past the win/doc guard.
globalThis.document.getElementById = (id) => (
    id === 'elementor-preview-iframe' ? { contentWindow: { document: {} } } : null
);

bindEditorChange();
eq('autoset-bound', typeof changeCb, 'function');

function fakeSettings(values, changed) {
    const store = Object.assign({}, values);
    const calls = [];
    return {
        store,
        calls,
        changed: changed || {},
        get: (k) => (k in store ? store[k] : undefined),
        set: function(k, v) { store[k] = v; calls.push([k, v]); },
    };
}

function fire(settings) {
    const view = {
        model: {
            get: (k) => {
                if (k === 'settings') return settings;
                return { widgetType: 'heading', elType: 'heading', id: 'w1' }[k];
            },
        },
    };
    changeCb(view);
}

// 1. Switching to One by One with default ease moves Ease to Linear.
const s1 = fakeSettings({
    emje_motion_enable: 'yes',
    emje_motion_animation: 'fill-reveal',
    emje_motion_fill_line_mode: 'sequence',
    emje_motion_ease: 'power2.out',
    emje_motion_live_preview: '',
}, { emje_motion_fill_line_mode: 'sequence' });
fire(s1);
eq('autoset-to-linear', s1.calls, [['emje_motion_ease', 'none']]);

// 2. Custom ease is never overwritten.
const s2 = fakeSettings({
    emje_motion_enable: 'yes',
    emje_motion_animation: 'fill-reveal',
    emje_motion_fill_line_mode: 'sequence',
    emje_motion_ease: 'elastic.out(1, 0.3)',
    emje_motion_live_preview: '',
}, { emje_motion_fill_line_mode: 'sequence' });
fire(s2);
eq('autoset-keeps-custom', s2.calls, []);

// 3. Already in sequence mode (no fresh change) does nothing.
const s3 = fakeSettings({
    emje_motion_enable: 'yes',
    emje_motion_animation: 'fill-reveal',
    emje_motion_fill_line_mode: 'sequence',
    emje_motion_ease: 'power2.out',
    emje_motion_live_preview: '',
}, {});
fire(s3);
eq('autoset-one-way', s3.calls, []);

// 4. Other animations are untouched.
const s4 = fakeSettings({
    emje_motion_enable: 'yes',
    emje_motion_animation: 'text-unfold',
    emje_motion_fill_line_mode: 'sequence',
    emje_motion_ease: 'power2.out',
    emje_motion_live_preview: '',
}, { emje_motion_fill_line_mode: 'sequence' });
fire(s4);
eq('autoset-fill-only', s4.calls, []);
