import { findGame, isCanvasGame, isGodotWebGame, validateCatalog } from './catalog.js';
import { normalizeGameId } from './core/security.js';
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

const rawId = new URLSearchParams(location.search).get('id') ?? '';
const id = normalizeGameId(rawId);
const game = id ? findGame(id) : null;

function fail(message) {
  ui.status.textContent = 'INDISPONÍVEL';
  ui.error.hidden = false;
  ui.error.textContent = message;
  ui.stage.hidden = true;
  ui.reload.disabled = true;
  ui.fullscreen.disabled = true;
}

function syncFavorite() {
  if (!game) return;
  const active = isFavorite(game.id);
  ui.favorite.setAttribute('aria-pressed', String(active));
  ui.favorite.textContent = active ? '♥ Favorito' : '♡ Favorito';
}

function safeEntryUrl(targetGame) {
  const url = new URL(targetGame.entry, document.baseURI);
  const expected = new URL(`./games-web/${targetGame.id}/`, document.baseURI);
  if (url.origin !== location.origin) return null;
  if (!url.pathname.startsWith(expected.pathname) || !url.pathname.endsWith('/index.html')) return null;
  return url;
}

async function loadGodotBuild(targetGame, restarting = false) {
  const entryUrl = safeEntryUrl(targetGame);
  if (!entryUrl) {
    fail('A build do jogo não pertence ao Pixel Vault.');
    return;
  }

  ui.error.hidden = true;
  ui.stage.hidden = false;
  ui.status.textContent = restarting ? 'A REINICIAR' : 'A VERIFICAR';

  let response;
  try {
    response = await fetch(entryUrl.href, {
      cache: 'no-store',
      credentials: 'same-origin',
      redirect: 'error'
    });
  } catch {
    fail('Não foi possível verificar a build do jogo.');
    return;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!response.ok || !contentType.toLowerCase().includes('text/html')) {
    fail('A build Web não está disponível ou não é HTML válido.');
    return;
  }

  ui.status.textContent = 'A CARREGAR';
  ui.reload.disabled = false;
  ui.fullscreen.disabled = false;
  ui.frame.addEventListener('load', () => {
    ui.status.textContent = 'A JOGAR';
  }, { once: true });
  ui.frame.addEventListener('error', () => {
    fail('Falha ao carregar a build Web.');
  }, { once: true });
  ui.frame.src = entryUrl.href;
}

async function boot() {
  if (!game) {
    fail('Jogo não encontrado no catálogo.');
    ui.favorite.disabled = true;
    return;
  }
  if (isCanvasGame(game)) {
    window.location.replace(`./?play=${encodeURIComponent(game.id)}`);
    return;
  }
  if (!isGodotWebGame(game)) {
    fail('Runtime de jogo não suportado.');
    return;
  }

  document.title = `${game.title} — Pixel Vault`;
  ui.title.textContent = game.title;
  ui.meta.textContent = `${game.category.toUpperCase()} · ${game.year} · ${game.engine.toUpperCase()}`;
  ui.help.textContent = game.help;
  syncFavorite();
  recordPlayed(game.id);
  await loadGodotBuild(game);
}

ui.favorite.addEventListener('click', () => {
  if (!game) return;
  toggleFavorite(game.id);
  syncFavorite();
});

ui.reload.addEventListener('click', () => {
  if (!game || !isGodotWebGame(game)) return;
  void loadGodotBuild(game, true);
});

ui.fullscreen.addEventListener('click', async () => {
  if (!game || !isGodotWebGame(game)) return;
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await ui.stage.requestFullscreen();
  } catch (error) {
    console.warn('Fullscreen indisponível:', error);
    ui.status.textContent = 'FULLSCREEN INDISPONÍVEL';
  }
});

void boot();
