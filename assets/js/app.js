import { games, findGame, getPlayerUrl, isCanvasGame, isGodotWebGame, validateCatalog } from './catalog.js';
import { GameHost } from './core/game-host.js';
import { getBestScore, getFavorites, getRecent, isFavorite, recordPlayed, saveBestScore, toggleFavorite } from './core/storage.js';

validateCatalog();

const state = { category: 'all', query: '', mode: 'all', activeGame: null };
const ui = {
  gameGrid: document.querySelector('#gameGrid'),
  template: document.querySelector('#gameCardTemplate'),
  resultCount: document.querySelector('#resultCount'),
  emptyState: document.querySelector('#emptyState'),
  search: document.querySelector('#searchInput'),
  dialog: document.querySelector('#gameDialog'),
  canvas: document.querySelector('#gameCanvas'),
  title: document.querySelector('#gameTitle'),
  category: document.querySelector('#gameCategory'),
  help: document.querySelector('#gameHelp'),
  score: document.querySelector('#scoreValue'),
  best: document.querySelector('#bestValue'),
  status: document.querySelector('#statusValue'),
  favorite: document.querySelector('#favoriteButton'),
  menu: document.querySelector('#menuButton'),
  touchControls: document.querySelector('#touchControls')
};

const host = new GameHost(ui.canvas, {
  onScore: (value) => {
    ui.score.textContent = String(value);
    if (!state.activeGame) return;
    const best = saveBestScore(state.activeGame.id, value);
    ui.best.textContent = String(best);
  },
  onStatus: (value) => { ui.status.textContent = value; },
  onError: () => { ui.dialog.setAttribute('aria-busy', 'false'); }
});

function filteredGames() {
  const query = state.query.trim().toLocaleLowerCase('pt-PT');
  let list = [...games];
  if (state.mode === 'favorites') {
    const favorites = new Set(getFavorites());
    list = list.filter((game) => favorites.has(game.id));
  } else if (state.mode === 'recent') {
    const recent = getRecent();
    const order = new Map(recent.map((id, index) => [id, index]));
    list = list.filter((game) => order.has(game.id)).sort((a, b) => order.get(a.id) - order.get(b.id));
  }
  if (state.category !== 'all') list = list.filter((game) => game.category === state.category);
  if (query) {
    list = list.filter((game) => `${game.title} ${game.category} ${game.year} ${game.engine} ${game.runtime}`.toLocaleLowerCase('pt-PT').includes(query));
  }
  return list;
}

function runtimeLabel(game) {
  return isGodotWebGame(game) ? '3D · GODOT WEB' : '2D · CANVAS';
}

function renderGames() {
  const list = filteredGames();
  ui.gameGrid.replaceChildren();
  for (const game of list) {
    const fragment = ui.template.content.cloneNode(true);
    const card = fragment.querySelector('.game-card');
    const cover = fragment.querySelector('.game-cover');
    const icon = fragment.querySelector('.cover-icon');
    const title = fragment.querySelector('h3');
    const meta = fragment.querySelector('.game-meta');
    const runtime = fragment.querySelector('.runtime-badge');
    const favorite = fragment.querySelector('.card-favorite');
    card.dataset.gameId = game.id;
    cover.style.setProperty('--cover-a', game.colors[0]);
    cover.style.setProperty('--cover-b', game.colors[1]);
    icon.textContent = game.icon;
    title.textContent = game.title;
    meta.textContent = `${game.category} · ${game.year}`;
    runtime.textContent = runtimeLabel(game);
    cover.setAttribute('aria-label', `Jogar ${game.title}`);
    cover.addEventListener('click', () => launchGame(game.id));
    setFavoriteButton(favorite, game.id);
    favorite.addEventListener('click', () => {
      toggleFavorite(game.id);
      setFavoriteButton(favorite, game.id);
      if (state.mode === 'favorites') renderGames();
      if (state.activeGame?.id === game.id) syncDialogFavorite();
    });
    ui.gameGrid.append(fragment);
  }
  ui.resultCount.textContent = `${list.length} ${list.length === 1 ? 'jogo' : 'jogos'}`;
  ui.emptyState.hidden = list.length > 0;
}

