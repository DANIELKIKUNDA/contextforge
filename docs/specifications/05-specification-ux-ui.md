CONTEXTFORGE  
05 — Spécification UX/UI premium de l’extension VS Code ContextForge V1  
Version 1.0 — Spécification officielle

1\. OBJET DU DOCUMENT

Ce document définit l’expérience utilisateur complète de l’extension VS Code ContextForge V1. Il précise les parcours, les commandes, les étapes de l’assistant, les états, les messages, les interactions, les exigences d’accessibilité, les comportements d’erreur, les composants d’interface et les préparations nécessaires à une future collaboration avec Figma.

L’objectif est d’obtenir une extension moderne, professionnelle, rapide à comprendre et cohérente avec les conventions natives de VS Code.

2\. PRINCIPES UX

• Simplicité : aucune étape inutile.  
• Transparence : l’utilisateur sait toujours ce qui sera inclus, exclu ou bloqué.  
• Sécurité visible : les risques sont présentés avant génération.  
• Progressivité : les informations avancées apparaissent seulement lorsque nécessaires.  
• Réversibilité : l’utilisateur peut revenir, annuler ou modifier sa sélection.  
• Cohérence native : utiliser les composants et comportements habituels de VS Code.  
• Accessibilité : navigation clavier, lecteurs d’écran et contrastes compatibles.  
• Prévisibilité : aucune action destructive sur le projet source.  
• Contrôle : aucune génération finale sans confirmation.

3\. POINTS D’ENTRÉE

3.1. Palette de commandes

• ContextForge: Generate Context Pack  
• ContextForge: Preview Context Pack  
• ContextForge: Validate Configuration  
• ContextForge: Open Last Context Pack

3.2. Menu contextuel de l’explorateur

Sur un dossier :  
• Generate Context Pack from This Folder  
• Add Folder to Context Pack Selection

Sur un fichier :  
• Add File to Context Pack Selection

3.3. Barre d’état

État neutre : ContextForge  
État actif : ContextForge: Scanning…  
État avertissement : ContextForge: 2 security warnings  
État succès : ContextForge: Pack ready

La barre d’état ne doit pas devenir envahissante.

4\. PARCOURS PRINCIPAL

Étape 1 — Détection du workspace  
Étape 2 — Saisie de l’objectif  
Étape 3 — Choix du profil  
Étape 4 — Choix des sources  
Étape 5 — Choix de la taille cible  
Étape 6 — Prévisualisation  
Étape 7 — Confirmation  
Étape 8 — Génération  
Étape 9 — Résultat

5\. ÉTAPE 1 — DÉTECTION DU WORKSPACE

Cas simple : un seul dossier ouvert, sélection automatique.

Cas multi-root : Quick Pick obligatoire avec le nom de chaque racine.

Cas sans workspace : message d’erreur avec action “Open Folder”.

Message :  
“Aucun projet n’est ouvert. Ouvrez un dossier pour générer un Context Pack.”

6\. ÉTAPE 2 — OBJECTIF

Composant : InputBox VS Code.

Titre :  
“Quel est l’objectif de ce Context Pack ?”

Placeholder :  
“Ex. Préparer la conception UI du module Paiements”

Validation :  
• minimum 10 caractères ;  
• maximum 500 caractères ;  
• message instantané en cas d’erreur.

Texte d’aide :  
“Un objectif précis améliore la sélection et l’organisation du contexte.”

7\. ÉTAPE 3 — PROFIL

Composant : Quick Pick.

Options :  
• General AI  
• Code Review  
• Documentation  
• Onboarding  
• UI/UX  
• Custom

Chaque option affiche :  
• nom ;  
• description courte ;  
• limite par défaut ;  
• catégories privilégiées.

Exemple UI/UX :  
“Rôles, permissions, parcours, formulaires, validations, erreurs et états d’écran.”

8\. ÉTAPE 4 — SOURCES

Composant : Quick Pick multi-sélection ou arborescence dédiée simple.

Fonctions :  
• sélectionner un ou plusieurs dossiers ;  
• sélectionner des fichiers individuels ;  
• voir les dossiers suggérés par le profil ;  
• afficher le nombre de fichiers estimé ;  
• retirer une sélection ;  
• rechercher par nom.

Actions rapides :  
• Select Recommended  
• Select Documentation Only  
• Clear Selection  
• Add Current File

Règle : au moins une source doit être sélectionnée.

9\. ÉTAPE 5 — TAILLE CIBLE

Quick Pick :  
• Small — 20 000 tokens estimés  
• Medium — 60 000  
• Large — 120 000  
• Custom

Texte d’aide :  
“La taille est une estimation. ContextForge découpera le paquet si nécessaire.”

