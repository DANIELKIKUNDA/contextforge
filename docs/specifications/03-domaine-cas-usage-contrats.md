CONTEXTFORGE  
03 — Domaine, cas d’usage et contrats détaillés de ContextForge V1  
Version 1.0 — Spécification officielle

1\. OBJET DU DOCUMENT

Ce document transforme l’architecture technique validée de ContextForge V1 en spécification métier et applicative directement implémentable. Il définit le vocabulaire du domaine, l’agrégat principal, les entités, les value objects, les unions discriminées, les ports, les cas d’usage, les DTO, les schémas Zod, les erreurs, les événements internes, les invariants et les critères d’acceptation.

Il constitue le contrat de référence entre le moteur Core, la CLI et l’extension VS Code.

2\. VOCABULAIRE MÉTIER OFFICIEL

Projet source : dossier ou workspace analysé par ContextForge.

Context Pack : paquet structuré de contexte généré pour un objectif explicite.

Prévisualisation : résultat complet du scan, du filtrage, de la sécurité et de l’estimation avant écriture finale.

Fichier candidat : fichier découvert par le scanner avant décision.

Fichier inclus : fichier validé pour l’export.

Fichier exclu : fichier ignoré pour une raison non critique, par exemple extension non autorisée.

Fichier bloqué : fichier interdit à l’export pour raison de sécurité.

Fichier oversized : fichier dont la taille dépasse la limite individuelle ou celle d’un volume.

Security Finding : constat de sécurité produit par une règle de détection.

Profil : ensemble de préférences de sélection, d’ordre et de présentation pour un usage donné.

Volume : unité de sortie Markdown contenant un sous-ensemble cohérent de fichiers inclus.

Manifeste : description JSON complète, traçable et versionnée d’un Context Pack.

3\. AGRÉGAT PRINCIPAL : CONTEXT PACK

Le Context Pack est l’agrégat racine du domaine.

Responsabilités :  
• porter l’identité du paquet ;  
• associer un objectif ;  
• associer un projet source ;  
• associer un profil ;  
• garantir la cohérence des décisions par fichier ;  
• garantir qu’aucun fichier bloqué n’est inclus ;  
• garantir que les volumes respectent les limites ;  
• produire un manifeste cohérent ;  
• exposer les avertissements et résultats finaux.

Invariants de l’agrégat :  
1\. l’objectif ne peut pas être vide ;  
2\. le paquet possède exactement un projet source ;  
3\. un fichier ne peut avoir qu’une seule décision finale ;  
4\. un fichier bloqué ne peut apparaître dans aucun volume ;  
5\. un volume ne peut dépasser sa limite configurée ;  
6\. tous les chemins exportés sont relatifs ;  
7\. le manifeste référence exactement les fichiers et volumes réellement générés ;  
8\. la date de génération est définie par ClockPort ;  
9\. l’identifiant est défini par IdGeneratorPort ;  
10\. un paquet incomplet ne peut pas être marqué comme generated.

États possibles :  
• draft ;  
• previewed ;  
• confirmed ;  
• generating ;  
• generated ;  
• failed ;  
• cancelled.

Transitions autorisées :  
draft → previewed  
previewed → confirmed  
previewed → cancelled  
confirmed → generating  
generating → generated  
generating → failed  
generating → cancelled

Toute autre transition est invalide.

4\. VALUE OBJECTS

4.1. ContextPackId

Chaîne non vide, opaque et immuable.  
Format recommandé : UUID v4 ou UUID v7.

4.2. Objective

Contraintes :  
• trim automatique ;  
• minimum 10 caractères ;  
• maximum 500 caractères ;  
• aucune chaîne vide ;  
• conservé tel qu’exprimé par l’utilisateur après normalisation minimale.

4.3. RelativePath

Contraintes :  
• jamais absolu ;  
• séparateurs normalisés en slash ;  
• aucun segment .. sortant du projet ;  
• aucune chaîne vide ;  
• insensible à la plateforme dans les exports.

4.4. TokenLimit

Entier positif.  
Valeurs recommandées :  
• small : 20 000 ;  
• medium : 60 000 ;  
• large : 120 000 ;  
• custom : valeur fournie.

4.5. FileSize

Entier positif ou nul exprimé en octets.

4.6. EstimatedTokenCount

Entier positif ou nul. Il s’agit d’une estimation, jamais d’une garantie exacte.

4.7. ProfileId

Valeurs V1 :  
• ai-general ;  
• code-review ;  
• documentation ;  
• onboarding ;  
• ui-ux ;  
• custom.

