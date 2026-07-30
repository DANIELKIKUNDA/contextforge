CONTEXTFORGE  
02 — Architecture technique premium de ContextForge V1  
Version 1.0 — Spécification officielle

1\. OBJET DU DOCUMENT

Ce document définit l’architecture technique complète de ContextForge V1. Il précise la structure du monorepo, les responsabilités de chaque package, les dépendances autorisées, les dépendances interdites, les contrats du domaine, les flux applicatifs, les exigences de sécurité, la stratégie de tests, la CI/CD, le packaging VS Code et les limites strictes de la première version.

Cette spécification constitue la référence d’implémentation. Toute décision contraire doit faire l’objet d’une décision d’architecture formelle dans docs/decisions.

2\. PRINCIPES D’ARCHITECTURE

ContextForge V1 respecte les principes suivants :

• Local-first : toutes les fonctions essentielles fonctionnent sans Internet.  
• Privacy by default : aucun contenu ne quitte la machine sans action explicite.  
• Read-only source access : les fichiers du projet source ne sont jamais modifiés.  
• Core indépendant : la logique métier ne dépend ni de VS Code, ni de la CLI.  
• Ports et adaptateurs : les interfaces d’entrée et de sortie sont séparées du domaine.  
• Déterminisme : à configuration et projet identiques, le résultat reste stable.  
• Sécurité avant commodité : un fichier douteux est bloqué plutôt qu’inclus silencieusement.  
• Validation systématique : toutes les entrées externes sont validées.  
• Faible empreinte : aucune base de données, aucun serveur et aucun runtime lourd.  
• Extensibilité contrôlée : l’architecture prépare les futurs connecteurs sans les intégrer dans la V1.

3\. STYLE D’ARCHITECTURE RETENU

L’architecture retenue est une architecture modulaire inspirée de l’hexagonale.

Flux autorisé :

Extension VS Code / CLI  
        ↓  
Application Core  
        ↓  
Ports  
        ↓  
Adaptateurs techniques : scanner, système de fichiers, sécurité, générateurs

Le domaine et l’application ne connaissent pas VS Code. Les adaptateurs VS Code et CLI traduisent les interactions utilisateur en requêtes métier.

4\. STRUCTURE DU MONOREPO

contextforge/  
├── apps/  
│   ├── cli/  
│   │   ├── src/  
│   │   │   ├── commands/  
│   │   │   ├── presenters/  
│   │   │   ├── adapters/  
│   │   │   └── index.ts  
│   │   ├── package.json  
│   │   └── tsconfig.json  
│   └── vscode-extension/  
│       ├── src/  
│       │   ├── commands/  
│       │   ├── workflows/  
│       │   ├── views/  
│       │   ├── adapters/  
│       │   ├── configuration/  
│       │   └── extension.ts  
│       ├── package.json  
│       └── tsconfig.json  
├── packages/  
│   ├── contracts/  
│   ├── core/  
│   ├── scanner/  
│   ├── security/  
│   ├── sizing/  
│   ├── packer/  
│   ├── generators/  
│   ├── profiles/  
│   ├── configuration/  
│   └── shared/  
├── docs/  
│   ├── product/  
│   ├── architecture/  
│   ├── security/  
│   ├── decisions/  
│   ├── testing/  
│   └── release/  
├── fixtures/  
│   ├── safe-project/  
│   ├── project-with-secrets/  
│   ├── oversized-project/  
│   └── multi-language-project/  
├── scripts/  
├── .github/workflows/  
├── package.json  
├── pnpm-workspace.yaml  
├── turbo.json  
├── tsconfig.base.json  
├── biome.json  
├── vitest.workspace.ts  
└── README.md

5\. RESPONSABILITÉS DES PACKAGES

5.1. packages/contracts

Contient les contrats partagés : types, enums, unions discriminées, schémas Zod et interfaces publiques.

Autorisé :  
• types TypeScript ;  
• schémas Zod ;  
• constantes de contrat ;  
• erreurs métier sérialisables.

Interdit :  
• accès au disque ;  
• import de vscode ;  
• logique de scan ;  
• génération Markdown ;  
• accès réseau ;  
• logique de sécurité concrète.

