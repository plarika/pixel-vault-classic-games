# Builds 3D Web

Esta pasta recebe apenas builds Web aprovadas para o Pixel Vault.

Estrutura esperada:

```text
games-web/
└── <game-id>/
    ├── index.html
    ├── *.js
    ├── *.wasm
    ├── *.pck
    └── assets...
```

## Contrato V1

- O `game-id` usa apenas letras minúsculas, números e hífen.
- A entrada do catálogo tem de ser `./games-web/<game-id>/index.html`.
- Não são aceites URLs externas, traversal (`..`), backslashes ou paths percent-encoded.
- Executáveis Windows e scripts de sistema são bloqueados pelo build.
- Ficheiros individuais acima de 95 MiB bloqueiam o build.
