/**
 * Extract translatable strings from PHP sources into languages/emje-motion.pot.
 *
 * Usage: npm run i18n
 *
 * Scans src/ + emje-motion.php for WordPress i18n calls
 * (__, _e, _n, _x, _nx, esc_html__, esc_attr__, esc_html_e,
 * esc_attr_e, esc_html_x, esc_attr_x) with the 'emje-motion'
 * text domain, dedupes by msgid, and writes a valid POT file.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DOMAIN = 'emje-motion';
const OUT = path.join(ROOT, 'languages', 'emje-motion.pot');

const FUNCS = new Set([
    '__', '_e', '_n', '_x', '_nx',
    'esc_html__', 'esc_attr__',
    'esc_html_e', 'esc_attr_e',
    'esc_html_x', 'esc_attr_x',
]);

/** Parse all string literals in text: {value, line}[] (1-indexed lines). */
function parseStrings(text) {
    const out = [];
    let i = 0;
    let line = 1;
    while (i < text.length) {
        const ch = text[i];
        if (ch === '\n') {
            line++;
            i++;
            continue;
        }
        if (ch === "'" || ch === '"') {
            const quote = ch;
            let val = '';
            const startLine = line;
            i++;
            while (i < text.length && text[i] !== quote) {
                if (text[i] === '\\' && i + 1 < text.length) {
                    const nxt = text[i + 1];
                    // Keep PHP-ish escapes as their literal meaning for ' and ".
                    if (nxt === quote || nxt === '\\') {
                        val += nxt;
                    } else if (nxt === 'n' && quote === '"') {
                        val += '\n';
                    } else if (nxt === 't' && quote === '"') {
                        val += '\t';
                    } else {
                        val += text[i] + nxt;
                    }
                    if (nxt === '\n') line++;
                    i += 2;
                    continue;
                }
                if (text[i] === '\n') line++;
                val += text[i];
                i++;
            }
            i++; // closing quote
            out.push({ value: val, line: startLine });
            continue;
        }
        i++;
    }
    return out;
}

/**
 * Find i18n calls in PHP: returns {func, msgid, plural, context, line, file}[].
 * Parses the balanced paren group after each call and collects string
 * literals in order; requires the domain literal to be present.
 */
function extractCalls(src, relFile) {
    const found = [];
    const re = /(?<![A-Za-z0-9_$])(__|_e|_n|_x|_nx|esc_html__|esc_attr__|esc_html_e|esc_attr_e|esc_html_x|esc_attr_x)\s*\(/g;
    let m;
    while ((m = re.exec(src)) !== null) {
        const func = m[1];
        if (!FUNCS.has(func)) continue;
        // Locate balanced paren group.
        let depth = 1;
        let j = m.index + m[0].length;
        const argStart = j;
        while (j < src.length && depth > 0) {
            const c = src[j];
            if (c === '(') depth++;
            else if (c === ')') depth--;
            else if (c === "'" || c === '"') {
                // Skip string literals when counting parens.
                const q = c;
                j++;
                while (j < src.length && src[j] !== q) {
                    if (src[j] === '\\') j++;
                    j++;
                }
            }
            j++;
        }
        const argsText = src.slice(argStart, j - 1);
        const callLine = src.slice(0, m.index).split('\n').length;
        const strings = parseStrings(argsText).map((s) => s.value);
        if (!strings.includes(DOMAIN)) continue;

        const nonDomain = strings.filter((s) => s !== DOMAIN);
        let msgid = null;
        let plural = null;
        let context = null;
        if (func === '_n') {
            if (nonDomain.length < 2) continue;
            [msgid, plural] = nonDomain;
        } else if (func === '_nx') {
            if (nonDomain.length < 3) continue;
            [msgid, plural, context] = nonDomain;
        } else if (func === '_x' || func === 'esc_html_x' || func === 'esc_attr_x') {
            if (nonDomain.length < 2) continue;
            [msgid, context] = nonDomain;
        } else {
            if (nonDomain.length < 1 || nonDomain[0] === '') continue;
            [msgid] = nonDomain;
        }
        if (!msgid) continue;
        found.push({ func, msgid, plural, context, line: callLine, file: relFile });
    }
    return found;
}

/** Look back <=3 lines for a "translators:" note. */
function findNote(src, line) {
    const lines = src.split('\n');
    for (let k = Math.max(0, line - 4); k < line - 1; k++) {
        const m = lines[k].match(/translators:\s*(.+?)(?:\*\/)?\s*$/i);
        if (m) return m[1].trim();
    }
    return null;
}

function escPo(s) {
    return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

function walk(dir, out) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p, out);
        else if (e.name.endsWith('.php')) out.push(p);
    }
}

