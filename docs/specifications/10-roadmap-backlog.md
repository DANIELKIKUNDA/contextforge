CONTEXTFORGE  
10 — Roadmap produit, jalons, backlog et critères de livraison de ContextForge V1  
Version 1.0 — Spécification officielle

1\. OBJET DU DOCUMENT

Ce document définit la roadmap officielle de ContextForge V1. Il organise le travail en epics, jalons, user stories, priorités, dépendances, lots de livraison, risques et critères d’acceptation. Il sert de plan directeur pour conduire le projet depuis l’initialisation du monorepo jusqu’à la première extension VS Code installable au format .vsix.

2\. PRINCIPES DE PLANIFICATION

• livrer par vertical slices ;  
• stabiliser le Core avant l’interface ;  
• faire passer la sécurité avant les fonctionnalités secondaires ;  
• garder les phases petites et validables ;  
• ne pas démarrer plusieurs fondations en parallèle ;  
• produire une preuve exécutable à chaque jalon ;  
• refuser les ajouts hors périmètre V1 ;  
• documenter tout changement d’architecture par ADR.

3\. PRIORITÉS

P0 — Bloquant pour la V1  
P1 — Important pour une V1 premium  
P2 — Utile mais reportable  
P3 — Hors périmètre V1

4\. EPICS OFFICIELS

E1 — Fondation monorepo  
E2 — Contracts et domaine  
E3 — Scanner local sécurisé  
E4 — Détection de secrets  
E5 — Estimation et packing  
E6 — Preview et orchestration Core  
E7 — Génération Markdown/JSON  
E8 — CLI  
E9 — Extension VS Code  
E10 — Profils, dont UI/UX  
E11 — Tests, qualité et sécurité  
E12 — Packaging et release

5\. JALON M0 — FONDATION DU PROJET

Objectif : disposer d’un monorepo propre, compilable et testable.

Livrables :  
• structure apps/packages ;  
• pnpm workspaces ;  
• Turborepo ;  
• TypeScript strict ;  
• Biome ;  
• Vitest ;  
• premiers workflows CI.

Critères de sortie :  
• pnpm install fonctionne ;  
• build, lint, typecheck et test existent ;  
• aucun cycle entre packages ;  
• main protégée ;  
• conventions documentées.

6\. JALON M1 — CONTRACTS ET DOMAINE

Objectif : verrouiller le langage métier et les contrats.

User stories :  
US-001 — Créer un ContextPackRequest valide.  
US-002 — Représenter chaque fichier par une FileDecision unique.  
US-003 — Valider les chemins relatifs.  
US-004 — Gérer les états du Context Pack.  
US-005 — Produire des erreurs structurées.

Critères de sortie :  
• value objects testés ;  
• schémas Zod disponibles ;  
• ports définis ;  
• aucune dépendance technique dans contracts ;  
• invariants du domaine couverts.

7\. JALON M2 — SCANNER LOCAL

Objectif : découvrir les fichiers sans sortir du workspace.

User stories :  
US-010 — Scanner un dossier sélectionné.  
US-011 — Respecter .gitignore.  
US-012 — Respecter .contextforgeignore.  
US-013 — Ignorer node\_modules, .git et .contextforge.  
US-014 — Refuser traversal et liens symboliques externes.  
US-015 — Classer les fichiers binaires et illisibles.

Critères de sortie :  
• chemins relatifs uniquement ;  
• aucun fichier hors workspace ;  
• scan déterministe ;  
• tests Windows et POSIX ;  
• progression et annulation supportées.

8\. JALON M3 — SÉCURITÉ

Objectif : empêcher l’export des secrets critiques.

User stories :  
US-020 — Bloquer .env et variantes.  
US-021 — Bloquer les clés privées.  
US-022 — Détecter tokens, mots de passe et chaînes de connexion.  
US-023 — Masquer toute preuve sensible.  
US-024 — Produire un SecurityFinding explicable.  
US-025 — Garantir qu’un critical ne devient jamais included.

