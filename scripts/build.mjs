import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const item of ['index.html', 'manifest.webmanifest', 'sw.js', 'assets']) {
  await cp(join(root, item), join(dist, item), { recursive: true });
}
console.log('BUILD_OK: dist/ preparado para GitHub Pages.');
