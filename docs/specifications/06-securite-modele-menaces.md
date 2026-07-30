CONTEXTFORGE  
06 — Spécification sécurité premium et modèle de menaces de ContextForge V1  
Version 1.0 — Spécification officielle

1\. OBJET DU DOCUMENT

Ce document définit la posture de sécurité de ContextForge V1. Il identifie les actifs à protéger, les frontières de confiance, les menaces, les scénarios d’attaque, les contrôles préventifs et détectifs, la politique de masquage, les règles de blocage, les exigences de journalisation, les tests offensifs, les limitations connues et les critères de publication sécurisée.

La sécurité de ContextForge ne repose pas sur une promesse absolue. Elle repose sur une réduction systématique du risque, une architecture locale, un principe de moindre privilège et une traçabilité explicite des décisions.

2\. OBJECTIFS DE SÉCURITÉ

ContextForge V1 doit garantir au minimum :

• aucun accès réseau nécessaire ;  
• aucune transmission automatique du contenu du projet ;  
• aucun secret critique exporté volontairement ;  
• aucun fichier hors workspace lu ;  
• aucun fichier source modifié ;  
• aucun paquet partiel présenté comme valide ;  
• aucun secret brut dans les logs, manifestes ou rapports ;  
• une explication claire de chaque blocage ;  
• une génération atomique ;  
• une annulation propre ;  
• une configuration validée avant exécution.

3\. PRINCIPES DIRECTEURS

3.1. Local-first

Tous les traitements essentiels s’exécutent localement.

3.2. Privacy by default

Aucune télémétrie distante, aucun upload et aucune synchronisation en V1.

3.3. Least privilege

ContextForge lit uniquement les chemins sélectionnés et écrit uniquement dans son dossier de sortie.

3.4. Deny by default

Un fichier inconnu, sensible ou douteux est exclu ou bloqué plutôt qu’inclus silencieusement.

3.5. Read-only source

Le projet source est traité en lecture seule.

3.6. Defense in depth

La sécurité combine nom de fichier, extension, chemin, contenu, politique de sévérité, preview, validation finale et tests.

3.7. Fail closed

En cas de doute critique, la génération échoue ou le fichier est bloqué.

4\. ACTIFS À PROTÉGER

• secrets applicatifs ;  
• clés API ;  
• tokens d’accès ;  
• mots de passe ;  
• clés privées ;  
• certificats ;  
• chaînes de connexion ;  
• fichiers de configuration sensibles ;  
• données personnelles ;  
• données de production ;  
• chemins absolus de la machine ;  
• intégrité du projet source ;  
• intégrité du Context Pack ;  
• configuration ContextForge ;  
• confiance de l’utilisateur ;  
• chaîne de dépendances du produit.

5\. ACTEURS DE MENACE

• utilisateur inattentif ;  
• développeur mal informé ;  
• extension tierce malveillante dans VS Code ;  
• fichier volontairement piégé dans le projet ;  
• dépendance compromise ;  
• attaquant ayant un accès local au poste ;  
• dépôt cloné contenant des liens symboliques dangereux ;  
• contributeur tentant d’affaiblir les règles de sécurité ;  
• agent IA recevant un paquet trop large.

6\. FRONTIÈRES DE CONFIANCE

6.1. Workspace source

Considéré comme non fiable. Les noms, chemins et contenus peuvent être malveillants.

6.2. Core ContextForge

Zone de confiance principale. Il applique les règles métier et de sécurité.

6.3. Adaptateurs système de fichiers

Zone sensible. Ils doivent normaliser les chemins et empêcher toute sortie du workspace.

6.4. Extension VS Code

Interface non souveraine. Elle ne doit pas contenir de logique critique.

6.5. CLI

Même règle que l’extension : collecte et présentation uniquement.

6.6. Dossier .contextforge

Zone de sortie contrôlée. Il ne doit jamais être rescanné.

6.7. Dépendances externes

Zone de risque de supply chain. Elles doivent être limitées, auditées et verrouillées.

7\. MODÈLE DE MENACES

Le modèle s’inspire de STRIDE, adapté au produit.

7.1. Spoofing

Menace : un fichier trompeur imite un fichier sûr.  
Réponse : classification par chemin, extension, contenu et règles stables.

7.2. Tampering

Menace : modification du projet source ou du paquet généré.  
Réponse : lecture seule, génération temporaire, validation puis commit atomique.

7.3. Repudiation

