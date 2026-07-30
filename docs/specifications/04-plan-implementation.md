CONTEXTFORGE  
04 — Plan d’implémentation premium, fichier par fichier, de ContextForge V1  
Version 1.0 — Spécification officielle

1\. OBJET DU DOCUMENT

Ce document définit l’ordre exact de réalisation de ContextForge V1. Il traduit les documents 01, 02 et 03 en plan d’exécution concret pour un développeur ou un agent de code. Il précise les phases, les fichiers à créer, leur rôle, leurs dépendances autorisées, leurs tests, les commandes, les critères de sortie et les interdictions.

Principe directeur : aucune phase ne commence tant que les critères de sortie de la phase précédente ne sont pas satisfaits.

2\. STRATÉGIE GÉNÉRALE D’IMPLÉMENTATION

L’implémentation suit cet ordre :

Phase 0 — Initialisation du monorepo  
Phase 1 — Contracts et value objects  
Phase 2 — Ports et erreurs du core  
Phase 3 — Scanner et système de fichiers  
Phase 4 — Sécurité  
Phase 5 — Sizing et packing  
Phase 6 — Prévisualisation  
Phase 7 — Génération atomique  
Phase 8 — CLI  
Phase 9 — Extension VS Code  
Phase 10 — Qualité, CI/CD et packaging  
Phase 11 — Validation V1

3\. PHASE 0 — INITIALISATION DU MONOREPO

Fichiers racine à créer :

package.json  
pnpm-workspace.yaml  
turbo.json  
tsconfig.base.json  
biome.json  
vitest.workspace.ts  
.gitignore  
.gitattributes  
.editorconfig  
README.md  
LICENSE  
CHANGELOG.md

Dossiers :

apps/cli  
apps/vscode-extension  
packages/contracts  
packages/core  
packages/scanner  
packages/security  
packages/sizing  
packages/packer  
packages/generators  
packages/profiles  
packages/configuration  
packages/shared  
docs  
fixtures  
scripts  
.github/workflows

Commandes initiales :

corepack enable  
pnpm init  
pnpm add \-D typescript turbo @biomejs/biome vitest @types/node

Scripts racine :

build  
dev  
test  
test:unit  
test:integration  
test:security  
typecheck  
lint  
format  
clean  
package:extension  
validate:architecture

Critères de sortie :  
• pnpm install fonctionne ;  
• pnpm typecheck s’exécute ;  
• pnpm lint s’exécute ;  
• chaque workspace est détecté ;  
• aucun package ne possède de dépendance circulaire.

4\. PHASE 1 — PACKAGE CONTRACTS

Objectif : définir tous les types publics avant la logique.

4.1. ids/context-pack-id.ts

Rôle : value object d’identité.  
Dépendances : aucune hors standard.  
Exports : ContextPackId, createContextPackId.  
Tests : valeur vide refusée, immutabilité, sérialisation.

4.2. value-objects/objective.ts

Rôle : objectif métier validé.  
Règles : trim, longueur 10 à 500\.  
Tests : vide, trop court, trop long, espace, valeur valide.

4.3. value-objects/relative-path.ts

Rôle : chemin exportable sécurisé.  
Règles : jamais absolu, normalisation slash, blocage traversal.  
Tests Windows et Linux obligatoires.

4.4. value-objects/token-limit.ts

Rôle : limite de contexte.  
Règles : entier positif, presets small/medium/large.

4.5. enums

profile-id.ts  
security-severity.ts  
context-pack-status.ts  
file-content-kind.ts  
generation-phase.ts  
reason-code.ts

4.6. models

project-descriptor.ts  
source-file.ts  
security-finding.ts  
file-decision.ts  
context-pack-preview.ts  
pack-volume.ts  
context-pack-manifest.ts  
context-pack-result.ts  
generation-progress.ts

4.7. schemas Zod

context-pack-request.schema.ts  
context-pack-manifest.schema.ts  
configuration.schema.ts  
profile-definition.schema.ts  
security-finding.schema.ts  
file-decision.schema.ts

Dépendances : zod uniquement.

Critères de sortie :  
• tous les contrats sont exportés par index.ts ;  
• aucune dépendance vers Node fs ou vscode ;  
• 100 % des schémas critiques testés ;  
• aucune propriété any.

