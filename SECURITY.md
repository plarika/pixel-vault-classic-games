# Segurança

## Âmbito
Pixel Vault V0.1 é uma aplicação estática executada no browser. Não possui backend, autenticação, pagamentos nem recolha de dados.

## Princípios
- Content Security Policy restritiva e sem scripts inline.
- Sem dependências JavaScript de terceiros em runtime.
- Sem recursos remotos, trackers ou analytics.
- Preferências guardadas apenas em `localStorage` do browser.
- CI com permissões mínimas; o job de testes tem apenas `contents: read`.
- Deploy Pages usa apenas `pages: write` e `id-token: write` no workflow dedicado.

## Conteúdo de jogos
Não adicionar ROMs, BIOS, imagens, música ou outros assets protegidos sem licença explícita. Jogos novos devem ser originais, open-source, public domain ou possuir autorização de distribuição.

## Reportar vulnerabilidades
Não publicar segredos em issues. Num repositório público, usar o mecanismo privado de Security Advisories do GitHub quando estiver ativado.
