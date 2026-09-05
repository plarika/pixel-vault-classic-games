export const games = Object.freeze([
  {
    id: 'snake',
    title: 'Neon Snake',
    category: 'arcade',
    year: 1976,
    icon: '▰',
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
    module: './games/star-defender.js',
    help: '←/→ ou A/D para mover. Espaço para disparar. Sobrevive às vagas inimigas.',
    colors: ['#4d2d12', '#ff8a3d']
  }
]);

export function findGame(id) {
  return games.find((game) => game.id === id) ?? null;
}

export function validateCatalog(catalog = games) {
  const ids = new Set();
  for (const game of catalog) {
    if (!/^[a-z0-9-]+$/.test(game.id)) throw new Error(`ID inválido: ${game.id}`);
    if (ids.has(game.id)) throw new Error(`ID duplicado: ${game.id}`);
    ids.add(game.id);
    if (!game.title || !game.category || !game.module || !game.help) throw new Error(`Jogo incompleto: ${game.id}`);
    if (!game.module.startsWith('./games/') || !game.module.endsWith('.js')) throw new Error(`Módulo inválido: ${game.id}`);
  }
  return true;
}