5.2. packages/core

Contient l’orchestration métier et les cas d’usage.

Cas d’usage principaux :  
• PrepareContextPackPreview ;  
• GenerateContextPack ;  
• ValidateContextForgeConfiguration ;  
• InspectProjectSources ;  
• ListAvailableProfiles.

Le core dépend uniquement des contrats et des ports. Il ne dépend d’aucune API spécifique à VS Code ou au terminal.

5.3. packages/scanner

Responsable de découvrir les fichiers candidats et leurs métadonnées.

Fonctions :  
• scan récursif ;  
• respect de .gitignore et .contextforgeignore ;  
• application des globs d’inclusion et d’exclusion ;  
• collecte du chemin relatif, de l’extension, de la taille et du type probable ;  
• exclusion rapide des dossiers lourds.

Le scanner ne décide pas qu’un fichier est sécurisé. Il ne lit le contenu que lorsque nécessaire et selon une limite explicite.

5.4. packages/security

Responsable de l’analyse de sécurité.

Fonctions :  
• blocage par nom ;  
• blocage par extension ;  
• détection de motifs sensibles ;  
• classification par sévérité ;  
• masquage des valeurs sensibles ;  
• production de SecurityFinding.

Il ne supprime, ne déplace et ne modifie aucun fichier.

5.5. packages/sizing

Responsable du calcul de taille.

Fonctions :  
• octets ;  
• caractères ;  
• lignes ;  
• estimation de tokens ;  
• agrégation par fichier, volume et paquet.

L’estimation V1 utilise par défaut 1 token ≈ 4 caractères, avec stratégie configurable.

5.6. packages/packer

Responsable de répartir les fichiers validés dans un ou plusieurs volumes.

Contraintes :  
• respecter la limite de tokens ;  
• conserver un fichier entier dans un volume lorsque possible ;  
• produire un ordre stable ;  
• identifier les fichiers individuellement trop grands ;  
• ne jamais réinclure un fichier bloqué.

5.7. packages/generators

Responsable de produire les fichiers de sortie.

Sorties V1 :  
• README.md ;  
• context-XX.md ;  
• manifest.json ;  
• included-files.md ;  
• exclusions.md ;  
• warnings.md.

Ce package ne choisit jamais les fichiers. Il reçoit une structure déjà validée.

5.8. packages/profiles

Contient les profils prédéfinis : ai-general, code-review, documentation, onboarding, ui-ux et custom.

Chaque profil définit :  
• extensions prioritaires ;  
• dossiers suggérés ;  
• catégories de contenu ;  
• ordre de lecture ;  
• limite par défaut ;  
• règles de présentation.

5.9. packages/configuration

Responsable de charger, fusionner et valider :  
• valeurs par défaut ;  
• paramètres VS Code ;  
• .contextforge.json ;  
• .contextforge.yaml ;  
• options CLI.

Ordre de priorité : options explicites de la commande \> paramètres de l’interface \> fichier du projet \> valeurs par défaut.

5.10. packages/shared

Contient uniquement les utilitaires transverses réellement génériques :  
• Result ;  
• horloge ;  
• identifiants ;  
• normalisation des chemins ;  
• tri stable ;  
• helpers de chaînes.

Aucune règle métier spécifique ne doit être placée dans shared.

6\. DÉPENDANCES TECHNIQUES RECOMMANDÉES

Gestion du monorepo :  
• pnpm ;  
• Turborepo.

Validation :  
• zod.

Scan et motifs :  
• fast-glob ;  
• ignore ;  
• picomatch.

Configuration :  
• yaml.

CLI :  
• commander ;  
• @inquirer/prompts ;  
• ora.

Extension VS Code :  
• vscode ;  
• esbuild ;  
• @vscode/test-electron ;  
• @vscode/vsce.

Tests :  
• vitest ;  
• fast-check ;  
• memfs.

Qualité :  
• Biome.

Sécurité de la chaîne de développement :  
• Semgrep ;  
• Gitleaks ;  
• Trivy ;  
• GitHub Actions.

