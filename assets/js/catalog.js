export const RUNTIMES = Object.freeze({
  CANVAS: 'canvas',
  GODOT_WEB: 'godot-web'
});

export const games = Object.freeze([
  {
    id: 'snake',
    title: 'Neon Snake',
    category: 'arcade',
    year: 1976,
    icon: '▰',
    runtime: RUNTIMES.CANVAS,
    engine: 'HTML5 Canvas',
    module: './games/snake.js',
    help: 'Setas/WASD para mover. Come os pixels e evita as paredes e a própria cauda.',
    colors: ['#0d3f59', '#19d8ff']
  },
  {
    id: 'pong',
    title: 'Vector Pong',
    category: 'sports',
    year: 1972,
    icon: '◐',
    runtime: RUNTIMES.CANVAS,
    engine: 'HTML5 Canvas',
    module: './games/pong.js',
    help: 'W/S ou ↑/↓ para mover a raquete. Primeiro a 7 pontos vence.',
    colors: ['#251f5d', '#8b5cf6']
  },
  {
    id: 'breaker',
    title: 'Neon Breaker',
    category: 'arcade',
    year: 1976,
    icon: '▦',
    runtime: RUNTIMES.CANVAS,
    engine: 'HTML5 Canvas',
    module: './games/breaker.js',
    help: '←/→ ou A/D para mover. Parte todos os blocos sem deixar cair a bola.',
    colors: ['#5c203e', '#ff3fa4']
  },
  {
    id: 'star-defender',
    title: 'Star Defender',
    category: 'action',
    year: 1978,
    icon: '▲',
    runtime: RUNTIMES.CANVAS,
    engine: 'HTML5 Canvas',
    module: './games/star-defender.js',
    help: '←/→ ou A/D para mover. Espaço para disparar. Sobrevive às vagas inimigas.',
    colors: ['#4d2d12', '#ff8a3d']
  }
]);

export function findGame(id) {
  return games.find((game) => game.id === id) ?? null;
}

export function isCanvasGame(game) {
  return game?.runtime === RUNTIMES.CANVAS;
}

export function isGodotWebGame(game) {
  return game?.runtime === RUNTIMES.GODOT_WEB;
}

export function getPlayerUrl(game) {
  if (!game?.id || !isGodotWebGame(game)) return null;
  return `./play.html?id=${encodeURIComponent(game.id)}`;
}

function hasSafeRelativePath(path, prefix, suffix) {
  if (typeof path !== 'string') return false;
  if (!path.startsWith(prefix) || !path.endsWith(suffix)) return false;
  if (path.includes('..') || path.includes('\\') || path.includes('?') || path.includes('#')) return false;
  return !/^[a-z][a-z0-9+.-]*:/i.test(path);
}

export function validateCatalog(catalog = games) {
  const ids = new Set();
  for (const game of catalog) {
    if (!game || typeof game !== 'object') throw new Error('Entrada de jogo inválida');
    if (!/^[a-z0-9-]+$/.test(game.id ?? '')) throw new Error(`ID inválido: ${game.id}`);
    if (ids.has(game.id)) throw new Error(`ID duplicado: ${game.id}`);
    ids.add(game.id);
    if (!game.title || !game.category || !game.help || !game.engine) throw new Error(`Jogo incompleto: ${game.id}`);
    if (!Array.isArray(game.colors) || game.colors.length !== 2) throw new Error(`Cores inválidas: ${game.id}`);

    if (isCanvasGame(game)) {
      if (!hasSafeRelativePath(game.module, './games/', '.js')) throw new Error(`Módulo inválido: ${game.id}`);
      continue;
    }
    if (isGodotWebGame(game)) {
      const prefix = `./games-web/${game.id}/`;
      if (!hasSafeRelativePath(game.entry, prefix, 'index.html')) throw new Error(`Build Godot inválida: ${game.id}`);
      continue;
    }
    throw new Error(`Runtime não suportado: ${game.id}`);
  }
  return true;
}
