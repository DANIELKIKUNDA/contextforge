import type { ContextPackPreview, IncludedFileDecision, SourceFile } from '@contextforge/contracts';
import { describe, expect, it } from 'vitest';
import { UiUxOutputGenerator } from '../ui-ux-output.generator.js';
import type { UiUxOutputOptions } from '../ui-ux-output.generator.js';

/**
 * Construit un SourceFile minimal pour les tests.
 */
function fakeFile(relativePath: string, sizeInBytes = 1024): SourceFile {
  return {
    id: `id-${relativePath}` as SourceFile['id'],
    relativePath: relativePath as SourceFile['relativePath'],
    absolutePath: `/fake/${relativePath}`,
    extension: relativePath.includes('.') ? `.${relativePath.split('.').pop()}` : '',
    sizeInBytes,
    encoding: 'utf-8',
    contentKind: 'text',
    discoveredAt: new Date().toISOString(),
  };
}

function fakeIncluded(relativePath: string, estimatedTokens = 100): IncludedFileDecision {
  return {
    status: 'included',
    file: fakeFile(relativePath),
    estimatedTokens,
    category: 'code',
    priority: 5,
    warnings: [],
  };
}

function emptyPreview(): ContextPackPreview {
  return {
    previewId: 'preview-1',
    requestFingerprint: 'fp-1',
    project: {
      name: 'test',
      rootPath: '/test',
      workspaceKind: 'single-root',
      platform: 'unknown',
      detectedLanguages: [],
      selectedPaths: [],
    },
    objective: 'Test' as unknown as ContextPackPreview['objective'],
    profile: 'ai-general',
    decisions: [],
    includedCount: 0,
    excludedCount: 0,
    blockedCount: 0,
    oversizedCount: 0,
    failedCount: 0,
    estimatedTokens: 0,
    estimatedBytes: 0,
    estimatedVolumes: 0,
    warnings: [],
    requiresConfirmation: false,
    createdAt: new Date().toISOString(),
  };
}

