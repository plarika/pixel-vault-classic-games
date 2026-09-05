# Segurança — Pixel Vault

## Versões suportadas

| Versão | Suporte |
| --- | --- |
| 1.0.x | Sim |
| < 1.0 | Não |

## Modelo de segurança

Pixel Vault é uma aplicação estática publicada em GitHub Pages. Não existe backend próprio, autenticação, base de dados, analytics ou cookies de sessão.

A V1 aplica:

- Content Security Policy restritiva, com `default-src 'none'`.
- Scripts e estilos apenas do próprio origin.
- `object-src 'none'`, `base-uri 'none'` e `form-action 'none'`.
- `referrer` desativado pela aplicação.
- Game Registry com IDs e paths validados.
- Builds 3D limitadas a `games-web/<game-id>/`.
- Service Worker com allowlist explícita da shell.
- Persistência local validada e limitada.
- GitHub Actions fixadas a SHAs completos.

## Limite de confiança das builds 3D

O `iframe` Godot Web usa `sandbox` com apenas as capacidades necessárias. No entanto, uma build 3D é servida pelo mesmo origin da plataforma e precisa de scripts; por isso o sandbox não deve ser tratado como uma fronteira forte contra código malicioso.

Consequência operacional: **só publicar builds 3D próprias, auditadas ou provenientes de fonte confiável**. Uma build desconhecida deve ser revista antes de entrar em `games-web/`.

## Supply chain

- As Actions usadas pelo CI/CD são referenciadas por SHA imutável.
- O repositório exige SHA pinning para GitHub Actions.
- O token padrão de workflows tem apenas permissão de leitura.
- Dependabot verifica npm e GitHub Actions mensalmente.
- Vulnerability alerts e automated security fixes estão ativos.

## Reportar uma vulnerabilidade

Usar **Security → Report a vulnerability** no repositório para um relatório privado. Não publicar detalhes exploráveis num issue público antes de existir correção.

Inclui versão, passos mínimos de reprodução, impacto observado e browser/SO quando aplicável.
