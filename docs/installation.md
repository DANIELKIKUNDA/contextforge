# Installation

ContextForge V1 se distribue sous forme d'extension VS Code empaquetée dans un fichier `.vsix`. L'installation est 100 % locale : aucun compte, aucun accès réseau requis.

## Prérequis

| Composant | Version minimale |
|---|---|
| Visual Studio Code | `^1.85.0` |
| Node.js | `>= 20` (développement uniquement) |
| pnpm | `>= 9` (développement uniquement) |

> L'extension installée ne nécessite **pas** Node.js : son code d'exécution et ses
> dépendances internes sont regroupés dans `dist/extension.js`.

## Installer le .vsix

### Depuis l'interface VS Code

1. Ouvrez VS Code
2. Palette de commandes (`Ctrl+Shift+P`) → **Extensions: Install from VSIX...**
3. Sélectionnez `contextforge-1.0.0-rc.1.vsix`

### Depuis le terminal

```bash
code --install-extension contextforge-1.0.0-rc.1.vsix --force
```

### Vérifier l'installation

```bash
code --list-extensions --show-versions
```

La sortie doit contenir `contextforge.contextforge` (ID = `publisher.name`).

## Vérifier l'intégrité

Chaque artefact est accompagné d'un SHA-256 (`.sha256`).

**PowerShell :**
```powershell
Get-FileHash .\contextforge-1.0.0-rc.1.vsix -Algorithm SHA256
```

**Linux/macOS :**
```bash
sha256sum -c contextforge-1.0.0-rc.1.vsix.sha256
```

Toute divergence = artefact altéré : **ne pas installer**.

## Désinstaller

```bash
code --uninstall-extension contextforge.contextforge
```

L'extension ne doit plus apparaître dans `code --list-extensions`. Les Context
Packs déjà générés dans les workspaces ne sont pas supprimés.

## Récupérer l'artefact

L'artefact `contextforge-1.0.0-rc.1` est produit par le job CI `Package VSIX` et
téléchargeable depuis l'onglet **Artifacts** du run GitHub Actions. Il contient
le VSIX et son fichier `.sha256`.

## Limitations V1

- Pas de publication sur le Visual Studio Marketplace
- Activation automatique au démarrage de VS Code (`onStartupFinished`)
- Installation exclusivement par fichier `.vsix`