5\. PHASE 2 — CORE : PORTS, ERREURS ET DOMAINE

Fichiers à créer :

packages/core/src/errors/contextforge-error.ts  
packages/core/src/errors/error-codes.ts  
packages/core/src/domain/context-pack.ts  
packages/core/src/domain/context-pack-state-machine.ts  
packages/core/src/ports/file-discovery.port.ts  
packages/core/src/ports/file-content-reader.port.ts  
packages/core/src/ports/security-scanner.port.ts  
packages/core/src/ports/sizing.port.ts  
packages/core/src/ports/packing.port.ts  
packages/core/src/ports/context-pack-writer.port.ts  
packages/core/src/ports/configuration.port.ts  
packages/core/src/ports/profile-registry.port.ts  
packages/core/src/ports/clock.port.ts  
packages/core/src/ports/id-generator.port.ts  
packages/core/src/ports/progress-reporter.port.ts  
packages/core/src/ports/cancellation.port.ts  
packages/core/src/ports/last-pack-registry.port.ts

Règles :  
• interfaces uniquement dans ports ;  
• aucune implémentation technique ;  
• aucune importation de vscode ;  
• erreurs avec code stable et metadata sans secret.

Tests :  
• transitions d’état valides et invalides ;  
• impossibilité de marquer generated sans volumes ;  
• impossibilité d’inclure un fichier blocked ;  
• erreurs sérialisables.

6\. PHASE 3 — SCANNER ET SYSTÈME DE FICHIERS

Dépendances : fast-glob, ignore, picomatch.

Fichiers :

packages/scanner/src/node-file-discovery.adapter.ts  
packages/scanner/src/node-file-content-reader.adapter.ts  
packages/scanner/src/path-normalizer.ts  
packages/scanner/src/gitignore-loader.ts  
packages/scanner/src/contextforge-ignore-loader.ts  
packages/scanner/src/default-exclusions.ts  
packages/scanner/src/file-kind-detector.ts  
packages/scanner/src/encoding-detector.ts  
packages/scanner/src/symlink-policy.ts  
packages/scanner/src/index.ts

Responsabilités :  
• découvrir sans suivre les symlinks ;  
• filtrer les gros dossiers avant lecture ;  
• produire des chemins relatifs ;  
• ne jamais sortir du workspace ;  
• lire sous limite ;  
• gérer UTF-8 en priorité.

Tests :  
• node\_modules ignoré ;  
• .git ignoré ;  
• .contextforge ignoré ;  
• .gitignore respecté ;  
• .contextforgeignore respecté ;  
• symlink ignoré ;  
• traversal refusé ;  
• multi-root sécurisé ;  
• fichier illisible transformé en FailedFileDecision.

7\. PHASE 4 — SÉCURITÉ

Fichiers :

packages/security/src/default-sensitive-file-rules.ts  
packages/security/src/default-sensitive-extension-rules.ts  
packages/security/src/default-secret-patterns.ts  
packages/security/src/security-rule.ts  
packages/security/src/security-scanner.ts  
packages/security/src/evidence-masker.ts  
packages/security/src/severity-policy.ts  
packages/security/src/security-summary.ts  
packages/security/src/index.ts

Règles obligatoires :  
• .env et variantes bloqués ;  
• .pem, .key, .p12, .pfx bloqués ;  
• private keys bloquées ;  
• tokens, passwords et connection strings détectés ;  
• aucune valeur brute dans finding, log ou rapport ;  
• critical non contournable en V1.

Tests :  
• clés API factices détectées ;  
• preuves masquées ;  
• faux positifs contrôlés ;  
• fichier sélectionné manuellement toujours bloqué ;  
• rapport final sans secret.

8\. PHASE 5 — SIZING ET PACKING

8.1. Package sizing

Fichiers :

character-token-estimator.ts  
file-metrics-calculator.ts  
aggregate-metrics-calculator.ts  
sizing-strategy.ts  
index.ts

Règle V1 : 1 token ≈ 4 caractères, stratégie injectable.

8.2. Package packer

Fichiers :

stable-file-sorter.ts  
profile-priority-resolver.ts  
volume-packer.ts  
oversized-file-policy.ts  
packing-validator.ts  
index.ts