4.8. SecuritySeverity

Valeurs : low, medium, high, critical.

4.9. GenerationProgress

Valeur comprise entre 0 et 100, accompagnée d’une phase et d’un message utilisateur.

5\. ENTITÉS ET STRUCTURES MÉTIER

5.1. ProjectDescriptor

Champs :  
• name ;  
• rootPath interne ;  
• workspaceKind ;  
• platform ;  
• detectedLanguages ;  
• selectedPaths ;  
• configurationSource.

Invariants :  
• rootPath existe ;  
• selectedPaths appartiennent au projet ;  
• name n’est pas vide.

5.2. SourceFile

Champs :  
• id ;  
• relativePath ;  
• absolutePath interne ;  
• extension ;  
• sizeInBytes ;  
• lineCount optionnel ;  
• encoding ;  
• contentKind ;  
• hash optionnel ;  
• discoveredAt.

contentKind : text, binary, unknown.

5.3. SecurityFinding

Champs :  
• ruleId ;  
• kind ;  
• severity ;  
• relativePath ;  
• message ;  
• maskedEvidence optionnel ;  
• lineNumber optionnel.

Kinds V1 :  
• sensitive-file-name ;  
• sensitive-extension ;  
• private-key ;  
• api-key ;  
• token ;  
• password ;  
• connection-string ;  
• credential-object ;  
• suspicious-secret-pattern.

5.4. PackVolume

Champs :  
• index ;  
• outputFileName ;  
• files ;  
• estimatedTokens ;  
• estimatedBytes ;  
• heading ;  
• orderKey.

Invariants :  
• index commence à 1 ;  
• outputFileName est unique ;  
• files n’est pas vide ;  
• estimatedTokens respecte la limite ;  
• ordre stable.

6\. UNION DISCRIMINÉE FILEDECISION

La décision finale d’un fichier doit être représentée par une union discriminée.

IncludedFileDecision  
• status: included ;  
• file ;  
• estimatedTokens ;  
• category ;  
• priority ;  
• warnings éventuels.

ExcludedFileDecision  
• status: excluded ;  
• file ;  
• reasonCode ;  
• reason ;  
• ruleId optionnel.

BlockedFileDecision  
• status: blocked ;  
• file ;  
• reasonCode ;  
• reason ;  
• findings ;  
• highestSeverity.

OversizedFileDecision  
• status: oversized ;  
• file ;  
• estimatedTokens ;  
• configuredLimit ;  
• recommendation.

FailedFileDecision  
• status: failed ;  
• relativePath ;  
• errorCode ;  
• message ;  
• recoverable.

Reason codes V1 :  
• ignored-directory ;  
• ignored-by-gitignore ;  
• ignored-by-contextforgeignore ;  
• unsupported-extension ;  
• binary-file ;  
• sensitive-file-name ;  
• sensitive-extension ;  
• secret-detected ;  
• too-large ;  
• unreadable ;  
• invalid-encoding ;  
• outside-workspace ;  
• symbolic-link ;  
• duplicate ;  
• cancelled.

7\. CONTEXT PACK REQUEST

Contrat d’entrée principal :

ContextPackRequest  
• projectRoot: string ;  
• objective: string ;  
• profile: ProfileId ;  
• selectedPaths: string\[\] ;  
• tokenLimit: number ;  
• customIncludes?: string\[\] ;  
• customExcludes?: string\[\] ;  
• outputDirectory?: string ;  
• securityMode?: strict | balanced ;  
• previewOnly?: boolean.

Règles :  
• objective obligatoire ;  
• selectedPaths contient au moins un élément ;  
• tokenLimit positif ;  
• tous les chemins restent dans projectRoot ;  
• outputDirectory reste dans projectRoot en V1 ;  
• securityMode vaut strict par défaut.

8\. CONTEXT PACK PREVIEW

ContextPackPreview  
• previewId ;  
• requestFingerprint ;  
• project ;  
• objective ;  
• profile ;  
• decisions ;  
• includedCount ;  
• excludedCount ;  
• blockedCount ;  
• oversizedCount ;  
• failedCount ;  
• estimatedTokens ;  
• estimatedBytes ;  
• estimatedVolumes ;  
• warnings ;  
• requiresConfirmation ;  
• createdAt.

Le preview ne crée aucun fichier final.

Le requestFingerprint permet de vérifier que la génération finale correspond exactement à la prévisualisation confirmée.

