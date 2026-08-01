\# CONTEXTFORGE  
\#\# 18 — V4 : Support multi-langages et système de plugins  
\*\*Version 1.0 — Spécification officielle\*\*

\#\# 1\. Objectif  
Étendre ContextForge à plusieurs écosystèmes sans alourdir le Core ni imposer toutes les dépendances à chaque utilisateur.

\#\# 2\. Langages prioritaires  
1\. TypeScript/JavaScript  
2\. Python  
3\. Java  
4\. C\#  
5\. Go  
6\. Rust  
7\. PHP

\#\# 3\. Architecture plugin  
\`\`\`text  
Plugin  
├── manifest  
├── analyzer  
├── classifier  
├── rules  
├── renderer  
└── tests  
\`\`\`

\#\# 4\. Contrats  
\- AnalyzerPlugin  
\- SymbolExtractor  
\- DependencyResolver  
\- RouteDetector  
\- TestDetector  
\- FrameworkProfile  
\- ReportRenderer

\#\# 5\. Manifest plugin  
\- id ;  
\- version ;  
\- API compatibility ;  
\- languages ;  
\- frameworks ;  
\- permissions ;  
\- entrypoint ;  
\- integrity hash.

\#\# 6\. Sécurité  
\- plugins désactivés par défaut ;  
\- permissions minimales ;  
\- signature ou hash ;  
\- sandbox lorsque possible ;  
\- aucune exécution arbitraire silencieuse ;  
\- journalisation locale.

\#\# 7\. SDK  
\- types publics stables ;  
\- exemples ;  
\- fixtures ;  
\- harnais de tests ;  
\- validateur de manifest ;  
\- compatibilité semver.

\#\# 8\. UX  
\- liste des plugins ;  
\- activer/désactiver ;  
\- afficher permissions ;  
\- diagnostics ;  
\- mise à jour manuelle ou contrôlée.

\#\# 9\. Critères de sortie  
\- Core indépendant des langages ;  
\- premier plugin TypeScript officiel ;  
\- au moins un second langage ;  
\- API documentée ;  
\- sécurité validée ;  
\- compatibilité ascendante.  