7\. DÉPENDANCES INTERDITES EN V1

La V1 ne doit pas intégrer :  
• base de données ;  
• ORM ;  
• serveur HTTP ;  
• framework backend ;  
• SDK OpenAI ;  
• SDK DeepSeek ;  
• SDK Claude ;  
• SDK Figma ;  
• SDK Notion ;  
• SDK Google Drive ;  
• télémétrie distante ;  
• authentification ;  
• Electron séparé ;  
• React pour l’interface initiale ;  
• synchronisation cloud.

8\. RÈGLES DE DÉPENDANCE

Dépendances autorisées :

apps/vscode-extension → core, contracts, configuration  
apps/cli → core, contracts, configuration  
core → contracts, ports  
scanner → contracts, shared  
security → contracts, shared  
sizing → contracts, shared  
packer → contracts, shared  
profiles → contracts  
configuration → contracts, shared  
generators → contracts, shared

Dépendances interdites :

core → vscode  
core → commander  
security → vscode  
contracts → scanner  
contracts → generators  
generators → CLI  
scanner → security  
packer → système de fichiers concret

Toute violation doit être détectée par une règle d’architecture automatisée.

9\. CONFIGURATION TYPESCRIPT

Le projet utilise TypeScript strict avec au minimum :

strict: true  
noImplicitOverride: true  
noUncheckedIndexedAccess: true  
exactOptionalPropertyTypes: true  
useUnknownInCatchVariables: true  
noFallthroughCasesInSwitch: true  
noImplicitReturns: true  
forceConsistentCasingInFileNames: true

Aucun any non justifié n’est accepté dans le core. Toute exception doit être documentée.

10\. MODÈLE DE DOMAINE

10.1. ContextPackRequest

Représente une demande validée de préparation d’un paquet.

Champs :  
• projectRoot ;  
• objective ;  
• profile ;  
• selectedPaths ;  
• tokenLimit ;  
• customIncludes ;  
• customExcludes ;  
• outputDirectory ;  
• securityMode.

10.2. ProjectDescriptor

• name ;  
• rootPath ;  
• workspaceKind : single-root ou multi-root ;  
• platform ;  
• detectedLanguages.

10.3. SourceFile

• relativePath ;  
• absolutePath interne non exporté ;  
• extension ;  
• sizeInBytes ;  
• lineCount ;  
• encoding ;  
• contentKind ;  
• hash optionnel.

10.4. FileDecision

Union discriminée :  
• included ;  
• excluded ;  
• blocked ;  
• failed ;  
• oversized.

Chaque variante contient uniquement les champs pertinents.

10.5. SecurityFinding

• ruleId ;  
• kind ;  
• severity ;  
• relativePath ;  
• message ;  
• maskedEvidence ;  
• lineNumber optionnel.

La valeur brute d’un secret n’est jamais stockée.

10.6. ContextPackPreview

• project ;  
• objective ;  
• profile ;  
• candidates ;  
• included ;  
• excluded ;  
• blocked ;  
• oversized ;  
• estimatedTokens ;  
• estimatedBytes ;  
• warnings ;  
• requiresConfirmation.

10.7. PackVolume

• index ;  
• fileIds ;  
• estimatedTokens ;  
• estimatedBytes ;  
• outputFileName.

10.8. ContextPackManifest

• schemaVersion ;  
• contextForgeVersion ;  
• packId ;  
• name ;  
• objective ;  
• profile ;  
• projectName ;  
• generatedAt ;  
• includedFiles ;  
• excludedFiles ;  
• blockedFiles ;  
• volumes ;  
• warnings ;  
• estimationStrategy ;  
• securitySummary.

11\. PORTS DU CORE

Le core définit des ports, pas des implémentations concrètes.

FileDiscoveryPort : découvre les fichiers candidats.  
FileContentReaderPort : lit un fichier dans une limite sûre.  
SecurityScannerPort : analyse noms, extensions et contenu.  
SizingPort : calcule les métriques.  
PackingPort : répartit les fichiers.  
ContextPackWriterPort : écrit les sorties.  
ConfigurationPort : fournit la configuration fusionnée.  
ClockPort : fournit la date.  
IdGeneratorPort : produit les identifiants.  
ProgressReporterPort : publie la progression sans dépendre de VS Code.  
CancellationPort : permet l’annulation.

