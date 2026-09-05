# Jogos 3D / Godot Web

Esta pasta recebe **builds Web reais** dos jogos 3D integrados no Pixel Vault.

## Contrato de integração

Cada jogo deve ocupar uma pasta própria cujo nome seja exatamente igual ao `id` do catálogo:

```text
games-web/
└── classic-snake-3d/
    ├── index.html
    ├── classic-snake-3d.js
    ├── classic-snake-3d.wasm
    ├── classic-snake-3d.pck
    └── outros assets locais...
```

A entrada correspondente em `assets/js/catalog.js` usa:

```js
{
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
}
```

## Regras técnicas

- Exportar o projeto Godot para **Web**.
- Usar renderer **Compatibility** para compatibilidade Web.
- Preferir exportação Web sem threads quando o jogo não necessita delas.
- Manter scripts, WASM, PCK, texturas, áudio e restantes assets dentro da pasta do jogo.
- Não depender de CDNs ou scripts remotos.
- Não usar caminhos `../` nem URLs absolutas no campo `entry` do catálogo.
- O `entry` tem obrigatoriamente de terminar em `index.html` e estar dentro de `games-web/<id>/`.
- Otimizar texturas, áudio, sombras e resolução para reduzir tempo de arranque no browser.

## Publicação

Depois de copiar a build e adicionar a entrada ao catálogo:

```bash
npm test
npm run build
```

O workflow de GitHub Pages publica automaticamente a pasta `games-web/` juntamente com a plataforma.

## Segurança e direitos

Só devem ser adicionados jogos e assets que possam ser legalmente redistribuídos. O launcher 3D do Pixel Vault aceita apenas páginas internas do próprio site; URLs externas não são aceites pelo catálogo.
