import { existsSync } from 'node:fs';
import { commands, window, workspace } from 'vscode';
import { Uri } from 'vscode';

/**
 * Commande VS Code : contextForge.openLastContextPack.
 * Ouvre le dossier du dernier Context Pack généré.
 *
 * Utilise OpenLastContextPack du Core si disponible,
 * sinon utilise le LastPackRegistry directement.
 *
 * - Vérifie l'existence réelle du pack
 * - Gère proprement l'absence de dernier pack
 * - N'invente jamais de chemin
 * - N'ouvre jamais un chemin hors workspace sans validation
 */
export function registerOpenLastContextPackCommand(lastPackRegistry: {
  get(projectRoot: string): string | undefined;
}): void {
  commands.registerCommand('contextForge.openLastContextPack', async () => {
    const folders = workspace.workspaceFolders;

    if (!folders || folders.length === 0) {
      window.showInformationMessage(
        'Aucun workspace ouvert. Impossible de trouver le dernier Context Pack.',
      );
      return;
    }

    const projectRoot = folders[0]?.uri.fsPath ?? '';
    const lastPackPath = lastPackRegistry.get(projectRoot);

    if (!lastPackPath) {
      window.showInformationMessage(
        'Aucun Context Pack généré précédemment. Générez d’abord un Context Pack.',
      );
      return;
    }

    // Vérifier l'existence réelle
    if (!existsSync(lastPackPath)) {
      window.showWarningMessage(
        `Le dernier Context Pack n'existe plus : ${lastPackPath}. Il a peut-être été supprimé ou déplacé.`,
      );
      return;
    }

    // Vérifier que le chemin est dans le workspace
    const normalizedPack = lastPackPath.replace(/\\/g, '/');
    const normalizedRoot = projectRoot.replace(/\\/g, '/');

    if (!normalizedPack.startsWith(normalizedRoot)) {
      window.showWarningMessage(
        `Le dernier Context Pack se trouve hors du workspace actuel. Vérifiez le chemin : ${lastPackPath}`,
      );
      return;
    }

    // Ouvrir le dossier dans l'explorateur VS Code
    const uri = Uri.file(lastPackPath);
    await commands.executeCommand('revealInExplorer', uri);
  });
}