Menace : impossibilité de comprendre pourquoi un fichier a été inclus ou bloqué.  
Réponse : manifeste, reasonCode, ruleId et rapports.

7.4. Information disclosure

Menace : fuite de secrets ou de chemins locaux.  
Réponse : blocage, masquage, chemins relatifs, logs minimaux.

7.5. Denial of service

Menace : énorme dépôt, fichier géant, boucle de symlinks, regex coûteuse.  
Réponse : limites, exclusions précoces, timeout logique, annulation, symlinks désactivés.

7.6. Elevation of privilege

Menace : lecture hors workspace ou écriture arbitraire.  
Réponse : canonicalisation, vérification de parenté, outputDirectory contrôlé.

8\. SCÉNARIOS D’ATTAQUE PRIORITAIRES

8.1. Traversal de chemin

Exemple : ../../secret.txt

Contrôles :  
• resolve \+ realpath ;  
• vérification que le chemin final reste sous projectRoot ;  
• rejet avant lecture ;  
• test Windows et Linux.

8.2. Symlink vers un fichier externe

Contrôles :  
• followSymlinks \= false par défaut ;  
• lstat avant lecture ;  
• rejet avec reasonCode symbolic-link.

8.3. Fichier .env sélectionné manuellement

Contrôle : blocage obligatoire, même en mode custom.

8.4. Secret dans un fichier ordinaire

Contrôles : scan de contenu, masquage, sévérité, blocage selon politique.

8.5. Clé privée encodée dans Markdown

Contrôle : détection des marqueurs BEGIN PRIVATE KEY et variantes.

8.6. Chaîne de connexion avec identifiants

Contrôle : détection de schémas postgres, mysql, mongodb, redis et autres URI sensibles.

8.7. Regex denial of service

Contrôles : motifs bornés, pas de regex catastrophique, taille maximale de contenu analysé, tests dédiés.

8.8. Fichier géant

Contrôles : maxFileSizeBytes, classification oversized, lecture limitée.

8.9. Dossier .contextforge rescanné

Contrôle : exclusion irrévocable par défaut.

8.10. Paquet temporaire incomplet

Contrôle : dossier .tmp, validation complète, rename atomique, rollback.

9\. POLITIQUE DE CLASSIFICATION

Sévérités :

Low : information ou risque faible.  
Medium : risque réel nécessitant attention.  
High : risque sérieux, blocage par défaut.  
Critical : risque inacceptable, blocage obligatoire.

Décision :  
• critical → blocked ;  
• high → blocked par défaut ;  
• medium → excluded ou warning selon règle ;  
• low → warning.

Aucune option utilisateur ne permet d’inclure un finding critical en V1.

10\. RÈGLES DE FICHIERS SENSIBLES

Noms bloqués :  
• .env ;  
• .env.\* ;  
• credentials.json ;  
• secrets.json ;  
• secrets.yaml ;  
• secrets.yml ;  
• id\_rsa ;  
• id\_ed25519 ;  
• known\_hosts sensibles selon contexte ;  
• service-account\*.json.

Extensions bloquées :  
• .pem ;  
• .key ;  
• .p12 ;  
• .pfx ;  
• .jks ;  
• .keystore.

Les règles sont versionnées, documentées et testées.

11\. DÉTECTION DE CONTENU

Catégories :  
• API key ;  
• access token ;  
• refresh token ;  
• password ;  
• private key ;  
• connection string ;  
• credential object ;  
• secret assignment ;  
• bearer token ;  
• cloud credential pattern.

Chaque règle possède :  
• ruleId ;  
• description ;  
• catégorie ;  
• sévérité ;  
• motif ;  
• stratégie de masquage ;  
• cas positifs ;  
• cas négatifs.

12\. POLITIQUE DE MASQUAGE

Aucune valeur brute détectée ne doit être :  
• journalisée ;  
• stockée dans SecurityFinding ;  
• affichée dans l’UI ;  
• sérialisée dans manifest.json ;  
• incluse dans exclusions.md ;  
• incluse dans warnings.md.

Exemple correct :  
“Clé API potentielle détectée à la ligne 18\. Valeur masquée.”

maskedEvidence peut contenir uniquement une forme non réversible, par exemple :  
“sk-\*\*\*REDACTED\*\*\*9x”

La quantité de caractères conservés doit être minimale et configurable.

13\. CHEMINS ET FICHIERS

