# Guide d'utilisation — ContextForge V1

ContextForge V1 est une extension VS Code locale et offline-first permettant de générer des Context Packs structurés, sécurisés et traçables depuis un projet logiciel, sans jamais modifier les sources.

## Commandes

Toutes les commandes sont accessibles via la palette de commandes (`Ctrl+Shift+P`).

| Commande | ID |
|---|---|
| Generate Context Pack | `contextForge.generateContextPack` |
| Preview Context Pack | `contextForge.previewContextPack` |
| Validate Configuration | `contextForge.validateConfiguration` |
| Open Last Context Pack | `contextForge.openLastContextPack` |

## 1. Générer un Context Pack

1. Ouvrez le workspace du projet cible dans VS Code.
2. Lancez **ContextForge: Generate Context Pack**.
3. Renseignez les paramètres demandés :
   - **Objectif** : description textuelle (ex : "Revue de code du module auth").
   - **Profil** : `ai-general`, `code-review`, `ui-ux`, ou `custom`.
   - **Limite de tokens** : 4000, 8000, 16000, 32000 (défaut), 64000, 128000.
   - **Sources** : répertoires ou fichiers à inclure.
4. Confirmez le preview.
5. Le pack est généré dans `.contextforge/output/`.

### Contenu du pack

| Fichier | Rôle |
|---|---|
| `README.md` | Contexte, objectif, instructions |
| `context-01.md`, `context-02.md`, … | Contenu des fichiers sources inclus, réparti en volumes |
| `manifest.json` | Métadonnées (id, date, profil, exclusions) |
| `included-files.md` | Liste des fichiers inclus |
| `exclusions.md` | Fichiers exclus avec motifs |
| `warnings.md` | Avertissements sécurité/taille |

### Exclusions automatiques

`node_modules`, `.git`, `.contextforge`, `dist`, `build`, `.next`, `.nuxt`, `__pycache__`, `.venv`, `venv`, `.idea`, `.vscode`, `coverage`, `.turbo`, fichiers sensibles détectés, fichiers > 1 Mo, patterns `.gitignore` et `.contextforgeignore`.

### Masquage des secrets

Les secrets détectés (clés API, tokens, mots de passe) sont remplacés par `[REDACTED]`. **Aucun fichier source n'est modifié.**

## 2. Prévisualiser un Context Pack

**ContextForge: Preview Context Pack** affiche le résultat de l'analyse avant génération : nombre de fichiers découverts/inclus/exclus/bloqués, estimation de tokens, volume estimé.

## 3. Valider la configuration

**ContextForge: Validate Configuration** vérifie la validité du fichier de configuration, le chargement des profils, et l'absence d'incohérences.

## 4. Ouvrir le dernier Context Pack

**ContextForge: Open Last Context Pack** ouvre le répertoire du dernier pack généré dans l'explorateur.

## Configuration VS Code

Accessible via `File > Preferences > Settings` > `Extensions > ContextForge`.

| Paramètre | Défaut | Valeurs |
|---|---|---|
| `contextForge.defaultProfile` | `ai-general` | `ai-general`, `code-review`, `ui-ux`, `custom` |
| `contextForge.defaultTokenLimit` | `32000` | `4000`, `8000`, `16000`, `32000`, `64000`, `128000` |
| `contextForge.outputDirectory` | `.contextforge/output` | Chemin relatif au workspace |

## Profils

- **ai-general** : Tous fichiers textuels, ordre de pertinence.
- **code-review** : Code source uniquement.
- **ui-ux** : Styles, templates, composants.
- **custom** : Défini par `.contextforge/config.yaml`.

## Configuration projet (optionnelle)

Fichier `.contextforge/config.yaml` à la racine :

```yaml
outputDirectory: .contextforge/output
defaultProfile: ai-general
maxEstimatedTokens: 200000
blockSensitiveFiles: true
followSymlinks: false
maxFileSizeBytes: 1048576
```

Les paramètres projet priment sur les paramètres VS Code.

## `.contextforgeignore`

Exclusions additionnelles via patterns (syntaxe `.gitignore`) :

```
*.log
temp/
generated/
```

## CLI (alternative)

Une CLI (`contextforge`) est disponible pour une utilisation en terminal. Commandes : `generate`, `preview`, `validate`, `profiles`, `inspect`, `open-last`, `init`, `version`.

## Limitations V1

- Pas de background task dans l'UI.
- Profil `custom` nécessite une configuration valide.
- Pas de publication sur le Visual Studio Marketplace en V1.