describe('UiUxOutputGenerator', () => {
  const generator = new UiUxOutputGenerator();
  const options = UiUxOutputGenerator.defaultOptions();

  it('retourne un résumé vide pour un preview sans fichier UI/UX', () => {
    const preview = emptyPreview();
    const output = generator.generate(preview, options);

    expect(output.summary).toContain('0 fichiers pertinents');
    expect(output.recommendations.some((r) => r.includes('Aucun fichier UI/UX détecté'))).toBe(
      true,
    );
  });

  it("détecte les fichiers CSS et les inclut dans l'analyse", () => {
    const preview: ContextPackPreview = {
      ...emptyPreview(),
      decisions: [
        fakeIncluded('src/styles/main.css'),
        fakeIncluded('src/styles/theme.scss'),
        fakeIncluded('src/styles/variables.less'),
      ],
      includedCount: 3,
    };

    const output = generator.generate(preview, options);

    expect(output.relevantFiles).toHaveLength(3);
    expect(output.summary).toContain('3 fichier(s) de style');
    expect(output.summary).toContain('0 fichier(s) de composants');
  });

  it('détecte les fichiers de composants (JSX/TSX/Vue/Svelte)', () => {
    const preview: ContextPackPreview = {
      ...emptyPreview(),
      decisions: [
        fakeIncluded('src/components/Button.tsx'),
        fakeIncluded('src/components/Card.vue'),
        fakeIncluded('src/components/Navbar.svelte'),
      ],
      includedCount: 3,
    };

    const output = generator.generate(preview, options);

    expect(output.relevantFiles).toHaveLength(3);
    expect(output.summary).toContain('3 fichier(s) de composants');
  });

  it('détecte les fichiers par pattern de nom même sans extension reconnue', () => {
    const preview: ContextPackPreview = {
      ...emptyPreview(),
      decisions: [fakeIncluded('src/Button.module.ts')],
      includedCount: 1,
    };

    const output = generator.generate(preview, options);
    expect(output.relevantFiles).toHaveLength(1);
  });

  it('ignore les fichiers qui ne sont pas "included"', () => {
    const preview: ContextPackPreview = {
      ...emptyPreview(),
      decisions: [
        fakeIncluded('src/styles/main.css'),
        {
          status: 'blocked',
          file: fakeFile('secrets.env'),
          reasonCode: 'secret-detected' as const,
          reason: 'Fichier sensible',
          findings: [],
          highestSeverity: 'critical',
        },
        {
          status: 'failed',
          relativePath: 'error.log',
          errorCode: 'READ_ERROR',
          message: 'Erreur',
          recoverable: true,
        },
      ],
      includedCount: 1,
      blockedCount: 1,
      failedCount: 1,
    };

    const output = generator.generate(preview, options);

    expect(output.relevantFiles).toHaveLength(1);
    expect(output.summary).toContain('1 fichier');
  });

  it('génère des recommandations quand plus de 10 fichiers de style', () => {
    const decisions: IncludedFileDecision[] = [];
    for (let i = 0; i < 15; i++) {
      decisions.push(fakeIncluded(`src/styles/style-${i}.css`));
    }

    const preview: ContextPackPreview = {
      ...emptyPreview(),
      decisions,
      includedCount: 15,
    };

    const output = generator.generate(preview, options);

    const designRecommendation = output.recommendations.find((r) =>
      r.includes('fichiers de style'),
    );
    expect(designRecommendation).toBeDefined();
  });

  it('génère des recommandations quand plus de 50 composants', () => {
    const decisions: IncludedFileDecision[] = [];
    for (let i = 0; i < 60; i++) {
      decisions.push(fakeIncluded(`src/components/Comp${i}.tsx`));
    }

    const preview: ContextPackPreview = {
      ...emptyPreview(),
      decisions,
      includedCount: 60,
      estimatedTokens: 200_000,
    };

    const output = generator.generate(preview, options);

    const componentRec = output.recommendations.find((r) => r.includes('composants détectés'));
    expect(componentRec).toBeDefined();

    const volumeRec = output.recommendations.find((r) => r.includes('dépasse 100k tokens'));
    expect(volumeRec).toBeDefined();
  });

  it("génère le rapport d'accessibilité quand des fichiers de markup sont présents", () => {
    const preview: ContextPackPreview = {
      ...emptyPreview(),
      decisions: [fakeIncluded('src/index.html'), fakeIncluded('src/components/App.tsx')],
      includedCount: 2,
    };

    const output = generator.generate(preview, options);

    expect(output.accessibilityReport).toBeDefined();
    expect(output.accessibilityReport).toContain('fichiers de markup');
  });

  it("ne génère pas le rapport d'accessibilité si désactivé", () => {
    const preview: ContextPackPreview = {
      ...emptyPreview(),
      decisions: [fakeIncluded('src/index.html')],
      includedCount: 1,
    };

    const customOptions: UiUxOutputOptions = {
      ...options,
      includeAccessibilityReport: false,
    };
    const output = generator.generate(preview, customOptions);

    expect(output.accessibilityReport).toBeUndefined();
  });

  it('génère les métriques de performance', () => {
    const decisions: IncludedFileDecision[] = [];
    for (let i = 0; i < 60; i++) {
      decisions.push(fakeIncluded(`src/components/Comp${i}.tsx`));
    }
    for (let i = 0; i < 20; i++) {
      decisions.push(fakeIncluded(`src/styles/style-${i}.css`));
    }

    const preview: ContextPackPreview = {
      ...emptyPreview(),
      decisions,
      includedCount: 80,
    };

    const output = generator.generate(preview, options);

    expect(output.performanceMetrics).toBeDefined();
    expect(output.performanceMetrics?.componentCount).toBe(60);
    expect(output.performanceMetrics?.styleFileCount).toBe(20);
    expect(output.performanceMetrics?.estimatedBundleComplexity).toBe('high');
  });

  it('calcule une complexité bundle faible', () => {
    const preview: ContextPackPreview = {
      ...emptyPreview(),
      decisions: [fakeIncluded('src/components/Button.tsx'), fakeIncluded('src/styles/main.css')],
      includedCount: 2,
    };

    const output = generator.generate(preview, options);

    expect(output.performanceMetrics?.estimatedBundleComplexity).toBe('low');
  });

  it('limite les recommandations au maxRecommendations', () => {
    const decisions: IncludedFileDecision[] = [];
    for (let i = 0; i < 100; i++) {
      decisions.push(fakeIncluded(`src/styles/style-${i}.css`));
    }

    const preview: ContextPackPreview = {
      ...emptyPreview(),
      decisions,
      includedCount: 100,
      estimatedTokens: 500_000,
    };

    const limitedOptions: UiUxOutputOptions = { ...options, maxRecommendations: 2 };
    const output = generator.generate(preview, limitedOptions);

    expect(output.recommendations.length).toBeLessThanOrEqual(2);
  });

  it('fournit des options par défaut valides', () => {
    const defaultOpts = UiUxOutputGenerator.defaultOptions();
    expect(defaultOpts.maxRecommendations).toBe(10);
    expect(defaultOpts.includeAccessibilityReport).toBe(true);
    expect(defaultOpts.includePerformanceMetrics).toBe(true);
  });

  it('détecte les images et assets', () => {
    const preview: ContextPackPreview = {
      ...emptyPreview(),
      decisions: [
        fakeIncluded('assets/logo.svg'),
        fakeIncluded('assets/banner.png'),
        fakeIncluded('assets/hero.webp'),
        fakeIncluded('fonts/roboto.woff2'),
      ],
      includedCount: 4,
    };

    const output = generator.generate(preview, options);

    expect(output.relevantFiles).toHaveLength(4);
    expect(output.summary).toContain("fichier(s) d'assets");
  });

  it('détecte les fichiers HTML comme markup', () => {
    const preview: ContextPackPreview = {
      ...emptyPreview(),
      decisions: [fakeIncluded('public/index.html'), fakeIncluded('templates/email.htm')],
      includedCount: 2,
    };

    const output = generator.generate(preview, options);

    expect(output.summary).toContain('2 fichier(s) de markup (HTML)');
  });
});
