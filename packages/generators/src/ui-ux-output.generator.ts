import type { ContextPackPreview, IncludedFileDecision } from '@contextforge/contracts';

/**
 * Options de configuration pour le générateur UI/UX.
 */
export interface UiUxOutputOptions {
  /** Nombre maximal de recommandations à générer. */
  readonly maxRecommendations: number;
  /** Inclure les rapports d'accessibilité simulés. */
  readonly includeAccessibilityReport: boolean;
  /** Inclure les métriques de performance estimées. */
  readonly includePerformanceMetrics: boolean;
}

/**
 * Résultat produit par le générateur UI/UX.
 */
export interface UiUxOutput {
  /** Résumé textuel de l'analyse UI/UX. */
  readonly summary: string;
  /** Recommandations issues de l'analyse. */
  readonly recommendations: string[];
  /** Fichiers identifiés comme pertinents pour l'UI/UX. */
  readonly relevantFiles: string[];
  /** Rapport d'accessibilité simulé (si activé). */
  readonly accessibilityReport?: string;
  /** Métriques de performance estimées (si activé). */
  readonly performanceMetrics?: {
    readonly componentCount: number;
    readonly styleFileCount: number;
    readonly estimatedBundleComplexity: 'low' | 'medium' | 'high';
  };
}

/**
 * Générateur de sortie UI/UX spécialisé.
 * Analyse le ContextPackPreview pour produire un rapport
 * orienté design system, accessibilité et expérience utilisateur.
 *
 * Ce générateur ne modifie pas les fichiers sources.
 * Il produit uniquement des métadonnées exploitables par les adaptateurs.
 */
export class UiUxOutputGenerator {
  /** Extensions de fichiers considérées comme UI/UX. */
  private static readonly UI_UX_EXTENSIONS = new Set([
    '.css',
    '.scss',
    '.less',
    '.sass',
    '.html',
    '.htm',
    '.jsx',
    '.tsx',
    '.vue',
    '.svelte',
    '.svg',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.webp',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
  ]);

  /** Patterns de noms de fichiers indiquant des composants UI. */
  private static readonly UI_COMPONENT_PATTERNS = [
    /component/i,
    /button/i,
    /input/i,
    /modal/i,
    /dialog/i,
    /card/i,
    /form/i,
    /layout/i,
    /header/i,
    /footer/i,
    /sidebar/i,
    /nav/i,
    /menu/i,
    /table/i,
    /list/i,
    /grid/i,
    /icon/i,
    /avatar/i,
    /badge/i,
    /tooltip/i,
    /dropdown/i,
    /slider/i,
    /toggle/i,
    /checkbox/i,
    /radio/i,
    /select/i,
    /progress/i,
    /spinner/i,
    /loader/i,
    /skeleton/i,
    /toast/i,
    /notification/i,
    /banner/i,
    /tabs/i,
    /accordion/i,
    /carousel/i,
    /pagination/i,
    /breadcrumb/i,
  ];

  /**
   * Génère la sortie UI/UX à partir d'un preview.
   *
   * @param preview - Le ContextPackPreview à analyser.
   * @param options - Options de configuration du générateur.
   * @returns L'objet UiUxOutput contenant l'analyse.
   */
  generate(preview: ContextPackPreview, options: UiUxOutputOptions): UiUxOutput {
    const relevantFiles = this.findRelevantFiles(preview);
    const summary = this.buildSummary(preview, relevantFiles);
    const recommendations = this.buildRecommendations(preview, relevantFiles, options);

    const accessibilityReport = options.includeAccessibilityReport
      ? this.buildAccessibilityReport(preview, relevantFiles)
      : undefined;
    const performanceMetrics = options.includePerformanceMetrics
      ? this.buildPerformanceMetrics(preview, relevantFiles)
      : undefined;

    const output: UiUxOutput = {
      summary,
      recommendations,
      relevantFiles: relevantFiles.map((f) => f.file.relativePath as string),
      ...(accessibilityReport !== undefined ? { accessibilityReport } : {}),
      ...(performanceMetrics !== undefined ? { performanceMetrics } : {}),
    };

    return output;
  }

  /**
   * Génère les options par défaut pour les tests et le développement.
   */
  static defaultOptions(): UiUxOutputOptions {
    return {
      maxRecommendations: 10,
      includeAccessibilityReport: true,
      includePerformanceMetrics: true,
    };
  }

