CONTEXTFORGE  
11 — Pack de démarrage Codex : prompts d’implémentation phase par phase pour ContextForge V1  
Version 1.0 — Spécification officielle

1\. OBJET DU DOCUMENT

Ce document transforme les spécifications 01 à 10 en instructions directement exploitables dans Codex. Chaque phase contient un prompt prêt à l’emploi, les fichiers autorisés, les fichiers interdits, les dépendances, les tests obligatoires, les commandes de validation et les conditions de sortie.

Règle fondamentale : un seul prompt de phase à la fois. Codex ne doit pas recevoir l’ensemble du projet en une seule demande.

2\. RÈGLES GÉNÉRALES À PLACER AU DÉBUT DE CHAQUE PROMPT

Tu travailles sur ContextForge V1, extension VS Code locale et offline-first destinée à transformer une sélection de fichiers d’un projet en Context Pack structuré, sécurisé et traçable.

Contraintes absolues :  
• ne modifie jamais les fichiers sources du projet analysé ;  
• aucun accès réseau ;  
• aucun SDK cloud ;  
• aucune base de données ;  
• aucune IA embarquée ;  
• aucune logique métier dans apps/cli ou apps/vscode-extension ;  
• TypeScript strict ;  
• tests obligatoires ;  
• aucun any injustifié ;  
• aucun secret réel dans les fixtures ;  
• ne supprime aucun test pour faire passer la CI ;  
• ne change pas l’architecture sans ADR explicite ;  
• ne touche qu’aux fichiers autorisés pour cette phase.

Avant toute modification :  
1\. inspecte le dépôt ;  
2\. résume l’état actuel ;  
3\. liste les fichiers que tu vas créer ou modifier ;  
4\. signale toute contradiction avec les spécifications ;  
5\. attends une décision uniquement si un blocage architectural réel existe.

Après modification :  
1\. exécute les commandes de validation ;  
2\. corrige les erreurs ;  
3\. donne la liste exacte des fichiers modifiés ;  
4\. résume les tests ajoutés ;  
5\. signale honnêtement ce qui reste incomplet.

3\. PROMPT PHASE 0 — INITIALISATION DU MONOREPO

Objectif : créer le squelette compilable de ContextForge.

Prompt Codex :

« Initialise le monorepo ContextForge selon les décisions officielles.

Crée :  
• package.json racine ;  
• pnpm-workspace.yaml ;  
• turbo.json ;  
• tsconfig.base.json ;  
• biome.json ;  
• vitest.workspace.ts ;  
• .gitignore ;  
• .gitattributes ;  
• .editorconfig ;  
• README.md ;  
• LICENSE ;  
• CHANGELOG.md ;  
• apps/cli ;  
• apps/vscode-extension ;  
• packages/contracts ;  
• packages/core ;  
• packages/scanner ;  
• packages/security ;  
• packages/sizing ;  
• packages/packer ;  
• packages/generators ;  
• packages/profiles ;  
• packages/configuration ;  
• packages/shared ;  
• docs ;  
• fixtures ;  
• scripts ;  
• .github/workflows.

Configure TypeScript strict, pnpm workspaces, Turborepo, Biome et Vitest.

Ajoute les scripts racine : build, dev, test, test:unit, test:integration, test:security, typecheck, lint, format, clean, package:extension, validate:architecture.

Ne crée encore aucune logique métier.

Critères : pnpm install, pnpm typecheck, pnpm lint et pnpm test doivent s’exécuter avec succès. »

Fichiers interdits : toute implémentation métier.

Validation :  
pnpm install  
pnpm typecheck  
pnpm lint  
pnpm test

4\. PROMPT PHASE 1 — CONTRACTS ET VALUE OBJECTS

Objectif : définir les contrats publics.

Prompt Codex :

« Implémente exclusivement packages/contracts.