Algorithme V1 : first-fit stable selon priorité métier et ordre déterministe.

Tests :  
• limite jamais dépassée ;  
• ordre stable ;  
• fichier entier conservé ;  
• oversized classé ;  
• même entrée, même résultat.

9\. PHASE 6 — PROFILS ET CONFIGURATION

9.1. Profiles

Fichiers :

ai-general.profile.ts  
code-review.profile.ts  
documentation.profile.ts  
onboarding.profile.ts  
ui-ux.profile.ts  
custom.profile.ts  
profile-registry.ts  
index.ts

Chaque profil définit :  
• id ;  
• nom ;  
• description ;  
• tokenLimit par défaut ;  
• dossiers suggérés ;  
• extensions prioritaires ;  
• catégories ;  
• ordre.

9.2. Configuration

Fichiers :

default-configuration.ts  
json-configuration-loader.ts  
yaml-configuration-loader.ts  
configuration-merger.ts  
configuration-validator.ts  
configuration-provenance.ts  
index.ts

Priorité : CLI/VS Code \> fichier projet \> valeurs par défaut.

Tests :  
• conflit correctement résolu ;  
• valeur invalide non ignorée ;  
• provenance retournée ;  
• YAML et JSON équivalents.

10\. PHASE 7 — PRÉVISUALISATION

Fichiers core :

services/file-decision-service.ts  
services/request-fingerprint-service.ts  
services/project-inspection-service.ts  
use-cases/prepare-context-pack-preview.ts  
use-cases/inspect-project-sources.ts  
use-cases/validate-contextforge-configuration.ts  
use-cases/list-available-profiles.ts

Ordre interne de PrepareContextPackPreview :  
1\. validation ;  
2\. configuration ;  
3\. profil ;  
4\. chemins ;  
5\. scan ;  
6\. exclusions ;  
7\. blocage nom/extension ;  
8\. lecture ;  
9\. scan contenu ;  
10\. décision ;  
11\. sizing ;  
12\. simulation packing ;  
13\. preview.

Tests d’intégration :  
• tous les candidats ont une décision ;  
• aucun fichier final écrit ;  
• progression complète ;  
• annulation respectée ;  
• fingerprint stable ;  
• changements de requête modifient le fingerprint.

11\. PHASE 8 — GÉNÉRATION ATOMIQUE

Package generators :

markdown-language-resolver.ts  
readme.generator.ts  
context-volume.generator.ts  
manifest.generator.ts  
included-files.generator.ts  
exclusions.generator.ts  
warnings.generator.ts  
output-directory-namer.ts  
atomic-context-pack-writer.ts  
output-validator.ts  
index.ts

Core :

use-cases/generate-context-pack.ts  
use-cases/open-last-context-pack.ts  
use-cases/cancel-context-pack-generation.ts  
services/output-validation-service.ts

Flux :  
• écrire dans .contextforge/.tmp/\<pack-id\> ;  
• produire tous les fichiers ;  
• relire manifest.json ;  
• valider Zod ;  
• vérifier chemins absolus ;  
• vérifier absence de blocked ;  
• vérifier limites ;  
• commit atomique ;  
• rollback sinon.

Tests :  
• échec d’un générateur provoque rollback ;  
• aucun dossier final partiel ;  
• mismatch fingerprint refusé ;  
• manifeste exact ;  
• noms de volumes déterministes.

12\. PHASE 9 — CLI

Dépendances : commander, @inquirer/prompts, ora.

Fichiers :

apps/cli/src/index.ts  
apps/cli/src/commands/init.command.ts  
apps/cli/src/commands/inspect.command.ts  
apps/cli/src/commands/preview.command.ts  
apps/cli/src/commands/generate.command.ts  
apps/cli/src/commands/validate.command.ts  
apps/cli/src/presenters/preview.presenter.ts  
apps/cli/src/presenters/result.presenter.ts  
apps/cli/src/adapters/console-progress.adapter.ts  
apps/cli/src/adapters/process-cancellation.adapter.ts  
apps/cli/src/composition-root.ts

Commandes :

contextforge init  
contextforge inspect  
contextforge preview  
contextforge generate  
contextforge validate

Règle : aucune logique métier dans les commandes.