  // ── méthodes privées ──────────────────────────────

  /**
   * Identifie les fichiers pertinents pour l'analyse UI/UX.
   */
  private findRelevantFiles(preview: ContextPackPreview): IncludedFileDecision[] {
    return preview.decisions.filter((d): d is IncludedFileDecision => {
      if (d.status !== 'included') return false;
      const path = d.file.relativePath as string;
      const ext = path.includes('.') ? `.${path.split('.').pop() ?? ''}` : '';
      const fileName = path.split('/').pop() ?? '';

      // Vérification par extension
      if (UiUxOutputGenerator.UI_UX_EXTENSIONS.has(ext)) {
        return true;
      }

      // Vérification par pattern de nom de fichier
      for (const pattern of UiUxOutputGenerator.UI_COMPONENT_PATTERNS) {
        if (pattern.test(fileName)) {
          return true;
        }
      }

      return false;
    });
  }

  /**
   * Construit le résumé textuel de l'analyse.
   */
  private buildSummary(
    _preview: ContextPackPreview,
    relevantFiles: IncludedFileDecision[],
  ): string {
    const totalDesignFiles = relevantFiles.filter((f) => {
      const ext = this.getExtension(f.file.relativePath as string);
      return ['.css', '.scss', '.less', '.sass'].includes(ext);
    }).length;

    const totalComponentFiles = relevantFiles.filter((f) => {
      const ext = this.getExtension(f.file.relativePath as string);
      return ['.jsx', '.tsx', '.vue', '.svelte'].includes(ext);
    }).length;

    const totalAssetFiles = relevantFiles.filter((f) => {
      const ext = this.getExtension(f.file.relativePath as string);
      return [
        '.svg',
        '.png',
        '.jpg',
        '.jpeg',
        '.gif',
        '.webp',
        '.woff',
        '.woff2',
        '.ttf',
        '.eot',
      ].includes(ext);
    }).length;

    const totalMarkupFiles = relevantFiles.filter((f) => {
      const ext = this.getExtension(f.file.relativePath as string);
      return ['.html', '.htm'].includes(ext);
    }).length;

    const totalTokens = relevantFiles.reduce((sum, f) => sum + f.estimatedTokens, 0);

    return [
      `Analyse UI/UX du projet — ${relevantFiles.length} fichiers pertinents identifiés.`,
      `- ${totalDesignFiles} fichier(s) de style (CSS/SCSS/Less/Sass)`,
      `- ${totalComponentFiles} fichier(s) de composants (JSX/TSX/Vue/Svelte)`,
      `- ${totalMarkupFiles} fichier(s) de markup (HTML)`,
      `- ${totalAssetFiles} fichier(s) d'assets (images, polices)`,
      `Volume estimé : ~${totalTokens} tokens.`,
    ].join('\n');
  }

  /**
   * Construit les recommandations basées sur l'analyse.
   */
  private buildRecommendations(
    preview: ContextPackPreview,
    relevantFiles: IncludedFileDecision[],
    options: UiUxOutputOptions,
  ): string[] {
    const recommendations: string[] = [];

    const styleFiles = relevantFiles.filter((f) => {
      const ext = this.getExtension(f.file.relativePath as string);
      return ['.css', '.scss', '.less', '.sass'].includes(ext);
    });

    const componentFiles = relevantFiles.filter((f) => {
      const ext = this.getExtension(f.file.relativePath as string);
      return ['.jsx', '.tsx', '.vue', '.svelte'].includes(ext);
    });

    // Recommandations sur les styles
    if (styleFiles.length > 10) {
      recommendations.push(
        `Le projet contient ${styleFiles.length} fichiers de style. Envisagez de consolider avec un design system ou CSS-in-JS pour réduire la fragmentation.`,
      );
    } else if (styleFiles.length === 0 && componentFiles.length > 0) {
      recommendations.push(
        'Aucun fichier de style détecté. Assurez-vous que les styles sont gérés via CSS-in-JS ou un framework de composants.',
      );
    }

    // Recommandations sur les composants
    if (componentFiles.length > 50) {
      recommendations.push(
        `${componentFiles.length} composants détectés. Vérifiez la couverture de tests visuels et l'utilisation de Storybook ou équivalent.`,
      );
    }

    // Recommandations sur la taille totale
    const totalTokens = preview.estimatedTokens;
    if (totalTokens > 100_000) {
      recommendations.push(
        'Le volume total dépasse 100k tokens. Considérez la segmentation par domaine fonctionnel pour optimiser le contexte.',
      );
    }

    // Recommandations sur les assets
    const assetFiles = relevantFiles.filter((f) => {
      const ext = this.getExtension(f.file.relativePath as string);
      return ['.png', '.jpg', '.jpeg', '.gif'].includes(ext);
    });
    if (assetFiles.length > 20) {
      recommendations.push(
        `${assetFiles.length} images raster détectées. Optimisez la compression et privilégiez le format WebP.`,
      );
    }

    // Recommandations génériques
    if (relevantFiles.length === 0) {
      recommendations.push(
        'Aucun fichier UI/UX détecté. Vérifiez que les sélecteurs de chemin incluent les dossiers de composants et de styles.',
      );
    }

    if (componentFiles.length > 0 && styleFiles.length > 0) {
      const ratio = componentFiles.length / styleFiles.length;
      if (ratio > 5) {
        recommendations.push(
          'Ratio composants/styles élevé. Vérifiez que chaque composant a des styles associés ou utilise un système de design cohérent.',
        );
      }
    }

    // Limiter au nombre max
    return recommendations.slice(0, options.maxRecommendations);
  }

