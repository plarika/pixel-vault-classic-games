import {
  isHexColor,
  isSafeRelativeResource,
  isSafeText,
  normalizeGameId
} from './core/security.js';

export const RUNTIMES = Object.freeze({
  CANVAS: 'canvas',
  GODOT_WEB: 'godot-web'
});

const CATEGORIES = new Set(['arcade', 'action', 'puzzle', 'sports', 'racing', 'adventure']);

export const games = Object.freeze([
  Object.freeze({
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
  }),
  Object.freeze({
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
  }),
  Object.freeze({
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
  }),
  Object.freeze({
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
  })
]);

export function findGame(id) {
  const safeId = normalizeGameId(id);
  return safeId ? games.find((game) => game.id === safeId) ?? null : null;
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

function validMetadata(game) {
  return isSafeText(game.title, 80)
    && isSafeText(game.help, 320)
    && isSafeText(game.engine, 80)
    && CATEGORIES.has(game.category)
    && Number.isInteger(game.year)
    && game.year >= 1970 && game.year <= 2100;
}

export function validateCatalog(catalog = games) {
  if (!Array.isArray(catalog) || catalog.length > 256) throw new Error('Catálogo inválido');
  const ids = new Set();
  for (const game of catalog) {
    if (!game || typeof game !== 'object') throw new Error('Entrada de jogo inválida');
    const id = normalizeGameId(game.id);
    if (!id || id !== game.id) throw new Error(`ID inválido: ${game.id}`);
    if (ids.has(id)) throw new Error(`ID duplicado: ${id}`);
    ids.add(id);
    if (!validMetadata(game)) throw new Error(`Metadados inválidos: ${id}`);
    if (!Array.isArray(game.colors) || game.colors.length !== 2 || !game.colors.every(isHexColor)) {
      throw new Error(`Cores inválidas: ${id}`);
    }

    if (isCanvasGame(game)) {
      if (!isSafeRelativeResource(game.module, './games/', '.js')) {
        throw new Error(`Módulo inválido: ${id}`);
      }
      continue;
    }

    if (isGodotWebGame(game)) {
      const prefix = `./games-web/${id}/`;
      if (!isSafeRelativeResource(game.entry, prefix, 'index.html')) {
        throw new Error(`Build Godot inválida: ${id}`);
      }
      continue;
    }
    throw new Error(`Runtime não suportado: ${id}`);
  }
  return true;
}
