CONTEXTFORGE  
Définition produit premium — Version 1.0

1\. VISION DU PRODUIT

ContextForge est un outil local destiné aux développeurs qui travaillent avec des projets complexes, des documentations dispersées et plusieurs agents d’intelligence artificielle.

Sa mission est de transformer un projet logiciel en un paquet de contexte propre, ciblé, sécurisé et immédiatement exploitable par un humain ou un agent IA.

ContextForge ne remplace ni VS Code, ni GitHub, ni Notion, ni Codex, ni ChatGPT, ni Claude, ni DeepSeek. Il agit comme une couche intermédiaire entre le projet réel et les outils qui doivent le comprendre.

Le produit répond à un problème croissant : les développeurs possèdent de nombreuses informations utiles, mais celles-ci sont dispersées, mal sélectionnées, parfois obsolètes, parfois sensibles et rarement prêtes à être transmises efficacement à une IA.

2\. PROBLÈME PRINCIPAL

2.1. Le contexte est dispersé

Les informations importantes peuvent se trouver dans README.md, les dossiers docs, les fichiers TypeScript, les configurations, les migrations, les schémas de base de données, les routes API, les règles métier, les décisions d’architecture, les issues GitHub, les notes Notion, les commentaires internes, les tests et les documents techniques.

Le développeur doit alors chercher manuellement ce qui est pertinent.

2.2. Les agents ne voient qu’une partie du projet

Un agent peut avoir accès au dépôt, un autre seulement à un fichier téléchargé, un autre à Notion mais pas à GitHub, et un autre à VS Code mais pas à Google Drive. Le développeur doit continuellement transférer le contexte d’un outil à l’autre.

2.3. Les prompts deviennent trop longs

Pour expliquer un projet complexe, le développeur écrit souvent des prompts volumineux. Cela entraîne perte de temps, répétitions, contradictions, dépassement des limites de contexte, consommation excessive de crédits, réponses imprécises et oubli de règles importantes.

2.4. Le contexte peut contenir des secrets

Un projet peut contenir des fichiers .env, mots de passe, tokens, clés API, certificats, identifiants, URL privées, chaînes de connexion, informations personnelles ou données de production. Copier un projet sans filtrage est dangereux.

2.5. Les informations importantes ne sont pas hiérarchisées

Un agent IA ne doit pas recevoir tous les fichiers sans distinction. Il doit recevoir le bon contexte, pour la bonne tâche, dans le bon ordre, avec les bons avertissements et sans données inutiles.

2.6. La documentation peut être obsolète

Un fichier peut encore exister alors qu’il ne représente plus la réalité. Le développeur ne sait pas toujours quel document est actuel, quelle décision reste valide, quel fichier a été remplacé, quelle règle a changé ou quelle architecture est réellement utilisée.

2.7. Les projets complexes sont difficiles à transmettre

Lorsqu’un nouveau développeur rejoint un projet, il doit parfois parcourir des centaines de fichiers avant de comprendre la vision, les modules, les règles métier, les dépendances, les zones sensibles, les conventions et le travail en cours. ContextForge doit réduire ce temps d’apprentissage.

3\. PROPOSITION DE VALEUR

ContextForge permet à un développeur de générer depuis VS Code un Context Pack adapté à une tâche précise : concevoir une interface, corriger un bug, comprendre un module, préparer une revue de code, transmettre une fonctionnalité, documenter une API, préparer un prompt pour une IA, analyser une architecture, intégrer un nouveau développeur, préparer un audit ou résumer une partie du projet.

Le produit apporte cinq valeurs principales :

• Gain de temps : plus besoin de rechercher et copier manuellement les fichiers utiles.  
• Sécurité : les fichiers sensibles sont détectés, bloqués ou signalés.  
• Pertinence : le contexte généré correspond à un objectif précis.  
• Portabilité : le paquet peut être transmis à différents agents ou collaborateurs.  
• Continuité : le développeur peut recréer rapidement un contexte fiable à chaque étape du projet.