Crée :  
• ids/context-pack-id.ts ;  
• value-objects/objective.ts ;  
• value-objects/relative-path.ts ;  
• value-objects/token-limit.ts ;  
• enums/profile-id.ts ;  
• enums/security-severity.ts ;  
• enums/context-pack-status.ts ;  
• enums/file-content-kind.ts ;  
• enums/generation-phase.ts ;  
• enums/reason-code.ts ;  
• models/project-descriptor.ts ;  
• models/source-file.ts ;  
• models/security-finding.ts ;  
• models/file-decision.ts ;  
• models/context-pack-preview.ts ;  
• models/pack-volume.ts ;  
• models/context-pack-manifest.ts ;  
• models/context-pack-result.ts ;  
• models/generation-progress.ts ;  
• dto nécessaires ;  
• schémas Zod ;  
• index.ts.

Contraintes :  
• aucune dépendance à fs, path, vscode ou commander ;  
• FileDecision est une union discriminée ;  
• RelativePath refuse les chemins absolus et traversal ;  
• Objective applique trim et longueur 10–500 ;  
• tous les schémas critiques sont testés ;  
• aucun any.

Ajoute les tests unitaires complets. »

Validation :  
pnpm \--filter @contextforge/contracts typecheck  
pnpm \--filter @contextforge/contracts test

5\. PROMPT PHASE 2 — PORTS, ERREURS ET AGRÉGAT CORE

Objectif : implémenter le domaine sans technique.

Prompt Codex :

« Implémente dans packages/core uniquement :  
• ContextForgeError et codes stables ;  
• agrégat ContextPack ;  
• machine d’état ;  
• ports du Core ;  
• tests des invariants.

Ports obligatoires : FileDiscoveryPort, FileContentReaderPort, SecurityScannerPort, SizingPort, PackingPort, ContextPackWriterPort, ConfigurationPort, ProfileRegistryPort, ClockPort, IdGeneratorPort, ProgressReporterPort, CancellationPort, LastPackRegistryPort.

Contraintes :  
• aucune implémentation Node ou VS Code ;  
• aucun import de vscode, fs ou commander ;  
• un fichier blocked ne peut jamais être included ;  
• generated impossible sans volumes valides ;  
• erreurs sérialisables et sans secret.

Ajoute des tests pour toutes les transitions valides et invalides. »

Validation :  
pnpm \--filter @contextforge/core typecheck  
pnpm \--filter @contextforge/core test

6\. PROMPT PHASE 3 — SCANNER LOCAL SÉCURISÉ

Objectif : découvrir les fichiers sans sortir du workspace.

Prompt Codex :

« Implémente packages/scanner avec fast-glob, ignore et picomatch.

Crée :  
• node-file-discovery.adapter.ts ;  
• node-file-content-reader.adapter.ts ;  
• path-normalizer.ts ;  
• gitignore-loader.ts ;  
• contextforge-ignore-loader.ts ;  
• default-exclusions.ts ;  
• file-kind-detector.ts ;  
• encoding-detector.ts ;  
• symlink-policy.ts ;  
• index.ts.

Contraintes :  
• followSymlinks false ;  
• realpath et vérification de parenté ;  
• chemins relatifs uniquement ;  
• node\_modules, .git, dist, build, coverage, out et .contextforge exclus ;  
• lecture plafonnée ;  
• UTF-8 prioritaire ;  
• fichiers binaires classés sans lecture complète ;  
• aucune décision de sécurité par contenu dans ce package.

Ajoute des fixtures et tests Windows/POSIX, traversal, symlink, .gitignore et .contextforgeignore. »

Validation :  
pnpm \--filter @contextforge/scanner test  
pnpm test:integration

7\. PROMPT PHASE 4 — MOTEUR DE SÉCURITÉ

Objectif : bloquer secrets et fichiers sensibles.

Prompt Codex :

« Implémente packages/security.

Crée :  
• default-sensitive-file-rules.ts ;  
• default-sensitive-extension-rules.ts ;  
• default-secret-patterns.ts ;  
• security-rule.ts ;  
• security-scanner.ts ;  
• evidence-masker.ts ;  
• redaction-policy.ts ;  
• severity-policy.ts ;  
• security-summary.ts ;  
• index.ts.

Contraintes :  
• .env et variantes bloqués ;  
• .pem, .key, .p12, .pfx, .jks bloqués ;  
• private keys, API keys, tokens, passwords et connection strings détectés ;  
• critical non contournable ;  
• aucun secret brut dans SecurityFinding, logs ou rapports ;  
• regex bornées et testées contre ReDoS ;  
• secrets de tests uniquement factices.