Pour Custom : InputBox numérique avec validation.

10\. ÉTAPE 6 — PRÉVISUALISATION

La prévisualisation est obligatoire avant génération.

Format recommandé V1 : Webview Panel léger ou document Markdown temporaire, selon effort d’implémentation.

Sections :  
• objectif ;  
• profil ;  
• sources ;  
• fichiers inclus ;  
• fichiers exclus ;  
• fichiers bloqués ;  
• fichiers oversized ;  
• taille estimée ;  
• volumes prévus ;  
• avertissements ;  
• règles de sécurité déclenchées.

Actions :  
• Generate  
• Modify Selection  
• Change Profile  
• Cancel  
• Open Detailed Report

11\. CONCEPTION DU PANNEAU DE PRÉVISUALISATION

En-tête : nom du projet, objectif et profil.

Résumé visuel :  
• Included  
• Excluded  
• Blocked  
• Estimated Tokens  
• Volumes

Niveaux de sévérité :  
• Info  
• Warning  
• High  
• Critical

Aucun secret ne doit être affiché en clair.

Exemple de bloc :  
“2 fichiers bloqués pour raison de sécurité. Les valeurs sensibles ont été masquées.”

12\. ÉTAPE 7 — CONFIRMATION

La confirmation finale doit rappeler :  
• nombre de fichiers inclus ;  
• nombre de fichiers bloqués ;  
• taille estimée ;  
• dossier de sortie.

Boutons :  
• Generate Context Pack  
• Back  
• Cancel

13\. ÉTAPE 8 — GÉNÉRATION

Utiliser vscode.window.withProgress avec cancellation token.

Phases visibles :  
• Validating  
• Discovering files  
• Filtering  
• Scanning security  
• Estimating size  
• Packing volumes  
• Generating outputs  
• Validating result  
• Finalizing

Le message doit évoluer sans exposer de contenu sensible.

14\. ÉTAPE 9 — RÉSULTAT

Message succès :  
“Context Pack generated successfully.”

Actions :  
• Open README  
• Reveal in Explorer  
• Open Manifest  
• Copy Output Path

Le README doit être ouvert par défaut uniquement si la préférence utilisateur l’autorise.

15\. ÉTATS D’INTERFACE

État idle : aucune opération.  
État collecting-input : assistant en cours.  
État previewing : prévisualisation visible.  
État generating : progression active.  
État success : paquet généré.  
État warning : génération réussie avec avertissements.  
État error : échec.  
État cancelled : opération annulée.

Chaque état doit avoir un message clair et une action utile.

16\. GESTION DES ERREURS

Validation :  
“L’objectif doit contenir au moins 10 caractères.”

Aucun fichier :  
“Aucune source valide n’a été sélectionnée.”

Projet introuvable :  
“Le projet sélectionné n’est plus accessible.”

Configuration invalide :  
“La configuration ContextForge contient des erreurs. Ouvrez le rapport pour les corriger.”

Sécurité critique :  
“Un ou plusieurs fichiers critiques ont été bloqués. Ils ne seront pas exportés.”

Écriture impossible :  
“ContextForge n’a pas pu écrire dans le dossier de sortie.”

Annulation :  
“Génération annulée. Aucun paquet incomplet n’a été conservé.”

17\. PRINCIPES DE MICROCOPY

• phrases courtes ;  
• verbes d’action ;  
• aucun jargon inutile ;  
• messages précis ;  
• pas de ton alarmiste sans raison ;  
• distinction claire entre excluded et blocked ;  
• ne jamais promettre une sécurité absolue.

Avertissement standard :  
“ContextForge réduit les risques d’exposition, mais vérifiez toujours le paquet avant de le partager.”

18\. ACCESSIBILITÉ

• toutes les actions accessibles au clavier ;  
• focus visible ;  
• labels explicites ;  
• aucun sens transmis uniquement par la couleur ;  
• compatibilité lecteurs d’écran ;  
• contrastes conformes au thème VS Code ;  
• ordre logique de tabulation ;  
• messages d’erreur annoncés.

Les raccourcis doivent respecter les conventions VS Code et éviter les conflits.

19\. THÈMES ET APPARENCE

L’extension doit utiliser les variables de thème VS Code.

Interdit :  
• couleurs codées en dur ;  
• typographies externes ;  
• design qui imite une application web indépendante ;  
• animations lourdes.

Autorisé :  
• codicons VS Code ;  
• badges ;  
• séparateurs ;  
• panneaux synthétiques ;  
• tableaux simples.

20\. EXPÉRIENCE PREMIUM SANS SURCHARGE

