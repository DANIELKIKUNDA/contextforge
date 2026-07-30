CONTEXTFORGE  
09 — Spécification des formats de sortie, manifeste, Markdown et profils de ContextForge V1  
Version 1.0 — Spécification officielle

1\. OBJET DU DOCUMENT

Ce document définit les formats de sortie officiels de ContextForge V1. Il précise la structure du dossier généré, le contenu exact de README.md, des volumes context-XX.md, de manifest.json, de included-files.md, de exclusions.md et de warnings.md. Il décrit également les variations propres aux profils ai-general, code-review, documentation, onboarding, ui-ux et custom.

Les sorties doivent être lisibles par un humain, exploitables par une IA, validables automatiquement et stables dans le temps.

2\. PRINCIPES DE SORTIE

• Markdown pour la lecture humaine et l’usage par les agents IA.  
• JSON pour la traçabilité et l’automatisation.  
• chemins relatifs uniquement ;  
• ordre déterministe ;  
• aucune donnée sensible en clair ;  
• aucune dépendance à un service externe ;  
• compatibilité Windows, Linux et macOS ;  
• structure versionnée ;  
• contenu explicable ;  
• validation post-génération obligatoire.

3\. STRUCTURE DU DOSSIER

.contextforge/  
└── \<date\>-\<slug-objective\>/  
    ├── README.md  
    ├── context-01.md  
    ├── context-02.md  
    ├── manifest.json  
    ├── included-files.md  
    ├── exclusions.md  
    └── warnings.md

Le nom du dossier contient :  
• date ISO courte ;  
• slug de l’objectif ;  
• suffixe numérique si collision.

Exemple :  
2026-07-29-payment-ui  
2026-07-29-payment-ui-02

4\. RÈGLES DE NOMMAGE

• minuscules pour les dossiers générés ;  
• tirets pour les espaces ;  
• caractères non sûrs supprimés ;  
• longueur maximale bornée ;  
• aucun chemin absolu ;  
• aucun nom provenant directement d’un secret ou contenu sensible.

5\. README.MD

README.md est le point d’entrée officiel du paquet.

Sections obligatoires :  
1\. titre ;  
2\. objectif ;  
3\. projet source ;  
4\. profil ;  
5\. date de génération ;  
6\. résumé ;  
7\. structure du paquet ;  
8\. volumes ;  
9\. statistiques ;  
10\. avertissements ;  
11\. sécurité ;  
12\. mode d’utilisation ;  
13\. limitation.

Exemple de structure :

\# Context Pack — Payment UI

\#\# Objective  
Prepare the UI/UX design of the payment module.

\#\# Project  
EducSyn

\#\# Profile  
ui-ux

\#\# Summary  
• 48 files included  
• 12 files excluded  
• 2 files blocked  
• 2 volumes  
• 58 420 estimated tokens

\#\# Volumes  
• context-01.md — Product, business and contracts  
• context-02.md — UI, API and tests

\#\# Security Notice  
ContextForge reduces exposure risks but does not guarantee that no sensitive information remains. Review the pack before sharing.

6\. CONTEXT-XX.MD

Chaque volume contient un sous-ensemble cohérent de fichiers.

En-tête obligatoire :  
• titre du volume ;  
• index ;  
• objectif ;  
• profil ;  
• taille estimée ;  
• nombre de fichiers ;  
• catégories principales.

Pour chaque fichier :

\#\# \`src/modules/payments/payment-service.ts\`

Metadata :  
• Category: application  
• Language: TypeScript  
• Size: 4 218 bytes  
• Lines: 132  
• Estimated tokens: 1 080

