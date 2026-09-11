import { tmpUrl, model, eq } from './helpers.mjs';

const { buildBackgroundConfig, buildPixelConfig, buildDitherConfig, buildBackgroundPayload } =
    await import(tmpUrl('eb-backgroundBridge.mjs'));

const ascii = buildBackgroundConfig(model({
    emje_background_enable: 'yes',
    emje_background_live_preview: 'yes',
    emje_background_effect: 'ascii',
    emje_background_ascii_color: '#3B82F6',
    emje_background_ascii_cell_w: { size: 22, unit: 'px' },
}));
eq('ascii-effect', ascii.effect, 'ascii');
eq('ascii-color', ascii.color, '#3B82F6');
eq('ascii-cellW', ascii.cellW, 22);
eq('ascii-mobile-default', ascii.disableOnMobile, true);

const asciiShown = buildBackgroundConfig(model({
    emje_background_enable: 'yes',
    emje_background_effect: 'ascii',
    emje_background_ascii_disable_mobile: '',
}));
eq('ascii-mobile-override', asciiShown.disableOnMobile, false);

const px = buildBackgroundConfig(model({
    emje_background_enable: 'yes',
    emje_background_live_preview: 'yes',
    emje_background_effect: 'pixel',
    emje_background_pixel_fit: 'crop',
}));
eq('px-effect', px.effect, 'pixel');
eq('px-fit', px.fit, 'crop');
eq('px-active-default', px.active, '#3B82F6');

const off = buildBackgroundConfig(model({ emje_background_enable: '' }));
eq('off-enable', off.enable, false);

const legacy = buildBackgroundConfig(model({
    emje_background_enable: 'yes',
    emje_background_effect: 'ascii-interactive',
}));
eq('legacy-effect', legacy.effect, 'ascii');

const payload = buildBackgroundPayload(px);
eq('payload-fit', payload.fit, 'crop');
eq('payload-live', payload.livePreview, true);
eq('payload-mobile', payload.disableOnMobile, true);

// buildPixelConfig honors explicit zero values (0 is valid, not fallback).
const zero = buildPixelConfig(model({
    emje_background_pixel_radius: 0,
    emje_background_pixel_trail: 0,
}), true);
eq('zero-radius', zero.radius, 0);
eq('zero-trail', zero.trail, 0);

const dither = buildBackgroundConfig(model({
    emje_background_enable: 'yes',
    emje_background_live_preview: 'yes',
    emje_background_effect: 'dither',
    emje_background_dither_speed: 0,
}));
eq('dither-effect', dither.effect, 'dither');
eq('dither-speed-zero', dither.speed, 0);
eq('dither-ripple-default', dither.ripple, true);
eq('dither-fg-default', dither.fg, '#3B82F6');
eq('dither-no-shape', 'shape' in dither, false);
eq('dither-mobile-default', dither.disableOnMobile, false);

const ditherHidden = buildBackgroundConfig(model({
    emje_background_enable: 'yes',
    emje_background_effect: 'dither',
    emje_background_dither_disable_mobile: 'yes',
}));
eq('dither-mobile-override', ditherHidden.disableOnMobile, true);

const ditherPayload = buildBackgroundPayload(dither);
eq('dither-payload-effect', ditherPayload.effect, 'dither');
eq('dither-payload-no-shape', 'shape' in ditherPayload, false);
eq('dither-payload-live', ditherPayload.livePreview, true);

const ditherDirect = buildDitherConfig(model({
    emje_background_dither_density: 0.8,
}), true);
eq('dither-density', ditherDirect.density, 0.8);
