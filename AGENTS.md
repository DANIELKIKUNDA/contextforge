# ContextForge — Règles permanentes

ContextForge V1 est un outil local et offline-first permettant de générer
des Context Packs structurés, sécurisés et traçables depuis un projet logiciel.

## Contraintes absolues

- Aucun accès réseau.
- Aucun service cloud.
- Aucune base de données.
- Aucune IA intégrée en V1.
- Aucun fichier source du projet analysé ne doit être modifié.
- Aucun secret réel dans le dépôt ou les fixtures.
- TypeScript strict.
- Aucun `any` injustifié.
- La logique métier reste dans le Core.
- La CLI et l’extension VS Code sont uniquement des adaptateurs.
- Aucun test ne doit être supprimé pour faire passer la CI.
- Aucun changement d’architecture sans ADR.
- Une seule phase d’implémentation à la fois.

## Documentation officielle

Les spécifications se trouvent dans :

`docs/specifications/`

Codex doit lire uniquement les documents indiqués dans le prompt de la phase.

## Compte rendu obligatoire

Après chaque intervention, fournir :

1. état initial ;
2. fichiers créés ;
3. fichiers modifiés ;
4. tests ajoutés ;
5. commandes exécutées ;
6. résultats ;
7. éléments incomplets ;
8. risques ;
9. recommandation pour la suite.