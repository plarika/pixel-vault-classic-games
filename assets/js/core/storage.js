const PREFIX = 'pixel-vault:';

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function getFavorites() {
  const value = readJson('favorites', []);
  return Array.isArray(value) ? value.filter((id) => typeof id === 'string') : [];
}

export function toggleFavorite(id) {
  const set = new Set(getFavorites());
  if (set.has(id)) set.delete(id); else set.add(id);
  writeJson('favorites', [...set]);
  return set.has(id);
}

export function isFavorite(id) {
  return getFavorites().includes(id);
}

export function recordPlayed(id) {
  const current = getRecent().filter((value) => value !== id);
  current.unshift(id);
  writeJson('recent', current.slice(0, 12));
}

export function getRecent() {
  const value = readJson('recent', []);
  return Array.isArray(value) ? value.filter((id) => typeof id === 'string') : [];
}

export function getBestScore(id) {
  const value = Number(readJson(`best:${id}`, 0));
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
}

export function saveBestScore(id, score) {
  const safeScore = Number.isFinite(score) ? Math.max(0, Math.floor(score)) : 0;
  const previous = getBestScore(id);
  if (safeScore > previous) writeJson(`best:${id}`, safeScore);
  return Math.max(previous, safeScore);
}
