// Smoke test runner: stages repo .js sources as .mjs (package type is
// commonjs, so ESM sources can't be imported directly), runs every
// *.test.mjs, and exits non-zero on any failure.
import { mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { report } from './helpers.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const tmp = join(dirname(fileURLToPath(import.meta.url)), '.tmp');
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

// Sources needed by the tests (repo-relative). Keys are temp names so
// relative cross-imports keep working after the .js -> .mjs rename.
const sources = {
    'eb-utils.mjs': 'resources/js/editor-bridge/utils.js',
    'eb-backgroundBridge.mjs': 'resources/js/editor-bridge/backgroundBridge.js',
    'eb-textMotionBridge.mjs': 'resources/js/editor-bridge/textMotionBridge.js',
    'eb-interactionBridge.mjs': 'resources/js/editor-bridge/interactionBridge.js',
    'eb-tooltip.mjs': 'resources/js/editor-bridge/tooltip.js',
    'eb-previewSync.mjs': 'resources/js/editor-bridge/previewSync.js',
    'mod-shared.mjs': 'resources/js/modules/BackgroundMotion/shared.js',
    'mod-interactiveCursor.mjs': 'resources/js/modules/InteractiveCursor/InteractiveCursor.js',
    'mod-textFollowCursor.mjs': 'resources/js/modules/InteractiveCursor/strategies/TextFollowCursor.js',
    'mod-dotRingCursor.mjs': 'resources/js/modules/InteractiveCursor/strategies/DotRingCursor.js',
};

for (const [dest, src] of Object.entries(sources)) {
    let code = readFileSync(join(root, src), 'utf8');
    // Rewrite relative imports to the staged .mjs names (match by
    // basename, case-insensitive: sources use prefixes like mod-Foo).
    code = code.replace(/from '(\.[\\/][\w\\/.-]+)\.js'/g, (m, p) => {
        const base = p.split('/').pop().toLowerCase();
        const hit = Object.keys(sources).find((k) => k.slice(0, -4).split('-').pop().toLowerCase() === base);
        return hit ? `from './${hit}'` : m;
    });
    writeFileSync(join(tmp, dest), code);
}

// Minimal browser globals for module top-level code.
globalThis.window = {
    elementor: {
        channels: { editor: { on: () => {}, request: () => null } },
        hooks: { addAction: () => {} },
    },
    jQuery: () => ({ on: () => {} }),
};
globalThis.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };

const dir = dirname(fileURLToPath(import.meta.url));
const tests = readdirSync(dir).filter((f) => f.endsWith('.test.mjs')).sort();
for (const t of tests) {
    try {
        await import(pathToFileURL(join(dir, t)).href);
        console.log(`ok - ${t}`);
    } catch (e) {
        console.log(`FAIL - ${t}: ${e && e.message}`);
        process.exitCode = 1;
    }
}
report('smoke');