4\. POSITIONNEMENT

ContextForge n’est pas un IDE, un agent autonome, un générateur de code, un moteur de recherche classique, un outil complet de documentation automatique, un stockage cloud, une plateforme collaborative, un gestionnaire de projet, un remplaçant de GitHub ou de Notion.

ContextForge est un moteur local de préparation, de sécurisation, de structuration et d’export du contexte logiciel.

5\. UTILISATEURS CIBLÉS

5.1. Utilisateur principal

Le développeur individuel qui utilise VS Code, travaille sur un projet réel, utilise un ou plusieurs agents IA, possède une documentation dispersée, veut transmettre rapidement un contexte propre, souhaite éviter les copies manuelles, veut protéger les données sensibles et travaille parfois hors ligne.

5.2. Utilisateurs secondaires

À terme : équipes de développement, architectes logiciels, consultants, freelances, étudiants en informatique, responsables techniques, reviewers, responsables sécurité, équipes de support, intégrateurs, formateurs et mainteneurs de projets open source.

5.3. Profils d’utilisation

Développeur backend : contexte métier, API, cas d’usage, migration, erreur, service.  
Développeur frontend : composants, interfaces, règles d’affichage, appels API, états d’écran, validations et permissions.  
Architecte : architecture globale, dépendances, limites, conventions, décisions et risques.  
Nouveau membre d’équipe : compréhension du projet, des modules, des conventions, des fichiers essentiels et des règles métier.  
Utilisateur d’agent IA : fournir uniquement les bons fichiers, dans un ordre cohérent, sans secrets et dans une taille acceptable.

6\. CAS D’USAGE PRINCIPAUX

Cas 1 — Générer un contexte pour une tâche  
Le développeur ouvre un projet, choisit un objectif, un ensemble de dossiers, un profil et une limite de taille. ContextForge génère un paquet exploitable.

Cas 2 — Préparer un contexte pour une IA  
Le développeur choisit ChatGPT, Codex, Claude, DeepSeek, Gemini ou un autre agent. En V1, l’adaptation reste simple et locale.

Cas 3 — Préparer une revue de code  
Le développeur sélectionne les fichiers concernés, les documents liés, les règles métier, les tests et les dépendances. ContextForge produit un paquet de revue.

Cas 4 — Transmettre un module  
Le paquet contient l’objectif du module, sa structure, ses fichiers, dépendances, règles, limitations et points ouverts.

Cas 5 — Préparer une conception UI/UX  
Le développeur sélectionne documentation métier, rôles, permissions, données, routes, erreurs, états et composants existants. ContextForge prépare un paquet adapté à Figma.

Cas 6 — Générer une vue documentaire du projet  
Le développeur obtient un index des documents, une carte des fichiers, des résumés de structure, une liste des exclusions et une estimation de taille.

Cas 7 — Préparer un onboarding  
Le paquet contient présentation, architecture, conventions, modules, commandes, points sensibles et documents de référence.

7\. CONCEPT MÉTIER CENTRAL : CONTEXT PACK

Le Context Pack est l’élément central du produit. Il représente un ensemble structuré de fichiers et de métadonnées préparés pour un objectif précis.

Définition : une extraction contrôlée, traçable, sécurisée et structurée d’un projet logiciel, générée pour une finalité explicite.

Un Context Pack possède un identifiant, un nom, un objectif, une date de génération, un projet source, un profil cible, une limite de taille, une liste de fichiers inclus, exclus et bloqués, les raisons d’exclusion, des avertissements, une estimation de taille, un manifeste et un ou plusieurs fichiers de sortie.

Structure conceptuelle :

Context Pack  
├── id  
├── name  
├── objective  
├── project  
├── targetProfile  
├── sourceSelection  
├── includedFiles  
├── excludedFiles  
├── blockedFiles  
├── warnings  
├── estimatedTokens  
├── estimatedCharacters  
├── totalBytes  
├── generatedOutputs  
└── generatedAt

