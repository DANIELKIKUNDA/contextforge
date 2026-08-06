# Processus de release — ContextForge V1

## Versionnement

ContextForge suit le versionnement sémantique (SemVer) : `MAJOR.MINOR.PATCH`.

| Version | Statut |
|---|---|
| `1.0.0-rc.1` | Release candidate V1 |
| `1.0.0` | Première release stable (future) |

## Artefacts de release

Chaque release candidate produit :

| Artefact | Description |
|---|---|
| `contextforge-1.0.0-rc.1.vsix` | Extension VS Code empaquetée |
| `contextforge-1.0.0-rc.1.vsix.sha256` | Empreinte SHA-256 du .vsix |

## Pipeline CI

Le workflow `.github/workflows/ci.yml` définit le pipeline de release :

### Job `quality` (ubuntu-latest)

1. Checkout du dépôt
2. `corepack enable` + `pnpm install --frozen-lockfile`
3. `pnpm build` — Compilation TypeScript
4. `pnpm typecheck` — Vérification des types
5. `pnpm lint` — Linting Biome
6. `pnpm test` — Tests unitaires Vitest (503 tests)
7. `xvfb-run -a pnpm test:integration` — Tests d'intégration VS Code

### Job `package` (ubuntu-latest, needs: quality)

1. `pnpm build` dans `apps/vscode-extension`
2. `npx @vscode/vsce package` — Packaging .vsix
3. `sha256sum` — Calcul du SHA-256
4. `npx @vscode/vsce ls` — Liste du contenu
5. Upload de l'artefact (`actions/upload-artifact@v4`, rétention 90 jours)

## Créer une release candidate

1. Créer une branche `feat/phase-XX-release` depuis `main`
2. Mettre à jour `version` dans `apps/vscode-extension/package.json`
3. Mettre à jour le nom du fichier `.vsix` dans :
   - `apps/vscode-extension/package.json` (script `package`)
   - `.github/workflows/ci.yml` (job `package`)
4. Mettre à jour `CHANGELOG.md`
5. Vérifier qualité locale : `pnpm typecheck && pnpm lint && pnpm test`
6. Committer, pousser, créer une PR vers `main`
7. Attendre que la CI soit verte (jobs quality + package)
8. Télécharger l'artefact `.vsix` depuis l'onglet Artifacts du run
9. Vérifier l'intégrité : `sha256sum -c contextforge-1.0.0-rc.1.vsix.sha256`
10. Tester l'installation : `code --install-extension contextforge-1.0.0-rc.1.vsix`
11. Exécuter le smoke test (commandes visibles, génération de pack)
12. Désinstaller : `code --uninstall-extension contextforge.contextforge`
13. **Ne pas fusionner la PR** tant que tous les tests ne sont pas validés
14. **Ne pas publier sur le Visual Studio Marketplace** en V1
15. Une fois validé, fusionner la PR dans `main`

## Checklist de release

- [ ] `pnpm typecheck` OK
- [ ] `pnpm lint` OK
- [ ] `pnpm test` OK (503 tests)
- [ ] CI quality vert
- [ ] CI package vert
- [ ] Artefact `.vsix` produit
- [ ] SHA-256 vérifié
- [ ] Contenu du `.vsix` inspecté (`vsce ls`)
- [ ] Installation VS Code OK
- [ ] Commandes visibles dans la palette
- [ ] Génération de Context Pack OK
- [ ] Fichiers générés corrects (README, manifest, etc.)
- [ ] Exclusions respectées
- [ ] Aucun fichier source modifié
- [ ] Désinstallation propre
- [ ] Documentation à jour
- [ ] CHANGELOG à jour
- [ ] PR créée, CI verte, non fusionnée

## Notes

- Le packaging local sur Windows peut échouer à cause des espaces dans les chemins. Utiliser le job CI `package` (Linux).
- Aucun tag Git, Release GitHub, ou publication Marketplace n'est créé en V1.
- La branche `feat/phase-11-release` contient la release candidate 1.0.0-rc.1.