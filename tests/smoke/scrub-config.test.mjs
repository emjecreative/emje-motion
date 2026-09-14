import { tmpUrl, model, eq } from './helpers.mjs';

const { buildTextMotionConfig } = await import(tmpUrl('eb-textMotionBridge.mjs'));
const { clampScrubPos, resolveScrubAnchor, resolveScrubPreset, computeScrubProgress } =
    await import(tmpUrl('mod-scrub.mjs'));

// Bridge defaults: Custom 100/30.
const def = buildTextMotionConfig(model({}));
eq('scrub-default', def.scrub, 'custom');
eq('scrub-startpos-default', def.scrubStartPos, 100);
eq('scrub-endpos-default', def.scrubEndPos, 30);
eq('scrub-old-keys-absent', ['scrubStart' in def, 'scrubEnd' in def], [false, false]);

// Values pass through.
const full = buildTextMotionConfig(model({
    emje_motion_scrub: 'center',
    emje_motion_scrub_start_position: 60,
    emje_motion_scrub_end_position: 40,
}));
eq('scrub-center', full.scrub, 'center');
eq('scrub-startpos-60', full.scrubStartPos, 60);
eq('scrub-endpos-40', full.scrubEndPos, 40);

// Garbage preset + out-of-range positions: positions clamp, and because
// position keys count as legacy input the combo resolves via translation.
const bogus = buildTextMotionConfig(model({
    emje_motion_scrub: 'anywhere',
    emje_motion_scrub_start_position: 150,
    emje_motion_scrub_end_position: -20,
}));
eq('scrub-garbage', [bogus.scrub, bogus.scrubStartPos, bogus.scrubEndPos], ['full', 100, 0]);

// Retired presets map gracefully.
eq('scrub-retired-visible', buildTextMotionConfig(model({ emje_motion_scrub: 'visible' })).scrub, 'custom');
const retiredVisible = buildTextMotionConfig(model({ emje_motion_scrub: 'visible' }));
eq('scrub-retired-visible-pos', [retiredVisible.scrubStartPos, retiredVisible.scrubEndPos], [100, 100]);
eq('scrub-retired-leave', buildTextMotionConfig(model({ emje_motion_scrub: 'leave' })).scrub, 'full');

// Legacy separate keys translate to the combined shape.
const legacyFull = buildTextMotionConfig(model({
    emje_motion_scrub_start: 'top-bottom',
    emje_motion_scrub_end: 'bottom-top',
}));
eq('legacy-full', legacyFull.scrub, 'full');

const legacyCenter = buildTextMotionConfig(model({
    emje_motion_scrub_start: 'top-center',
    emje_motion_scrub_end: 'bottom-center',
}));
eq('legacy-center', legacyCenter.scrub, 'center');

const legacyVisible = buildTextMotionConfig(model({
    emje_motion_scrub_start: 'top-bottom',
    emje_motion_scrub_end: 'bottom-bottom',
}));
eq('legacy-visible', [legacyVisible.scrub, legacyVisible.scrubStartPos, legacyVisible.scrubEndPos], ['custom', 100, 100]);

const legacyCustom = buildTextMotionConfig(model({
    emje_motion_scrub_start: 'top-top',
    emje_motion_scrub_end: 'custom',
    emje_motion_scrub_end_position: 30,
}));
eq('legacy-custom', [legacyCustom.scrub, legacyCustom.scrubStartPos, legacyCustom.scrubEndPos], ['custom', 0, 30]);

const legacyGarbage = buildTextMotionConfig(model({
    emje_motion_scrub_start: 'nowhere',
    emje_motion_scrub_end: 'anywhere',
}));
eq('legacy-garbage', legacyGarbage.scrub, 'full');

// New key wins over legacy keys.
const both = buildTextMotionConfig(model({
    emje_motion_scrub: 'center',
    emje_motion_scrub_start: 'top-top',
    emje_motion_scrub_end: 'bottom-bottom',
}));
eq('scrub-new-wins', both.scrub, 'center');

// Combined preset table spot checks.
eq('preset-full', resolveScrubPreset('full'), { start: { el: 0, vp: 1 }, end: { el: 1, vp: 0 } });
eq('preset-center', resolveScrubPreset('center'), { start: { el: 0, vp: 0.5 }, end: { el: 1, vp: 0.5 } });
eq('preset-custom', resolveScrubPreset('custom', 80, 20), { start: { el: 0, vp: 0.8 }, end: { el: 1, vp: 0.2 } });
eq('preset-unknown', resolveScrubPreset('bogus'), { start: { el: 0, vp: 1 }, end: { el: 1, vp: 0 } });
eq('clamppos-garbage', clampScrubPos('abc', 100), 100);

// Legacy anchor table still honored for cached configs.
eq('anchor-start-tb', resolveScrubAnchor('start', 'top-bottom'), { el: 0, vp: 1 });
eq('anchor-end-bt', resolveScrubAnchor('end', 'bottom-top'), { el: 1, vp: 0 });

// Geometry: elDocTop=2000, elH=100, vh=800.
// full -> start 1200, end 2100 (same as the old hardcoded formula).
const cfgFull = { scrub: 'full' };
eq('full-p0', computeScrubProgress(1200, 2000, 100, 800, cfgFull), 0);
eq('full-p05', computeScrubProgress(1650, 2000, 100, 800, cfgFull), 0.5);
eq('full-p1', computeScrubProgress(2100, 2000, 100, 800, cfgFull), 1);
eq('full-before', computeScrubProgress(500, 2000, 100, 800, cfgFull), 0);
eq('full-after', computeScrubProgress(5000, 2000, 100, 800, cfgFull), 1);

// center -> start 1600, end 2050.
const cfgCenter = { scrub: 'center' };
eq('center-p0', computeScrubProgress(1600, 2000, 100, 800, cfgCenter), 0);
eq('center-p1', computeScrubProgress(2050, 2000, 100, 800, cfgCenter), 1);

// default custom 100/30 -> start 1200, end 1860.
const cfgDefault = { scrub: 'custom', scrubStartPos: 100, scrubEndPos: 30 };
eq('default-p0', computeScrubProgress(1200, 2000, 100, 800, cfgDefault), 0);
eq('default-p1', computeScrubProgress(1860, 2000, 100, 800, cfgDefault), 1);

// custom 80/20 -> start 1360, end 1940.
const cfgCustom = { scrub: 'custom', scrubStartPos: 80, scrubEndPos: 20 };
eq('custom-p0', computeScrubProgress(1360, 2000, 100, 800, cfgCustom), 0);
eq('custom-p1', computeScrubProgress(1940, 2000, 100, 800, cfgCustom), 1);

// Legacy-shaped cached config still computes (no scrub key).
const cfgLegacy = { scrubStart: 'top-bottom', scrubEnd: 'bottom-top' };
eq('legacy-p05', computeScrubProgress(1650, 2000, 100, 800, cfgLegacy), 0.5);

// Degenerate (start meets end) behaves as a step, never frozen:
// custom 0/100 on a short element -> start 2000 >= end 1300.
const cfgPinch = { scrub: 'custom', scrubStartPos: 0, scrubEndPos: 100 };
eq('pinch-before', computeScrubProgress(1000, 2000, 100, 800, cfgPinch), 0);
eq('pinch-after', computeScrubProgress(2500, 2000, 100, 800, cfgPinch), 1);
