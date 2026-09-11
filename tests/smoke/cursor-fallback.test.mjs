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

// Per-effect mobile toggle: cursor defaults to hidden on touch...
eq('editor-cursor-mobile-default', dot.disableOnMobile, true);
const cursorShown = buildInteractionConfig(model({
    emje_interaction_enable: 'yes',
    emje_interaction_effect: 'interactive-cursor',
    emje_interaction_cursor_type: 'dot-ring',
    emje_interaction_cursor_disable_mobile: '',
}));
eq('editor-cursor-mobile-override', cursorShown.disableOnMobile, false);

// ...and so does hover reveal.
const hover = buildInteractionConfig(model({
    emje_interaction_enable: 'yes',
    emje_interaction_effect: 'hover-reveal',
    emje_interaction_live_preview: 'yes',
    emje_interaction_hover_image: { url: 'https://example.com/a.jpg' },
}));
eq('editor-hover-mobile-default', hover.disableOnMobile, true);
const hoverShown = buildInteractionConfig(model({
    emje_interaction_enable: 'yes',
    emje_interaction_effect: 'hover-reveal',
    emje_interaction_hover_image: { url: 'https://example.com/a.jpg' },
    emje_interaction_hover_disable_mobile: '',
}));
eq('editor-hover-mobile-override', hoverShown.disableOnMobile, false);

// JS runtime guard: old saved payloads fall through too.
const { default: InteractiveCursor } = await import(tmpUrl('mod-interactiveCursor.mjs'));
const inst = new InteractiveCursor({}, { type: 'trail' });
eq('js-trail-fallback', inst.config.type, 'text-follow');
const inst2 = new InteractiveCursor({}, { type: 'dot-ring' });
eq('js-dotring-kept', inst2.config.type, 'dot-ring');