Tests :  
• options invalides ;  
• annulation Ctrl+C ;  
• sortie succès ;  
• sortie erreur ;  
• code de sortie correct.

13\. PHASE 10 — EXTENSION VS CODE

Fichiers :

apps/vscode-extension/src/extension.ts  
apps/vscode-extension/src/composition-root.ts  
apps/vscode-extension/src/commands/generate-context-pack.command.ts  
apps/vscode-extension/src/commands/preview-context-pack.command.ts  
apps/vscode-extension/src/commands/validate-configuration.command.ts  
apps/vscode-extension/src/commands/open-last-context-pack.command.ts  
apps/vscode-extension/src/workflows/context-pack-wizard.ts  
apps/vscode-extension/src/views/objective-input.ts  
apps/vscode-extension/src/views/profile-picker.ts  
apps/vscode-extension/src/views/source-picker.ts  
apps/vscode-extension/src/views/token-limit-picker.ts  
apps/vscode-extension/src/views/preview-panel.ts  
apps/vscode-extension/src/adapters/vscode-progress.adapter.ts  
apps/vscode-extension/src/adapters/vscode-cancellation.adapter.ts  
apps/vscode-extension/src/adapters/vscode-configuration.adapter.ts  
apps/vscode-extension/src/adapters/vscode-last-pack-registry.adapter.ts

Expérience :  
1\. commande ;  
2\. objectif ;  
3\. profil ;  
4\. sources ;  
5\. taille ;  
6\. preview ;  
7\. confirmation ;  
8\. progression ;  
9\. résultat.

Interdiction : aucun scan, aucune sécurité et aucun packing dans l’extension.

Tests VS Code :  
• aucun workspace ;  
• workspace simple ;  
• multi-root ;  
• annulation ;  
• erreur disque ;  
• génération réussie ;  
• ouverture du dernier pack.

14\. PACKAGE.JSON DE L’EXTENSION

Doit déclarer :  
• name ;  
• displayName ;  
• description ;  
• version ;  
• publisher ;  
• engines.vscode ;  
• categories ;  
• activationEvents ;  
• main ;  
• contributes.commands ;  
• contributes.menus ;  
• contributes.configuration ;  
• repository ;  
• license ;  
• icon.

Commandes :  
contextForge.generateContextPack  
contextForge.previewContextPack  
contextForge.validateConfiguration  
contextForge.openLastContextPack

15\. PHASE 11 — QUALITÉ ET ARCHITECTURE

Contrôles :  
• TypeScript strict ;  
• Biome ;  
• Vitest ;  
• tests architecture ;  
• Semgrep ;  
• Gitleaks ;  
• Trivy ;  
• build reproductible.

Un test d’architecture doit refuser :  
• core important vscode ;  
• contracts important fs ;  
• extension contenant une règle security ;  
• generators important CLI ;  
• cycle entre packages.

16\. CI/CD GITHUB ACTIONS

Workflows :

.github/workflows/ci.yml  
.github/workflows/security.yml  
.github/workflows/package-extension.yml  
.github/workflows/release.yml

CI pull request :  
1\. checkout ;  
2\. setup Node ;  
3\. setup pnpm ;  
4\. pnpm install \--frozen-lockfile ;  
5\. typecheck ;  
6\. lint ;  
7\. tests ;  
8\. architecture ;  
9\. Semgrep ;  
10\. Gitleaks ;  
11\. build ;  
12\. package .vsix.

Release :  
• version taguée ;  
• changelog ;  
• build ;  
• tests complets ;  
• .vsix ;  
• checksum SHA-256 ;  
• artefact ;  
• validation manuelle avant Marketplace.

17\. FIXTURES OBLIGATOIRES

fixtures/safe-project  
fixtures/project-with-secrets  
fixtures/oversized-project  
fixtures/multi-language-project  
fixtures/broken-encoding-project  
fixtures/symlink-project  
fixtures/multi-root-workspace

Chaque fixture possède un README décrivant le comportement attendu.

18\. MATRICE DES TESTS

Contracts : unitaires.  
Scanner : unitaires \+ intégration disque.  
Security : unitaires \+ property-based.  
Sizing : unitaires.  
Packer : unitaires \+ property-based.  
Generators : snapshots contrôlés \+ intégration.  
Core : cas d’usage avec ports fake.  
CLI : intégration processus.  
VS Code : @vscode/test-electron.  
CI : smoke test sur Windows, Linux et macOS.

