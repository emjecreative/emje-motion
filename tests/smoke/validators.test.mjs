import { tmpUrl, eq } from './helpers.mjs';

const { isValidEditorColor, safeCssEnum, safeCssMeasure } = await import(tmpUrl('eb-utils.mjs'));
const { LIMITS, clampNum, smoothstep } = await import(tmpUrl('mod-shared.mjs'));

for (const c of ['#3B82F6', '#fff', '#ffffffff', 'rgba(255,255,255,0.08)', 'var(--e-global-color-abc)', 'red']) {
    eq(`color-ok ${c}`, isValidEditorColor(c), true);
}
for (const c of ['var(--x);color:red)', '#12345', '#1234567', 'rgba(0,0,0);evil(', 'red;', 'url(x)', 'var(--a)url(x)', '']) {
    eq(`color-bad ${c}`, isValidEditorColor(c), false);
}

eq('enum-ok', safeCssEnum('bold', /^(normal|bold)$/, '600'), 'bold');
eq('enum-fallback', safeCssEnum('bold;x', /^(normal|bold)$/, '600'), '600');
eq('enum-nonstr', safeCssEnum(null, /^(normal|bold)$/, '600'), '600');
eq('measure-ok', safeCssMeasure('12px', ''), '12px');
eq('measure-evil', safeCssMeasure('12px;color:red', ''), '');
eq('measure-num', safeCssMeasure(0.5, ''), '0.5');

// clampNum parity with the old inline Math.max/min pattern.
const samples = [undefined, null, 0, -5, 5, 22, 56, 120, 1000, 'abc'];
for (const s of samples) {
    const fb = Number.isNaN(parseFloat(s)) ? 56 : parseFloat(s);
    eq(`clamp ${String(s)}`, clampNum(fb, LIMITS.pixel.cellSize, 56), Math.max(24, Math.min(96, fb)));
}
// ASCII zero quirk preserved: explicit 0 falls back via || before clamping.
eq('ascii-zero-quirk', clampNum(parseFloat(0) || 22, LIMITS.ascii.cell, 22), 22);

eq('limits-pixel-maxcells', LIMITS.pixel.maxCells, 3000);
eq('limits-ascii-maxcells', LIMITS.ascii.maxCells, 2500);
eq('smoothstep-mid', smoothstep(0, 120, 60), 0.5);