8\. PROFILS DE CONTEXT PACK

• IA générale : objectif, fichiers utiles, règles, architecture, dépendances, contraintes et manifeste.  
• Revue de code : fichiers modifiés, tests, règles, conventions, risques et erreurs potentielles.  
• Documentation : documents existants, architecture, structure, modules, conventions et index.  
• Onboarding : présentation, installation, commandes, structure, rôle des dossiers, principes et points d’attention.  
• UI/UX : rôles, permissions, parcours, données, règles d’affichage, états, erreurs, API et composants existants.  
• Bug : fichiers liés, erreurs, logs locaux sélectionnés, tests, dépendances, comportement attendu et observé.

9\. FONCTIONNALITÉS DE LA V1

9.1. Détection du workspace  
L’extension détecte le projet ouvert, les workspaces multiples, le dossier racine et le nom du projet.

9.2. Sélection des sources  
L’utilisateur peut sélectionner un ou plusieurs dossiers, des fichiers individuels, le projet complet, les fichiers Markdown uniquement ou certains types de fichiers.

9.3. Objectif obligatoire  
Chaque Context Pack doit avoir un objectif explicite. L’objectif est utilisé dans le manifeste, le résumé, le nom du paquet et l’organisation de la sortie.

9.4. Profils prédéfinis  
IA générale, revue de code, documentation, onboarding, UI/UX et personnalisé.

9.5. Scan récursif  
Le moteur parcourt dossiers, sous-dossiers et fichiers autorisés en respectant exclusions, limites, sécurité et configuration.

9.6. Exclusions automatiques  
node\_modules, .git, dist, build, coverage, .next, .nuxt, .cache, tmp, temp, vendor, out et .contextforge.

9.7. Exclusion des fichiers sensibles  
.env, .env.local, .env.production, .env.development, \*.pem, \*.key, \*.p12, \*.pfx, id\_rsa, id\_ed25519, credentials.json et secrets.json.

9.8. Détection simple de secrets  
Recherche de motifs comme API\_KEY=, SECRET=, TOKEN=, PASSWORD=, PRIVATE\_KEY, BEGIN PRIVATE KEY, chaînes de connexion, tokens typiques et clés longues suspectes. La V1 ne remplace pas Gitleaks, mais apporte une couche de protection supplémentaire.

9.9. Décision par fichier  
Chaque fichier reçoit un statut : inclus, exclu, bloqué, ignoré, trop volumineux, type non pris en charge, inaccessible ou erreur de lecture.

9.10. Aperçu avant génération  
L’utilisateur voit le nombre de fichiers candidats, inclus, exclus et bloqués, la taille totale, l’estimation de tokens, les avertissements et les raisons principales.

9.11. Estimation de taille  
L’outil calcule caractères, octets, lignes et estimation de tokens. La V1 peut utiliser l’approximation 1 token ≈ 4 caractères, clairement présentée comme estimation.

9.12. Limite configurable  
Petit : 20 000 tokens estimés.  
Moyen : 60 000\.  
Grand : 120 000\.  
Personnalisé : valeur définie par l’utilisateur.

9.13. Découpage automatique  
Si le contenu dépasse la limite, l’outil crée plusieurs volumes, maintient chaque volume sous la limite, génère un index et conserve autant que possible chaque fichier dans un même volume.

9.14. Génération Markdown  
Structure type :  
.contextforge/  
└── payment-ui-context/  
    ├── README.md  
    ├── context-01.md  
    ├── context-02.md  
    ├── manifest.json  
    └── exclusions.md

9.15. Manifeste JSON  
Le manifeste contient métadonnées, objectif, profil, fichiers, tailles, décisions, avertissements, date et version du moteur.

9.16. Rapport d’exclusion  
Un fichier explique ce qui a été exclu ou bloqué, pourquoi, et les erreurs rencontrées.

