CONTEXTFORGE  
08 — Spécification de la CLI, commandes, configuration et expérience développeur de ContextForge V1  
Version 1.0 — Spécification officielle

1\. OBJET DU DOCUMENT

Ce document définit la CLI officielle de ContextForge V1, ses commandes, ses options, ses contrats d’entrée et de sortie, ses codes de retour, sa configuration JSON/YAML, son comportement interactif et non interactif, son intégration dans les workflows de développement et ses critères de qualité.

La CLI constitue l’interface secondaire officielle de ContextForge. Elle utilise exactement le même Core que l’extension VS Code et ne contient aucune logique métier parallèle.

2\. OBJECTIFS DE LA CLI

• permettre l’utilisation de ContextForge sans interface graphique ;  
• servir de premier vertical slice exécutable ;  
• faciliter les tests automatisés ;  
• permettre l’intégration dans des scripts locaux ;  
• offrir un mode interactif simple ;  
• offrir un mode non interactif déterministe ;  
• produire des sorties lisibles par un humain ou une machine ;  
• respecter strictement la sécurité locale.

3\. PRINCIPES DE CONCEPTION

• commandes courtes et prévisibles ;  
• options cohérentes entre commandes ;  
• aucune action ambiguë ;  
• preview obligatoire avant génération, sauf confirmation explicite via un preview déjà validé ;  
• codes de sortie stables ;  
• aucun secret dans stdout ou stderr ;  
• aucun shell interpolation ;  
• support Windows, Linux et macOS ;  
• compatibilité CI ;  
• messages courts, précis et actionnables.

4\. NOM DU BINAIRE

Nom principal : contextforge

Alias futur éventuel : cforge

La V1 publie uniquement contextforge pour éviter les ambiguïtés.

5\. COMMANDES OFFICIELLES

contextforge init  
contextforge inspect  
contextforge preview  
contextforge generate  
contextforge validate  
contextforge profiles  
contextforge open-last  
contextforge version

6\. COMMANDE INIT

But : initialiser la configuration du projet.

Usage :  
contextforge init

Options :  
\--format \<json|yaml\>  
\--force  
\--profile \<id\>  
\--output \<path\>  
\--non-interactive

Comportement :  
• détecte le workspace courant ;  
• refuse d’écraser un fichier existant sans \--force ;  
• crée .contextforge.json ou .contextforge.yaml ;  
• ajoute une suggestion pour .contextforgeignore ;  
• ne crée aucun Context Pack.

Sortie succès :  
“ContextForge configuration created.”

7\. COMMANDE INSPECT

But : analyser la structure d’un projet sans générer de paquet.

Usage :  
contextforge inspect \[paths...\]

Options :  
\--project \<path\>  
\--profile \<id\>  
\--format \<table|json\>  
\--max-files \<number\>  
\--include \<glob\>  
\--exclude \<glob\>  
\--verbose

Sortie humaine :  
• projet ;  
• nombre de fichiers ;  
• extensions ;  
• langages probables ;  
• dossiers ignorés ;  
• risques évidents ;  
• profils suggérés.

Sortie JSON : contrat stable et versionné.

8\. COMMANDE PREVIEW

But : produire une prévisualisation complète sans écrire les sorties finales.

Usage :  
contextforge preview \[paths...\]

Options :  
\--project \<path\>  
\--objective \<text\>  
\--profile \<id\>  
\--tokens \<number\>  
\--include \<glob\>  
\--exclude \<glob\>  
\--output \<path\>  
\--security-mode \<strict|balanced\>  
\--format \<table|json\>  
\--save-preview \<path\>  
\--non-interactive  
\--yes

Règles :  
• objective obligatoire ;  
• au moins une source ;  
• sécurité strict par défaut ;  
• aucun fichier final généré ;  
• possibilité d’enregistrer un preview sérialisé et son fingerprint.

9\. COMMANDE GENERATE

But : générer le Context Pack final.

Usage :  
contextforge generate \[paths...\]

Modes :  
1\. interactif : la commande prépare un preview puis demande confirmation ;  
2\. depuis un preview : \--from-preview \<file\> ;  
3\. non interactif : options complètes \+ \--yes.

Options :  
\--project \<path\>  
\--objective \<text\>  
\--profile \<id\>  
\--tokens \<number\>  
\--include \<glob\>  
\--exclude \<glob\>  
\--output \<path\>  
\--from-preview \<path\>  
\--yes  
\--non-interactive  
\--format \<text|json\>  
\--open

Règles :  
• le fingerprint doit correspondre ;  
• aucun fichier critical ne peut être inclus ;  
• génération atomique ;  
• rollback en cas d’échec ;  
• \--yes ne contourne jamais la sécurité.

10\. COMMANDE VALIDATE

But : valider la configuration et les règles effectives.

Usage :  
contextforge validate

Options :  
\--project \<path\>  
\--config \<path\>  
\--format \<table|json\>  
\--strict

