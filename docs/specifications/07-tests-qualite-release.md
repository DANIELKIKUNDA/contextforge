CONTEXTFORGE  
07 — Stratégie de tests, qualité, performance et critères de release de ContextForge V1  
Version 1.0 — Spécification officielle

1\. OBJET DU DOCUMENT

Ce document définit la stratégie complète de validation de ContextForge V1. Il couvre la pyramide de tests, les responsabilités par type de test, les seuils de couverture, les fixtures, les benchmarks, la compatibilité Windows/Linux/macOS, les tests de l’extension VS Code, les quality gates CI, les critères de release et les preuves exigées avant publication.

L’objectif n’est pas seulement d’obtenir des tests verts. L’objectif est de démontrer que le produit est correct, sûr, déterministe, performant, portable et publiable.

2\. PRINCIPES DE QUALITÉ

• Tester les invariants, pas seulement les lignes de code.  
• Préférer des tests déterministes et reproductibles.  
• Séparer les tests rapides des tests lourds.  
• Refuser les mocks excessifs pour les flux critiques.  
• Tester les erreurs aussi sérieusement que les succès.  
• Rendre les tests de sécurité bloquants.  
• Mesurer la performance avant d’optimiser.  
• Exécuter les tests sur plusieurs systèmes.  
• Conserver des fixtures stables et documentées.  
• Ne jamais réduire la qualité pour accélérer une release.

3\. PYRAMIDE DE TESTS

Niveau 1 — Tests unitaires  
Couvrent les value objects, règles, services purs, stratégies et erreurs.

Niveau 2 — Tests d’intégration  
Couvrent les interactions entre scanner, sécurité, sizing, packing et generators.

Niveau 3 — Tests de contrat  
Valident les ports, schémas Zod, manifestes et compatibilité entre packages.

Niveau 4 — Tests système  
Exécutent un flux complet sur une fixture réelle.

Niveau 5 — Tests extension VS Code  
Exécutent les commandes dans une instance de test VS Code.

Niveau 6 — Tests de sécurité et offensifs  
Couvrent traversal, symlinks, secrets, masquage, limites et supply chain.

Niveau 7 — Benchmarks et tests de charge  
Mesurent temps, mémoire et stabilité sur grands projets simulés.

4\. OUTILS DE TEST

• Vitest : tests unitaires et d’intégration.  
• fast-check : tests property-based.  
• memfs : système de fichiers simulé.  
• @vscode/test-electron : tests de l’extension.  
• Node test fixtures : scénarios disque réels.  
• GitHub Actions : orchestration multi-plateformes.  
• Semgrep : règles statiques.  
• Gitleaks : détection de secrets.  
• Trivy : dépendances et artefacts.

5\. CONVENTIONS DE NOMMAGE

Tests unitaires : \*.spec.ts  
Tests d’intégration : \*.integration.spec.ts  
Tests système : \*.system.spec.ts  
Tests property-based : \*.property.spec.ts  
Tests performance : \*.benchmark.spec.ts  
Tests VS Code : \*.vscode.spec.ts

Chaque test doit exprimer :  
• contexte ;  
• action ;  
• résultat attendu.

6\. TESTS DU PACKAGE CONTRACTS

Cibles :  
• ContextPackId ;  
• Objective ;  
• RelativePath ;  
• TokenLimit ;  
• ProfileId ;  
• SecurityFinding ;  
• FileDecision ;  
• ContextPackManifest ;  
• schémas Zod.

Cas obligatoires :  
• valeur valide ;  
• valeur vide ;  
• frontière minimale ;  
• frontière maximale ;  
• type invalide ;  
• propriété inconnue si mode strict ;  
• sérialisation ;  
• désérialisation ;  
• compatibilité de schéma.

Objectif de couverture : 90 % minimum.

7\. TESTS DU SCANNER

Tests unitaires :  
• normalisation de chemins ;  
• extensions ;  
• exclusions par défaut ;  
• parsing .gitignore ;  
• parsing .contextforgeignore ;  
• détection binaire ;  
• encodage.