9.17. Lecture seule  
ContextForge ne modifie jamais les fichiers sources. Il crée uniquement ses propres sorties.

9.18. Ouverture automatique  
Après génération, le dossier de sortie est révélé, le README peut être ouvert et un message de réussite est affiché.

9.19. Fonctionnement hors ligne  
Toutes les fonctions de la V1 fonctionnent sans Internet.

10\. ÉLÉMENTS EXCLUS DE LA V1

• Intelligence artificielle intégrée.  
• Appels à OpenAI, DeepSeek, Claude ou autre.  
• Connecteurs Notion, Google Drive, Dropbox, OneDrive, GitHub distant, GitLab ou Bitbucket.  
• Comptes utilisateurs, inscription, connexion, profil, abonnement ou licence en ligne.  
• Collaboration, partage d’équipe, commentaires, permissions ou travail simultané.  
• Application web ou mobile.  
• Analyse sémantique complète du code.  
• Génération directe de design Figma.  
• Modification ou génération de code.  
• Déploiement cloud et serveur.

11\. RÈGLES MÉTIER DÉTAILLÉES

1\. Un Context Pack doit avoir un objectif explicite.  
2\. Les fichiers sources sont toujours traités en lecture seule.  
3\. Les fichiers sensibles connus sont bloqués par défaut.  
4\. Toute exclusion doit être traçable et justifiée.  
5\. Les fichiers générés dans .contextforge ne doivent jamais être rescannés.  
6\. La taille maximale définie doit être respectée.  
7\. Un fichier ne doit pas être coupé arbitrairement entre plusieurs volumes.  
8\. Un fichier trop volumineux doit être signalé et traité selon une règle explicite.  
9\. Les fichiers binaires sont exclus de la V1.  
10\. Le manifeste est obligatoire.  
11\. Le résultat doit être reproductible à projet et configuration identiques.  
12\. L’ordre des fichiers doit être stable et déterministe.  
13\. Une erreur de lecture isolée ne doit pas interrompre tout le processus.  
14\. Les encodages non pris en charge doivent être signalés.  
15\. Les chemins exportés doivent être relatifs afin de ne pas exposer inutilement le chemin absolu de l’ordinateur.  
16\. Le traitement local est le comportement par défaut.  
17\. L’utilisateur doit voir un aperçu avant la génération finale.  
18\. Les profils proposent des règles, mais l’utilisateur garde le contrôle.  
19\. Chaque paquet doit identifier son projet source et sa date de génération.  
20\. Chaque paquet doit identifier la version de ContextForge qui l’a produit.

12\. ORGANISATION DE LA SORTIE

Structure recommandée :

.contextforge/  
└── 2026-07-29-payment-ui/  
    ├── README.md  
    ├── context-01.md  
    ├── context-02.md  
    ├── manifest.json  
    ├── included-files.md  
    ├── exclusions.md  
    └── warnings.md

README.md contient l’objectif, le profil, les instructions, le résumé du paquet, l’ordre de lecture, le nombre de volumes et les avertissements.

context-XX.md contient les fichiers regroupés.

manifest.json contient les métadonnées techniques.

included-files.md liste les fichiers inclus.

exclusions.md liste les exclusions et leurs raisons.

warnings.md liste les risques et alertes.

13\. FORMAT DU CONTENU GÉNÉRÉ

Chaque fichier intégré doit être présenté avec :

• son chemin relatif ;  
• son extension ;  
• sa taille ;  
• son nombre de lignes ;  
• son statut ;  
• son contenu dans un bloc de code adapté.

Exemple :

Source : src/contexts/payments/domain/payment.ts  
Extension : .ts  
Taille : 8,4 Ko  
Lignes : 214  
Statut : inclus

Le moteur doit préserver le chemin, le type, la lisibilité, les limites des blocs Markdown et l’ordre stable.

14\. EXPÉRIENCE UTILISATEUR PREMIUM

