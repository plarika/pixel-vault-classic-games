# Pixel Vault — Jogos que nunca morrem

Pixel Vault V1.0.0 é uma plataforma web estática para jogos clássicos 2D e 3D, publicada em GitHub Pages e desenhada para execução direta no browser.

## V1.0.0

Inclui quatro jogos Canvas jogáveis:

- **Neon Snake**
- **Vector Pong**
- **Neon Breaker**
- **Star Defender**

E está preparada para receber builds 3D Godot Web através do Game Registry.

### Funcionalidades

- catálogo, pesquisa e categorias;
- favoritos, histórico e recordes locais;
- teclado e controlos táteis;
- launcher dedicado para jogos 3D;
- fullscreen para builds Web;
- PWA e shell offline;
- layout responsivo;
- deep links de jogos;
- CI/CD e deploy automático no GitHub Pages.

## Arquitetura

```text
index.html                 catálogo/launcher 2D
play.html                  launcher 3D
assets/js/catalog.js       Game Registry
assets/js/core/            input, storage, segurança, GameHost
assets/js/games/           jogos Canvas
games-web/<game-id>/       builds 3D Web
scripts/                   gates de build e segurança
.github/workflows/         CI e deploy Pages
```

## Adicionar um jogo Canvas

1. Criar `assets/js/games/<id>.js`.
2. Exportar `createGame({ width, height })`.
3. A instância deve implementar `update`, `render` e `reset`.
4. Registar o jogo em `assets/js/catalog.js` com runtime `canvas`.
5. Executar `npm run verify`.

## Adicionar um jogo Godot Web

1. Exportar uma build Web para `games-web/<game-id>/`.
2. A entrada deve ser `games-web/<game-id>/index.html`.
3. Registar o jogo com runtime `godot-web`.
4. Rever a origem e o conteúdo da build antes de publicar.
5. Executar `npm run verify`.

Não incluir ROMs, BIOS, assets comerciais sem licença, executáveis nativos ou scripts de sistema.

## Validação local

Requer Node.js 22 ou superior.

```bash
npm ci
npm run verify
npm run serve
```

A página local fica em `http://127.0.0.1:4173`.

## Hardening V1

- CSP restritiva e sem scripts inline.
- Validação central de IDs, textos, cores e paths.
- Estado local sanitizado, limitado e migrado da V0.x.
- Runtime Canvas com validação de contrato e error boundary.
- Launcher 3D com preflight same-origin e `iframe sandbox`.
- Service Worker limitado a uma allowlist explícita.
- GitHub Actions fixadas por SHA completo.
- Dependabot, vulnerability alerts e security fixes ativos.
- CI bloqueia sinks JS perigosos e artefactos 3D incompatíveis.

Ver `SECURITY.md` para o modelo de confiança e limitações.

## Publicação

O workflow de Pages executa testes, gates de segurança e build antes do deploy. A branch `main` é a fonte da página pública.

## Licença e conteúdo

O código da plataforma é MIT. Jogos e assets adicionados ao catálogo devem ser originais, public domain, open-source compatível ou ter licença de redistribuição adequada.
