import { tmpUrl, model, eq } from './helpers.mjs';

const { buildBackgroundConfig, buildMeshConfig, buildBackgroundPayload, applyBackgroundToTarget } =
    await import(tmpUrl('eb-backgroundBridge.mjs'));
const MeshModule = await import(tmpUrl('mod-meshgradient.mjs'));
const { DEFAULT_COLORS, LEGACY_PRESETS, MOTIONS, QUALITY_SCALE, parseCssColor, resolveCssVar } = MeshModule;
const MeshGradient = MeshModule.default;

// Bridge: 4 custom colors resolve, motion defaults to drift, mobile visible by default.
const mesh = buildBackgroundConfig(model({
    emje_background_enable: 'yes',
    emje_background_live_preview: 'yes',
    emje_background_effect: 'mesh',
    emje_background_mesh_motion: 'swirl',
    emje_background_mesh_speed: 0,
}));
eq('mesh-effect', mesh.effect, 'mesh');
eq('mesh-motion', mesh.motion, 'swirl');
eq('mesh-colors', mesh.colors, ['#0C4A6E', '#0284C7', '#5EEAD4', '#F0FDFA']);
eq('mesh-speed-zero', mesh.speed, 0);
eq('mesh-mobile-default', mesh.disableOnMobile, false);
eq('mesh-quality-default', mesh.quality, 'balanced');

// Unknown motion / quality fall back.
const weird = buildMeshConfig(model({
    emje_background_mesh_motion: 'vortex',
    emje_background_mesh_quality: 'ultra',
}), true);
eq('mesh-motion-fallback', weird.motion, 'drift');
eq('mesh-quality-fallback', weird.quality, 'balanced');

// Custom palette passes through; mobile toggle hides.
const custom = buildBackgroundConfig(model({
    emje_background_enable: 'yes',
    emje_background_effect: 'mesh',
    emje_background_mesh_motion: 'pulse',
    emje_background_mesh_c1: '#111111',
    emje_background_mesh_disable_mobile: 'yes',
}));
eq('mesh-custom-c1', custom.colors[0], '#111111');
eq('mesh-custom-motion', custom.motion, 'pulse');
eq('mesh-mobile-override', custom.disableOnMobile, true);

// Legacy preset migrates to its palette when no custom colors are set.
const legacy = buildMeshConfig(model({
    emje_background_mesh_preset: 'sunset',
}), true);
eq('mesh-legacy-sunset', legacy.colors, ['#FF6A3D', '#FF2E63', '#7B2FF7', '#F9CB6B']);
eq('mesh-legacy-motion', legacy.motion, 'drift');

const payload = buildBackgroundPayload(mesh);
eq('mesh-payload-effect', payload.effect, 'mesh');
eq('mesh-payload-motion', payload.motion, 'swirl');
eq('mesh-payload-live', payload.livePreview, true);

// Palettes + motion table + quality scales stay in sync with PHP defaults.
eq('mesh-defaults', DEFAULT_COLORS, ['#0C4A6E', '#0284C7', '#5EEAD4', '#F0FDFA']);
eq('mesh-legacy-keys', Object.keys(LEGACY_PRESETS).sort(), ['beach', 'ocean', 'sunset']);
eq('mesh-motion-index', MOTIONS, { drift: 0, swirl: 1, pulse: 2, flow: 3 });
eq('mesh-quality', QUALITY_SCALE, { low: 0.5, balanced: 0.75, high: 1.0 });

// CSS color parser for vec3 uniforms.
eq('mesh-parse-hex6', parseCssColor('#D81F1F'), [216 / 255, 31 / 255, 31 / 255]);
eq('mesh-parse-hex3', parseCssColor('#fff'), [1, 1, 1]);
eq('mesh-parse-rgb', parseCssColor('rgb(4, 56, 228)'), [4 / 255, 56 / 255, 228 / 255]);
eq('mesh-parse-rgb-pct', parseCssColor('rgb(100%, 0%, 0%)'), [1, 0, 0]);
eq('mesh-parse-hsl-red', parseCssColor('hsl(0, 100%, 50%)'), [1, 0, 0]);
eq('mesh-parse-hsl-green', parseCssColor('hsl(120, 100%, 50%)'), [0, 1, 0]);
eq('mesh-parse-hsl-wrap', parseCssColor('hsl(480, 100%, 50%)'), [0, 1, 0]);
eq('mesh-parse-var', parseCssColor('var(--e-global-color-abc)'), null);
eq('mesh-parse-garbage', parseCssColor('not-a-color'), null);

// var() resolves nearest-first: element, then body, then root.
const KIT_VAR = '--e-kit-color';
const kitEl = { getAttribute: () => null };
globalThis.getComputedStyle = (el) => ({
    getPropertyValue: (name) => {
        if (el === kitEl && name === KIT_VAR) return '  #abcdef  ';
        return name === '--e-global-color-abc' ? '  #123456  ' : '';
    },
});
const fakeDoc = { documentElement: {} };
eq('mesh-var-resolve', resolveCssVar('var(--e-global-color-abc)', fakeDoc), '#123456');
eq('mesh-var-element-scope', resolveCssVar(`var(${KIT_VAR})`, fakeDoc, kitEl), '#abcdef');
eq('mesh-var-element-miss', resolveCssVar(`var(${KIT_VAR})`, fakeDoc, null), null);
eq('mesh-var-fallback', resolveCssVar('var(--e-global-color-missing, #abcdef)', fakeDoc), '#abcdef');
eq('mesh-var-unresolvable', resolveCssVar('var(--e-global-color-missing)', fakeDoc), null);
eq('mesh-var-plain', resolveCssVar('#ff0000', fakeDoc), null);

