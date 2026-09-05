const KEY = 'pixel-vault:v1:state';
const LEGACY = 'pixel-vault:';
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SCORE = 1_000_000_000;
let memory = { version: 1, favorites: [], recent: [], best: {} };

function safeId(value) {
  return typeof value === 'string' && value.length <= 64 && ID.test(value) ? value : '';
}

function uniqueIds(values, limit) {
  if (!Array.isArray(values)) return [];
  const out = [];
  const seen = new Set();
  for (const value of values) {
    const id = safeId(value);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= limit) break;
  }
  return out;
}

function safeScore(value) {
  const score = Number(value);
  return Number.isFinite(score) ? Math.min(MAX_SCORE, Math.max(0, Math.floor(score))) : 0;
}

export function sanitizeState(value) {
  const state = { version: 1, favorites: [], recent: [], best: {} };
  if (!value || typeof value !== 'object') return state;
  state.favorites = uniqueIds(value.favorites, 128);
  state.recent = uniqueIds(value.recent, 24);
  if (value.best && typeof value.best === 'object' && !Array.isArray(value.best)) {
    let count = 0;
    for (const [rawId, rawScore] of Object.entries(value.best)) {
      const id = safeId(rawId);
      if (!id) continue;
      state.best[id] = safeScore(rawScore);
      if (++count >= 256) break;
    }
  }
  return state;
}

function storage() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const probe = `${KEY}:probe`;
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    return null;
  }
}

function migrate(store) {
  const state = { version: 1, favorites: [], recent: [], best: {} };
  try {
    state.favorites = JSON.parse(store.getItem(`${LEGACY}favorites`) ?? '[]');
    state.recent = JSON.parse(store.getItem(`${LEGACY}recent`) ?? '[]');
    for (let i = 0; i < store.length; i += 1) {
      const key = store.key(i);
      if (!key?.startsWith(`${LEGACY}best:`)) continue;
      const id = safeId(key.slice(`${LEGACY}best:`.length));
      if (id) state.best[id] = JSON.parse(store.getItem(key) ?? '0');
    }
  } catch {
    return sanitizeState(null);
  }
  return sanitizeState(state);
}

function load() {
  const store = storage();
  if (!store) return sanitizeState(memory);
  try {
    const raw = store.getItem(KEY);
    if (raw) return sanitizeState(JSON.parse(raw));
    const state = migrate(store);
    store.setItem(KEY, JSON.stringify(state));
    return state;
  } catch {
    return sanitizeState(null);
  }
}

function save(state) {
  memory = sanitizeState(state);
  const store = storage();
  if (!store) return false;
  try {
    store.setItem(KEY, JSON.stringify(memory));
    return true;
  } catch {
    return false;
  }
}

export function getFavorites() { return [...load().favorites]; }
export function getRecent() { return [...load().recent]; }
export function isFavorite(id) { const x = safeId(id); return x ? load().favorites.includes(x) : false; }

export function toggleFavorite(id) {
  const x = safeId(id); if (!x) return false;
  const state = load(); const set = new Set(state.favorites);
  if (set.has(x)) set.delete(x); else set.add(x);
  state.favorites = [...set].slice(-128); save(state); return set.has(x);
}

export function recordPlayed(id) {
  const x = safeId(id); if (!x) return false;
  const state = load(); state.recent = [x, ...state.recent.filter((v) => v !== x)].slice(0, 24);
  return save(state);
}

export function getBestScore(id) { const x = safeId(id); return x ? safeScore(load().best[x] ?? 0) : 0; }
export function saveBestScore(id, score) {
  const x = safeId(id); if (!x) return 0;
  const state = load(); const best = Math.max(safeScore(state.best[x] ?? 0), safeScore(score));
  state.best[x] = best; save(state); return best;
}