12\. FLUX APPLICATIF COMPLET

1\. L’adaptateur reçoit la demande utilisateur.  
2\. La demande est validée par Zod.  
3\. Le projet et les chemins sélectionnés sont normalisés.  
4\. La configuration effective est calculée.  
5\. Le scanner découvre les fichiers candidats.  
6\. Les exclusions structurelles sont appliquées.  
7\. Les métadonnées sont collectées.  
8\. Les fichiers manifestement sensibles sont bloqués avant lecture.  
9\. Le contenu des fichiers autorisés est lu sous limite.  
10\. Le scanner de sécurité analyse le contenu.  
11\. Une décision est créée pour chaque fichier.  
12\. La taille est calculée.  
13\. Le core produit un ContextPackPreview.  
14\. L’utilisateur confirme ou annule.  
15\. Le packer répartit les fichiers inclus.  
16\. Les générateurs produisent les sorties dans un dossier temporaire.  
17\. Les contrôles finaux sont exécutés.  
18\. Le dossier temporaire est renommé de façon atomique vers le dossier final.  
19\. Le résultat est présenté à l’utilisateur.

13\. TRANSACTION DE GÉNÉRATION

La génération doit être atomique autant que possible.

Stratégie :  
• écrire dans .contextforge/.tmp/\<pack-id\> ;  
• valider toutes les sorties ;  
• vérifier les limites ;  
• vérifier l’absence de chemins absolus ;  
• vérifier qu’aucun fichier bloqué n’est présent ;  
• renommer vers le dossier final ;  
• supprimer le temporaire en cas d’échec.

Un paquet incomplet ne doit pas être présenté comme réussi.

14\. POLITIQUE DE SCAN

Exclusions par défaut :  
node\_modules, .git, dist, build, coverage, .next, .nuxt, .cache, tmp, temp, vendor, out, .contextforge.

Fichiers sensibles bloqués par défaut :  
.env, .env.\*, \*.pem, \*.key, \*.p12, \*.pfx, id\_rsa, id\_ed25519, credentials.json, secrets.json, secrets.yaml.

Les chemins symboliques sont ignorés par défaut afin d’éviter les boucles et les sorties hors workspace. Leur support futur exigera une option explicite.

15\. POLITIQUE DE SÉCURITÉ

Niveaux de détection :

Niveau 1 — nom du fichier.  
Niveau 2 — extension.  
Niveau 3 — contenu.  
Niveau 4 — structure suspecte, par exemple chaîne de connexion avec identifiants.

Sévérités : low, medium, high, critical.

Comportement :  
• critical : blocage obligatoire ;  
• high : blocage par défaut ;  
• medium : exclusion ou avertissement selon règle ;  
• low : avertissement.

Aucun secret détecté ne doit apparaître en clair dans les logs, rapports, erreurs ou manifestes.

16\. PROFIL UI/UX

Le profil ui-ux est officiel dans la V1, mais sa capacité doit être interprétée correctement.

Il ne dessine pas les écrans dans Figma. Il prépare un paquet structuré destiné à la conception UI/UX.

Sources prioritaires :  
• docs/product ;  
• docs/business ;  
• docs/ux ;  
• docs/ui ;  
• src/domain ;  
• src/application ;  
• src/routes ;  
• src/controllers ;  
• src/dto ;  
• src/validators ;  
• src/permissions ;  
• src/pages ;  
• src/components ;  
• src/stores ;  
• src/types.

Structure de sortie recommandée :

ui-ux-context/  
├── README.md  
├── product-objective.md  
├── user-roles.md  
├── permissions.md  
├── user-journeys.md  
├── business-rules.md  
├── screen-inventory.md  
├── screen-states.md  
├── forms-and-validations.md  
├── api-contracts.md  
├── errors-and-edge-cases.md  
├── existing-components.md  
├── relevant-source-files.md  
└── manifest.json

Sans IA intégrée, ContextForge organise les sources et les catégories. Il ne prétend pas comprendre automatiquement toute la logique métier.

