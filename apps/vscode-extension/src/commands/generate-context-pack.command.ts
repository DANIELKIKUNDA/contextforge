import { commands, window, workspace } from 'vscode';
import type { ContextPackWizard } from '../workflows/context-pack-wizard.js';

/**
 * Commande VS Code : contextForge.generateContextPack.
 * Lance le wizard complet de génération d'un Context Pack.
 *
 * Aucune logique métier — délégation pure au wizard et au Core.
 */
export function registerGenerateContextPackCommand(wizard: ContextPackWizard): void {
  commands.registerCommand('contextForge.generateContextPack', async () => {
    const folders = workspace.workspaceFolders;

    if (!folders || folders.length === 0) {
      window.showErrorMessage(
        'Aucun workspace ouvert. Ouvrez un projet avant de générer un Context Pack.',
      );
      return;
    }

    const projectRoot = folders[0]?.uri.fsPath ?? '';

    try {
      await wizard.run(projectRoot, {
        isCancellationRequested: false,
        onCancellationRequested: () => ({ dispose: () => {} }),
      } as never);
    } catch (_err) {
      // Les erreurs sont déjà gérées dans le wizard
    }
  });
}
