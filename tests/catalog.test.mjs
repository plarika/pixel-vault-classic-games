import test from 'node:test';
import assert from 'node:assert/strict';
import { RUNTIMES, games, findGame, getPlayerUrl, validateCatalog } from '../assets/js/catalog.js';

test('catálogo base é válido', () => assert.equal(validateCatalog(), true));
test('IDs do catálogo são únicos', () => assert.equal(new Set(games.map((game) => game.id)).size, games.length));
test('findGame devolve jogo conhecido', () => assert.equal(findGame('snake')?.title, 'Neon Snake'));
test('findGame devolve null para ID inexistente', () => assert.equal(findGame('nao-existe'), null));
test('catálogo rejeita IDs duplicados', () => {
  const duplicate = [{ ...games[0] }, { ...games[0] }];
  assert.throws(() => validateCatalog(duplicate), /duplicado/i);
});

test('Game Registry V2 aceita uma build Godot interna válida', () => {
  const godot = {
    id: 'classic-snake-3d',
    title: 'Classic Snake 3D',
    category: 'arcade',
    year: 2026,
    icon: '◆',
    runtime: RUNTIMES.GODOT_WEB,
    engine: 'Godot 4 Web',
    entry: './games-web/classic-snake-3d/index.html',
    help: 'Setas/WASD para controlar.',
    colors: ['#123456', '#19d8ff']
  };
  assert.equal(validateCatalog([godot]), true);
  assert.equal(getPlayerUrl(godot), './play.html?id=classic-snake-3d');
});

test('Game Registry V2 rejeita build Godot externa', () => {
  const godot = {
    id: 'classic-snake-3d', title: 'Classic Snake 3D', category: 'arcade', year: 2026,
    icon: '◆', runtime: RUNTIMES.GODOT_WEB, engine: 'Godot 4 Web',
    entry: 'https://example.com/index.html', help: 'Teste', colors: ['#111111', '#222222']
  };
  assert.throws(() => validateCatalog([godot]), /Godot inválida/i);
});

test('Game Registry V2 rejeita path traversal em build Godot', () => {
  const godot = {
    id: 'classic-snake-3d', title: 'Classic Snake 3D', category: 'arcade', year: 2026,
    icon: '◆', runtime: RUNTIMES.GODOT_WEB, engine: 'Godot 4 Web',
    entry: './games-web/classic-snake-3d/../outro/index.html', help: 'Teste', colors: ['#111111', '#222222']
  };
  assert.throws(() => validateCatalog([godot]), /Godot inválida/i);
});

test('catálogo rejeita runtime desconhecido', () => {
  const invalid = { ...games[0], id: 'runtime-invalido', runtime: 'remote-iframe' };
  assert.throws(() => validateCatalog([invalid]), /Runtime não suportado/i);
});