17\. ROADMAP FIGMA

V1 : projet → Context Pack UI/UX → Markdown et JSON.  
V2 : Context Pack → spécification UI normalisée.  
V3 : spécification UI → connecteur ou plugin Figma.  
V4 : ContextForge \+ Figma \+ design system.

La future spécification UI pourra décrire :  
• feature ;  
• rôles ;  
• écrans ;  
• états ;  
• actions ;  
• permissions ;  
• formulaires ;  
• validations ;  
• erreurs ;  
• composants suggérés.

18\. FORMAT DES SORTIES

Dossier type :

.contextforge/  
└── 2026-07-29-payment-ui/  
    ├── README.md  
    ├── context-01.md  
    ├── context-02.md  
    ├── manifest.json  
    ├── included-files.md  
    ├── exclusions.md  
    └── warnings.md

Les chemins exportés sont toujours relatifs.

Chaque source intégrée contient :  
• chemin relatif ;  
• extension ;  
• taille ;  
• nombre de lignes ;  
• statut ;  
• bloc de code avec langage.

19\. STRATÉGIE DE DÉCOUPAGE

Le packer utilise un tri stable.

Priorité recommandée :  
1\. documents produit et métier ;  
2\. architecture ;  
3\. contrats et types ;  
4\. cas d’usage ;  
5\. interfaces ;  
6\. infrastructure ;  
7\. tests ;  
8\. autres fichiers.

Un fichier reste entier dans un volume lorsque possible. Un fichier dépassant seul la limite est classé oversized et n’est pas tronqué silencieusement.

20\. GESTION DES ERREURS

Catégories :  
• ValidationError ;  
• ConfigurationError ;  
• ScanError ;  
• FileReadError ;  
• SecurityError ;  
• PackingError ;  
• GenerationError ;  
• OutputValidationError ;  
• CancellationError.

Les erreurs internes sont traduites en messages utilisateur clairs. Les détails techniques peuvent être consignés localement sans secret.

21\. JOURNALISATION

La V1 utilise une journalisation locale minimale.

Interdit dans les logs :  
• contenu complet des fichiers ;  
• secrets ;  
• tokens ;  
• chemins absolus exportables ;  
• données utilisateur non nécessaires.

Niveaux : debug, info, warn, error.

La télémétrie distante est interdite en V1.

22\. PERFORMANCE

Objectifs :  
• démarrage du scan rapide ;  
• traitement en flux lorsque possible ;  
• lecture plafonnée ;  
• parallélisme limité ;  
• progression visible ;  
• annulation ;  
• aucune saturation durable de la mémoire ;  
• aucune immobilisation prolongée de l’extension VS Code.

Les gros dossiers exclus doivent être filtrés avant lecture.

23\. STRATÉGIE DE TESTS

Tests unitaires : chaque module métier et chaque règle.

Tests d’intégration :  
scan → sécurité → décision → taille → découpage → génération.

Tests de sécurité obligatoires :  
• .env bloqué ;  
• clé privée bloquée ;  
• token masqué ;  
• chemin absolu absent ;  
• .contextforge ignoré ;  
• aucun secret dans le rapport ;  
• fichier sensible sélectionné manuellement toujours bloqué.

Tests génératifs avec fast-check :  
• aucune combinaison de chemins ne permet d’inclure .env ;  
• la somme des volumes respecte la limite ;  
• l’ordre reste stable ;  
• un fichier bloqué n’apparaît jamais dans les sorties.

Tests de performance : 100, 1 000 et 10 000 fichiers simulés.

Tests extension : aucun workspace, workspace simple, multi-root, annulation, erreur disque, succès.

24\. FIXTURES DE RÉFÉRENCE

safe-project : projet textuel sans secret.  
project-with-secrets : .env, clé privée et token factice.  
oversized-project : fichiers dépassant les limites.  
multi-language-project : TypeScript, Python, Java, Markdown et YAML.  
broken-encoding-project : fichiers non UTF-8.  
symlink-project : liens symboliques et risques de boucle.

25\. CI/CD