14.1. Commande principale

Dans la palette VS Code :  
ContextForge: Générer un Context Pack

14.2. Clic droit

Sur un dossier :  
Générer un Context Pack depuis ce dossier

14.3. Étapes de l’assistant

Étape 1 — Objectif  
Question : Quel est l’objectif de ce contexte ?

Étape 2 — Profil  
Choix : IA générale, revue de code, documentation, onboarding, UI/UX ou personnalisé.

Étape 3 — Sources  
Sélection de dossiers et fichiers.

Étape 4 — Taille cible  
Petit, moyen, grand ou personnalisé.

Étape 5 — Sécurité  
Résumé des fichiers sensibles bloqués, fichiers trop volumineux et fichiers prêts à être inclus.

Étape 6 — Aperçu  
Résumé final avant validation.

Étape 7 — Génération  
Progression visible et possibilité d’annuler.

Étape 8 — Résultat  
Actions proposées : ouvrir le paquet, ouvrir le manifeste, copier le chemin ou révéler dans l’explorateur.

15\. CONFIGURATION UTILISATEUR

Exemple de configuration VS Code :

{  
  "contextForge.outputDirectory": ".contextforge",  
  "contextForge.defaultProfile": "ai-general",  
  "contextForge.maxEstimatedTokens": 60000,  
  "contextForge.includeExtensions": \[  
    ".md",  
    ".txt",  
    ".json",  
    ".ts",  
    ".tsx",  
    ".js",  
    ".jsx",  
    ".yml",  
    ".yaml"  
  \],  
  "contextForge.excludeDirectories": \[  
    "node\_modules",  
    ".git",  
    "dist",  
    "coverage"  
  \],  
  "contextForge.blockSensitiveFiles": true,  
  "contextForge.previewBeforeGenerate": true  
}

16\. ARCHITECTURE LOGIQUE DU PRODUIT

Le produit est séparé en trois couches principales.

16.1. Core

Le moteur métier, responsable du scan, du filtrage, de la sécurité, de la taille, du découpage, de la génération et du manifeste.

16.2. CLI

Interface en ligne de commande, responsable de recevoir les paramètres, appeler le core, afficher les résultats et faciliter les tests.

16.3. Extension VS Code

Interface principale, responsable de l’interaction utilisateur, de la sélection, de l’affichage, de la configuration, des commandes et de l’intégration avec VS Code.

17\. MODULES DU MOTEUR

core/  
├── domain/  
├── scanning/  
├── filtering/  
├── security/  
├── sizing/  
├── packing/  
├── generation/  
├── reporting/  
└── configuration/

Rôle des modules :

• domain : ContextPack, ContextPackRequest, SourceFile, FileDecision, SecurityFinding, PackVolume et GenerationResult.  
• scanning : parcours du projet.  
• filtering : application des règles d’inclusion et d’exclusion.  
• security : détection des fichiers sensibles et motifs suspects.  
• sizing : calcul des tailles et estimation de tokens.  
• packing : répartition dans les volumes.  
• generation : production Markdown et JSON.  
• reporting : rapports d’exclusion et avertissements.  
• configuration : paramètres et profils.

18\. OBJETS MÉTIER PRINCIPAUX

ContextPackRequest  
\- projectRoot  
\- objective  
\- profile  
\- selectedPaths  
\- tokenLimit  
\- customIncludes  
\- customExcludes

SourceFile  
\- relativePath  
\- absolutePath  
\- extension  
\- sizeInBytes  
\- lineCount

FileDecision  
\- file  
\- status : included, excluded, blocked, skipped ou failed  
\- reason

SecurityFinding  
\- filePath  
\- type : sensitive-file, secret-pattern, private-key, credential ou connection-string  
\- severity : low, medium, high ou critical  
\- description

PackVolume  
\- index  
\- files  
\- estimatedTokens  
\- outputPath