19\. OBJECTIFS DE COUVERTURE

Core métier : 90 % minimum.  
Security : 95 % minimum.  
Packer : 95 % minimum.  
Contracts : 90 % minimum.  
Apps : couverture fonctionnelle prioritaire.

La couverture ne remplace pas les tests d’invariants.

20\. CRITÈRES DE PERFORMANCE

Projet de 100 fichiers : preview inférieur à 2 secondes sur machine normale.  
Projet de 1 000 fichiers : progression visible, mémoire stable.  
Projet de 10 000 fichiers : scan possible sans blocage durable, exclusions précoces.

Les objectifs sont indicatifs et devront être mesurés dans un benchmark reproductible.

21\. CRITÈRES DE SÉCURITÉ

La V1 ne peut être publiée si :  
• un .env est exportable ;  
• une clé privée apparaît en clair ;  
• un chemin absolu apparaît dans manifest.json ;  
• un fichier hors workspace peut être lu ;  
• un dossier temporaire incomplet peut être pris pour un résultat final.

22\. DÉFINITION OF DONE PAR PHASE

Une phase est terminée si :  
• code compilé ;  
• tests passants ;  
• aucune violation d’architecture ;  
• documentation minimale mise à jour ;  
• exports publics stables ;  
• aucun secret de fixture dans les sorties ;  
• revue technique effectuée.

23\. ORDRE DE TRAVAIL RECOMMANDÉ POUR UN AGENT IA

L’agent doit recevoir une seule phase à la fois.

Chaque prompt doit inclure :  
• objectif de la phase ;  
• fichiers autorisés ;  
• fichiers interdits ;  
• dépendances ;  
• signatures attendues ;  
• tests ;  
• critères de sortie.

L’agent ne doit jamais :  
• anticiper une intégration cloud ;  
• ajouter une base de données ;  
• changer l’architecture ;  
• déplacer la logique métier dans VS Code ;  
• supprimer des tests pour faire passer la CI.

24\. PREMIER INCRÉMENT EXÉCUTABLE

Le premier vertical slice doit permettre :

1\. ouvrir un petit projet fixture ;  
2\. scanner des fichiers Markdown et TypeScript ;  
3\. bloquer .env ;  
4\. estimer la taille ;  
5\. produire un preview ;  
6\. générer README.md, context-01.md et manifest.json ;  
7\. lancer le flux depuis la CLI.

Ce slice doit exister avant l’interface VS Code complète.

25\. CRITÈRES DE VALIDATION V1

La V1 est prête lorsque :  
• CLI fonctionnelle ;  
• extension installable par .vsix ;  
• preview obligatoire ;  
• sécurité critique opérationnelle ;  
• génération atomique ;  
• Markdown et JSON valides ;  
• profils disponibles ;  
• UI/UX profile opérationnel comme organisateur de contexte ;  
• tests multi-plateformes ;  
• documentation d’installation ;  
• aucun cloud requis.

26\. LIVRABLES FINAUX

• code source monorepo ;  
• package lock pnpm ;  
• documentation ;  
• fixtures ;  
• rapports de tests ;  
• rapport sécurité ;  
• fichier .vsix ;  
• checksum ;  
• changelog ;  
• guide utilisateur ;  
• guide développeur.

27\. DÉCISIONS VERROUILLÉES

• implémentation par phases ;  
• contracts avant core ;  
• core avant interfaces ;  
• CLI avant extension complète ;  
• vertical slice avant finition premium ;  
• aucun connecteur externe en V1 ;  
• tests de sécurité bloquants ;  
• génération atomique obligatoire ;  
• aucun changement d’architecture sans ADR.

28\. PROCHAINE ÉTAPE

Le prochain document officiel sera :

05 — Spécification UX/UI premium de l’extension VS Code ContextForge V1

Il définira l’expérience complète, les parcours, les écrans, les Quick Picks, les messages, les états, les erreurs, l’accessibilité, les interactions et la préparation future de l’intégration Figma.

FIN DU PLAN D’IMPLÉMENTATION  
