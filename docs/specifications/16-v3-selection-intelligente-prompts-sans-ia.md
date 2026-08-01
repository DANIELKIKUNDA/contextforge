\# CONTEXTFORGE  
\#\# 16 — V3 : Sélection intelligente et prompts sans IA  
\*\*Version 1.0 — Spécification officielle\*\*

\#\# 1\. Objectif  
Préparer automatiquement le meilleur contexte possible pour une tâche à partir de règles, graphes et scores explicables.

\#\# 2\. Scoring de pertinence  
Exemple :  
\- sélection explicite : \+100 ;  
\- import direct : \+50 ;  
\- import indirect proche : \+25 ;  
\- même module : \+20 ;  
\- test associé : \+30 ;  
\- document lié : \+25 ;  
\- ADR lié : \+20 ;  
\- fichier modifié récemment : \+10 ;  
\- fichier généré : \-50 ;  
\- fichier sensible : blocage absolu.

\#\# 3\. Explicabilité  
Chaque recommandation affiche :  
\- score ;  
\- raisons ;  
\- relations ;  
\- niveau de confiance ;  
\- possibilité d’inclure ou exclure manuellement.

\#\# 4\. Profils enrichis  
\- bug ;  
\- feature ;  
\- refactoring ;  
\- sécurité ;  
\- performance ;  
\- onboarding ;  
\- revue de code ;  
\- documentation ;  
\- UI/UX ;  
\- migration base de données.

\#\# 5\. Génération de prompts déterministes  
Templates Markdown/YAML remplis automatiquement avec :  
\- objectif ;  
\- contexte projet ;  
\- fichiers ;  
\- règles ;  
\- décisions ;  
\- contraintes ;  
\- tests ;  
\- interdictions ;  
\- critères d’acceptation.

\#\# 6\. Cas d’usage  
\- RecommendContextForTask  
\- ExplainRecommendation  
\- GeneratePromptFromTemplate  
\- PreviewPromptBudget  
\- CompareCandidateContexts

\#\# 7\. Gestion du budget  
\- budget en tokens estimés ;  
\- priorisation ;  
\- réduction progressive ;  
\- avertissement si contexte insuffisant ;  
\- volumes ordonnés ;  
\- résumé structurel déterministe.

\#\# 8\. UX  
\- champ d’objectif ;  
\- liste de fichiers recommandés ;  
\- raisons visibles ;  
\- curseur de budget ;  
\- aperçu du prompt ;  
\- copier/exporter ;  
\- aucun envoi automatique.

\#\# 9\. Critères de sortie  
\- sélection reproductible ;  
\- raisons compréhensibles ;  
\- budget respecté ;  
\- contrôle total de l’utilisateur ;  
\- fonctionnement hors ligne.  
