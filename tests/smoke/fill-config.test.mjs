import { tmpUrl, model, eq } from './helpers.mjs';

const { buildTextMotionConfig } = await import(tmpUrl('eb-textMotionBridge.mjs'));
const { resolveFillStagger } = await import(tmpUrl('mod-fillTiming.mjs'));

// Defaults: empty wash (follow text color) + blur off (pure wipe) + overlap.
const def = buildTextMotionConfig(model({}));
eq('fill-wash-default', def.fillWashColor, '');
eq('fill-blur-default', def.fillBlur, 0);
eq('fill-linemode-default', def.fillLineMode, 'overlap');
eq('fill-motion-absent', 'fillMotion' in def, false);

// Values pass through, incl. Global Color var refs.
const full = buildTextMotionConfig(model({
    emje_motion_fill_wash_color: '#1227E2',
    emje_motion_fill_blur: 6,
}));
eq('fill-wash-hex', full.fillWashColor, '#1227E2');
eq('fill-blur-6', full.fillBlur, 6);

const globalRef = buildTextMotionConfig(model({
    emje_motion_fill_wash_color: '#000000',
    __globals__: { emje_motion_fill_wash_color: 'globals/colors?id=abc123' },
}));
eq('fill-wash-global', globalRef.fillWashColor, 'var(--e-global-color-abc123)');

// Garbage falls back safely (never injects CSS break-outs).
const bogus = buildTextMotionConfig(model({
    emje_motion_fill_wash_color: 'red;evil',
    emje_motion_fill_blur: 'blurry',
}));
eq('fill-wash-injection', bogus.fillWashColor, '');
eq('fill-blur-garbage', bogus.fillBlur, 0);

// Blur clamps to 0..20.
eq('fill-blur-clamp', buildTextMotionConfig(model({ emje_motion_fill_blur: 99 })).fillBlur, 20);
eq('fill-blur-negative', buildTextMotionConfig(model({ emje_motion_fill_blur: -5 })).fillBlur, 0);

// Line mode passes through + garbage falls back to overlap.
eq('fill-linemode-seq', buildTextMotionConfig(model({ emje_motion_fill_line_mode: 'sequence' })).fillLineMode, 'sequence');
eq('fill-linemode-fallback', buildTextMotionConfig(model({ emje_motion_fill_line_mode: 'shuffle' })).fillLineMode, 'overlap');

// Effective stagger: overlap keeps the setting, sequence waits a full duration.
eq('timing-overlap', resolveFillStagger('overlap', 0.15, 1), 0.15);
eq('timing-overlap-zero', resolveFillStagger('overlap', 0, 1), 0);
eq('timing-sequence', resolveFillStagger('sequence', 0.15, 1), 1);
eq('timing-sequence-custom-dur', resolveFillStagger('sequence', 0.15, 0.5), 0.5);
eq('timing-sequence-no-dur', resolveFillStagger('sequence', 0.15, undefined), 0);
eq('timing-unknown-mode', resolveFillStagger('bogus', 0.15, 1), 0.15);
