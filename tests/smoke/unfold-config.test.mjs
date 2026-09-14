import { tmpUrl, model, eq } from './helpers.mjs';

const { buildTextMotionConfig } = await import(tmpUrl('eb-textMotionBridge.mjs'));

// Defaults: up + words + 1.2 / off / 0 (BC — old pages without keys unchanged).
const def = buildTextMotionConfig(model({}));
eq('unfold-direction-default', def.direction, 'up');
eq('unfold-split-default', def.splitBy, 'words');
eq('unfold-distance-default', def.distance, 1.2);
eq('unfold-mask-default', def.mask, false);
eq('unfold-blur-default', def.blur, 0);

// New values pass through.
const full = buildTextMotionConfig(model({
    emje_motion_unfold_direction: 'left',
    emje_motion_unfold_split_by: 'lines',
    emje_motion_unfold_distance: 0.5,
    emje_motion_unfold_mask: 'yes',
    emje_motion_unfold_blur: 8,
}));
eq('unfold-direction-left', full.direction, 'left');
eq('unfold-split-lines', full.splitBy, 'lines');
eq('unfold-distance-half', full.distance, 0.5);
eq('unfold-mask-on', full.mask, true);
eq('unfold-blur-8', full.blur, 8);

// Garbage falls back to safe defaults.
const bogus = buildTextMotionConfig(model({
    emje_motion_unfold_direction: 'diagonal',
    emje_motion_unfold_split_by: 'paragraphs',
}));
eq('unfold-direction-fallback', bogus.direction, 'up');
eq('unfold-split-fallback', bogus.splitBy, 'words');

// All four directions accepted.
for (const d of ['up', 'down', 'left', 'right']) {
    const c = buildTextMotionConfig(model({ emje_motion_unfold_direction: d }));
    eq(`unfold-direction-${d}`, c.direction, d);
}

// Stagger clamp unchanged.
const stag = buildTextMotionConfig(model({ emje_motion_unfold_stagger: 9 }));
eq('unfold-stagger-clamp', stag.stagger, 0.5);

// Distance / blur clamps + garbage fallbacks.
eq('unfold-distance-clamp', buildTextMotionConfig(model({ emje_motion_unfold_distance: 9 })).distance, 2);
eq('unfold-distance-zero', buildTextMotionConfig(model({ emje_motion_unfold_distance: 0 })).distance, 0);
eq('unfold-distance-garbage', buildTextMotionConfig(model({ emje_motion_unfold_distance: 'jauh' })).distance, 1.2);
eq('unfold-blur-clamp', buildTextMotionConfig(model({ emje_motion_unfold_blur: 99 })).blur, 20);
eq('unfold-blur-garbage', buildTextMotionConfig(model({ emje_motion_unfold_blur: 'blur' })).blur, 0);
eq('unfold-mask-off', buildTextMotionConfig(model({ emje_motion_unfold_mask: '' })).mask, false);