9\. CONTEXT PACK RESULT

ContextPackResult  
• packId ;  
• status ;  
• outputDirectory ;  
• readmePath ;  
• manifestPath ;  
• volumePaths ;  
• includedFilesPath ;  
• exclusionsPath ;  
• warningsPath ;  
• includedCount ;  
• blockedCount ;  
• estimatedTokens ;  
• generatedAt ;  
• durationMs ;  
• warnings.

Aucun chemin absolu ne doit être exporté dans les fichiers générés. Les chemins internes retournés à l’interface peuvent être absolus, mais ne doivent pas être sérialisés dans le manifeste public.

10\. PROFILS MÉTIER

10.1. ai-general

Priorités : docs, architecture, contrats, code central, tests ciblés.  
Sortie : contexte général pour agent IA.

10.2. code-review

Priorités : fichiers modifiés, tests, conventions, règles métier, erreurs et risques.

10.3. documentation

Priorités : README, docs, architecture, structure, conventions et index.

10.4. onboarding

Priorités : installation, commandes, architecture, dossiers, principes et documents essentiels.

10.5. ui-ux

Priorités : rôles, permissions, parcours, données, formulaires, validations, API, erreurs, états d’écran et composants existants.

10.6. custom

Le profil custom n’applique aucune priorité forte hors sécurité et règles globales.

11\. PORTS DU CORE

11.1. FileDiscoveryPort

Responsabilité : découvrir les fichiers candidats.  
Méthode : discover(request, configuration, cancellation): Promise\<SourceFile\[\]\>.

11.2. FileContentReaderPort

Responsabilité : lire un fichier sous limite contrôlée.  
Méthode : read(file, options): Promise\<ReadFileResult\>.

11.3. SecurityScannerPort

Responsabilité : analyser un fichier et produire des findings.  
Méthode : scan(file, content?): Promise\<SecurityFinding\[\]\>.

11.4. SizingPort

Responsabilité : calculer les métriques.  
Méthodes : estimateFile(content), estimateAggregate(files).

11.5. PackingPort

Responsabilité : répartir les fichiers inclus dans des volumes.  
Méthode : pack(includedFiles, tokenLimit, profile): PackVolume\[\].

11.6. ContextPackWriterPort

Responsabilité : écrire atomiquement les sorties.  
Méthodes : writeTemporary, validateTemporary, commit, rollback.

11.7. ConfigurationPort

Responsabilité : fournir la configuration effective et sa provenance.

11.8. ProfileRegistryPort

Responsabilité : lister et résoudre les profils.

11.9. ClockPort

Responsabilité : fournir la date actuelle.

11.10. IdGeneratorPort

Responsabilité : générer packId et previewId.

11.11. ProgressReporterPort

Responsabilité : publier les phases et pourcentages.

11.12. CancellationPort

Responsabilité : signaler l’annulation sans dépendre de VS Code.

11.13. LastPackRegistryPort

Responsabilité : mémoriser localement le dernier paquet généré pour OpenLastContextPack.

12\. CAS D’USAGE 1 — PREPARECONTEXTPACKPREVIEW

Objectif : produire une prévisualisation complète sans écrire les sorties finales.

Entrée : ContextPackRequest.

Étapes :  
1\. valider la requête ;  
2\. charger la configuration ;  
3\. résoudre le profil ;  
4\. normaliser les chemins ;  
5\. découvrir les fichiers ;  
6\. appliquer exclusions structurelles ;  
7\. bloquer les fichiers sensibles par nom et extension ;  
8\. lire les fichiers autorisés sous limite ;  
9\. analyser le contenu ;  
10\. créer une décision pour chaque fichier ;  
11\. estimer les tokens ;  
12\. simuler le découpage ;  
13\. produire ContextPackPreview.

Sortie : ContextPackPreview.

Critères d’acceptation :  
• aucun fichier final n’est écrit ;  
• chaque candidat reçoit une décision ;  
• les secrets ne sont jamais exposés ;  
• les totaux sont cohérents ;  
• la progression est publiée ;  
• l’annulation est respectée.

13\. CAS D’USAGE 2 — GENERATECONTEXTPACK

Objectif : générer le paquet final après confirmation.

Entrée :  
• ContextPackRequest ;  
• previewId ;  
• requestFingerprint confirmé.

Précondition : le preview existe et correspond à la requête.

