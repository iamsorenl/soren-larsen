// worker/scripts/sync-data.mjs
import { cp, mkdir, rm } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '../../src/data');
const dest = resolve(here, '../src/data');

await rm(dest, { recursive: true, force: true });
await mkdir(dest, { recursive: true });
await cp(src, dest, {
  recursive: true,
  filter: (path) => !path.endsWith('.pdf') && !basename(path).startsWith('.'),
});

console.log(`Synced ${src} -> ${dest}`);
