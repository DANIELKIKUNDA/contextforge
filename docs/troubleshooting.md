# Dépannage — ContextForge V1

## L'extension n'apparaît pas dans VS Code

**Symptôme** : `code --list-extensions` ne liste pas `contextforge.contextforge`.

**Solutions** :
1. Vérifiez que VS Code est en version >= 1.85.0 (`code --version`).
2. Réinstallez le `.vsix` : `code --install-extension contextforge-1.0.0-rc.1.vsix --force`.
3. Redémarrez VS Code.
4. Vérifiez qu'aucune autre extension n'entre en conflit (désactivez temporairement les autres).

## Les commandes ContextForge n'apparaissent pas dans la palette

**Symptôme** : `Ctrl+Shift+P` ne montre pas les commandes `ContextForge:*`.

**Solutions** :
1. Vérifiez que l'extension est activée : `Developer: Show Running Extensions`.
2. Vérifiez les erreurs dans `Help > Toggle Developer Tools > Console`.
3. Redémarrez VS Code.

## Erreur lors du packaging .vsix en local

**Symptôme** : `npx @vscode/vsce package` échoue avec `ETIMEDOUT` ou autre.

**Solutions** :
1. Vérifiez que `@vscode/vsce` est installé : `pnpm install`.
2. Vérifiez le `.vscodeignore` à la racine de `apps/vscode-extension/`.
3. Exécutez depuis un terminal dans `apps/vscode-extension/`.
4. Sur Windows avec espaces dans le chemin, utilisez le job CI `package` qui s'exécute sur Linux.

## Erreur `Extension not found` dans les tests d'intégration

**Symptôme** : `vscode.extensions.getExtension(...)` retourne `undefined`.

**Cause** : L'ID d'extension dans `package.json` (`"name"`) ne correspond pas à celui utilisé dans le test. Le nom de package doit être `contextforge` (pas `@contextforge/vscode-extension`).

**Solution** : Vérifiez que `package.json` contient `"name": "contextforge"` et que les tests utilisent l'ID `contextforge.vscode-extension` ou `contextforge.contextforge` selon le contexte d'exécution.

## Le Context Pack ne contient pas les fichiers attendus

**Solutions** :
1. Vérifiez les patterns `.gitignore` et `.contextforgeignore`.
2. Vérifiez la limite de tokens (les fichiers sont priorisés, les moins pertinents sont exclus si la limite est dépassée).
3. Vérifiez que les fichiers ne sont pas bloqués par le scanner de sécurité.
4. Lancez **ContextForge: Preview Context Pack** pour voir les décisions d'inclusion/exclusion.
5. Vérifiez `exclusions.md` dans le pack généré pour les motifs d'exclusion.

## Erreur de configuration

**Symptôme** : `ContextForge: Validate Configuration` retourne des erreurs.

**Solutions** :
1. Vérifiez le fichier `.contextforge/config.yaml` : indentation YAML correcte, clés valides.
2. Supprimez temporairement le fichier de configuration pour utiliser les valeurs par défaut.
3. Vérifiez que les paramètres VS Code (`contextForge.*`) sont valides dans `File > Preferences > Settings`.

## Performance lente sur grands projets

**Solutions** :
1. Augmentez `maxConcurrentReads` pour paralléliser la lecture (défaut: 16).
2. Réduisez la limite de tokens (`maxEstimatedTokens`) pour limiter le nombre de fichiers.
3. Ajoutez des exclusions dans `.contextforgeignore`.
4. Vérifiez que `followSymlinks` est `false`.

## L'installation échoue sur Windows

**Symptôme** : `code --install-extension` échoue avec une erreur de chemin.

**Solution** : Utilisez des guillemets autour du chemin absolu :

```powershell
code --install-extension "C:\Users\MOI\Downloads\contextforge-1.0.0-rc.1.vsix"
```

## Où trouver les logs ?

- **Extension VS Code** : `Help > Toggle Developer Tools > Console`
- **CLI** : Les erreurs sont écrites sur stderr
- **CI** : GitHub Actions > Workflow runs

## Support

Ouvrez une issue sur `https://github.com/DANIELKIKUNDA/contextforge/issues`. Incluez :
- Version de VS Code (`code --version`)
- Version de l'extension (`code --list-extensions | findstr contextforge`)
- OS et architecture
- Logs d'erreur
- Étapes pour reproduire