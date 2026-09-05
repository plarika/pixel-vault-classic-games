import { findGame, isCanvasGame, isGodotWebGame, validateCatalog } from './catalog.js';
import { isFavorite, recordPlayed, toggleFavorite } from './core/storage.js';

validateCatalog();

const ui = {
  title: document.querySelector('#playerTitle'),
  meta: document.querySelector('#playerMeta'),
  help: document.querySelector('#playerHelp'),
  status: document.querySelector('#playerStatus'),
  frame: document.querySelector('#gameFrame'),
  stage: document.querySelector('#webGameStage'),
  error: document.querySelector('#playerError'),
  favorite: document.querySelector('#playerFavorite'),
  reload: document.querySelector('#reloadGame'),
  fullscreen: document.querySelector('#fullscreenGame')
};

const id = new URLSearchParams(location.search).get('id') ?? '';
const game = /^[a-z0-9-]+$/.test(id) ? findGame(id) : null;

function fail(message) {
  ui.status.textContent = 'INDISPONÍVEL';
  ui.error.hidden = false;
  ui.error.textContent = message;
  ui.stage.hidden = true;
}

function syncFavorite() {
  if (!game) return;
  const active = isFavorite(game.id);
  ui.favorite.setAttribute('aria-pressed', String(active));
  ui.favorite.textContent = active ? '♥ Favorito' : '♡ Favorito';
}

if (!game) {
  fail('Jogo não encontrado no catálogo.');
} else if (isCanvasGame(game)) {
  window.location.replace(`./?play=${encodeURIComponent(game.id)}`);
} else if (!isGodotWebGame(game)) {
  fail('Runtime de jogo não suportado.');
} else {
  document.title = `${game.title} — Pixel Vault`;
  ui.title.textContent = game.title;
  ui.meta.textContent = `${game.category.toUpperCase()} · ${game.year} · ${game.engine.toUpperCase()}`;
  ui.help.textContent = game.help;
  ui.status.textContent = 'A CARREGAR';
  syncFavorite();
  recordPlayed(game.id);

  const entryUrl = new URL(game.entry, document.baseURI);
  if (entryUrl.origin !== location.origin) {
    fail('A build do jogo não pertence ao Pixel Vault.');
  } else {
    ui.frame.src = entryUrl.href;
    ui.frame.addEventListener('load', () => { ui.status.textContent = 'A JOGAR'; }, { once: true });
  }
}

ui.favorite.addEventListener('click', () => {
  if (!game) return;
  toggleFavorite(game.id);
  syncFavorite();
});

ui.reload.addEventListener('click', () => {
  if (!game || !isGodotWebGame(game) || !ui.frame.src) return;
  ui.status.textContent = 'A REINICIAR';
  ui.frame.src = ui.frame.src;
});

ui.fullscreen.addEventListener('click', async () => {
  if (!game || !isGodotWebGame(game)) return;
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await ui.stage.requestFullscreen();
  } catch (error) {
    console.warn('Fullscreen indisponível:', error);
  }
});
