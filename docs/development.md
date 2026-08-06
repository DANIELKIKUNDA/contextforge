# Guide de développement — ContextForge V1

Ce document décrit l'environnement de développement, l'architecture et les workflows pour contribuer à ContextForge.

## Prérequis

- Node.js >= 20
- pnpm >= 9
- Git

## Mise en place

```bash
corepack enable
pnpm install
pnpm build
```

## Structure du monorepo

```
contextforge/
├── apps/
│   ├── cli/                  # CLI standalone (commander)
│   └── vscode-extension/     # Extension VS Code
├── packages/
│   ├── contracts/            # Types, DTOs, value objects, schémas Zod
│   ├── core/                 # Logique métier, use cases, ports, domain
│   ├── scanner/              # Découverte de fichiers, lecture, .gitignore
│   ├── security/             # Détection et masquage de secrets
│   ├── sizing/               # Estimation de tokens
│   ├── packer/               # Tri, priorisation, validation de volume
│   ├── generators/           # Génération des fichiers de sortie
│   ├── profiles/             # Profils prédéfinis (ai-general, code-review, ui-ux)
│   ├── configuration/        # Chargement YAML/JSON, merger, validation
│   └── shared/               # Utilitaires partagés
├── docs/                     # Documentation
├── fixtures/                 # Projets de test
└── scripts/                  # Scripts utilitaires
```

## Architecture

ContextForge suit une **architecture hexagonale** (ports & adapters) :

- **Domain** : `packages/core/src/domain/` — Agrégats, state machine
- **Ports** : `packages/core/src/ports/` — Interfaces (file discovery, security scanner, etc.)
- **Use Cases** : `packages/core/src/use-cases/` — Orchestration métier
- **Services** : `packages/core/src/services/` — Logique transverse
- **Adapters** : Implémentations concrètes dans chaque package applicatif

La CLI et l'extension VS Code sont des **adaptateurs** qui assemblent les dépendances et exposent les use cases. Aucune logique métier dans les apps.

## Commandes utiles

| Commande | Description |
|---|---|
| `pnpm install --frozen-lockfile` | Installer exactement les dépendances verrouillées |
| `pnpm build` | Compiler tous les packages (turbo) |
| `pnpm typecheck` | Vérifier les types TypeScript |
| `pnpm lint` | Linter (Biome) |
| `pnpm test` | Tests unitaires (Vitest) |
| `pnpm test:integration` | Tests d'intégration VS Code (Extension Host) |

## Qualité

- **TypeScript strict** dans tous les packages
- **Biome** pour le linting et le formatage
- **Vitest** pour les tests unitaires (le total exact est publié par chaque run CI)
- **Mocha + @vscode/test-electron** pour les tests d'intégration VS Code
- **Zod** pour la validation des schémas

## Workflow Git

1. Créer une branche `feat/xxx` depuis `main`
2. Développer, tester, linter
3. Ouvrir une PR vers `main`
4. La CI exécute `quality` (typecheck, lint, test) puis `package` (VSIX + SHA-256)

## Packaging

```bash
cd apps/vscode-extension
pnpm package
pnpm package:ls
```

Le `.vscodeignore` à la racine de `apps/vscode-extension/` contrôle ce qui est inclus/exclu du `.vsix`.

## CI/CD

Le workflow `.github/workflows/ci.yml` définit deux jobs :
- **Quality Gates** : build, typecheck, lint, tests unitaires et tests Extension Host ;
- **Package VSIX** (après Quality Gates) : bundle autonome, packaging `.vsix`, calcul et
  vérification du SHA-256, inspection du contenu et upload de l'artefact.

## Règles absolues

- Aucun accès réseau dans le Core
- Aucun `any` injustifié
- La logique métier reste dans le Core
- Aucun fichier source du projet analysé ne doit être modifié
- Aucun secret réel dans le dépôt ou les fixtures
- TypeScript strict partout
- Aucun test ne doit être supprimé pour faire passer la CI
- Aucun changement d'architecture sans ADR
