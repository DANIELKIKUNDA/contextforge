\# CONTEXTFORGE  
\#\# 14 — V2 : Mémoire locale persistante du projet  
\*\*Version 1.0 — Spécification officielle\*\*

\#\# 1\. Objectif  
Conserver durablement la connaissance technique du projet afin d’éviter de tout rescanner et de permettre l’historique, la comparaison et la continuité.

\#\# 2\. Stockage  
SQLite local dans \`.contextforge/state/contextforge.db\`.

\#\# 3\. Données persistées  
\- projets et workspaces ;  
\- fichiers et hashes ;  
\- symboles ;  
\- dépendances ;  
\- routes ;  
\- tests ;  
\- documents ;  
\- décisions d’architecture ;  
\- snapshots ;  
\- Context Packs ;  
\- règles ;  
\- findings ;  
\- tâches et prompts générés.

\#\# 4\. Principes  
\- aucune donnée hors machine ;  
\- migrations versionnées ;  
\- possibilité de supprimer entièrement la mémoire ;  
\- export/import portable ;  
\- chemins relatifs dans les données exportées ;  
\- transactions atomiques ;  
\- reprise après interruption.

\#\# 5\. Cas d’usage  
\- InitializeProjectMemory  
\- UpdateProjectMemory  
\- CreateSnapshot  
\- CompareSnapshots  
\- QueryProjectMemory  
\- ExportProjectMemory  
\- ImportProjectMemory  
\- ResetProjectMemory

\#\# 6\. Indexation incrémentale  
Le moteur compare taille, date et hash :  
\- inchangé → réutiliser ;  
\- modifié → réanalyser ;  
\- ajouté → indexer ;  
\- supprimé → marquer absent ;  
\- renommé probable → corréler par hash.

\#\# 7\. Schéma logique  
\`\`\`text  
projects  
files  
symbols  
dependency\_edges  
routes  
test\_associations  
documents  
decisions  
snapshots  
snapshot\_files  
context\_packs  
findings  
\`\`\`

\#\# 8\. UX  
\- “Dernière analyse : …” ;  
\- “42 fichiers ont changé” ;  
\- historique des snapshots ;  
\- comparaison visuelle ;  
\- nettoyage de la mémoire ;  
\- export portable.

\#\# 9\. Sécurité  
\- aucune donnée sensible en clair si elle n’est pas nécessaire ;  
\- exclusion des contenus bloqués ;  
\- stockage des hashes plutôt que des secrets ;  
\- permissions strictes sur le dossier local ;  
\- option de chiffrement des métadonnées sensibles.

\#\# 10\. Critères de sortie  
\- réanalyse incrémentale fiable ;  
\- reprise après crash ;  
\- migration automatique ;  
\- comparaison de snapshots ;  
\- mémoire supprimable et exportable ;  
\- aucune dépendance réseau.  