  /**
   * Construit un rapport d'accessibilité simulé.
   */
  private buildAccessibilityReport(
    _preview: ContextPackPreview,
    relevantFiles: IncludedFileDecision[],
  ): string {
    const markupFiles = relevantFiles.filter((f) => {
      const ext = this.getExtension(f.file.relativePath as string);
      return ['.html', '.htm', '.jsx', '.tsx', '.vue', '.svelte'].includes(ext);
    });

    if (markupFiles.length === 0) {
      return "Aucun fichier de markup détecté pour l'analyse d'accessibilité.";
    }

    // Comptage simulé : on vérifie la présence de patterns ARIA dans les noms
    const ariaRelatedFiles = markupFiles.filter((f) => {
      const name = (f.file.relativePath as string).toLowerCase();
      return /aria|a11y|accessib/i.test(name);
    });

    return [
      `Rapport d'accessibilité simulé — basé sur ${markupFiles.length} fichiers de markup.`,
      '',
      '⚠️ Ce rapport est une estimation basée sur les noms de fichiers.',
      'Une analyse approfondie nécessite des outils comme axe-core ou Lighthouse.',
      '',
      ariaRelatedFiles.length > 0
        ? `- ${ariaRelatedFiles.length} fichier(s) avec des références à l'accessibilité détecté(s).`
        : "- Aucun fichier avec référence explicite à l'accessibilité détecté.",
      '- Vérifiez les contrastes de couleurs, les labels ARIA et la navigation au clavier.',
      '- Assurez-vous que tous les éléments interactifs ont des rôles et états appropriés.',
    ].join('\n');
  }

  /**
   * Construit les métriques de performance estimées.
   */
  private buildPerformanceMetrics(
    _preview: ContextPackPreview,
    relevantFiles: IncludedFileDecision[],
  ): UiUxOutput['performanceMetrics'] {
    const componentFiles = relevantFiles.filter((f) => {
      const ext = this.getExtension(f.file.relativePath as string);
      return ['.jsx', '.tsx', '.vue', '.svelte'].includes(ext);
    });

    const styleFiles = relevantFiles.filter((f) => {
      const ext = this.getExtension(f.file.relativePath as string);
      return ['.css', '.scss', '.less', '.sass'].includes(ext);
    });

    const totalComplexity = componentFiles.length * 2 + styleFiles.length;
    let estimatedBundleComplexity: 'low' | 'medium' | 'high' = 'low';
    if (totalComplexity > 100) {
      estimatedBundleComplexity = 'high';
    } else if (totalComplexity > 30) {
      estimatedBundleComplexity = 'medium';
    }

    return {
      componentCount: componentFiles.length,
      styleFileCount: styleFiles.length,
      estimatedBundleComplexity,
    };
  }

  /**
   * Extrait l'extension d'un chemin de fichier.
   */
  private getExtension(filePath: string): string {
    const lastDot = filePath.lastIndexOf('.');
    if (lastDot === -1) return '';
    return `.${filePath.slice(lastDot + 1).toLowerCase()}`;
  }
}
