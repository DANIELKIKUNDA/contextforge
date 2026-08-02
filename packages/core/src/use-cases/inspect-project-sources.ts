import type { ProfileId } from '@contextforge/contracts';
import type { FileDiscoveryPort } from '../ports/file-discovery.port';
import type { ProjectInspectionService } from '../services/project-inspection-service';

/**
 * Entrée du cas d'usage.
 */
export interface InspectProjectSourcesInput {
  readonly projectRoot: string;
  readonly selectedPaths?: string[];
}

/**
 * Sortie du cas d'usage.
 */
export interface InspectProjectSourcesOutput {
  readonly structure: {
    readonly directoryCount: number;
    readonly fileCount: number;
  };
  readonly detectedExtensions: string[];
  readonly probableLanguages: string[];
  readonly estimatedTotalSizeBytes: number;
  readonly ignoredDirectories: string[];
  readonly securityRisks: string[];
  readonly suggestedProfiles: ProfileId[];
}

/**
 * Cas d'usage : Inspection rapide d'un projet sans lecture de contenu.
 * Utilise le port de découverte de fichiers pour analyser la structure.
 */
export class InspectProjectSources {
  constructor(
    private readonly fileDiscovery: FileDiscoveryPort,
    private readonly inspectionService: ProjectInspectionService,
  ) {}

  async execute(input: InspectProjectSourcesInput): Promise<InspectProjectSourcesOutput> {
    const paths = input.selectedPaths ?? ['.'];
    const candidates = await this.fileDiscovery.discover(input.projectRoot, paths);

    const inspection = this.inspectionService.inspect(input.projectRoot, paths, candidates);

    // Comptage des répertoires uniques à partir des chemins relatifs
    const dirs = new Set<string>();
    for (const f of candidates) {
      const dirPath = (f.relativePath as string).split('/').slice(0, -1).join('/');
      if (dirPath) {
        dirs.add(dirPath);
      }
    }

    return {
      structure: {
        directoryCount: dirs.size,
        fileCount: candidates.length,
      },
      detectedExtensions: inspection.detectedExtensions,
      probableLanguages: [],
      estimatedTotalSizeBytes: inspection.totalSizeBytes,
      ignoredDirectories: [],
      securityRisks: [],
      suggestedProfiles: [],
    };
  }
}
