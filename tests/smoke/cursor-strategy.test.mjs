import { tmpUrl, model, eq } from './helpers.mjs';

// Strategy modules expose the type-specific builders/handlers.
const text = await import(tmpUrl('mod-textFollowCursor.mjs'));
const ring = await import(tmpUrl('mod-dotRingCursor.mjs'));
for (const fn of ['buildTextFollow', 'enterTextFollow', 'leaveTextFollow']) {
    eq(`text-strategy ${fn}`, typeof text[fn], 'function');
}
for (const fn of ['buildDotRing', 'onInteractiveEnter', 'onInteractiveLeave', 'bindDotRingHover']) {
    eq(`ring-strategy ${fn}`, typeof ring[fn], 'function');
}

// Main class still constructs both surviving types (DOM-free).
const { default: InteractiveCursor } = await import(tmpUrl('mod-interactiveCursor.mjs'));
for (const t of ['text-follow', 'dot-ring']) {
    const inst = new InteractiveCursor({}, { type: t });
    eq(`construct ${t}`, inst.config.type, t);
}
