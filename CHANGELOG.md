# Changelog

## 1.0.0 — 2026-09-05

### Segurança

- CSP endurecida com `default-src 'none'`.
- `iframe` Godot limitado com sandbox e same-origin preflight.
- Game Registry com validação central de IDs, paths e metadados.
- Service Worker convertido para cache allowlist-only.
- Persistência local sanitizada e limitada.
- GitHub Actions fixadas por SHA completo.
- Gate estático para sinks JS perigosos e permissões de workflows.

### Fiabilidade

- Error boundary no runtime Canvas.
- Validação do contrato `update/render/reset`.
- Proteção contra carregamentos assíncronos fora de ordem.
- Migração automática do estado local V0.x para V1.
- Builds 3D verificadas antes de abrir no launcher.

### Manutenção

- Dependabot para GitHub Actions e npm.
- EditorConfig e Git attributes.
- CODEOWNERS para áreas críticas.
- Testes de catálogo, paths, estado local e hardening.