Tests d’intégration disque :  
• scan récursif ;  
• node\_modules ignoré ;  
• .git ignoré ;  
• .contextforge ignoré ;  
• fichier inaccessible ;  
• symlink ;  
• junction Windows ;  
• multi-root ;  
• chemin Unicode ;  
• traversal refusé.

Critère bloquant : aucun fichier hors workspace ne peut être retourné.

8\. TESTS DU PACKAGE SECURITY

Tests unitaires :  
• noms sensibles ;  
• extensions sensibles ;  
• motifs de private key ;  
• API keys factices ;  
• tokens ;  
• mots de passe ;  
• connection strings ;  
• severity policy ;  
• evidence masking.

Tests négatifs :  
• exemples de documentation ;  
• placeholders ;  
• chaînes ressemblantes mais non secrètes ;  
• fichiers de tests autorisés.

Tests property-based :  
• critical ne devient jamais included ;  
• la valeur originale n’est jamais retrouvable après masquage ;  
• .env reste bloqué ;  
• aucun finding ne contient la preuve brute.

Objectif de couverture : 95 % minimum.

9\. TESTS DU PACKAGE SIZING

Cas :  
• fichier vide ;  
• ASCII ;  
• Unicode ;  
• très long contenu ;  
• agrégation ;  
• stratégie injectable ;  
• valeur stable ;  
• absence de dépassement numérique.

La formule V1 doit être explicitement testée et documentée comme approximation.

10\. TESTS DU PACKAGE PACKER

Invariants :  
• aucune limite dépassée ;  
• ordre stable ;  
• aucun fichier perdu ;  
• aucun doublon ;  
• aucun blocked inclus ;  
• oversized classé ;  
• même entrée, même résultat.

Tests property-based :  
• listes aléatoires de tailles ;  
• limites diverses ;  
• profils différents ;  
• tri stable ;  
• conservation de cardinalité.

Objectif de couverture : 95 % minimum.

11\. TESTS DES GENERATORS

Cibles :  
• README ;  
• volumes Markdown ;  
• manifest.json ;  
• included-files.md ;  
• exclusions.md ;  
• warnings.md.

Contrôles :  
• syntaxe valide ;  
• ordre déterministe ;  
• chemins relatifs ;  
• blocs de code fermés ;  
• aucun secret ;  
• aucun fichier blocked ;  
• manifeste validé par Zod ;  
• cohérence entre fichiers générés et manifeste.

Les snapshots sont autorisés uniquement s’ils restent lisibles et révisables.

12\. TESTS DU CORE

Use cases à couvrir :  
• PrepareContextPackPreview ;  
• GenerateContextPack ;  
• InspectProjectSources ;  
• ValidateContextForgeConfiguration ;  
• ListAvailableProfiles ;  
• OpenLastContextPack ;  
• CancelContextPackGeneration.

Ports : utiliser fakes explicites.

Cas critiques :  
• preview sans écriture ;  
• fingerprint mismatch ;  
• annulation ;  
• rollback ;  
• progression ;  
• erreur récupérable ;  
• erreur non récupérable ;  
• dernier pack obsolète.

Objectif de couverture : 90 % minimum.

13\. TESTS DE LA CLI

Commandes : init, inspect, preview, generate, validate.

Scénarios :  
• aide ;  
• version ;  
• option inconnue ;  
• argument manquant ;  
• succès ;  
• erreur ;  
• Ctrl+C ;  
• code de sortie ;  
• sortie lisible ;  
• aucune fuite de secret dans stdout/stderr.

Codes de sortie recommandés :  
0 succès  
1 erreur générale  
2 validation  
3 configuration  
4 sécurité  
5 génération  
130 interruption utilisateur

14\. TESTS DE L’EXTENSION VS CODE

Scénarios :  
• activation ;  
• aucun workspace ;  
• workspace simple ;  
• multi-root ;  
• objectif invalide ;  
• sélection vide ;  
• profil UI/UX ;  
• preview ;  
• confirmation ;  
• annulation ;  
• génération ;  
• ouverture README ;  
• ouverture manifeste ;  
• erreur disque ;  
• configuration invalide.

