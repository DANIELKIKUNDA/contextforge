# Sécurité — ContextForge V1

## Principes

- **Offline-first** : Aucun accès réseau. Aucune télémétrie. Aucun service cloud.
- **Read-only** : Aucun fichier source du projet analysé n'est modifié.
- **Local uniquement** : Toute l'exécution se fait sur la machine locale.
- **Pas d'IA intégrée** : Aucun LLM, aucun appel API externe.

## Détection et masquage des secrets

ContextForge scanne chaque fichier texte avant inclusion dans le Context Pack :

- **Patterns de secrets** : clés API (AWS, GitHub, GitLab, Slack, Stripe, etc.), tokens JWT, clés privées SSH/PGP, chaînes de connexion, mots de passe en clair.
- **Noms de fichiers sensibles** : `.env`, `.env.*`, `credentials.*`, `secrets.*`, `*.pem`, `*.key`, `*.pfx`, `id_rsa*`.
- **Extensions sensibles** : `.pem`, `.key`, `.pfx`, `.p12`, `.jks`, `.keystore`.

Les fichiers identifiés comme sensibles sont **bloqués** (non inclus). Les secrets détectés dans des fichiers non bloqués sont **masqués** (`[REDACTED]`).

## Surface d'attaque

| Vecteur | Mitigation |
|---|---|
| Exécution de code malveillant | L'extension exécute uniquement du code compilé TypeScript ; pas d'eval dynamique |
| Fuite de secrets dans le pack | Détection + blocage + masquage |
| Accès réseau non autorisé | Aucune dépendance réseau dans le Core |
| Injection via nom de fichier | Normalisation des chemins, refus des paths hors workspace |
| Symlinks malveillants | `followSymlinks: false` par défaut |
| Fichiers volumineux | Taille max 1 Mo par défaut |
| Fichiers binaires | Détection du type MIME, exclusion automatique |

## Bonnes pratiques utilisateur

- Ne pas versionner les Context Packs générés (`.contextforge/output/` est dans `.gitignore` par défaut).
- Vérifier le SHA-256 du `.vsix` avant installation.
- Utiliser `blockSensitiveFiles: true` dans la configuration.
- Ne pas désactiver le preview avant génération en environnement sensible.

## Configuration de sécurité

```yaml
# .contextforge/config.yaml
blockSensitiveFiles: true    # Bloque les fichiers sensibles (défaut: true)
followSymlinks: false         # Ne suit pas les liens symboliques (défaut: false)
maxFileSizeBytes: 1048576    # Taille maximale par fichier (1 Mo)
```

## Signalement de vulnérabilités

Les vulnérabilités doivent être signalées via GitHub Issues sur le dépôt `DANIELKIKUNDA/contextforge`. Ne pas inclure de secrets réels dans le rapport.