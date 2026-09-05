import test from 'node:test';
import assert from 'node:assert/strict';
import { games, findGame, validateCatalog } from '../assets/js/catalog.js';

test('catálogo base é válido', () => assert.equal(validateCatalog(), true));
test('IDs do catálogo são únicos', () => assert.equal(new Set(games.map((game) => game.id)).size, games.length));
test('findGame devolve jogo conhecido', () => assert.equal(findGame('snake')?.title, 'Neon Snake'));
test('findGame devolve null para ID inexistente', () => assert.equal(findGame('nao-existe'), null));
test('catálogo rejeita IDs duplicados', () => {
  const duplicate = [{ ...games[0] }, { ...games[0] }];
  assert.throws(() => validateCatalog(duplicate), /duplicado/i);
});