Le caractère premium repose sur :  
• clarté ;  
• vitesse ;  
• cohérence ;  
• qualité des messages ;  
• sécurité expliquée ;  
• résultats bien structurés ;  
• absence de bugs visuels ;  
• états complets ;  
• excellente navigation clavier.

Il ne repose pas sur une interface décorative excessive.

21\. PROFIL UI/UX DANS L’INTERFACE

Lorsque le profil UI/UX est choisi, l’assistant suggère :  
• docs/product ;  
• docs/business ;  
• docs/ux ;  
• docs/ui ;  
• routes ;  
• DTO ;  
• validators ;  
• permissions ;  
• pages ;  
• components ;  
• stores ;  
• types.

La prévisualisation peut regrouper les fichiers par catégories :  
• Product  
• Roles  
• Permissions  
• User Journeys  
• Business Rules  
• Forms  
• Validation  
• API Contracts  
• Errors  
• Screen States  
• Existing Components

22\. PRÉPARATION FUTURE POUR FIGMA

La V1 ne crée pas de frames Figma.

Elle doit cependant produire une structure exploitable par un agent connecté à Figma.

Préparation V1 :  
• noms de catégories stables ;  
• manifest JSON versionné ;  
• ordre cohérent ;  
• identification des rôles, permissions, états et écrans lorsqu’ils existent dans les sources ;  
• sortie UI/UX dédiée.

Préparation V2 :  
• ui-spec.json normalisé ;  
• screen inventory ;  
• flow inventory ;  
• form schemas ;  
• component references.

23\. COMPOSANTS UX À CRÉER

apps/vscode-extension/src/views/  
• objective-input.ts  
• profile-picker.ts  
• source-picker.ts  
• token-limit-picker.ts  
• preview-panel.ts  
• result-actions.ts  
• error-message-mapper.ts  
• accessibility-labels.ts

apps/vscode-extension/src/workflows/  
• context-pack-wizard.ts  
• preview-workflow.ts  
• generation-workflow.ts

24\. RÈGLES DE RESPONSABILITÉ

Les vues :  
• collectent et présentent ;  
• ne scannent pas ;  
• ne décident pas la sécurité ;  
• ne calculent pas les tokens ;  
• n’écrivent pas les sorties.

Le workflow :  
• orchestre les écrans ;  
• appelle les cas d’usage ;  
• traduit les résultats en messages.

Le core :  
• reste la seule source de vérité métier.

25\. TESTS UX OBLIGATOIRES

• aucun workspace ;  
• multi-root ;  
• objectif invalide ;  
• aucune source ;  
• sélection recommandée ;  
• retour arrière ;  
• annulation ;  
• preview avec blocked ;  
• preview oversized ;  
• génération réussie ;  
• génération avec warning ;  
• erreur d’écriture ;  
• navigation clavier ;  
• labels accessibles ;  
• thème clair et sombre.

26\. CRITÈRES D’ACCEPTATION UX

1\. un nouvel utilisateur comprend le flux sans documentation externe ;  
2\. la génération complète peut être lancée en moins d’une minute sur un petit projet ;  
3\. les risques de sécurité sont visibles avant confirmation ;  
4\. aucune action finale n’est ambiguë ;  
5\. l’utilisateur peut annuler à tout moment ;  
6\. les erreurs proposent une prochaine action ;  
7\. l’interface fonctionne au clavier ;  
8\. le résultat final est facilement accessible.

27\. ÉCRANS ET ÉTATS À PROTOTYPER DANS FIGMA

Même si l’extension utilisera des composants VS Code, un prototype Figma peut documenter :  
• assistant objectif ;  
• choix du profil ;  
• sélection des sources ;  
• choix de taille ;  
• panneau de preview ;  
• sécurité ;  
• progression ;  
• succès ;  
• erreur ;  
• état annulé.

Le prototype doit respecter le langage visuel de VS Code, pas inventer un design web séparé.

28\. DÉCISIONS VERROUILLÉES

• assistant séquentiel ;  
• preview obligatoire ;  
• composants natifs VS Code en priorité ;  
• Webview limitée au panneau de preview si nécessaire ;  
• aucune couleur codée en dur ;  
• annulation disponible ;  
• sécurité visible ;  
• profil UI/UX officiel ;  
• aucune création Figma directe en V1 ;  
• préparation d’un futur ui-spec.json.

29\. PROCHAINE ÉTAPE

Le prochain document officiel sera :

06 — Spécification sécurité premium et modèle de menaces de ContextForge V1

Il détaillera les actifs à protéger, les menaces, les frontières de confiance, les règles de détection, la politique de masquage, les faux positifs, les tests offensifs, les limitations et les critères de publication sécurisée.

FIN DE LA SPÉCIFICATION UX/UI  
