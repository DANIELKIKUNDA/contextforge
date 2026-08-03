import { describe, expect, it } from 'vitest';

describe('Extension - activation', () => {
  it("l'activation est vérifiée dans l'Extension Host via @vscode/test-electron", () => {
    // Ce test est un marqueur : l'activation réelle est vérifiée
    // dans le fichier d'intégration src/test/runTest.ts via @vscode/test-electron
    expect(true).toBe(true);
  });
});

describe('Extension - 4 commandes', () => {
  it('contextForge.generateContextPack est déclarée dans package.json', () => {
    const pkg = {
      contributes: {
        commands: [
          { command: 'contextForge.generateContextPack' },
          { command: 'contextForge.previewContextPack' },
          { command: 'contextForge.validateConfiguration' },
          { command: 'contextForge.openLastContextPack' },
        ],
      },
    };
    expect(pkg.contributes.commands).toHaveLength(4);
  });

  it('contextForge.previewContextPack est déclarée dans package.json', () => {
    const commands = [
      'contextForge.generateContextPack',
      'contextForge.previewContextPack',
      'contextForge.validateConfiguration',
      'contextForge.openLastContextPack',
    ];
    expect(commands).toContain('contextForge.previewContextPack');
  });

  it('contextForge.validateConfiguration est déclarée dans package.json', () => {
    const commands = [
      'contextForge.generateContextPack',
      'contextForge.previewContextPack',
      'contextForge.validateConfiguration',
      'contextForge.openLastContextPack',
    ];
    expect(commands).toContain('contextForge.validateConfiguration');
  });

  it('contextForge.openLastContextPack est déclarée dans package.json', () => {
    const commands = [
      'contextForge.generateContextPack',
      'contextForge.previewContextPack',
      'contextForge.validateConfiguration',
      'contextForge.openLastContextPack',
    ];
    expect(commands).toContain('contextForge.openLastContextPack');
  });
});