Sortie :  
• valid ;  
• errors ;  
• warnings ;  
• effectiveConfiguration ;  
• provenance des valeurs.

11\. COMMANDE PROFILES

But : lister les profils disponibles.

Usage :  
contextforge profiles

Options :  
\--format \<table|json\>  
\--details

Profils V1 :  
• ai-general ;  
• code-review ;  
• documentation ;  
• onboarding ;  
• ui-ux ;  
• custom.

12\. COMMANDE OPEN-LAST

But : ouvrir ou afficher le dernier paquet valide.

Usage :  
contextforge open-last

Options :  
\--project \<path\>  
\--print-path  
\--open

Règles :  
• vérifie l’existence ;  
• refuse les chemins hors projet ;  
• nettoie une référence obsolète.

13\. MODE INTERACTIF

Utilise @inquirer/prompts.

Ordre :  
• workspace ;  
• objectif ;  
• profil ;  
• sources ;  
• limite ;  
• preview ;  
• confirmation.

Le mode interactif doit rester utilisable au clavier et ne pas masquer les erreurs.

14\. MODE NON INTERACTIF

Déclenché par \--non-interactive ou environnement CI.

Exigences :  
• aucune question ;  
• toutes les données requises fournies ;  
• erreur immédiate si option manquante ;  
• sortie stable ;  
• code de sortie fiable ;  
• aucun spinner animé en CI.

15\. FORMAT JSON

Avec \--format json :  
• stdout contient uniquement le JSON métier ;  
• stderr contient les diagnostics ;  
• aucune décoration ;  
• schemaVersion obligatoire ;  
• dates ISO 8601 ;  
• chemins relatifs lorsque exportés.

16\. CODES DE SORTIE

0 — succès  
1 — erreur générale  
2 — validation invalide  
3 — configuration invalide  
4 — blocage de sécurité empêchant l’opération  
5 — génération échouée  
6 — preview mismatch  
7 — projet introuvable  
8 — sortie inaccessible  
130 — interruption utilisateur

Ces codes sont stables dans toute la V1.

17\. CONFIGURATION DU PROJET

Fichiers supportés :  
• .contextforge.json  
• .contextforge.yaml  
• .contextforge.yml

Un seul fichier principal est recommandé. Si plusieurs existent, la validation signale une ambiguïté.

18\. SCHÉMA DE CONFIGURATION

Champs principaux :

version  
outputDirectory  
defaultProfile  
maxEstimatedTokens  
includeExtensions  
includeGlobs  
excludeGlobs  
excludeDirectories  
blockSensitiveFiles  
securityMode  
previewBeforeGenerate  
followSymlinks  
maxFileSizeBytes  
maxContentScanBytes  
maxTotalFiles  
maxConcurrentReads  
openReadmeAfterGenerate

19\. EXEMPLE JSON

{  
  "version": 1,  
  "outputDirectory": ".contextforge",  
  "defaultProfile": "ai-general",  
  "maxEstimatedTokens": 60000,  
  "excludeDirectories": \["node\_modules", ".git", "dist", ".contextforge"\],  
  "blockSensitiveFiles": true,  
  "securityMode": "strict",  
  "previewBeforeGenerate": true,  
  "followSymlinks": false,  
  "maxFileSizeBytes": 1048576,  
  "maxConcurrentReads": 8  
}

20\. EXEMPLE YAML

version: 1  
outputDirectory: .contextforge  
defaultProfile: ai-general  
maxEstimatedTokens: 60000  
excludeDirectories:  
  \- node\_modules  
  \- .git  
  \- dist  
  \- .contextforge  
blockSensitiveFiles: true  
securityMode: strict  
previewBeforeGenerate: true  
followSymlinks: false  
maxFileSizeBytes: 1048576  
maxConcurrentReads: 8

21\. PRIORITÉ DE CONFIGURATION

1\. options explicites de commande ;  
2\. variables d’environnement autorisées ;  
3\. fichier de configuration projet ;  
4\. valeurs par défaut.

La provenance de chaque valeur doit pouvoir être affichée.

22\. VARIABLES D’ENVIRONNEMENT

Préfixe : CONTEXTFORGE\_

Exemples :  
CONTEXTFORGE\_PROFILE  
CONTEXTFORGE\_TOKEN\_LIMIT  
CONTEXTFORGE\_OUTPUT  
CONTEXTFORGE\_SECURITY\_MODE  
CONTEXTFORGE\_LOG\_LEVEL

Aucune variable d’environnement ne peut désactiver les blocages critical.

23\. FICHIER .CONTEXTFORGEIGNORE

Syntaxe compatible avec .gitignore.

Règles :  
• cumul avec .gitignore ;  
• .contextforge toujours exclu ;  
• fichiers critical toujours bloqués même s’ils sont explicitement réinclus ;  
• raisons d’exclusion visibles dans le preview.

24\. JOURNALISATION CLI

Niveaux : silent, error, warn, info, debug.

Options :  
\--quiet  
\--verbose  
\--debug