Les tests doivent vérifier que l’extension délègue au core et ne réimplémente pas la logique métier.

15\. TESTS D’ACCESSIBILITÉ

• navigation clavier complète ;  
• focus visible ;  
• labels annoncés ;  
• ordre logique ;  
• messages d’erreur accessibles ;  
• aucun sens uniquement par couleur ;  
• thème clair ;  
• thème sombre ;  
• contraste selon composants natifs.

16\. FIXTURES OFFICIELLES

safe-project : projet sain.  
project-with-secrets : secrets factices.  
oversized-project : gros fichiers.  
multi-language-project : plusieurs langages.  
broken-encoding-project : encodages invalides.  
symlink-project : liens symboliques.  
multi-root-workspace : plusieurs racines.  
ui-ux-project : rôles, permissions, formulaires, routes et composants.

Chaque fixture contient :  
• README ;  
• comportement attendu ;  
• fichiers inclus attendus ;  
• fichiers bloqués attendus ;  
• taille approximative ;  
• règles déclenchées.

17\. TESTS SYSTÈME DE BOUT EN BOUT

Flux minimal :  
1\. charger une fixture ;  
2\. préparer un preview ;  
3\. vérifier les décisions ;  
4\. confirmer ;  
5\. générer ;  
6\. relire les sorties ;  
7\. valider le manifeste ;  
8\. vérifier l’absence de secret ;  
9\. vérifier l’ordre ;  
10\. supprimer le résultat de test.

18\. TESTS DE RÉGRESSION

Toute correction de bug doit ajouter :  
• un test reproduisant le bug ;  
• le correctif ;  
• un test de non-régression ;  
• une note de changelog si l’utilisateur est affecté.

Aucun bug de sécurité ne peut être fermé sans test dédié.

19\. TESTS DE PERFORMANCE

Mesures :  
• temps total ;  
• temps par phase ;  
• mémoire maximale ;  
• fichiers par seconde ;  
• octets lus ;  
• durée d’annulation ;  
• durée de commit.

Scénarios :  
• 100 fichiers ;  
• 1 000 fichiers ;  
• 10 000 fichiers ;  
• 1 fichier géant ;  
• nombreux petits fichiers ;  
• beaucoup d’exclusions ;  
• nombreux findings de sécurité.

20\. OBJECTIFS DE PERFORMANCE

Machine de référence à documenter.

Objectifs indicatifs :  
• 100 fichiers : preview \< 2 s ;  
• 1 000 fichiers : preview \< 10 s ;  
• 10 000 fichiers : pas de blocage durable, progression visible ;  
• annulation : prise en compte \< 1 s lorsque possible ;  
• mémoire : croissance bornée et sans fuite après plusieurs exécutions.

Ces seuils doivent être ajustés après mesure réelle, sans être abaissés arbitrairement.

21\. TESTS DE MÉMOIRE

• exécutions répétées ;  
• grands fichiers ;  
• annulation ;  
• erreur pendant génération ;  
• fermeture de webview ;  
• réactivation extension ;  
• absence de listeners non libérés.

22\. MATRICE DE COMPATIBILITÉ

Windows 11 : obligatoire.  
Linux Ubuntu LTS : obligatoire.  
macOS récent : obligatoire avant publication Marketplace.

Node.js : version LTS supportée par le projet.  
VS Code : version minimale définie dans engines.vscode et dernière stable.

Les comportements de chemins doivent être testés séparément sur Windows et POSIX.

23\. QUALITÉ STATIQUE

Contrôles :  
• TypeScript strict ;  
• Biome ;  
• imports ordonnés ;  
• aucune dépendance circulaire ;  
• règles d’architecture ;  
• aucun any injustifié ;  
• aucun ts-ignore sans justification ;  
• aucun TODO critique avant release ;  
• aucun code mort.

24\. TESTS D’ARCHITECTURE

Doivent échouer si :  
• core importe vscode ;  
• contracts importe fs ;  
• security dépend de l’extension ;  
• generators dépend de la CLI ;  
• scanner dépend de l’UI ;  
• cycle entre packages ;  
• logique métier dans apps.

25\. QUALITY GATES CI

