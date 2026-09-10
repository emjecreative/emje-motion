// Shared test helpers (kept separate from run.mjs to avoid a
// circular import that deadlocks top-level await).
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));

let pass = 0;
let fail = 0;
const failures = [];

export function model(obj) {
    return { get: (k) => (k in obj ? obj[k] : undefined) };
}

export function eq(name, actual, expected) {
    const a = JSON.stringify(actual);
    const b = JSON.stringify(expected);
    if (a === b) {
        pass++;
    } else {
        fail++;
        failures.push(`${name}: got ${a}, want ${b}`);
    }
}

export function tmpUrl(name) {
    return new URL(`./.tmp/${name}`, `file://${dir}/`).href;
}

export function report(label) {
    console.log(`\n${label}: ${pass} passed, ${fail} failed`);
    if (fail > 0) {
        for (const f of failures) console.log(`  - ${f}`);
        process.exitCode = 1;
    }
}
