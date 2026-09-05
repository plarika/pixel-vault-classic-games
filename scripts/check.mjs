import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { games, validateCatalog } from '../assets/js/catalog.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
validateCatalog();

const required = ['index.html', 'assets/css/styles.css', 'assets/js/app.js', 'manifest.webmanifest', 'sw.js'];
for (const path of required) await access(join(root, path));
for (const game of games) await access(join(root, 'assets/js', game.module.replace('./', '')));

const html = await readFile(join(root, 'index.html'), 'utf8');
if (!html.includes('Content-Security-Policy')) throw new Error('CSP em falta no index.html');
if (/https?:\/\//i.test(html)) throw new Error('O index.html não deve depender de recursos externos');
if (/<script(?![^>]*type="module"[^>]*src=)/i.test(html)) throw new Error('Scripts inline ou não-modulares detetados');

console.log(`CHECK_OK: ${games.length} jogos validados e estrutura íntegra.`);