Pull Request obligatoire :  
• pnpm install \--frozen-lockfile ;  
• typecheck ;  
• lint ;  
• tests unitaires ;  
• tests d’intégration ;  
• tests sécurité ;  
• tests architecture ;  
• build ;  
• package .vsix ;  
• Semgrep ;  
• Gitleaks ;  
• Trivy.

Aucun merge si un gate obligatoire échoue.

26\. STRATÉGIE DE BRANCHES

Recommandation : trunk-based légère.

• main protégée ;  
• branches courtes feature/\* ;  
• pull request obligatoire ;  
• review obligatoire ;  
• squash merge recommandé ;  
• tags pour releases.

27\. VERSIONING

Semantic Versioning : MAJOR.MINOR.PATCH.

PATCH : correction compatible.  
MINOR : nouvelle fonctionnalité compatible.  
MAJOR : rupture de contrats ou comportement.

Avant 1.0.0, les ruptures doivent être clairement documentées.

28\. PROCESSUS DE RELEASE

1\. geler le périmètre ;  
2\. vérifier le changelog ;  
3\. exécuter la CI complète ;  
4\. exécuter matrice multi-OS ;  
5\. générer .vsix ;  
6\. calculer SHA-256 ;  
7\. tester l’installation sur VS Code propre ;  
8\. effectuer smoke test ;  
9\. valider sécurité ;  
10\. publier artefact ;  
11\. publication Marketplace après validation manuelle.

29\. SMOKE TEST DE RELEASE

• installation .vsix ;  
• activation ;  
• commande visible ;  
• preview fixture saine ;  
• blocage .env ;  
• génération ;  
• ouverture README ;  
• manifeste valide ;  
• désinstallation propre.

30\. CRITÈRES NO-GO

Release interdite si :  
• test critique échoue ;  
• faille high/critical ouverte ;  
• .env exportable ;  
• chemin hors workspace lisible ;  
• manifest invalide ;  
• rollback non fiable ;  
• fuite mémoire majeure ;  
• package .vsix non installable ;  
• checksum absent ;  
• build non reproductible.

31\. CRITÈRES GO

Release autorisée si :  
• tous les gates obligatoires passent ;  
• couverture minimale atteinte ;  
• benchmarks acceptables ;  
• tests multi-OS verts ;  
• smoke test réussi ;  
• documentation à jour ;  
• changelog validé ;  
• sécurité validée ;  
• artefact signé ou checksum publié.

32\. RAPPORT DE QUALITÉ DE RELEASE

Chaque release doit produire :  
• version ;  
• commit ;  
• date ;  
• résultats CI ;  
• couverture ;  
• benchmarks ;  
• dépendances vulnérables ;  
• checksum ;  
• plateformes testées ;  
• limitations connues ;  
• décision GO/NO-GO.

33\. FICHIERS À CRÉER

tests/  
• architecture/  
• integration/  
• system/  
• performance/  
• vscode/  
• security/

scripts/  
• benchmark.ts  
• verify-manifest.ts  
• verify-no-absolute-paths.ts  
• verify-vsix.ts  
• generate-checksum.ts  
• release-smoke-test.ts

.github/workflows/  
• ci.yml  
• security.yml  
• cross-platform.yml  
• performance.yml  
• package-extension.yml  
• release.yml

34\. DÉCISIONS VERROUILLÉES

• Vitest comme framework principal.  
• fast-check pour les invariants génératifs.  
• tests sécurité bloquants.  
• matrice Windows/Linux/macOS.  
• couverture minimale par package critique.  
• smoke test obligatoire.  
• .vsix vérifié avant publication.  
• release manuelle après CI complète.  
• aucune baisse de qualité sans ADR.

35\. PROCHAINE ÉTAPE

Le prochain document officiel sera :

08 — Spécification de la CLI, commandes, configuration et expérience développeur de ContextForge V1

Il détaillera toutes les commandes, options, codes de sortie, configuration JSON/YAML, exemples d’utilisation, messages, compatibilité CI et règles d’intégration dans les workflows de développement.

FIN DE LA STRATÉGIE DE TESTS ET RELEASE  
