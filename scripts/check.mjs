import { access, readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { games, isCanvasGame, isGodotWebGame, validateCatalog } from '../assets/js/catalog.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const version = packageJson.version;
if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Versão SemVer inválida');
validateCatalog();

const required = [
  'index.html', 'play.html', 'manifest.webmanifest', 'sw.js',
  'assets/css/styles.css', 'assets/js/app.js', 'assets/js/player.js',
  'assets/js/catalog.js', 'assets/js/core/security.js',
  'assets/js/core/storage.js', 'assets/js/core/input.js', 'assets/js/core/game-host.js'
];
for (const path of required) await access(join(root, path));

for (const game of games) {
  if (isCanvasGame(game)) {
    await access(join(root, 'assets/js', game.module.replace('./', '')));
  } else if (isGodotWebGame(game)) {
    await access(join(root, game.entry.replace('./', '')));
  }
}

const indexHtml = await readFile(join(root, 'index.html'), 'utf8');
const sw = await readFile(join(root, 'sw.js'), 'utf8');
if (!indexHtml.includes(`PIXEL VAULT V${version}`)) throw new Error('Versão visual desalinhada');
if (!sw.includes(`pixel-vault-v${version}`)) throw new Error('Versão do cache desalinhada');

const forbiddenExtensions = new Set(['.exe', '.msi', '.bat', '.cmd', '.ps1', '.com', '.scr']);
const maxFileBytes = 95 * 1024 * 1024;

async function inspectTree(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error?.code === 'ENOENT') return;
    throw error;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await inspectTree(full);
      continue;
    }
    const ext = entry.name.includes('.') ? `.${entry.name.split('.').pop().toLowerCase()}` : '';
    if (forbiddenExtensions.has(ext)) throw new Error(`Executável proibido em games-web: ${entry.name}`);
    const info = await stat(full);
    if (info.size > maxFileBytes) throw new Error(`Ficheiro >95 MiB: ${entry.name}`);
  }
}

await inspectTree(join(root, 'games-web'));

const manifest = JSON.parse(await readFile(join(root, 'manifest.webmanifest'), 'utf8'));
if (manifest.start_url !== './' || manifest.scope !== './') throw new Error('Manifest fora do scope esperado');
if (!Array.isArray(manifest.icons) || manifest.icons.length < 2) throw new Error('Ícones PWA insuficientes');

console.log(`CHECK_OK: Pixel Vault V${version}; ${games.length} jogos; estrutura e artefactos validados.`);