Ajoute tests unitaires, négatifs, property-based et offensifs minimaux. »

Validation :  
pnpm \--filter @contextforge/security test  
pnpm test:security  
pnpm gitleaks

8\. PROMPT PHASE 5 — SIZING ET PACKING

Objectif : estimer et découper.

Prompt Codex :

« Implémente packages/sizing et packages/packer.

Sizing :  
• character-token-estimator.ts ;  
• file-metrics-calculator.ts ;  
• aggregate-metrics-calculator.ts ;  
• sizing-strategy.ts.

Packer :  
• stable-file-sorter.ts ;  
• profile-priority-resolver.ts ;  
• volume-packer.ts ;  
• oversized-file-policy.ts ;  
• packing-validator.ts.

Règles :  
• stratégie V1 \= caractères / 4 ;  
• first-fit stable ;  
• aucun fichier coupé silencieusement ;  
• oversized explicite ;  
• aucun blocked accepté ;  
• même entrée \= même résultat ;  
• aucune limite dépassée.

Ajoute tests unitaires et property-based. »

Validation :  
pnpm \--filter @contextforge/sizing test  
pnpm \--filter @contextforge/packer test

9\. PROMPT PHASE 6 — PROFILS ET CONFIGURATION

Objectif : créer les profils officiels et la configuration fusionnée.

Prompt Codex :

« Implémente packages/profiles et packages/configuration.

Profils : ai-general, code-review, documentation, onboarding, ui-ux, custom.

Configuration :  
• valeurs par défaut ;  
• JSON ;  
• YAML ;  
• merger ;  
• validator ;  
• provenance.

Priorité : options explicites \> interface/CLI \> variables d’environnement autorisées \> fichier projet \> défauts.

Contraintes :  
• aucune option ne désactive un blocage critical ;  
• JSON et YAML équivalents ;  
• profil UI/UX priorise rôles, permissions, parcours, formulaires, validations, API, erreurs, pages et composants ;  
• validation Zod aux frontières.

Ajoute tests de priorité, conflits, provenance et invalidité. »

Validation :  
pnpm \--filter @contextforge/profiles test  
pnpm \--filter @contextforge/configuration test

10\. PROMPT PHASE 7 — PREVIEW CORE

Objectif : produire ContextPackPreview sans sortie finale.

Prompt Codex :

« Implémente dans packages/core :  
• file-decision-service.ts ;  
• request-fingerprint-service.ts ;  
• project-inspection-service.ts ;  
• prepare-context-pack-preview.ts ;  
• inspect-project-sources.ts ;  
• validate-contextforge-configuration.ts ;  
• list-available-profiles.ts.

Ordre obligatoire : validation, configuration, profil, normalisation, scan, exclusions, blocage nom/extension, lecture, scan contenu, décision, sizing, simulation packing, preview.

Contraintes :  
• aucun fichier final écrit ;  
• chaque candidat reçoit exactement une décision ;  
• preview sérialisable ;  
• fingerprint stable ;  
• progression et annulation ;  
• aucun secret dans les erreurs.

Ajoute tests d’intégration avec fakes et fixtures. »

Validation :  
pnpm \--filter @contextforge/core test  
pnpm test:integration

11\. PROMPT PHASE 8 — GENERATORS ET GÉNÉRATION ATOMIQUE

Objectif : produire les sorties officielles.

Prompt Codex :

« Implémente packages/generators et le cas d’usage GenerateContextPack.

Crée :  
• readme.generator.ts ;  
• context-volume.generator.ts ;  
• manifest.generator.ts ;  
• included-files.generator.ts ;  
• exclusions.generator.ts ;  
• warnings.generator.ts ;  
• ui-ux-output.generator.ts ;  
• markdown-language-resolver.ts ;  
• output-directory-namer.ts ;  
• atomic-context-pack-writer.ts ;  
• output-validator.ts.

