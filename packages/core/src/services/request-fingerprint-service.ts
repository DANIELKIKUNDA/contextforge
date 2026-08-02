import { createHash } from 'node:crypto';
import type { ProfileId } from '@contextforge/contracts';

/**
 * Service de calcul du fingerprint d'une requête de preview.
 * Le fingerprint est stable : une même entrée produit toujours la même sortie.
 * Il est utilisé pour détecter les changements entre deux previews.
 */
export class RequestFingerprintService {
  /**
   * Calcule un fingerprint SHA-256 à partir des informations pertinentes
   * de la demande de preview. Le fingerprint ne dépend pas de l'ordre
   * des chemins (ils sont triés avant hachage).
   */
  compute(objective: string, profile: ProfileId, selectedPaths: readonly string[]): string {
    const hash = createHash('sha256');

    // On normalise les entrées pour garantir la stabilité
    hash.update('objective:');
    hash.update(objective.trim());
    hash.update('|profile:');
    hash.update(profile);
    hash.update('|paths:');

    // Tri des chemins pour un fingerprint stable quel que soit l'ordre d'entrée
    const sorted = [...selectedPaths].sort();
    for (const path of sorted) {
      hash.update(path);
      hash.update(',');
    }

    return hash.digest('hex');
  }
}