Critères de sortie :  
• tests offensifs minimaux ;  
• faux positifs documentés ;  
• aucun secret brut dans logs ou rapports ;  
• Gitleaks et Semgrep intégrés ;  
• sécurité bloquante en CI.

9\. JALON M4 — SIZING ET PACKING

Objectif : mesurer, classer et découper le contexte.

User stories :  
US-030 — Estimer les tokens d’un fichier.  
US-031 — Estimer un ensemble.  
US-032 — Classer un fichier oversized.  
US-033 — Répartir les fichiers en volumes.  
US-034 — Respecter un ordre stable.

Critères de sortie :  
• aucune limite dépassée ;  
• aucun fichier perdu ou dupliqué ;  
• même entrée, même découpage ;  
• tests property-based passants.

10\. JALON M5 — PREVIEW CORE

Objectif : produire une prévisualisation complète sans écrire de paquet final.

User stories :  
US-040 — Demander un objectif.  
US-041 — Résoudre un profil.  
US-042 — Scanner et décider chaque fichier.  
US-043 — Afficher inclus, exclus, bloqués et oversized.  
US-044 — Produire un fingerprint.  
US-045 — Annuler proprement.

Critères de sortie :  
• tous les candidats ont une décision ;  
• aucun fichier final créé ;  
• preview sérialisable ;  
• fingerprint stable ;  
• erreurs actionnables.

11\. JALON M6 — GÉNÉRATION ATOMIQUE

Objectif : produire un Context Pack complet et validé.

User stories :  
US-050 — Générer README.md.  
US-051 — Générer context-XX.md.  
US-052 — Générer manifest.json.  
US-053 — Générer les rapports d’inclusion, exclusion et warning.  
US-054 — Valider les sorties.  
US-055 — Commit atomique et rollback.

Critères de sortie :  
• manifeste valide ;  
• aucun chemin absolu ;  
• aucun blocked inclus ;  
• dossier temporaire nettoyé ;  
• paquet final cohérent.

12\. JALON M7 — PREMIER VERTICAL SLICE CLI

Objectif : disposer d’un produit utilisable sans VS Code.

Flux :  
1\. inspect ;  
2\. preview ;  
3\. generate ;  
4\. validate ;  
5\. open-last.

Critères de sortie :  
• commandes fonctionnelles ;  
• mode interactif ;  
• mode non interactif ;  
• codes de sortie stables ;  
• JSON machine propre ;  
• Ctrl+C sécurisé.

13\. JALON M8 — PROFILS PREMIUM

Objectif : livrer les profils officiels.

User stories :  
US-060 — Profil ai-general.  
US-061 — Profil code-review.  
US-062 — Profil documentation.  
US-063 — Profil onboarding.  
US-064 — Profil ui-ux.  
US-065 — Profil custom.

Critères de sortie :  
• chaque profil documenté ;  
• ordre et priorités testés ;  
• profil UI/UX produit sa structure dédiée ;  
• règles de sécurité globales inchangées.

14\. JALON M9 — EXTENSION VS CODE

Objectif : livrer l’interface principale.

User stories :  
US-070 — Lancer Generate Context Pack.  
US-071 — Saisir l’objectif.  
US-072 — Choisir un profil.  
US-073 — Sélectionner les sources.  
US-074 — Choisir la limite.  
US-075 — Voir le preview.  
US-076 — Confirmer et générer.  
US-077 — Ouvrir le résultat.

Critères de sortie :  
• aucune logique métier dupliquée ;  
• composants natifs VS Code ;  
• annulation ;  
• accessibilité clavier ;  
• thèmes clair et sombre ;  
• tests @vscode/test-electron.

15\. JALON M10 — HARDENING

Objectif : transformer la version fonctionnelle en version publiable.

Travaux :  
• performance ;  
• mémoire ;  
• tests multi-OS ;  
• tests offensifs ;  
• revue architecture ;  
• revue dépendances ;  
• revue UX ;  
• documentation ;  
• corrections de régression.

