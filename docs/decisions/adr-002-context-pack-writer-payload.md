# ADR 002 — Passer les données de génération au writer de Context Pack

- **Statut** : accepté
- **Date** : 2026-08-06
- **Phase** : 11 (Release)

## Contexte

Le port `ContextPackWriterPort` recevait uniquement l’identifiant du pack, le
répertoire de sortie et la description des volumes. Les adaptateurs CLI et
VS Code pouvaient donc créer un répertoire temporaire, mais ne disposaient ni
du manifest, ni des décisions, ni du contenu validé des fichiers à écrire.
Ils produisaient en pratique un Context Pack vide.

## Décision

Le Core lit le contenu des seuls fichiers dont la décision est `included`, puis
transmet au port un `ContextPackWriteRequest` immuable contenant le manifest, la
preview, les volumes et une table `chemin relatif → contenu`.

Le package `generators` transforme ces données en fichiers déterministes :
`README.md`, `context-NN.md`, `manifest.json`, `included-files.md`,
`exclusions.md` et `warnings.md`. Les adaptateurs restent limités aux opérations
d’entrée-sortie atomiques : création temporaire, écriture, validation, commit et
rollback.

## Conséquences

- le Core conserve l’orchestration et la politique d’inclusion ;
- les adaptateurs CLI et VS Code ne contiennent aucune logique métier ;
- aucun chemin absolu ni contenu bloqué n’est remis au générateur de volumes ;
- la signature du port change pour ses deux adaptateurs existants ;
- les sorties réelles peuvent être testées indépendamment de VS Code.

## Alternatives rejetées

- **Lire les sources depuis les adaptateurs** : dupliquerait la logique et
  contournerait le port de lecture sécurisé du Core.
- **Générer directement dans le Core** : mélangerait orchestration métier et
  formatage Markdown/JSON.
- **Conserver le writer vide pour la release** : rendrait le smoke test trompeur
  et livrerait une extension incapable de générer un Context Pack exploitable.
