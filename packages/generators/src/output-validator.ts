import type { ContextPackManifest } from '@contextforge/contracts';
import { ContextPackManifestSchema } from '@contextforge/contracts';

/** Résultat de la validation des sorties. */
export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: string[];
}

/**
 * Valide les sorties temporaires avant le commit atomique.
 * Vérifie : manifest Zod, chemins relatifs, blocs Markdown fermés,
 * absence de blocked, cohérence manifest/fichiers.
 */
export class OutputValidator {
  /**
   * Valide le manifest JSON contre le schéma Zod.
   */
  validateManifest(raw: string): ValidationResult {
    try {
      const parsed = JSON.parse(raw) as unknown;
      const result = ContextPackManifestSchema.safeParse(parsed);
      if (!result.success) {
        return {
          valid: false,
          errors: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
        };
      }
      return { valid: true, errors: [] };
    } catch (e) {
      return {
        valid: false,
        errors: [`Manifest JSON invalide : ${String(e)}`],
      };
    }
  }

  /**
   * Vérifie qu'un contenu Markdown a tous ses blocs de code fermés.
   */
  validateMarkdownBlocks(content: string): ValidationResult {
    const errors: string[] = [];
    let inBlock = false;
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('```')) {
        inBlock = !inBlock;
      }
    }

    if (inBlock) {
      errors.push('Bloc de code Markdown non fermé');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Vérifie que le manifest ne contient que des chemins relatifs.
   */
  validateRelativePaths(manifest: ContextPackManifest): ValidationResult {
    const errors: string[] = [];
    const allPaths = [
      ...manifest.includedFiles,
      ...manifest.excludedFiles,
      ...manifest.blockedFiles,
      ...manifest.oversizedFiles,
      ...manifest.failedFiles,
      ...manifest.outputFiles,
    ];

    for (const p of allPaths) {
      if (p.startsWith('/') || p.includes('\\') || p.startsWith('..')) {
        errors.push(`Chemin non relatif ou traversal détecté : ${p}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Vérifie qu'aucun fichier blocked n'est présent dans les volumes.
   */
  validateNoBlockedInVolumes(
    manifest: ContextPackManifest,
    volumeContents: string[],
  ): ValidationResult {
    const errors: string[] = [];
    const blockedSet = new Set(manifest.blockedFiles);

    for (const content of volumeContents) {
      for (const blocked of blockedSet) {
        if (content.includes(blocked)) {
          errors.push(`Fichier bloqué trouvé dans un volume : ${blocked}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validation complète : manifest + chemins + Markdown + blocked.
   */
  validateAll(manifestRaw: string, volumeContents: string[]): ValidationResult {
    const allErrors: string[] = [];

    const manifestResult = this.validateManifest(manifestRaw);
    allErrors.push(...manifestResult.errors);

    if (manifestResult.valid) {
      try {
        const parsed = JSON.parse(manifestRaw) as ContextPackManifest;
        allErrors.push(...this.validateRelativePaths(parsed).errors);
        allErrors.push(...this.validateNoBlockedInVolumes(parsed, volumeContents).errors);
      } catch {
        allErrors.push('Impossible de parser le manifest pour les validations avancées');
      }
    }

    for (const content of volumeContents) {
      allErrors.push(...this.validateMarkdownBlocks(content).errors);
    }

    return { valid: allErrors.length === 0, errors: allErrors };
  }
}