Critères de sortie :  
• quality gates verts ;  
• couverture minimale atteinte ;  
• aucun incident high/critical ouvert ;  
• benchmarks acceptables ;  
• aucun TODO bloquant.

16\. JALON M11 — RELEASE CANDIDATE

Objectif : produire un .vsix candidat.

Livrables :  
• contextforge-x.y.z.vsix ;  
• checksum SHA-256 ;  
• changelog ;  
• rapport qualité ;  
• guide installation ;  
• guide utilisateur ;  
• guide développeur.

Critères de sortie :  
• installation sur VS Code propre ;  
• smoke test réussi ;  
• désinstallation propre ;  
• manifeste extension valide ;  
• publication manuelle autorisable.

17\. BACKLOG P0

• monorepo ;  
• contracts ;  
• scanner ;  
• sécurité critical ;  
• preview ;  
• sizing ;  
• packing ;  
• génération atomique ;  
• manifest.json ;  
• CLI ;  
• extension VS Code ;  
• tests sécurité ;  
• packaging .vsix.

18\. BACKLOG P1

• profil UI/UX complet ;  
• reporting avancé ;  
• provenance configuration ;  
• benchmarks ;  
• accessibilité ;  
• multi-root robuste ;  
• documentation premium ;  
• workflow release.

19\. BACKLOG P2

• règles personnalisées avancées ;  
• export de preview ;  
• statistiques enrichies ;  
• UX webview plus avancée ;  
• historique local de plusieurs packs ;  
• support de davantage d’encodages.

20\. BACKLOG P3 — HORS V1

• intégration Figma directe ;  
• Notion ;  
• Google Drive ;  
• GitHub distant ;  
• IA embarquée ;  
• comptes ;  
• paiement ;  
• cloud ;  
• collaboration ;  
• synchronisation ;  
• télémétrie distante.

21\. DÉPENDANCES ENTRE EPICS

E2 dépend de E1.  
E3 dépend de E2.  
E4 dépend de E2 et E3.  
E5 dépend de E2.  
E6 dépend de E3, E4 et E5.  
E7 dépend de E6.  
E8 dépend de E7.  
E9 dépend de E6 et E7.  
E10 dépend de E2, E5 et E7.  
E11 traverse tous les epics.  
E12 dépend de tous les P0.

22\. ESTIMATION RELATIVE

Échelle : XS, S, M, L, XL.

XS : changement local simple.  
S : petit module ou règle.  
M : cas d’usage ou adaptateur complet.  
L : package ou flux complet.  
XL : epic nécessitant découpage obligatoire.

Aucune user story XL ne doit être donnée telle quelle à un agent de code.

23\. DEFINITION OF READY

Une story est prête si :  
• objectif clair ;  
• fichiers autorisés connus ;  
• dépendances connues ;  
• critères d’acceptation écrits ;  
• tests attendus définis ;  
• risques identifiés ;  
• aucune décision architecturale ouverte.

24\. DEFINITION OF DONE

Une story est terminée si :  
• code compilé ;  
• tests écrits et passants ;  
• lint et typecheck verts ;  
• aucune violation architecture ;  
• documentation mise à jour ;  
• aucune fuite de secret ;  
• critères d’acceptation démontrés ;  
• revue réalisée.

25\. STRATÉGIE DE LIVRAISON

Livraison 0 — squelette compilable.  
Livraison 1 — scanner \+ sécurité minimale.  
Livraison 2 — preview Core.  
Livraison 3 — génération CLI.  
Livraison 4 — profils premium.  
Livraison 5 — extension VS Code.  
Livraison 6 — release candidate .vsix.

Chaque livraison doit être utilisable et démontrable.

26\. RISQUES MAJEURS

R1 — Faux sentiment de sécurité.  
Réponse : avertissement explicite, tests et modèle de menaces.

R2 — Scope creep.  
Réponse : P3 verrouillé hors V1.