ContextPackResult  
\- id  
\- name  
\- objective  
\- profile  
\- generatedAt  
\- includedFiles  
\- excludedFiles  
\- blockedFiles  
\- warnings  
\- volumes  
\- manifestPath

19\. SÉCURITÉ

La sécurité est une caractéristique fondamentale du produit.

19.1. Principes

• traitement local ;  
• aucune télémétrie sensible ;  
• aucune transmission automatique ;  
• lecture seule ;  
• exclusions explicites ;  
• contrôle utilisateur ;  
• journalisation minimale.

19.2. Menaces principales

• export accidentel d’un secret ;  
• inclusion d’un fichier .env ;  
• exposition d’un chemin local ;  
• inclusion d’un certificat ;  
• inclusion de données de production ;  
• secret non détecté dans un fichier ordinaire ;  
• partage involontaire d’un paquet sensible.

19.3. Réponses du produit

• blocage par nom ;  
• blocage par extension ;  
• scan par motifs ;  
• avertissements ;  
• rapport ;  
• validation avant génération ;  
• bannière de sécurité dans le README.

19.4. Avertissement obligatoire

La détection de secrets réduit les risques, mais ne garantit pas qu’aucune information sensible ne soit présente. Vérifiez toujours le Context Pack avant de le partager.

20\. PERFORMANCE

La V1 doit rester fluide sur un ordinateur modeste.

Exigences :

• traitement progressif ;  
• pas de chargement complet inutile en mémoire ;  
• limitation des fichiers ;  
• exclusion rapide des dossiers lourds ;  
• indication de progression ;  
• possibilité d’annuler ;  
• gestion des erreurs sans blocage global.

Objectifs indicatifs :

• démarrage du scan en moins d’une seconde pour un projet moyen ;  
• progression visible ;  
• génération en quelques secondes à quelques dizaines de secondes ;  
• aucun blocage durable de VS Code.

21\. COMPATIBILITÉ

La V1 doit viser :

• Windows 10 et 11 ;  
• Linux ;  
• macOS ;  
• VS Code stable ;  
• projets JavaScript et TypeScript en priorité.

Le moteur reste agnostique vis-à-vis du langage et peut lire Markdown, texte, JSON, YAML, JavaScript, TypeScript, Python, Java, C\#, Go, Rust, PHP et d’autres formats textuels configurables.

22\. CRITÈRES DE RÉUSSITE DE LA V1

La V1 est réussie si :

1\. l’utilisateur peut générer un paquet depuis un projet ouvert ;  
2\. le moteur fonctionne hors ligne ;  
3\. les fichiers sensibles connus sont bloqués ;  
4\. les exclusions sont expliquées ;  
5\. le paquet respecte la limite de taille ;  
6\. le résultat est structuré ;  
7\. le manifeste est généré ;  
8\. les sources ne sont jamais modifiées ;  
9\. le résultat peut être donné à un agent IA ;  
10\. le processus est stable sur Windows ;  
11\. l’extension peut être installée par fichier .vsix ;  
12\. un développeur peut comprendre l’utilisation sans formation complexe.

23\. INDICATEURS DE QUALITÉ

Fiabilité : taux de génération réussie, taux d’erreurs de lecture, stabilité et absence de corruption.

Sécurité : fichiers sensibles bloqués, avertissements correctement générés et absence de chemins absolus dans les exports.

Utilisabilité : nombre d’étapes, durée de génération, compréhension de l’aperçu et clarté des erreurs.

Pertinence : proportion de fichiers réellement utiles, taille du paquet et facilité d’utilisation par un agent.

24\. RISQUES DU PROJET

Risque 1 — Le produit devient un simple concaténateur.  
Réponse : imposer une structure, utiliser des profils et ajouter manifeste, exclusions et sécurité.

Risque 2 — Le contexte devient trop volumineux.  
Réponse : estimation, limites, découpage, avertissements et sélection ciblée.

