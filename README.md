# Pixel Vault — Jogos que nunca morrem

Pixel Vault é uma plataforma web estática para jogos clássicos 2D e 3D, desenhada para funcionar diretamente no browser e ser publicada no GitHub Pages.

## V0.2.0

A V0.2 introduz o **Game Registry V2** e o primeiro contrato de integração para jogos 3D exportados para Web.

### Jogos incluídos

- **Neon Snake** — arcade de grelha.
- **Vector Pong** — jogador contra IA.
- **Neon Breaker** — destruição de blocos.
- **Star Defender** — shooter arcade original.

Os quatro jogos atuais continuam a usar HTML5 Canvas. A arquitetura passa também a aceitar builds **Godot Web** reais sem misturar o código do jogo com o código da plataforma.

## Funcionalidades

- Catálogo, pesquisa e categorias.
- Favoritos, últimos jogados e recordes locais.
- Controlos de teclado e toque para jogos Canvas.
- PWA e cache offline do núcleo 2D.
- `Game Registry V2` com runtimes `canvas` e `godot-web`.
- Launcher dedicado `play.html` para jogos 3D.
- Fullscreen, reinício, favoritos e deep links para jogos Web.
- Validação de paths: builds Godot só podem ser carregadas de `games-web/<id>/`.
- Deploy automático para GitHub Pages.

## Arquitetura

```text
pixel-vault-classic-games/
├── index.html
├── play.html
├── manifest.webmanifest
├── sw.js
├── assets/
│   ├── css/styles.css
│   └── js/
│       ├── app.js
│       ├── player.js
│       ├── catalog.js
│       ├── core/
│       └── games/               # jogos Canvas
├── games-web/                   # builds Godot Web
│   └── README.md
├── scripts/
├── tests/
└── .github/workflows/
```

## Game Registry V2

Cada entrada em `assets/js/catalog.js` declara o runtime.

### Canvas

```js
{
  id: 'snake',
  runtime: RUNTIMES.CANVAS,
  engine: 'HTML5 Canvas',
  module: './games/snake.js'
}
```

### Godot Web

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

O launcher não aceita URLs externas nem `../`. A build tem de pertencer ao próprio Pixel Vault.

## Integrar um jogo Godot 3D

1. No Godot, preparar uma exportação **Web** compatível com o browser.
2. Colocar todos os ficheiros exportados em `games-web/<id>/`.
3. Garantir que existe `games-web/<id>/index.html`.
4. Adicionar a entrada `RUNTIMES.GODOT_WEB` ao catálogo.
5. Executar:

```bash
npm test
npm run build
```

6. Fazer push para `main`. O workflow publica automaticamente a build.

As instruções detalhadas estão em `games-web/README.md`.

## Testar localmente

Requer Node.js 22 ou superior.

```bash
npm ci
npm test
npm run build
npm run serve
```

Abrir `http://127.0.0.1:4173`.

## Segurança e manutenção

- CSP no catálogo e no launcher.
- Zero dependências npm de runtime.
- Sem trackers, anúncios ou backend obrigatório.
- Estado local em `localStorage`.
- Builds 3D não são pré-carregadas pelo Service Worker para evitar caches grandes ou desatualizados.
- ROMs, BIOS e assets comerciais não devem ser adicionados sem licença de redistribuição.

## Roadmap

- **V0.2.x** — integrar o primeiro jogo 3D real e afinar UX do launcher.
- **V0.3** — Gamepad API e remapeamento.
- **V0.4** — áudio comum, conquistas e estatísticas.
- **V0.5** — editor/manifesto de catálogo e mais jogos.
- **V1.0** — catálogo extensível estabilizado com testes E2E.