À chaque pull request :  
• installation pnpm figée ;  
• typecheck ;  
• lint Biome ;  
• tests unitaires ;  
• tests d’intégration ;  
• tests de sécurité ;  
• Semgrep ;  
• Gitleaks ;  
• build ;  
• packaging de l’extension.

Pour les releases :  
• vérification de version ;  
• génération changelog ;  
• build reproductible ;  
• génération .vsix ;  
• checksum ;  
• artefact GitHub Actions ;  
• publication Marketplace seulement après validation manuelle.

26\. PACKAGING DE L’EXTENSION

Bundler : esbuild.  
Outil de packaging : @vscode/vsce.

Le package.json de l’extension déclare :  
• activationEvents ;  
• commands ;  
• menus ;  
• configuration ;  
• engines.vscode ;  
• categories ;  
• repository ;  
• icon ;  
• license.

Commandes minimales :  
• ContextForge: Generate Context Pack ;  
• ContextForge: Preview Context Pack ;  
• ContextForge: Validate Configuration ;  
• ContextForge: Open Last Context Pack.

27\. CONFIGURATION UTILISATEUR

Paramètres initiaux :  
• contextForge.outputDirectory ;  
• contextForge.defaultProfile ;  
• contextForge.maxEstimatedTokens ;  
• contextForge.includeExtensions ;  
• contextForge.excludeDirectories ;  
• contextForge.blockSensitiveFiles ;  
• contextForge.previewBeforeGenerate ;  
• contextForge.followSymlinks \= false ;  
• contextForge.maxFileSizeBytes ;  
• contextForge.maxConcurrentReads.

28\. CRITÈRES DE QUALITÉ

Le produit est considéré premium si :  
• l’interface est simple ;  
• les erreurs sont compréhensibles ;  
• les résultats sont structurés ;  
• la sécurité est explicable ;  
• le moteur est testable indépendamment ;  
• l’extension reste légère ;  
• les sorties sont déterministes ;  
• la configuration est documentée ;  
• l’installation .vsix est fiable ;  
• aucune dépendance cloud n’est requise.

29\. CE QUI EST AUTORISÉ EN V1

• moteur local ;  
• scanner ;  
• sécurité ;  
• profils ;  
• estimation ;  
• découpage ;  
• Markdown ;  
• JSON ;  
• CLI ;  
• extension VS Code ;  
• tests ;  
• packaging .vsix.

30\. CE QUI EST INTERDIT EN V1

• intégration directe Figma ;  
• intégration Notion ;  
• intégration Google Drive ;  
• intégration GitHub distante ;  
• IA embarquée ;  
• comptes ;  
• serveur ;  
• paiement ;  
• synchronisation ;  
• collaboration ;  
• base de données ;  
• télémétrie distante.

31\. DÉCISIONS VERROUILLÉES

• TypeScript strict.  
• pnpm workspaces.  
• Turborepo.  
• Core indépendant.  
• Extension VS Code comme interface principale.  
• CLI comme interface secondaire.  
• Zod pour les contrats d’entrée.  
• fast-glob, ignore et picomatch pour le scan.  
• Vitest pour les tests.  
• Biome pour lint et formatage.  
• esbuild pour le bundle.  
• .vsix comme premier format distribuable.  
• Aucun cloud ni SDK externe dans la V1.

32\. CRITÈRE DE SORTIE ARCHITECTURALE

L’architecture est prête à être implémentée lorsque :  
• les packages sont créés ;  
• les dépendances sont verrouillées ;  
• les ports sont définis ;  
• les contrats Zod sont validés ;  
• un flux minimal fonctionne de bout en bout ;  
• les tests de sécurité fondamentaux passent ;  
• l’extension appelle le core sans importer de logique métier ;  
• un premier .vsix est généré.

33\. PROCHAINE ÉTAPE

Le prochain document officiel sera :

03 — Domaine, cas d’usage et contrats détaillés de ContextForge V1

Il définira fichier par fichier les entités, value objects, unions, ports, erreurs, cas d’usage, DTO, schémas Zod, événements internes et critères d’acceptation.

FIN DE LA SPÉCIFICATION  
