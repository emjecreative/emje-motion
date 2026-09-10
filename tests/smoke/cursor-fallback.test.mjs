import { tmpUrl, model, eq } from './helpers.mjs';

const { buildInteractionConfig } = await import(tmpUrl('eb-interactionBridge.mjs'));

// Retired Comet Trail: editor config falls through to text-follow.
const trail = buildInteractionConfig(model({
    emje_interaction_enable: 'yes',
    emje_interaction_effect: 'interactive-cursor',
    emje_interaction_live_preview: 'yes',
    emje_interaction_cursor_type: 'trail',
}));
eq('editor-trail-fallback', trail.type, 'text-follow');

// Unknown types also fall through.
const weird = buildInteractionConfig(model({
    emje_interaction_enable: 'yes',
    emje_interaction_effect: 'interactive-cursor',
    emje_interaction_cursor_type: 'comet!!!',
}));
eq('editor-unknown-fallback', weird.type, 'text-follow');

// Legacy dot/ring migrate to dot-ring.
const dot = buildInteractionConfig(model({
    emje_interaction_enable: 'yes',
    emje_interaction_effect: 'interactive-cursor',
    emje_interaction_cursor_type: 'dot',
}));
eq('editor-dot-migrate', dot.type, 'dot-ring');

// JS runtime guard: old saved payloads fall through too.
const { default: InteractiveCursor } = await import(tmpUrl('mod-interactiveCursor.mjs'));
const inst = new InteractiveCursor({}, { type: 'trail' });
eq('js-trail-fallback', inst.config.type, 'text-follow');
const inst2 = new InteractiveCursor({}, { type: 'dot-ring' });
eq('js-dotring-kept', inst2.config.type, 'dot-ring');