Règles :  
• tous les chemins externes sont normalisés ;  
• realpath est utilisé avant validation de parenté ;  
• les chemins absolus restent internes ;  
• les exports utilisent uniquement RelativePath ;  
• les séparateurs sont normalisés en slash ;  
• .. sortant est interdit ;  
• les lecteurs refusent les fichiers hors workspace ;  
• outputDirectory doit rester dans le projet en V1.

14\. POLITIQUE D’ENCODAGE

V1 privilégie UTF-8.

Comportement :  
• UTF-8 valide → lecture normale ;  
• BOM UTF-8 → accepté ;  
• binaire probable → excluded ;  
• encodage inconnu → failed ou excluded avec reasonCode invalid-encoding ;  
• aucun transcodage silencieux risqué.

15\. LIMITES DE RESSOURCES

Paramètres :  
• maxFileSizeBytes ;  
• maxTotalFiles ;  
• maxConcurrentReads ;  
• maxContentScanBytes ;  
• maxEstimatedTokens ;  
• maxPathLength ;  
• maxWarnings.

Objectif : empêcher saturation mémoire, blocage de l’Event Loop et déni de service local.

16\. JOURNALISATION SÉCURISÉE

Niveaux : debug, info, warn, error.

Interdit :  
• contenu de fichier ;  
• secret ;  
• token ;  
• mot de passe ;  
• clé privée ;  
• chemin absolu exporté ;  
• stack trace contenant des données sensibles dans l’UI.

Autorisé :  
• ruleId ;  
• reasonCode ;  
• chemin relatif ;  
• taille ;  
• durée ;  
• phase ;  
• nombre de fichiers.

17\. SÉCURITÉ DU MANIFESTE

manifest.json ne contient jamais :  
• chemins absolus ;  
• contenu des fichiers ;  
• preuve brute de secret ;  
• informations d’environnement inutiles ;  
• identifiants machine.

Il contient :  
• chemins relatifs ;  
• décisions ;  
• ruleId ;  
• sévérités ;  
• compteurs ;  
• version du schéma ;  
• version de ContextForge.

18\. GÉNÉRATION ATOMIQUE

Étapes :  
1\. création de .contextforge/.tmp/\<pack-id\> ;  
2\. écriture des sorties ;  
3\. validation structurelle ;  
4\. relecture du manifeste ;  
5\. validation Zod ;  
6\. recherche de chemins absolus ;  
7\. vérification qu’aucun blocked n’est présent ;  
8\. vérification des limites ;  
9\. commit atomique ;  
10\. suppression du temporaire en cas d’échec.

19\. ANNULATION SÉCURISÉE

L’annulation doit :  
• interrompre les étapes coopératives ;  
• empêcher le commit final ;  
• supprimer le temporaire ;  
• produire le statut cancelled ;  
• ne pas laisser de verrou ;  
• ne pas corrompre le dernier paquet valide.

20\. SUPPLY CHAIN

Règles :  
• pnpm-lock.yaml versionné ;  
• pnpm install \--frozen-lockfile en CI ;  
• dépendances minimales ;  
• pas de dépendance non maintenue sans justification ;  
• audit régulier ;  
• Dependabot ou équivalent en futur proche ;  
• provenance des artefacts de release ;  
• checksum SHA-256 du .vsix ;  
• Gitleaks, Semgrep et Trivy en CI.

21\. SÉCURITÉ DE L’EXTENSION VS CODE

• activation minimale ;  
• aucune commande shell construite à partir d’entrée non validée ;  
• aucune webview avec scripts non nécessaires ;  
• Content Security Policy stricte si webview ;  
• localResourceRoots limités ;  
• aucun eval ;  
• aucun innerHTML non contrôlé ;  
• aucune URL externe ouverte sans action explicite ;  
• aucun stockage de secret dans globalState.

22\. SÉCURITÉ DE LA CLI

• validation stricte des arguments ;  
• aucun shell interpolation ;  
• codes de sortie stables ;  
• Ctrl+C géré proprement ;  
• aucun secret dans stderr ;  
• chemins normalisés ;  
• output explicitement borné.

23\. FAUX POSITIFS

La détection de secrets peut produire des faux positifs.

Réponse :  
• reasonCode explicite ;  
• ruleId visible ;  
• masquage ;  
• distinction high/critical ;  
• corpus de cas négatifs ;  
• possibilité future de règles personnalisées ;  
• aucune désactivation globale de la sécurité critique en V1.

24\. FAUX NÉGATIFS

ContextForge ne peut pas garantir la détection de tous les secrets.

