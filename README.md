# ContextForge

**Générateur local, offline-first de Context Packs structurés, sécurisés et traçables depuis un projet logiciel.**

ContextForge V1 est une extension VS Code construite autour d'un moteur indépendant. Elle transforme une sélection de fichiers d'un projet en un Context Pack propre, ciblé et immédiatement exploitable par un humain ou un agent IA, sans jamais exposer de secrets ni modifier les sources.

## Statut

🚧 Phase 0 — Initialisation du monorepo

## Prérequis

- Node.js >= 20
- pnpm >= 9

## Démarrage rapide

```bash
corepack enable
pnpm install
pnpm typecheck
pnpm lint
pnpm test
```

## Structure du projet

```
contextforge/
├── apps/
│   ├── cli/
│   └── vscode-extension/
├── packages/
│   ├── contracts/
│   ├── core/
│   ├── scanner/
│   ├── security/
│   ├── sizing/
│   ├── packer/
│   ├── generators/
│   ├── profiles/
│   ├── configuration/
│   └── shared/
├── docs/
├── fixtures/
├── scripts/
└── .github/workflows/
```

## Licence

MIT — Voir [LICENSE](./LICENSE)