Étapes :  
1\. vérifier le fingerprint ;  
2\. revalider les sources nécessaires ;  
3\. construire les volumes ;  
4\. générer README, volumes, manifeste et rapports ;  
5\. écrire dans le dossier temporaire ;  
6\. exécuter les contrôles finaux ;  
7\. commit atomique ;  
8\. mémoriser le dernier paquet ;  
9\. retourner ContextPackResult.

Critères d’acceptation :  
• aucun fichier bloqué dans les sorties ;  
• limites respectées ;  
• manifeste cohérent ;  
• rollback en cas d’échec ;  
• aucun paquet partiel présenté comme réussi.

14\. CAS D’USAGE 3 — INSPECTPROJECTSOURCES

Objectif : explorer le projet sans préparer immédiatement un paquet.

Entrée : projectRoot et selectedPaths optionnels.

Sortie :  
• structure de dossiers ;  
• extensions détectées ;  
• langues probables ;  
• nombre de fichiers ;  
• taille estimée ;  
• dossiers ignorés ;  
• risques de sécurité évidents ;  
• suggestions de profils.

Ce cas d’usage ne lit pas profondément tous les contenus par défaut.

15\. CAS D’USAGE 4 — VALIDATECONTEXTFORGECONFIGURATION

Objectif : vérifier la configuration avant génération.

Entrées possibles :  
• paramètres VS Code ;  
• options CLI ;  
• .contextforge.json ;  
• .contextforge.yaml.

Sortie :  
• valid ;  
• errors ;  
• warnings ;  
• effectiveConfiguration ;  
• provenance par propriété.

Critères :  
• erreurs localisées ;  
• aucune valeur invalide silencieusement ignorée ;  
• priorités de configuration respectées.

16\. CAS D’USAGE 5 — LISTAVAILABLEPROFILES

Objectif : fournir la liste des profils disponibles.

Sortie par profil :  
• id ;  
• nom ;  
• description ;  
• limite par défaut ;  
• dossiers suggérés ;  
• extensions prioritaires ;  
• catégories de sortie.

17\. CAS D’USAGE 6 — OPENLASTCONTEXTPACK

Objectif : ouvrir le dernier paquet généré depuis l’interface.

Entrée : projectRoot.

Sortie : chemin du dernier paquet valide.

Règles :  
• ne jamais ouvrir un chemin hors du projet ;  
• vérifier l’existence du dossier ;  
• nettoyer la référence si elle est obsolète ;  
• ne contient aucune logique métier de génération.

18\. CAS D’USAGE 7 — CANCELCONTEXTPACKGENERATION

Objectif : interrompre proprement un scan ou une génération.

Règles :  
• l’annulation est coopérative ;  
• les lectures en cours se terminent ou s’arrêtent selon capacité ;  
• aucun paquet incomplet n’est commité ;  
• le dossier temporaire est supprimé ;  
• le statut final vaut cancelled.

19\. DTO D’ENTRÉE ET DE SORTIE

Les DTO exposés aux apps ne doivent jamais contenir d’objets spécifiques à VS Code.

DTO principaux :  
• PrepareContextPackPreviewInput ;  
• PrepareContextPackPreviewOutput ;  
• GenerateContextPackInput ;  
• GenerateContextPackOutput ;  
• InspectProjectSourcesInput ;  
• InspectProjectSourcesOutput ;  
• ValidateConfigurationInput ;  
• ValidateConfigurationOutput ;  
• ListProfilesOutput ;  
• OpenLastPackOutput.

Tous les DTO sont sérialisables en JSON.

20\. SCHÉMAS ZOD

Schémas obligatoires :  
• ObjectiveSchema ;  
• RelativePathSchema ;  
• TokenLimitSchema ;  
• ProfileIdSchema ;  
• SecurityModeSchema ;  
• ContextPackRequestSchema ;  
• ContextForgeConfigurationSchema ;  
• ContextPackManifestSchema ;  
• ProfileDefinitionSchema ;  
• FileDecisionSchema ;  
• SecurityFindingSchema.

Règles de validation :  
• parse aux frontières ;  
• pas de donnée non validée dans le core ;  
• erreurs transformées en ValidationError ;  
• manifest relu et revalidé après génération.

21\. ERREURS MÉTIER ET APPLICATIVES