// Constructor resolves var() colors through the container's document.
const mockContainer = () => ({
    clientWidth: 100,
    clientHeight: 100,
    classList: { add() {} },
    insertBefore() {},
    ownerDocument: fakeDoc,
});
const varInst = new MeshGradient(mockContainer(), {
    motion: 'drift',
    colors: ['var(--e-global-color-abc)', '#222222', '#333333', '#444444'],
    speed: 1,
});
eq('mesh-var-color', varInst.config.colors[0], [0x12 / 255, 0x34 / 255, 0x56 / 255]);

// updateLive pushes uniforms in place without a GL re-create.
const liveInst = new MeshGradient(mockContainer(), {
    motion: 'drift',
    colors: ['#111111', '#222222', '#333333', '#444444'],
    speed: 1,
});
const seen = {};
liveInst.gl = {
    uniform1f: (loc, v) => { seen[loc] = v; },
    uniform3f: (loc, x, y, z) => { seen[loc] = [x, y, z]; },
};
liveInst.locs = { motion: 'u_motion', c1: 'u_c1', c2: 'u_c2', c3: 'u_c3', c4: 'u_c4' };
liveInst.visible = true;
eq('mesh-update-live', liveInst.updateLive({ motion: 'flow', colors: ['#ff0000', '#00ff00', '#0000ff', '#ffffff'] }), true);
eq('mesh-update-motion', liveInst.config.motion, 'flow');
eq('mesh-update-uniform-motion', seen.u_motion, 3);
eq('mesh-update-uniform-c1', seen.u_c1, [1, 0, 0]);
eq('mesh-update-uniform-c4', seen.u_c4, [1, 1, 1]);
eq('mesh-update-bad', liveInst.updateLive(null), false);

// updateLive without GL repaints the static fallback instead.
const fallbackInst = new MeshGradient(mockContainer(), { motion: 'drift', speed: 0 });
fallbackInst.wrapEl = { style: {} };
fallbackInst.gl = null;
fallbackInst.locs = null;
eq('mesh-update-fallback', fallbackInst.updateLive({ motion: 'pulse', colors: ['#ff0000', '#00ff00', '#0000ff', '#ffffff'] }), true);
eq('mesh-fallback-bg', fallbackInst.wrapEl.style.background.startsWith('linear-gradient(135deg, rgb(255, 0, 0)'), true);

// Bridge fast path: only motion/colors changed → updateLive, no reInit.
const mockTarget = (payload) => {
    let attr = JSON.stringify(payload);
    return {
        getAttribute: () => attr,
        setAttribute: (k, v) => { attr = v; },
        read: () => JSON.parse(attr),
    };
};
const baseCfg = {
    enable: true, effect: 'mesh', livePreview: true, motion: 'drift',
    colors: ['#111111', '#222222', '#333333', '#444444'],
    speed: 2, quality: 'balanced', opacity: 1, fade: 0, disableOnMobile: false,
};
const prevPayload = buildBackgroundPayload(baseCfg);
const liveTarget = mockTarget(prevPayload);
const got = {};
const fakeInst = {
    canvas: { width: 100, height: 100 },
    updateLive: (patch) => { Object.assign(got, patch); return true; },
};
let reInited = 0;
const fakeWin = {
    EmjeMotionBackground: {
        _instances: { get: () => fakeInst },
        reInit: () => { reInited++; },
    },
};
applyBackgroundToTarget(fakeWin, liveTarget, { ...baseCfg, motion: 'swirl', colors: ['#ff0000', '#222222', '#333333', '#444444'] });
eq('mesh-bridge-live-patch', got, { motion: 'swirl', colors: ['#ff0000', '#222222', '#333333', '#444444'] });
eq('mesh-bridge-no-reinit', reInited, 0);
eq('mesh-bridge-attr', liveTarget.read().motion, 'swirl');

// …but a speed change still takes the full re-init path.
const slowTarget = mockTarget(prevPayload);
applyBackgroundToTarget(fakeWin, slowTarget, { ...baseCfg, speed: 0 });
eq('mesh-bridge-reinit', reInited, 1);
eq('mesh-bridge-attr-speed', slowTarget.read().speed, 0);

// …and so does a detached target (template re-render replaced the node).
const detachedTarget = mockTarget(prevPayload);
detachedTarget.isConnected = false;
const reInitedBefore = reInited;
applyBackgroundToTarget(fakeWin, detachedTarget, { ...baseCfg, motion: 'flow' });
eq('mesh-bridge-detached-reinit', reInited, reInitedBefore + 1);

// …and an instance without a live canvas.
const noCanvasWin = {
    EmjeMotionBackground: {
        _instances: { get: () => ({ updateLive: () => true }) },
        reInit: () => { reInited++; },
    },
};
const noCanvasTarget = mockTarget(prevPayload);
applyBackgroundToTarget(noCanvasWin, noCanvasTarget, { ...baseCfg, motion: 'flow' });
eq('mesh-bridge-nocanvas-reinit', reInited, reInitedBefore + 2);
