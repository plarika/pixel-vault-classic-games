const GAME_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAFE_TEXT_PATTERN = /^[^\u0000-\u001F\u007F]+$/u;
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

export function normalizeGameId(value) {
  if (typeof value !== 'string') return '';
  const id = value.trim().toLowerCase();
  return GAME_ID_PATTERN.test(id) && id.length <= 64 ? id : '';
}

export function isSafeText(value, maxLength = 160) {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= maxLength
    && SAFE_TEXT_PATTERN.test(value);
}

export function isHexColor(value) {
  return typeof value === 'string' && HEX_COLOR_PATTERN.test(value);
}

export function isSafeRelativeResource(path, prefix, suffix) {
  if (typeof path !== 'string' || path.length > 256) return false;
  if (!path.startsWith(prefix) || !path.endsWith(suffix)) return false;
  if (path.includes('..') || path.includes('\\') || path.includes('%')) return false;
  if (path.includes('?') || path.includes('#') || path.startsWith('//')) return false;
  return !/^[a-z][a-z0-9+.-]*:/i.test(path);
}
