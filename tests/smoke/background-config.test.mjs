import { tmpUrl, model, eq } from './helpers.mjs';

const { buildBackgroundConfig, buildPixelConfig, buildDitherConfig, buildBackgroundPayload } =
    await import(tmpUrl('eb-backgroundBridge.mjs'));
const DitherModule = await import(tmpUrl('mod-dithercanvas.mjs'));
const { bgAlpha } = DitherModule;
const DitherCanvas = DitherModule.default;
const AsciiInteractive = (await import(tmpUrl('mod-asciiinteractive.mjs'))).default;

// Garbage numerics restore defaults; explicit 0 stays valid (invisible).
const asciiGarbage = new AsciiInteractive({}, { fade: 'bogus', maxOpacity: 'bogus' });
eq('ascii-fade-garbage', asciiGarbage.config.fade, 10);
eq('ascii-opacity-garbage', asciiGarbage.config.maxOpacity, 0.35);
const asciiZero = new AsciiInteractive({}, { fade: 0, maxOpacity: 0 });
eq('ascii-fade-zero', asciiZero.config.fade, 0);
eq('ascii-opacity-zero', asciiZero.config.maxOpacity, 0);

// Global Colors resolve nearest-first: element, then body, then root
// (canvas 2D cannot resolve var() itself); unresolvable refs fall back.
const KIT_FG = '--e-kit-dot';
const kitContainer = { getAttribute: () => null, ownerDocument: { documentElement: {} } };
globalThis.getComputedStyle = (el) => ({
    getPropertyValue: (name) => {
        if (el === kitContainer && name === KIT_FG) return '#abcdef';
        return name === '--e-global-color-abc' ? '#123456' : '';
    },
});
const fakeDoc = { documentElement: {} };
const varContainer = { ownerDocument: fakeDoc };
eq('dither-global-fg', new DitherCanvas(varContainer, { fg: 'var(--e-global-color-abc)', bg: '#1227E21A' }).config.fg, '#123456');
eq('dither-global-element-scope', new DitherCanvas(kitContainer, { fg: `var(${KIT_FG})`, bg: '#1227E21A' }).config.fg, '#abcdef');
eq('dither-global-bg-missing', new DitherCanvas(varContainer, { fg: '#1227E2', bg: 'var(--e-global-color-missing)' }).config.bg, '#1227E21A');
eq('dither-global-nodoc', new DitherCanvas({}, { fg: 'var(--e-global-color-abc)', bg: 'var(--e-global-color-abc)' }).config.fg, '#1227E2');

const ascii = buildBackgroundConfig(model({
    emje_background_enable: 'yes',
    emje_background_live_preview: 'yes',
    emje_background_effect: 'ascii',
    emje_background_ascii_color: '#1227E2',
    emje_background_ascii_cell_w: { size: 22, unit: 'px' },
}));
eq('ascii-effect', ascii.effect, 'ascii');
eq('ascii-color', ascii.color, '#1227E2');
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
eq('px-active-default', px.active, '#1227E2');
eq('px-base-default', px.base, '#1227E21A');
eq('px-border-default', px.border, '#1227E21A');
eq('px-fade-default', px.fade, 0);

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
eq('dither-fg-default', dither.fg, '#1227E2');
eq('dither-bg-default', dither.bg, '#1227E21A');
eq('dither-fade-default', dither.fade, 0);
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

// bgAlpha drives the per-frame paint strategy: translucent veils must
// clearRect first or the alpha stacks to solid within seconds.
eq('bgAlpha-tint', bgAlpha('#1227E21A'), 26 / 255);
eq('bgAlpha-half', bgAlpha('rgba(18, 39, 226, 0.5)'), 0.5);
eq('bgAlpha-opaque', bgAlpha('#1227E2'), 1);
eq('bgAlpha-transparent', bgAlpha('rgba(255, 255, 255, 0)'), 0);
eq('bgAlpha-zerohex', bgAlpha('#1227E200'), 0);
eq('bgAlpha-named', bgAlpha('red'), 1);

const ditherInst = (bg) => new DitherCanvas({}, { fg: '#1227E2', bg });
eq('dither-translucent-flag', [ditherInst('#1227E21A')._bgTransparent, ditherInst('#1227E21A')._bgTranslucent], [false, true]);
eq('dither-opaque-flag', [ditherInst('#1227E2')._bgTransparent, ditherInst('#1227E2')._bgTranslucent], [false, false]);
eq('dither-clear-flag', [ditherInst('rgba(255, 255, 255, 0)')._bgTransparent, ditherInst('rgba(255, 255, 255, 0)')._bgTranslucent], [true, false]);

// A translucent veil frame must start with clearRect (ops[0]), then the
// veil fill — never veil-on-veil, which stacked alpha to solid blue.
const ops = [];
const paint = new DitherCanvas({}, { fg: '#1227E2', bg: '#1227E21A' });
paint.ctx = {
    clearRect: (...a) => ops.push(['clear', ...a]),
    set fillStyle(v) { ops.push(['style', v]); },
    fillRect: (...a) => ops.push(['rect', ...a]),
};
paint.cols = 2;
paint.rows = 2;
paint.cssW = 16;
paint.cssH = 16;
paint._autoPixel = 8;
paint._animTime = 0;
paint.draw(0);
eq('dither-frame-clear-first', ops[0][0], 'clear');
eq('dither-frame-veil', ops[1], ['style', '#1227E21A']);