ValidationError : entrée invalide.  
ConfigurationError : configuration invalide ou contradictoire.  
ProjectNotFoundError : projet introuvable.  
PathOutsideWorkspaceError : chemin sortant du projet.  
ScanError : échec global de découverte.  
FileReadError : fichier illisible.  
UnsupportedEncodingError : encodage non pris en charge.  
SecurityViolationError : violation empêchant la génération.  
PackingError : impossible de respecter les limites.  
GenerationError : échec d’écriture.  
OutputValidationError : sorties générées incohérentes.  
PreviewMismatchError : requête différente du preview confirmé.  
CancellationError : opération annulée.  
LastPackNotFoundError : aucun paquet récent valide.

Chaque erreur possède :  
• code stable ;  
• message utilisateur ;  
• cause interne optionnelle ;  
• recoverable ;  
• metadata sans secret.

22\. ÉVÉNEMENTS INTERNES

ProjectInspectionStarted  
ProjectInspectionCompleted  
ContextPackPreviewStarted  
ContextPackPreviewPrepared  
SensitiveFileBlocked  
OversizedFileDetected  
ContextPackGenerationStarted  
ContextPackVolumeWritten  
ContextPackGenerated  
ContextPackGenerationFailed  
ContextPackGenerationCancelled

Ces événements servent à la progression, aux logs locaux et aux tests. Ils ne sont pas publiés sur un réseau en V1.

23\. PROGRESSION OFFICIELLE

Phases :  
• validating ;  
• loading-configuration ;  
• discovering ;  
• filtering ;  
• reading ;  
• scanning-security ;  
• sizing ;  
• packing ;  
• generating ;  
• validating-output ;  
• committing ;  
• completed ;  
• cancelled ;  
• failed.

Chaque événement de progression contient :  
• phase ;  
• percent ;  
• message ;  
• currentItem optionnel ;  
• processed ;  
• total optionnel.

24\. INVARIANTS DE SÉCURITÉ

1\. .env et variantes sont bloqués même si l’utilisateur les sélectionne manuellement.  
2\. les clés privées sont toujours bloquées.  
3\. les preuves de secret sont masquées.  
4\. aucun contenu sensible n’apparaît dans les logs.  
5\. aucun chemin absolu n’apparaît dans les exports.  
6\. les liens symboliques sont ignorés par défaut.  
7\. aucun fichier hors workspace n’est lu.  
8\. .contextforge est toujours exclu du scan.  
9\. un fichier critical est bloqué sans option de contournement en V1.  
10\. le manifeste ne contient jamais la valeur d’un secret.

25\. INVARIANTS DE TAILLE ET DE DÉCOUPAGE

1\. un volume respecte la limite ;  
2\. un fichier n’est pas divisé silencieusement ;  
3\. un fichier trop grand est classé oversized ;  
4\. l’ordre des volumes est stable ;  
5\. le même jeu de fichiers produit le même découpage à configuration identique ;  
6\. la somme des fichiers inclus correspond aux fichiers présents dans les volumes.

26\. INVARIANTS DE TRAÇABILITÉ

1\. chaque fichier candidat possède une décision ;  
2\. chaque exclusion possède une raison ;  
3\. chaque blocage possède au moins un finding ou une règle explicite ;  
4\. chaque volume est référencé dans le manifeste ;  
5\. la version du schéma et de ContextForge est enregistrée ;  
6\. le fingerprint du preview est conservé jusqu’à la génération.

27\. MANIFESTE JSON

Champs obligatoires :  
• schemaVersion ;  
• contextForgeVersion ;  
• packId ;  
• name ;  
• objective ;  
• profile ;  
• projectName ;  
• generatedAt ;  
• estimationStrategy ;  
• limits ;  
• includedFiles ;  
• excludedFiles ;  
• blockedFiles ;  
• oversizedFiles ;  
• failedFiles ;  
• volumes ;  
• warnings ;  
• securitySummary ;  
• outputFiles.

Le manifeste est validé par Zod après écriture.

28\. CATÉGORIES DE FICHIERS

Catégories V1 :  
• product ;  
• business ;  
• architecture ;  
• contracts ;  
• application ;  
• domain ;  
• interfaces ;  
• infrastructure ;  
• configuration ;  
• tests ;  
• ui ;  
• ux ;  
• documentation ;  
• other.

La catégorisation V1 repose sur chemins, extensions et profil. Elle n’est pas une analyse sémantique complète.

29\. RÈGLES DU PROFIL UI/UX

Le profil ui-ux cherche à produire un contexte exploitable par un designer ou un agent connecté à Figma.

Il privilégie :  
• objectifs produit ;  
• rôles ;  
• permissions ;  
• parcours ;  
• règles métier ;  
• modèles de données ;  
• endpoints ;  
• formulaires ;  
• validations ;  
• erreurs ;  
• états loading, empty, error, success ;  
• composants existants.