function main() {
    const files = [];
    walk(path.join(ROOT, 'src'), files);
    files.push(path.join(ROOT, 'emje-motion.php'));

    const entries = new Map(); // key: msgctxt\0msgid -> {msgid, plural, context, refs[], note}
    for (const abs of files) {
        const src = fs.readFileSync(abs, 'utf8');
        const rel = path.relative(ROOT, abs).replace(/\\/g, '/');
        for (const c of extractCalls(src, rel)) {
            const key = (c.context || '') + '' + c.msgid;
            if (!entries.has(key)) {
                const base = { msgid: c.msgid, plural: c.plural, context: c.context, refs: [], note: null };
                const note = findNote(src, c.line);
                if (note) base.note = note;
                entries.set(key, base);
            }
            entries.get(key).refs.push(c.file + ':' + c.line);
        }
    }

    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const now = new Date().toISOString().replace(/\.\d+Z$/, '+00:00');
    let pot = '';
    pot += '# Emje Motion translation template.\n';
    pot += '# Copyright (C) 2026 Emje Creative\n';
    pot += '# This file is distributed under the GPL-2.0-or-later license.\n';
    pot += 'msgid ""\n';
    pot += 'msgstr ""\n';
    pot += '"Project-Id-Version: Emje Motion ' + pkg.version + '\\n"\n';
    pot += '"Report-Msgid-Bugs-To: https://github.com/emjecreative/emje-motion/issues\\n"\n';
    pot += '"POT-Creation-Date: ' + now + '\\n"\n';
    pot += '"MIME-Version: 1.0\\n"\n';
    pot += '"Content-Type: text/plain; charset=UTF-8\\n"\n';
    pot += '"Content-Transfer-Encoding: 8bit\\n"\n';
    pot += '"X-Generator: tools/make-pot.js\\n"\n';
    pot += '"X-Domain: emje-motion\\n"\n';
    pot += '"Language: \\n"\n';
    pot += '\n';

    const sorted = [...entries.values()].sort((a, b) => {
        if (a.msgid < b.msgid) return -1;
        if (a.msgid > b.msgid) return 1;
        return (a.context || '') < (b.context || '') ? -1 : 1;
    });
    for (const e of sorted) {
        if (e.note) pot += '#. ' + e.note + '\n';
        const refs = [...new Set(e.refs)].sort();
        // Wrap long refs.
        let refLine = '#: ';
        for (const r of refs) {
            if ((refLine + ' ' + r).length > 76 && refLine !== '#: ') {
                pot += refLine.trimEnd() + '\n';
                refLine = '#: ';
            }
            refLine += r + ' ';
        }
        pot += refLine.trimEnd() + '\n';
        if (e.context) pot += 'msgctxt "' + escPo(e.context) + '"\n';
        pot += 'msgid "' + escPo(e.msgid) + '"\n';
        if (e.plural) {
            pot += 'msgid_plural "' + escPo(e.plural) + '"\n';
            pot += 'msgstr[0] ""\n';
            pot += 'msgstr[1] ""\n';
        } else {
            pot += 'msgstr ""\n';
        }
        pot += '\n';
    }

    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, pot.replace(/\n/g, '\n'), 'utf8');
    console.log('Wrote ' + path.relative(ROOT, OUT) + ' with ' + sorted.length + ' strings from ' + files.length + ' files.');
}

main();