\`\`\`ts  
\<contenu\>  
\`\`\`

Règles :  
• blocs de code toujours fermés ;  
• langage Markdown résolu par extension ;  
• aucun fichier binaire ;  
• aucun secret brut ;  
• chemin relatif uniquement ;  
• ordre stable.

7\. ORDRE DES FICHIERS DANS LES VOLUMES

Priorité générale :  
1\. produit ;  
2\. métier ;  
3\. architecture ;  
4\. contrats ;  
5\. domaine ;  
6\. application ;  
7\. interfaces ;  
8\. infrastructure ;  
9\. UI/UX ;  
10\. tests ;  
11\. documentation complémentaire ;  
12\. autres.

À priorité égale : tri lexical stable par chemin relatif.

8\. INCLUDED-FILES.MD

Objectif : fournir un inventaire humain des fichiers inclus.

Colonnes recommandées :  
• chemin ;  
• catégorie ;  
• volume ;  
• taille ;  
• lignes ;  
• tokens estimés ;  
• priorité.

Le document contient aussi :  
• total des fichiers ;  
• total par catégorie ;  
• total par volume ;  
• total estimé.

9\. EXCLUSIONS.MD

Objectif : expliquer tous les fichiers non inclus.

Sections :  
• Excluded ;  
• Blocked ;  
• Oversized ;  
• Failed.

Pour chaque entrée :  
• chemin relatif ;  
• statut ;  
• reasonCode ;  
• message ;  
• ruleId éventuel ;  
• recommandation éventuelle.

Aucune preuve sensible en clair.

10\. WARNINGS.MD

Objectif : centraliser les avertissements non bloquants.

Catégories :  
• sécurité ;  
• taille ;  
• encodage ;  
• configuration ;  
• qualité du contexte ;  
• compatibilité ;  
• limitations.

Chaque warning possède :  
• code ;  
• sévérité ;  
• message ;  
• action recommandée.

11\. MANIFEST.JSON

manifest.json est le contrat machine principal.

Champs obligatoires :

schemaVersion  
contextForgeVersion  
packId  
name  
objective  
profile  
projectName  
generatedAt  
requestFingerprint  
estimationStrategy  
limits  
summary  
includedFiles  
excludedFiles  
blockedFiles  
oversizedFiles  
failedFiles  
volumes  
warnings  
securitySummary  
outputFiles

12\. EXEMPLE DE MANIFESTE

{  
  "schemaVersion": "1.0",  
  "contextForgeVersion": "0.1.0",  
  "packId": "01J...",  
  "name": "payment-ui",  
  "objective": "Prepare the UI/UX design of the payment module",  
  "profile": "ui-ux",  
  "projectName": "EducSyn",  
  "generatedAt": "2026-07-29T09:00:00.000Z",  
  "requestFingerprint": "sha256:...",  
  "estimationStrategy": {  
    "id": "chars-divided-by-four",  
    "version": 1  
  },  
  "limits": {  
    "maxEstimatedTokensPerVolume": 60000,  
    "maxFileSizeBytes": 1048576  
  },  
  "summary": {  
    "included": 48,  
    "excluded": 12,  
    "blocked": 2,  
    "oversized": 1,  
    "failed": 0,  
    "volumes": 2,  
    "estimatedTokens": 58420  
  },  
  "includedFiles": \[\],  
  "excludedFiles": \[\],  
  "blockedFiles": \[\],  
  "oversizedFiles": \[\],  
  "failedFiles": \[\],  
  "volumes": \[\],  
  "warnings": \[\],  
  "securitySummary": {},  
  "outputFiles": \[\]  
}

13\. SCHÉMA DES FICHIERS INCLUS

Chaque includedFile contient :  
• relativePath ;  
• category ;  
• language ;  
• sizeInBytes ;  
• lineCount ;  
• estimatedTokens ;  
• volumeIndex ;  
• priority ;  
• hash optionnel.

14\. SCHÉMA DES EXCLUSIONS

Chaque exclusion contient :  
• relativePath ;  
• status ;  
• reasonCode ;  
• message ;  
• ruleId optionnel ;  
• recoverable ;  
• recommendation optionnelle.

15\. SCHÉMA DES VOLUMES

Chaque volume contient :  
• index ;  
• fileName ;  
• heading ;  
• categories ;  
• fileCount ;  
• estimatedTokens ;  
• estimatedBytes ;  
• filePaths.

16\. SECURITY SUMMARY

securitySummary contient :  
• totalFindings ;  
• bySeverity ;  
• byKind ;  
• blockedFiles ;  
• redactedFindings ;  
• criticalCount ;  
• highCount ;  
• mediumCount ;  
• lowCount.

Aucune preuve brute.

17\. PROFIL AI-GENERAL

Objectif : fournir une compréhension globale du projet.

Priorités :  
• README et documentation ;  
• architecture ;  
• contrats ;  
• domaine ;  
• cas d’usage ;  
• configuration ;  
• tests essentiels.

Résumé spécifique :  
• stack ;  
• modules ;  
• architecture ;  
• conventions ;  
• points d’entrée ;  
• risques connus.

18\. PROFIL CODE-REVIEW

Objectif : préparer une revue technique.

Priorités :  
• fichiers modifiés si connus ;  
• tests associés ;  
• règles métier ;  
• erreurs ;  
• sécurité ;  
• conventions ;  
• dépendances.

Sections recommandées :  
• review scope ;  
• changed areas ;  
• related tests ;  
• known risks ;  
• review checklist.

19\. PROFIL DOCUMENTATION

Objectif : produire un contexte destiné à la rédaction technique.

Priorités :  
• README ;  
• docs ;  
• architecture ;  
• scripts ;  
• commandes ;  
• configuration ;  
• API publiques.

Sections :  
• documentation inventory ;  
• missing documentation ;  
• developer commands ;  
• architecture references ;  
• glossary candidates.

20\. PROFIL ONBOARDING

Objectif : aider un nouveau développeur à comprendre le projet.

Priorités :  
• installation ;  
• commandes ;  
• structure ;  
• architecture ;  
• conventions ;  
• premiers fichiers à lire ;  
• tests ;  
• workflow Git.

Sections :  
• quick start ;  
• project map ;  
• first reading path ;  
• development workflow ;  
• common pitfalls.

21\. PROFIL UI/UX

Objectif : fournir un contexte exploitable par un designer ou un agent connecté à Figma.

Structure recommandée :

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

Dans la V1, ces documents sont construits à partir des catégories et sources disponibles. ContextForge ne prétend pas inférer automatiquement tout le métier sans IA.

22\. CONTENU UI/UX DÉTAILLÉ

product-objective.md : objectif produit et périmètre.  
user-roles.md : rôles détectés dans les sources.  
permissions.md : permissions et restrictions explicites.  
user-journeys.md : parcours présents dans docs ou code.  
business-rules.md : règles métier pertinentes.  
screen-inventory.md : pages, routes, vues et composants principaux.  
screen-states.md : loading, empty, error, success et états métier.  
forms-and-validations.md : champs, contraintes et validations.  
api-contracts.md : endpoints, DTO et payloads.  
errors-and-edge-cases.md : erreurs, cas limites et scénarios alternatifs.  
existing-components.md : composants réutilisables.  
relevant-source-files.md : inventaire des sources retenues.

23\. PROFIL CUSTOM

Le profil custom permet :  
• globs personnalisés ;  
• catégories personnalisées limitées ;  
• ordre personnalisé ;  
• limite personnalisée ;  
• nom de pack personnalisé.

Les règles de sécurité globales restent obligatoires.

24\. LANGAGES ET BLOCS DE CODE

Mapping minimal :  
.ts → ts  
.tsx → tsx  
.js → js  
.jsx → jsx  
.json → json  
.md → markdown  
.yaml/.yml → yaml  
.py → python  
.java → java  
.cs → csharp  
.go → go  
.rs → rust  
.sql → sql  
.html → html  
.css → css  
.vue → vue

Extension inconnue textuelle : text.

25\. DÉTERMINISME

À projet, configuration et version identiques :  
• mêmes fichiers ;  
• même ordre ;  
• même découpage ;  
• mêmes noms de volumes ;  
• mêmes totaux ;  
• même manifeste hors packId et generatedAt.

26\. COMPATIBILITÉ DES SCHÉMAS

schemaVersion suit MAJOR.MINOR.

MINOR : ajout compatible de champs optionnels.  
MAJOR : rupture de structure ou de signification.

Le générateur doit refuser d’écrire un manifeste invalide.

27\. VALIDATION POST-GÉNÉRATION

Contrôles :  
• tous les fichiers attendus existent ;  
• manifest.json valide ;  
• volumes référencés présents ;  
• aucun chemin absolu ;  
• aucun fichier bloqué ;  
• aucune limite dépassée ;  
• aucun bloc Markdown non fermé ;  
• aucun secret connu dans les rapports ;  
• cohérence des compteurs.

28\. FICHIERS À CRÉER

packages/generators/src/  
• readme.generator.ts  
• context-volume.generator.ts  
• manifest.generator.ts  
• included-files.generator.ts  
• exclusions.generator.ts  
• warnings.generator.ts  
• ui-ux-output.generator.ts  
• markdown-language-resolver.ts  
• output-directory-namer.ts  
• output-validator.ts  
• index.ts

packages/generators/tests/  
• readme.generator.spec.ts  
• context-volume.generator.spec.ts  
• manifest.generator.spec.ts  
• exclusions.generator.spec.ts  
• ui-ux-output.generator.spec.ts  
• output-validator.integration.spec.ts

29\. CRITÈRES D’ACCEPTATION

1\. tous les fichiers de sortie sont documentés ;  
2\. manifest.json est validé par Zod ;  
3\. tous les chemins sont relatifs ;  
4\. aucun secret brut dans les rapports ;  
5\. l’ordre est déterministe ;  
6\. les volumes respectent la limite ;  
7\. le profil UI/UX produit sa structure dédiée ;  
8\. les compteurs sont cohérents ;  
9\. les sorties sont lisibles par humain et machine ;  
10\. les tests de snapshots et d’intégration passent.

30\. DÉCISIONS VERROUILLÉES

• Markdown \+ JSON ;  
• README comme point d’entrée ;  
• manifest.json comme contrat machine ;  
• chemins relatifs uniquement ;  
• volumes context-XX.md ;  
• raisons d’exclusion obligatoires ;  
• warnings séparés ;  
• profil UI/UX dédié ;  
• schemaVersion obligatoire ;  
• validation post-génération.

31\. PROCHAINE ÉTAPE

Le prochain document officiel sera :

10 — Roadmap produit, jalons, backlog et critères de livraison de ContextForge V1

Il définira les epics, user stories, priorités, dépendances, jalons, estimation relative, risques, Definition of Ready, Definition of Done et plan de livraison du premier .vsix.

FIN DE LA SPÉCIFICATION DES FORMATS DE SORTIE  