Il ne crée pas lui-même de frame Figma en V1.

30\. CARTOGRAPHIE FICHIER PAR FICHIER — CONTRACTS

packages/contracts/src/  
├── ids/context-pack-id.ts  
├── value-objects/objective.ts  
├── value-objects/relative-path.ts  
├── value-objects/token-limit.ts  
├── enums/profile-id.ts  
├── enums/security-severity.ts  
├── enums/context-pack-status.ts  
├── models/project-descriptor.ts  
├── models/source-file.ts  
├── models/security-finding.ts  
├── models/file-decision.ts  
├── models/context-pack-preview.ts  
├── models/pack-volume.ts  
├── models/context-pack-manifest.ts  
├── models/context-pack-result.ts  
├── dto/prepare-preview.dto.ts  
├── dto/generate-pack.dto.ts  
├── dto/inspect-project.dto.ts  
├── dto/validate-configuration.dto.ts  
├── schemas/context-pack-request.schema.ts  
├── schemas/context-pack-manifest.schema.ts  
├── schemas/configuration.schema.ts  
├── errors/contextforge-error.ts  
├── errors/error-codes.ts  
└── index.ts

31\. CARTOGRAPHIE FICHIER PAR FICHIER — CORE

packages/core/src/  
├── use-cases/prepare-context-pack-preview.ts  
├── use-cases/generate-context-pack.ts  
├── use-cases/inspect-project-sources.ts  
├── use-cases/validate-contextforge-configuration.ts  
├── use-cases/list-available-profiles.ts  
├── use-cases/open-last-context-pack.ts  
├── use-cases/cancel-context-pack-generation.ts  
├── domain/context-pack.ts  
├── domain/context-pack-state-machine.ts  
├── services/file-decision-service.ts  
├── services/request-fingerprint-service.ts  
├── services/output-validation-service.ts  
├── ports/file-discovery.port.ts  
├── ports/file-content-reader.port.ts  
├── ports/security-scanner.port.ts  
├── ports/sizing.port.ts  
├── ports/packing.port.ts  
├── ports/context-pack-writer.port.ts  
├── ports/configuration.port.ts  
├── ports/profile-registry.port.ts  
├── ports/clock.port.ts  
├── ports/id-generator.port.ts  
├── ports/progress-reporter.port.ts  
├── ports/cancellation.port.ts  
├── ports/last-pack-registry.port.ts  
└── index.ts

32\. TESTS MINIMAUX OBLIGATOIRES

Pour Objective : vide, trop court, trop long, trim.  
Pour RelativePath : absolu, traversal, normalisation Windows/Linux.  
Pour FileDecision : unicité et cohérence des variantes.  
Pour PreparePreview : tous les candidats ont une décision.  
Pour GeneratePack : mismatch de fingerprint refusé.  
Pour sécurité : .env, clé privée, token, chemin absolu.  
Pour packing : limite respectée, ordre stable, oversized.  
Pour manifeste : validation post-écriture.  
Pour annulation : aucun commit final.  
Pour erreurs : aucun secret dans metadata.

33\. CRITÈRES DE SORTIE DU DOCUMENT 03

Cette spécification est considérée prête lorsque :  
• tous les types principaux sont définis ;  
• les ports sont stables ;  
• les cas d’usage ont leurs entrées, sorties et critères ;  
• les invariants sont explicites ;  
• les erreurs ont des codes stables ;  
• les fichiers du package contracts et core sont cartographiés ;  
• les tests minimaux sont listés.

34\. DÉCISIONS VERROUILLÉES

• ContextPack est l’agrégat principal.  
• FileDecision est une union discriminée.  
• les entrées sont validées par Zod.  
• le preview précède toujours la génération finale.  
• la génération finale exige un fingerprint correspondant.  
• les ports du core sont indépendants de VS Code.  
• les erreurs sont structurées et sans secret.  
• les événements internes restent locaux.  
• les chemins exportés sont relatifs.  
• aucun fichier critical ne peut être inclus en V1.

35\. PROCHAINE ÉTAPE

Le prochain document officiel sera :

04 — Plan d’implémentation premium, fichier par fichier, de ContextForge V1

Il donnera l’ordre exact de création, les dépendances de chaque fichier, les signatures, les tests associés, les scripts, les commandes pnpm, les pipelines CI et les critères de validation de chaque phase.

FIN DE LA SPÉCIFICATION  
