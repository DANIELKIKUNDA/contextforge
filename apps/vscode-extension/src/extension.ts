import type { ExtensionContext } from 'vscode';
import { window } from 'vscode';
import { registerGenerateContextPackCommand } from './commands/generate-context-pack.command.js';
import { registerOpenLastContextPackCommand } from './commands/open-last-context-pack.command.js';
import { registerPreviewContextPackCommand } from './commands/preview-context-pack.command.js';
import { registerValidateConfigurationCommand } from './commands/validate-configuration.command.js';
import { createCompositionRoot } from './composition-root.js';

/**
 * Point d'entrée de l'extension VS Code ContextForge.
 *
 * Architecture :
 * interface VS Code → adaptateurs VS Code → cas d'usage Core
 * → packages scanner/security/sizing/packer/generators
 *
 * Aucune logique de scan, sécurité, sizing, packing ou génération
 * n'est dupliquée ici — le composition root centralise le wiring.
 */

/**
 * Appelé par VS Code lors de l'activation de l'extension.
 * Enregistre les quatre commandes et construit le graphe de dépendances.
 */
export async function activate(context: ExtensionContext): Promise<void> {
  try {
    const root = await createCompositionRoot(context);

    // Enregistrement des quatre commandes obligatoires
    registerGenerateContextPackCommand(root.wizard);
    registerPreviewContextPackCommand(root.preparePreview);
    registerValidateConfigurationCommand(root.configurationPort);
    registerOpenLastContextPackCommand(root.lastPackRegistry);

    window.showInformationMessage('ContextForge est prêt.');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue lors de l’activation.';
    window.showErrorMessage(`ContextForge : échec d'activation — ${message}`);
    throw err;
  }
}

/**
 * Appelé par VS Code lors de la désactivation de l'extension.
 * Nettoie les ressources si nécessaire.
 */
export function deactivate(): void {
  // Rien à nettoyer pour le moment — les ressources sont gérées par VS Code
}
