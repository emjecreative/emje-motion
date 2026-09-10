import { tmpUrl, model, eq } from './helpers.mjs';

const { buildBackgroundConfig, buildPixelConfig, buildBackgroundPayload } =
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