Risque 3 — Un secret est exporté.  
Réponse : blocage, motifs, avertissements, validation utilisateur et tests de sécurité.

Risque 4 — Le périmètre grandit trop vite.  
Réponse : V1 hors ligne uniquement, sans connecteur, IA ou cloud.

Risque 5 — L’extension devient dépendante de VS Code.  
Réponse : moteur indépendant, CLI séparée et architecture modulaire.

Risque 6 — Trop de formats à supporter.  
Réponse : formats textuels prioritaires, configuration extensible et exclusion des binaires.

25\. ROADMAP PROPOSÉE

Phase 1 — Core minimal  
Scan, exclusions, lecture, génération Markdown et manifeste.

Phase 2 — Sécurité  
Noms sensibles, extensions sensibles, motifs et rapports.

Phase 3 — Taille  
Estimation, limites, volumes et index.

Phase 4 — CLI  
Commandes, options, retours et tests.

Phase 5 — Extension VS Code  
Commande, sélection, aperçu, progression et génération.

Phase 6 — Qualité premium  
Configuration, profils, erreurs, logs, tests, documentation et fichier .vsix.

26\. VISION APRÈS LA V1

La V2 pourra introduire :

• synchronisation Notion ;  
• export Google Drive ;  
• intégration GitHub ;  
• résumé local ou via API ;  
• profils spécifiques par agent ;  
• analyse des changements Git ;  
• comparaison entre Context Packs ;  
• détection de documentation obsolète ;  
• export ZIP ;  
• copie vers le presse-papiers ;  
• modèles personnalisés ;  
• mode équipe ;  
• historique local ;  
• règles personnalisées ;  
• interface latérale complète ;  
• génération de spécifications UI ;  
• intégration Figma.

27\. PRINCIPE DIRECTEUR FINAL

Toutes les décisions futures doivent respecter cette règle :

ContextForge doit réduire l’effort nécessaire pour expliquer un projet, sans réduire le contrôle du développeur sur ses données.

Règle de sécurité principale :

Aucun contenu du projet ne doit quitter l’ordinateur sans une action explicite de l’utilisateur.

28\. DÉFINITION FINALE DU PRODUIT

ContextForge est une extension VS Code hors ligne, construite autour d’un moteur indépendant, qui permet de générer des paquets de contexte ciblés, structurés, traçables et sécurisés à partir d’un projet logiciel, afin de faciliter le travail avec les agents IA, les développeurs et les outils de documentation.

29\. DÉCISIONS VERROUILLÉES

• nom provisoire : ContextForge ;  
• produit principal : extension VS Code ;  
• moteur : indépendant et réutilisable ;  
• interface secondaire : CLI ;  
• fonctionnement : hors ligne ;  
• aucun cloud ;  
• aucune IA intégrée ;  
• aucun compte utilisateur ;  
• aucune modification du projet ;  
• sécurité obligatoire ;  
• objectif obligatoire ;  
• manifeste obligatoire ;  
• aperçu obligatoire ;  
• découpage selon limite ;  
• export Markdown et JSON ;  
• architecture modulaire ;  
• compatibilité Windows prioritaire ;  
• possibilité de publier un .vsix.

30\. PREMIÈRE USER STORY OFFICIELLE

En tant que développeur, je veux sélectionner une partie de mon projet dans VS Code et générer localement un Context Pack structuré, afin de transmettre un contexte utile à un agent IA sans copier manuellement les fichiers et sans exposer mes secrets.

Critères d’acceptation :

• le projet est détecté ;  
• l’objectif est demandé ;  
• les sources sont sélectionnées ;  
• les fichiers sensibles sont bloqués ;  
• un aperçu est affiché ;  
• l’utilisateur confirme ;  
• le paquet est généré ;  
• le manifeste existe ;  
• les exclusions sont expliquées ;  
• aucun fichier source n’est modifié ;  
• le résultat est ouvert dans VS Code.

Cette définition constitue la base produit officielle de ContextForge V1.  
