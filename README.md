# Pixel Vault — Jogos que nunca morrem

Pixel Vault é uma plataforma web estática para jogos clássicos originais, desenhada para funcionar diretamente no browser e ser publicada em GitHub Pages.

## V0.1.0

Inclui quatro jogos jogáveis:

- **Neon Snake** — arcade de grelha.
- **Vector Pong** — jogador contra IA.
- **Neon Breaker** — destruição de blocos.
- **Star Defender** — shooter arcade original inspirado na era dos arcades.

A plataforma inclui catálogo, pesquisa, categorias, favoritos, últimos jogados, recordes locais, controlos de teclado e toque, layout responsivo, instalação como PWA e cache offline.

## Arquitetura

```text
pixel-vault-classic-games/
├── index.html
├── manifest.webmanifest
├── sw.js
├── assets/
│   ├── css/styles.css
│   └── js/
│       ├── app.js
│       ├── catalog.js
│       ├── core/
│       │   ├── game-host.js
│       │   ├── input.js
│       │   └── storage.js
│       └── games/
│           ├── snake.js
│           ├── pong.js
│           ├── breaker.js
│           └── star-defender.js
├── scripts/
│   ├── build.mjs
│   ├── check.mjs
│   └── serve.mjs
├── tests/
│   └── catalog.test.mjs
└── .github/workflows/
    ├── ci.yml
    └── pages.yml
```

Cada jogo implementa a mesma interface mínima (`update`, `render`, `reset`) e é carregado dinamicamente pelo `GameHost`. Isto permite adicionar jogos sem misturar a lógica do catálogo com a lógica de gameplay.

## Testar localmente

Requer Node.js 22 ou superior.

```bash
npm install
npm test
npm run build
npm run serve
```

Depois abrir:

```text
http://127.0.0.1:4173
```

Não abrir `index.html` diretamente por `file://`, porque ES Modules e Service Workers dependem de um servidor HTTP.

## Publicar no GitHub Pages

1. Criar um repositório GitHub e colocar estes ficheiros na branch `main`.
2. Em **Settings → Pages → Build and deployment**, selecionar **GitHub Actions** como source.
3. Fazer push para `main`.
4. O workflow `.github/workflows/pages.yml` executa testes, cria `dist/` e publica a página.

O workflow usa as ações oficiais atuais recomendadas pelo GitHub para Pages: `configure-pages`, `upload-pages-artifact` e `deploy-pages`.

## Adicionar um jogo

1. Criar `assets/js/games/meu-jogo.js` exportando `createGame({ width, height })`.
2. O objeto retornado deve implementar:

```js
{
  update(dt, input),
  render(ctx),
  reset()
}
```

3. Adicionar a entrada ao array em `assets/js/catalog.js`.
4. Adicionar o ficheiro à lista `ASSETS` em `sw.js` para suporte offline.
5. Executar `npm test && npm run build`.

## Controlos

- Setas ou WASD: movimento.
- Espaço: ação/disparo/recomeçar, conforme o jogo.
- Em dispositivos táteis são mostrados D-pad e botão A.

## Segurança e privacidade

A V0.1 não tem servidor, login, cookies, anúncios ou analytics. Favoritos, histórico e recordes ficam apenas no `localStorage` do dispositivo. Ver `SECURITY.md`.

## Direitos de autor

O código deste projeto é MIT. Os jogos incluídos são implementações originais criadas para esta plataforma. O projeto **não inclui ROMs, BIOS ou assets comerciais**. Para expandir a biblioteca, usar apenas conteúdo original, open-source, public domain ou licenciado para redistribuição.

## Próximas versões

- V0.2 — perfis locais, conquistas e estatísticas.
- V0.3 — gamepad API e remapeamento de controlos.
- V0.4 — áudio e sistema comum de efeitos.
- V0.5 — mais jogos e editor de catálogo.
- V0.6 — suporte opcional a jogos open-source/WebAssembly licenciados.
- V1.0 — plataforma estável com catálogo extensível e testes end-to-end.
