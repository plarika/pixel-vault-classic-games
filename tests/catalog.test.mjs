import test from 'node:test';
import assert from 'node:assert/strict';
import { games, findGame, RUNTIMES, validateCatalog } from '../assets/js/catalog.js';
import { isSafeRelativeResource, normalizeGameId } from '../assets/js/core/security.js';
import { sanitizeState } from '../assets/js/core/storage.js';

test('catálogo base é válido', () => assert.equal(validateCatalog(), true));
test('IDs do catálogo são únicos', () => assert.equal(new Set(games.map((game) => game.id)).size, games.length));
test('findGame devolve jogo conhecido', () => assert.equal(findGame('snake')?.title, 'Neon Snake'));
test('findGame normaliza caixa e espaços', () => assert.equal(findGame(' SNAKE ')?.id, 'snake'));
test('findGame devolve null para ID inexistente', () => assert.equal(findGame('nao-existe'), null));

test('catálogo rejeita IDs duplicados', () => {
  const duplicate = [{ ...games[0] }, { ...games[0] }];
  assert.throws(() => validateCatalog(duplicate), /duplicado/i);
});

test('Game Registry V2 aceita uma build Godot interna válida', () => {
  const game = { ...games[0], id: 'snake-3d', runtime: RUNTIMES.GODOT_WEB, engine: 'Godot 4', entry: './games-web/snake-3d/index.html' };
  delete game.module;
  assert.equal(validateCatalog([game]), true);
});

test('Game Registry rejeita build Godot externa', () => {
  const game = { ...games[0], id: 'bad-3d', runtime: RUNTIMES.GODOT_WEB, engine: 'Godot 4', entry: 'https://example.test/index.html' };
  assert.throws(() => validateCatalog([game]), /Godot inválida/i);
});

test('Game Registry rejeita traversal normal e codificado', () => {
  assert.equal(isSafeRelativeResource('./games-web/x/../index.html', './games-web/x/', 'index.html'), false);
  assert.equal(isSafeRelativeResource('./games-web/x/%2e%2e/index.html', './games-web/x/', 'index.html'), false);
});

test('catálogo rejeita runtime desconhecido', () => {
  assert.throws(() => validateCatalog([{ ...games[0], runtime: 'plugin' }]), /Runtime não suportado/i);
});

test('catálogo rejeita cores fora do contrato', () => {
  assert.throws(() => validateCatalog([{ ...games[0], colors: ['red', '#ffffff'] }]), /Cores inválidas/i);
});

test('normalizeGameId rejeita IDs ambíguos', () => {
  assert.equal(normalizeGameId('snake--3d'), '');
  assert.equal(normalizeGameId('../snake'), '');
  assert.equal(normalizeGameId('Snake-3D'), 'snake-3d');
});

test('sanitizeState remove lixo, duplicados e limita scores', () => {
  const state = sanitizeState({
    favorites: ['snake', 'snake', '../bad', 7],
    recent: ['pong', 'pong', 'bad id'],
    best: { snake: 12.9, '../bad': 99, pong: 9e20 }
  });
  assert.deepEqual(state.favorites, ['snake']);
  assert.deepEqual(state.recent, ['pong']);
  assert.equal(state.best.snake, 12);
  assert.equal(state.best.pong, 1_000_000_000);
  assert.equal(state.best['../bad'], undefined);
});