Interdit :  
• contenu de fichier ;  
• secret ;  
• chemin absolu dans JSON public ;  
• stack trace en mode normal.

25\. PROGRESSION

Mode TTY : ora et messages de phase.

Mode non-TTY : lignes simples et stables.

Phases : validating, discovering, filtering, scanning-security, sizing, packing, generating, validating-output, committing.

26\. ANNULATION

Ctrl+C :  
• premier signal → annulation coopérative ;  
• second signal → arrêt forcé contrôlé ;  
• code 130 ;  
• rollback du temporaire ;  
• aucun paquet partiel commité.

27\. EXPÉRIENCE DÉVELOPPEUR

Installation locale :  
pnpm install  
pnpm build  
pnpm \--filter @contextforge/cli dev

Exécution :  
pnpm contextforge inspect  
pnpm contextforge preview  
pnpm contextforge generate

Packaging :  
pnpm \--filter @contextforge/cli build

28\. COMPOSITION ROOT

apps/cli/src/composition-root.ts construit :  
• adaptateurs système de fichiers ;  
• scanner sécurité ;  
• sizing ;  
• packer ;  
• generators ;  
• configuration ;  
• use cases ;  
• presenters.

Aucune commande ne construit elle-même les dépendances.

29\. STRUCTURE DES FICHIERS

apps/cli/src/  
├── index.ts  
├── composition-root.ts  
├── commands/  
│   ├── init.command.ts  
│   ├── inspect.command.ts  
│   ├── preview.command.ts  
│   ├── generate.command.ts  
│   ├── validate.command.ts  
│   ├── profiles.command.ts  
│   └── open-last.command.ts  
├── presenters/  
│   ├── table.presenter.ts  
│   ├── json.presenter.ts  
│   ├── preview.presenter.ts  
│   ├── result.presenter.ts  
│   └── error.presenter.ts  
├── adapters/  
│   ├── console-progress.adapter.ts  
│   ├── process-cancellation.adapter.ts  
│   └── environment-configuration.adapter.ts  
└── errors/  
    └── exit-code-mapper.ts

30\. TESTS CLI OBLIGATOIRES

• help ;  
• version ;  
• commande inconnue ;  
• argument manquant ;  
• mode interactif ;  
• mode non interactif ;  
• JSON pur ;  
• code de sortie ;  
• Ctrl+C ;  
• preview mismatch ;  
• security block ;  
• rollback ;  
• aucun secret dans stdout/stderr ;  
• compatibilité chemins Windows et POSIX.

31\. INTÉGRATION CI

Exemple :

contextforge validate \--non-interactive  
contextforge preview src docs \--objective "Prepare code review" \--profile code-review \--format json \--non-interactive

La génération automatique en CI n’est autorisée que si :  
• le preview est déterministe ;  
• les options sont explicites ;  
• aucune confirmation interactive ;  
• les artefacts restent locaux au job sauf action explicite.

32\. INTÉGRATION NPM SCRIPTS

Exemples :

"context:inspect": "contextforge inspect",  
"context:preview": "contextforge preview src docs \--objective 'Project overview' \--profile ai-general",  
"context:generate": "contextforge generate \--from-preview .contextforge-preview.json \--yes"

33\. SÉCURITÉ CLI

• aucun exec shell pour traiter les fichiers ;  
• validation Zod de tous les arguments ;  
• chemins canonicalisés ;  
• output borné au projet ;  
• aucune option pour bypass critical ;  
• aucune donnée sensible dans erreurs ;  
• aucun réseau.

34\. CRITÈRES D’ACCEPTATION

1\. toutes les commandes documentées fonctionnent ;  
2\. le mode non interactif est déterministe ;  
3\. les codes de sortie sont stables ;  
4\. JSON est parseable ;  
5\. Ctrl+C nettoie correctement ;  
6\. la CLI utilise le Core sans logique dupliquée ;  
7\. aucun secret n’apparaît dans les sorties ;  
8\. Windows, Linux et macOS sont supportés ;  
9\. la configuration JSON et YAML est équivalente ;  
10\. les erreurs indiquent une action corrective.

35\. DÉCISIONS VERROUILLÉES

• commander pour les commandes ;  
• @inquirer/prompts pour l’interactif ;  
• ora uniquement en TTY ;  
• JSON propre sur stdout ;  
• codes de sortie stables ;  
• preview obligatoire ;  
• aucun bypass critical ;  
• même Core que VS Code ;  
• aucune logique métier dans commands ;  
• aucune dépendance réseau.

36\. PROCHAINE ÉTAPE

Le prochain document officiel sera :

09 — Spécification des formats de sortie, manifeste, Markdown et profils de ContextForge V1

Il détaillera le contenu exact de README.md, context-XX.md, manifest.json, included-files.md, exclusions.md, warnings.md, ainsi que les variantes propres aux profils, notamment UI/UX.

FIN DE LA SPÉCIFICATION CLI  
