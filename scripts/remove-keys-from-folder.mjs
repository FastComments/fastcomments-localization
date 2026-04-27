#!/usr/bin/env node
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const [, , folder, ...keys] = process.argv;
if (!folder || keys.length === 0) {
    console.error('Usage: node scripts/remove-keys-from-folder.mjs <folder-relative-to-text> <key1> [<key2> ...]');
    process.exit(1);
}

const root = new URL('../text/' + folder + '/', import.meta.url);
const entries = await readdir(root);
let touched = 0;

for (const entry of entries) {
    if (!entry.endsWith('.json')) continue;
    const path = join(root.pathname, entry);
    const original = await readFile(path, 'utf8');
    const trailingNewline = original.endsWith('\n');
    let parsed;
    try {
        parsed = JSON.parse(original);
    } catch (e) {
        console.error('skip (invalid JSON): ' + entry);
        continue;
    }
    let removed = 0;
    for (const k of keys) {
        if (Object.prototype.hasOwnProperty.call(parsed, k)) {
            delete parsed[k];
            removed += 1;
        }
    }
    if (removed === 0) continue;
    const next = JSON.stringify(parsed, null, 4) + (trailingNewline ? '\n' : '');
    await writeFile(path, next);
    console.log(entry + ': removed ' + removed + ' key(s)');
    touched += 1;
}

console.log('done; ' + touched + ' file(s) updated');
