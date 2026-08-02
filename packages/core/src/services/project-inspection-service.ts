import type { ProjectDescriptor, SourceFile } from '@contextforge/contracts';

/**
 * Résultat d'inspection de projet retourné par le service.
 */
export interface ProjectInspectionResult {
  readonly project: ProjectDescriptor;
  readonly fileCount: number;
  readonly detectedExtensions: string[];
  readonly totalSizeBytes: number;
}

/**
 * Service d'inspection de projet : analyse la structure découverte
 * et produit un résumé sans modifier le système de fichiers.
 */
export class ProjectInspectionService {
  /**
   * Inspecte la liste des fichiers candidats et produit un résumé.
   */
  inspect(
    projectRoot: string,
    selectedPaths: string[],
    candidates: SourceFile[],
  ): ProjectInspectionResult {
    const extensions = new Set<string>();
    let totalSizeBytes = 0;

    for (const file of candidates) {
      extensions.add(file.extension);
      totalSizeBytes += file.sizeInBytes;
    }

    return {
      project: {
        name: projectRoot.split('/').pop() ?? projectRoot.split('\\').pop() ?? 'unknown',
        rootPath: projectRoot,
        workspaceKind: 'single-root',
        platform: process.platform,
        detectedLanguages: [],
        selectedPaths,
      },
      fileCount: candidates.length,
      detectedExtensions: [...extensions].sort(),
      totalSizeBytes,
    };
  }
}