R3 — Logique dupliquée dans l’extension.  
Réponse : architecture tests.

R4 — Performance sur gros dépôts.  
Réponse : exclusions précoces, limites et benchmarks.

R5 — Trop de faux positifs.  
Réponse : corpus négatif et policy de sévérité.

R6 — Instabilité multi-OS.  
Réponse : matrice CI.

R7 — Dépendances compromises.  
Réponse : lockfile, audits, Semgrep, Gitleaks, Trivy.

27\. GESTION DU CHANGEMENT

Tout changement majeur doit :  
• être décrit ;  
• indiquer le document impacté ;  
• préciser la compatibilité ;  
• ajouter ou modifier un ADR ;  
• mettre à jour backlog et critères ;  
• être validé avant implémentation.

28\. CADENCE DE TRAVAIL

Recommandation :  
• une phase active à la fois ;  
• petites pull requests ;  
• démonstration à chaque jalon ;  
• revue technique avant phase suivante ;  
• aucun travail caché hors backlog.

29\. PLAN D’UTILISATION AVEC CODEX

Pour chaque story, fournir :  
• identifiant ;  
• objectif ;  
• contexte ;  
• fichiers autorisés ;  
• fichiers interdits ;  
• signatures ;  
• dépendances ;  
• tests ;  
• critères de sortie ;  
• commande de validation.

Codex ne doit pas recevoir un epic complet en un seul prompt.

30\. PREMIÈRE SÉQUENCE D’IMPLÉMENTATION

Ordre officiel :  
1\. créer le monorepo ;  
2\. configurer TypeScript, pnpm, Turbo, Biome et Vitest ;  
3\. créer contracts ;  
4\. créer ports du Core ;  
5\. créer scanner minimal ;  
6\. bloquer .env ;  
7\. créer sizing ;  
8\. créer preview ;  
9\. générer README, context-01 et manifest ;  
10\. exposer le flux dans la CLI.

31\. CRITÈRES DE LIVRAISON V1

La V1 est livrable si :  
• le produit fonctionne offline ;  
• la CLI fonctionne ;  
• l’extension .vsix est installable ;  
• le preview est obligatoire ;  
• les secrets critiques sont bloqués ;  
• la génération est atomique ;  
• les sorties Markdown et JSON sont valides ;  
• les profils officiels existent ;  
• UI/UX est exploitable comme contexte ;  
• les tests multi-OS passent ;  
• la documentation est complète ;  
• aucun connecteur cloud n’est requis.

32\. CRITÈRES NO-GO

• .env exportable ;  
• lecture hors workspace ;  
• manifeste invalide ;  
• rollback incomplet ;  
• extension non installable ;  
• test sécurité bloquant rouge ;  
• faille high/critical ouverte ;  
• build non reproductible ;  
• documentation utilisateur absente.

33\. LIVRABLES OFFICIELS

• dépôt monorepo ;  
• code source ;  
• tests ;  
• fixtures ;  
• documentation ;  
• changelog ;  
• rapports sécurité ;  
• rapport qualité ;  
• benchmarks ;  
• .vsix ;  
• checksum ;  
• guides installation et utilisation.

34\. DÉCISIONS VERROUILLÉES

• développement par vertical slices ;  
• Core avant extension ;  
• CLI avant finition VS Code ;  
• sécurité P0 ;  
• UI/UX P1 ;  
• aucun connecteur externe en V1 ;  
• .vsix comme premier artefact publiable ;  
• release conditionnée par quality gates ;  
• backlog P3 strictement hors V1.

35\. PROCHAINE ÉTAPE

Le prochain document officiel sera :

11 — Pack de démarrage Codex : prompts d’implémentation phase par phase pour ContextForge V1

Il transformera la roadmap en instructions prêtes à copier dans Codex, avec un prompt par phase, les fichiers autorisés, les tests obligatoires et les commandes de validation.

FIN DE LA ROADMAP PRODUIT  
