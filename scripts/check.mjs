import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { games, isCanvasGame, isGodotWebGame, validateCatalog } from '../assets/js/catalog.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
validateCatalog();

const required = [
  'index.html', 'play.html', 'assets/css/styles.css', 'assets/js/app.js',
  'assets/js/player.js', 'manifest.webmanifest', 'sw.js', 'games-web/README.md'
];
for (const path of required) await access(join(root, path));

for (const game of games) {
  if (isCanvasGame(game)) {
    await access(join(root, 'assets/js', game.module.replace('./', '')));
  } else if (isGodotWebGame(game)) {
    await access(join(root, game.entry.replace('./', '')));
  }
}

for (const file of ['index.html', 'play.html']) {
  const html = await readFile(join(root, file), 'utf8');
  if (!html.includes('Content-Security-Policy')) throw new Error(`CSP em falta no ${file}`);
  if (/https?:\/\//i.test(html)) throw new Error(`${file} não deve depender de recursos externos`);
  if (/<script(?![^>]*type="module"[^>]*src=)/i.test(html)) throw new Error(`Scripts inline ou não-modulares em ${file}`);
}

console.log(`CHECK_OK: ${games.length} jogos validados; Canvas + Godot Web preparados.`);
