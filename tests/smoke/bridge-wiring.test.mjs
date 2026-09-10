import { tmpUrl, eq } from './helpers.mjs';

const bg = await import(tmpUrl('eb-backgroundBridge.mjs'));
const inter = await import(tmpUrl('eb-interactionBridge.mjs'));
const tip = await import(tmpUrl('eb-tooltip.mjs'));
const prev = await import(tmpUrl('eb-previewSync.mjs'));

// Every init entry wires its listeners without throwing.
const hooks = [];
const chan = [];
globalThis.window.elementor.hooks.addAction = (n) => hooks.push(n);
globalThis.window.elementor.channels.editor.on = (n) => chan.push(n);

for (const fn of [bg.initBackgroundBridge, inter.initInteractionBridge, tip.initEditorChrome, prev.initPreviewSync]) {
    fn();
}
eq('bg-panel-hook', hooks.includes('panel/open_editor/container'), true);
eq('inter-channel', chan.includes('change'), true);

// Required cross-module exports exist (entry wiring contract).
for (const [mod, name] of [
    [bg, 'buildBackgroundConfig'], [bg, 'applyBackgroundToTarget'],
    [bg, 'destroyBackgroundOnTarget'], [bg, 'hookBackgroundPreviewRender'],
    [inter, 'buildInteractionConfig'], [inter, 'buildHoverConfig'], [inter, 'buildCursorConfig'],
]) {
    eq(`export ${name}`, typeof mod[name], 'function');
}