function setFavoriteButton(button, gameId) {
  const active = isFavorite(gameId);
  button.setAttribute('aria-pressed', String(active));
  button.textContent = active ? '♥' : '♡';
  button.setAttribute('aria-label', active ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
}

async function launchGame(id) {
  const game = findGame(id);
  if (!game) return;
  recordPlayed(game.id);

  if (isGodotWebGame(game)) {
    const target = getPlayerUrl(game);
    if (target) window.location.assign(target);
    return;
  }
  if (!isCanvasGame(game)) return;

  state.activeGame = game;
  ui.title.textContent = game.title;
  ui.category.textContent = `${game.category.toUpperCase()} · ${game.year} · ${game.engine.toUpperCase()}`;
  ui.help.textContent = game.help;
  ui.score.textContent = '0';
  ui.best.textContent = String(getBestScore(game.id));
  ui.status.textContent = 'A CARREGAR';
  ui.dialog.setAttribute('aria-busy', 'true');
  syncDialogFavorite();
  if (!ui.dialog.open) ui.dialog.showModal();
  try {
    const moduleUrl = new URL(game.module, import.meta.url).href;
    await host.load(moduleUrl, game.id);
    ui.dialog.setAttribute('aria-busy', 'false');
    ui.canvas.focus();
  } catch (error) {
    console.error(error);
    ui.dialog.setAttribute('aria-busy', 'false');
    ui.status.textContent = 'ERRO AO CARREGAR';
  }
}

function syncDialogFavorite() {
  if (!state.activeGame) return;
  const active = isFavorite(state.activeGame.id);
  ui.favorite.setAttribute('aria-pressed', String(active));
  ui.favorite.textContent = active ? '♥ Remover dos favoritos' : '♡ Adicionar aos favoritos';
}

document.querySelectorAll('[data-play]').forEach((button) => button.addEventListener('click', () => launchGame(button.dataset.play)));
document.querySelector('#restartButton').addEventListener('click', () => host.restart());
document.querySelector('#closeGameButton').addEventListener('click', () => ui.dialog.close());
ui.dialog.addEventListener('close', () => { host.destroy(); state.activeGame = null; renderGames(); });
ui.favorite.addEventListener('click', () => { if (!state.activeGame) return; toggleFavorite(state.activeGame.id); syncDialogFavorite(); });

ui.search.addEventListener('input', () => { state.query = ui.search.value.slice(0, 48); renderGames(); });
document.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => {
  state.category = button.dataset.category;
  state.mode = 'all';
  document.querySelectorAll('[data-category]').forEach((item) => item.classList.toggle('active', item === button));
  renderGames();
}));

document.querySelector('#favoritesNav').addEventListener('click', () => { state.mode = 'favorites'; state.category = 'all'; setAllTab(); renderGames(); document.querySelector('#biblioteca').scrollIntoView(); closeMenu(); });
document.querySelector('#recentNav').addEventListener('click', () => { state.mode = 'recent'; state.category = 'all'; setAllTab(); renderGames(); document.querySelector('#biblioteca').scrollIntoView(); closeMenu(); });
function setAllTab() { document.querySelectorAll('[data-category]').forEach((item) => item.classList.toggle('active', item.dataset.category === 'all')); }

ui.menu.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  ui.menu.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('.sidebar a').forEach((link) => link.addEventListener('click', closeMenu));
function closeMenu() { document.body.classList.remove('menu-open'); ui.menu.setAttribute('aria-expanded', 'false'); }

for (const button of ui.touchControls.querySelectorAll('[data-key]')) {
  const key = button.dataset.key;
  const down = (event) => { event.preventDefault(); host.setTouchKey(key, true); };
  const up = (event) => { event.preventDefault(); host.setTouchKey(key, false); };
  button.addEventListener('pointerdown', down);
  button.addEventListener('pointerup', up);
  button.addEventListener('pointercancel', up);
  button.addEventListener('pointerleave', up);
}

window.addEventListener('blur', () => host.pause(true));
window.addEventListener('focus', () => { if (ui.dialog.open) host.pause(false); });
document.addEventListener('visibilitychange', () => host.pause(document.hidden));

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch((error) => console.warn('Service Worker indisponível:', error));
}

renderGames();
const requestedGame = new URLSearchParams(location.search).get('play');
if (requestedGame && /^[a-z0-9-]+$/.test(requestedGame)) launchGame(requestedGame);