Règles :  
• écriture dans .contextforge/.tmp/\<pack-id\> ;  
• validation complète avant commit ;  
• rollback sur toute erreur ;  
• chemins relatifs uniquement ;  
• manifest validé par Zod ;  
• aucun blocked dans les volumes ;  
• aucun secret brut ;  
• fichiers Markdown bien fermés ;  
• déterminisme hors packId et generatedAt.

Implémente aussi open-last et cancel-generation. »

Validation :  
pnpm \--filter @contextforge/generators test  
pnpm test:integration  
pnpm test:security

12\. PROMPT PHASE 9 — CLI

Objectif : livrer le premier produit exécutable.

Prompt Codex :

« Implémente apps/cli avec commander, @inquirer/prompts et ora.

Commandes : init, inspect, preview, generate, validate, profiles, open-last, version.

Contraintes :  
• composition-root central ;  
• aucune logique métier dans commands ;  
• JSON pur sur stdout avec \--format json ;  
• diagnostics sur stderr ;  
• mode non interactif sans question ;  
• ora uniquement en TTY ;  
• Ctrl+C coopératif, code 130 ;  
• codes de sortie stables ;  
• aucun secret dans stdout/stderr ;  
• aucune commande shell dynamique.

Ajoute les tests CLI et un vertical slice complet sur safe-project et project-with-secrets. »

Validation :  
pnpm \--filter @contextforge/cli build  
pnpm \--filter @contextforge/cli test  
pnpm contextforge inspect fixtures/safe-project  
pnpm contextforge preview fixtures/safe-project \--objective "Prepare a general project context" \--profile ai-general

13\. PROMPT PHASE 10 — EXTENSION VS CODE

Objectif : livrer l’interface principale.

Prompt Codex :

« Implémente apps/vscode-extension.

Commandes :  
• contextForge.generateContextPack ;  
• contextForge.previewContextPack ;  
• contextForge.validateConfiguration ;  
• contextForge.openLastContextPack.

Flux : workspace, objectif, profil, sources, limite, preview, confirmation, progression, résultat.

Utilise les composants natifs VS Code en priorité. Webview uniquement pour le panneau de preview si nécessaire.

Contraintes :  
• aucune logique de scan, sécurité, sizing, packing ou génération dans l’extension ;  
• délégation totale au Core ;  
• annulation ;  
• accessibilité clavier ;  
• thèmes clair et sombre ;  
• aucune couleur codée en dur ;  
• CSP stricte pour toute webview ;  
• aucun eval ;  
• aucun réseau.

Ajoute tests @vscode/test-electron. »

Validation :  
pnpm \--filter @contextforge/vscode-extension build  
pnpm \--filter @contextforge/vscode-extension test  
pnpm package:extension

14\. PROMPT PHASE 11 — CI, SÉCURITÉ ET RELEASE

Objectif : rendre le produit publiable.

Prompt Codex :

« Implémente les workflows et scripts de qualité.

Crée :  
• .github/workflows/ci.yml ;  
• security.yml ;  
• cross-platform.yml ;  
• performance.yml ;  
• package-extension.yml ;  
• release.yml ;  
• scripts/benchmark.ts ;  
• scripts/verify-manifest.ts ;  
• scripts/verify-no-absolute-paths.ts ;  
• scripts/verify-vsix.ts ;  
• scripts/generate-checksum.ts ;  
• scripts/release-smoke-test.ts.

Gates : typecheck, Biome, unit, integration, security, architecture, build, Semgrep, Gitleaks, Trivy, .vsix.

Matrice : Windows 11, Ubuntu LTS, macOS récent.

Release : Semantic Versioning, changelog, checksum SHA-256, artefact .vsix, validation manuelle avant Marketplace.

Aucun merge si un gate obligatoire échoue. »

Validation :  
pnpm typecheck  
pnpm lint  
pnpm test  
pnpm test:security  
pnpm validate:architecture  
pnpm build  
pnpm package:extension

15\. PROMPT DE REVUE APRÈS CHAQUE PHASE

« Effectue une revue stricte de la phase terminée.

