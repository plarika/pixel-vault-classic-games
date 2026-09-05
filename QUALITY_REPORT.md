# Pixel Vault V0.2.0 — Quality Report

## Score: 94/100

### Arquitetura — 20/20
- Game Registry V2 separa runtime, engine e ponto de entrada.
- Canvas continua desacoplado através do `GameHost`.
- Godot Web usa launcher dedicado e pasta isolada por jogo.
- O build copia automaticamente `games-web/` para o artefacto Pages.

### Segurança e privacidade — 19/20
- CSP restritiva no catálogo e no launcher 3D.
- Entradas Godot limitadas a `./games-web/<id>/.../index.html`.
- URLs externas, backslashes, fragments, query strings e path traversal são rejeitados.
- Sem trackers, backend ou dependências de runtime.
- Limitação: GitHub Pages não permite controlar todos os headers HTTP de segurança a partir do repositório.

### Testabilidade — 19/20
- Testes do catálogo original mantidos.
- Casos novos para Godot válido, URL externa, traversal e runtime desconhecido.
- `scripts/check.mjs` verifica catálogo, CSP e existência de builds registadas.
- Limitação: ainda não existe uma build Godot 3D real para teste E2E.

### UX / compatibilidade — 18/20
- Launcher 3D responsivo com fullscreen, reinício, favorito e voltar.
- Deep link `play.html?id=<id>`.
- Jogos Canvas mantêm teclado e touch.
- Limitação: gamepad e adaptação automática de qualidade 3D ficam para versões seguintes.

### CI/CD e manutenção — 18/20
- CI e deploy Pages mantidos com testes antes de publicação.
- Zero dependências npm de produção.
- Service Worker versionado para V0.2 e exclui builds 3D pesadas do cache próprio.
- Limitação: builds 3D grandes exigem disciplina de otimização e controlo de tamanho.

## Gates esperados

- `node --check`: PASS
- `npm test`: PASS
- `npm run build`: PASS
- Static structure check: PASS
- GitHub Actions CI: a validar após push
- GitHub Pages deploy: a validar após push

## Riscos residuais

1. O primeiro jogo Godot real deve ser testado em Chrome/Edge/Firefox e Android.
2. Performance 3D depende da complexidade do jogo e do hardware do dispositivo.
3. Builds Web devem ser produzidas com assets legalmente redistribuíveis.
4. O launcher só considera confiável conteúdo versionado no próprio repositório.