Limitations :  
• secrets obfusqués ;  
• secrets chiffrés ;  
• formats inconnus ;  
• secrets répartis sur plusieurs lignes ;  
• secrets générés dynamiquement ;  
• données sensibles métier non reconnaissables par motif.

Avertissement obligatoire :  
“ContextForge réduit les risques d’exposition, mais ne garantit pas qu’aucune information sensible ne soit présente. Vérifiez toujours le paquet avant de le partager.”

25\. TESTS DE SÉCURITÉ UNITAIRES

• noms sensibles ;  
• extensions sensibles ;  
• private keys ;  
• API keys factices ;  
• tokens factices ;  
• mots de passe ;  
• connection strings ;  
• masquage ;  
• sévérité ;  
• reasonCode ;  
• absence de secret dans les erreurs.

26\. TESTS PROPERTY-BASED

Avec fast-check :  
• aucun chemin absolu ne devient RelativePath valide ;  
• aucun chemin avec traversal ne sort du workspace ;  
• aucun finding critical ne produit included ;  
• le masque ne restitue jamais la valeur originale ;  
• .env reste bloqué quelle que soit la casse pertinente au système ;  
• un fichier blocked n’apparaît dans aucun volume.

27\. TESTS OFFENSIFS

Scénarios :  
• symlink externe ;  
• junction Windows ;  
• chemin UNC ;  
• chemin très long ;  
• nom Unicode trompeur ;  
• extension double ;  
• fichier binaire avec extension .txt ;  
• regex stress ;  
• fichier géant ;  
• permission refusée ;  
• disque plein simulé ;  
• interruption pendant commit ;  
• manifeste modifié avant validation.

28\. FIXTURE SECURITY LAB

fixtures/project-with-secrets doit contenir uniquement des secrets factices clairement invalides.

Sous-dossiers :  
• env-files ;  
• private-keys ;  
• tokens ;  
• connection-strings ;  
• symlinks ;  
• oversized ;  
• encoding ;  
• false-positives ;  
• false-negatives-documented.

Aucun vrai secret ne doit jamais être commité.

29\. CRITÈRES DE PUBLICATION SÉCURISÉE

La V1 ne peut être publiée si :  
• .env peut être exporté ;  
• une clé privée peut apparaître en clair ;  
• un chemin hors workspace peut être lu ;  
• un chemin absolu apparaît dans les sorties ;  
• un dossier temporaire peut être confondu avec un résultat final ;  
• une dépendance critique vulnérable reste non traitée ;  
• les tests de sécurité bloquants échouent ;  
• le .vsix n’a pas de checksum ;  
• la CI n’est pas reproductible.

30\. RÉPONSE AUX INCIDENTS

En cas de faille :  
1\. reproduire ;  
2\. classifier la sévérité ;  
3\. désactiver la release concernée si nécessaire ;  
4\. corriger avec test de non-régression ;  
5\. publier une nouvelle version ;  
6\. documenter dans CHANGELOG et security advisory ;  
7\. analyser les variantes possibles.

31\. FICHIERS DE SÉCURITÉ À CRÉER

packages/security/src/  
• default-sensitive-file-rules.ts  
• default-sensitive-extension-rules.ts  
• default-secret-patterns.ts  
• security-rule.ts  
• security-scanner.ts  
• evidence-masker.ts  
• severity-policy.ts  
• security-summary.ts  
• redaction-policy.ts  
• index.ts

packages/security/tests/  
• file-name-rules.spec.ts  
• extension-rules.spec.ts  
• secret-patterns.spec.ts  
• masking.spec.ts  
• severity-policy.spec.ts  
• security-scanner.integration.spec.ts  
• property-based-security.spec.ts

32\. DÉCISIONS VERROUILLÉES

• sécurité locale ;  
• aucun réseau en V1 ;  
• followSymlinks false ;  
• critical non contournable ;  
• chemins absolus interdits dans les exports ;  
• preuves masquées ;  
• génération atomique ;  
• tests offensifs obligatoires ;  
• supply chain contrôlée ;  
• aucun vrai secret dans les fixtures.

33\. PROCHAINE ÉTAPE

Le prochain document officiel sera :

07 — Stratégie de tests, qualité, performance et critères de release de ContextForge V1

Il détaillera la pyramide de tests, les seuils de couverture, les benchmarks, les matrices Windows/Linux/macOS, les tests VS Code, la qualité du code, les gates CI et le processus de release.

FIN DE LA SPÉCIFICATION SÉCURITÉ  