Vérifie :  
• conformité aux documents ContextForge 01 à 11 ;  
• fichiers modifiés uniquement dans le périmètre autorisé ;  
• aucune dépendance interdite ;  
• aucun secret ;  
• aucun any injustifié ;  
• aucun contournement de test ;  
• erreurs structurées ;  
• tests suffisants ;  
• commandes réellement exécutées ;  
• dette technique explicite.

Retourne :  
1\. verdict PASS ou FAIL ;  
2\. violations trouvées ;  
3\. correctifs nécessaires ;  
4\. risques résiduels ;  
5\. autorisation ou non de passer à la phase suivante. »

16\. PROMPT DE CORRECTION

« Corrige uniquement les violations listées dans la revue précédente.

Ne refactorise pas hors périmètre.  
Ne change pas les contrats publics sauf nécessité démontrée.  
Ajoute un test de non-régression pour chaque bug corrigé.  
Exécute toutes les validations de la phase et donne les résultats exacts. »

17\. PROMPT DE DIAGNOSTIC CI

« Analyse l’échec CI sans modifier le code immédiatement.

Donne :  
• job échoué ;  
• commande exacte ;  
• première cause racine probable ;  
• fichiers concernés ;  
• distinction entre erreur de code, test, environnement ou workflow ;  
• correctif minimal proposé ;  
• risques du correctif.

N’applique le correctif qu’après cette analyse. »

18\. PROMPT DE CONTRÔLE ARCHITECTURAL

« Vérifie la direction des dépendances :

apps/vscode-extension → core/contracts/configuration  
apps/cli → core/contracts/configuration  
core → contracts/ports  
scanner/security/sizing/packer/generators/profiles/configuration → contracts/shared selon leurs responsabilités

Refuse :  
• core → vscode ;  
• contracts → fs ;  
• security → extension ;  
• generators → CLI ;  
• logique métier dans apps ;  
• cycles.

Ajoute ou mets à jour les tests d’architecture si une violation n’est pas automatiquement détectée. »

19\. FORMAT DE COMPTE RENDU EXIGÉ DE CODEX

Pour chaque phase, Codex doit répondre avec :

A. État initial  
B. Plan exécuté  
C. Fichiers créés  
D. Fichiers modifiés  
E. Tests ajoutés  
F. Commandes exécutées  
G. Résultats  
H. Limites ou points non terminés  
I. Risques  
J. Recommandation pour la phase suivante

20\. CONDITIONS D’ARRÊT

Codex doit s’arrêter et signaler un blocage si :  
• une spécification se contredit réellement ;  
• une dépendance imposée est incompatible ;  
• un fichier critique existant devrait être supprimé ;  
• un changement de contrat public majeur est nécessaire ;  
• une règle de sécurité devrait être affaiblie ;  
• un test de sécurité ne peut être rendu vert sans contournement.

21\. CONDITIONS DE PASSAGE À LA PHASE SUIVANTE

• tous les tests de la phase passent ;  
• typecheck et lint verts ;  
• aucun secret ;  
• aucune violation d’architecture ;  
• Definition of Done satisfaite ;  
• compte rendu complet ;  
• revue PASS.

22\. PREMIER PROMPT À UTILISER

Le premier prompt à transmettre à Codex est celui de la PHASE 0 — INITIALISATION DU MONOREPO.

Il ne faut pas demander simultanément la création du scanner, de la sécurité ou de l’extension VS Code.

23\. DÉCISIONS VERROUILLÉES

• un prompt par phase ;  
• inspection avant modification ;  
• fichiers autorisés explicitement ;  
• tests obligatoires ;  
• rapport final structuré ;  
• revue avant phase suivante ;  
• aucun epic complet en une seule demande ;  
• aucun contournement de sécurité ;  
• aucune suppression de tests ;  
• aucun changement d’architecture sans ADR.

24\. PROCHAINE ÉTAPE

La documentation de conception V1 est désormais suffisamment complète pour démarrer l’implémentation.

Prochaine action opérationnelle :

1\. créer le dépôt ou dossier local ContextForge ;  
2\. ouvrir le projet dans VS Code ;  
3\. transmettre à Codex le prompt PHASE 0 ;  
4\. valider le squelette ;  
5\. avancer phase par phase.

FIN DU PACK DE DÉMARRAGE CODEX  
