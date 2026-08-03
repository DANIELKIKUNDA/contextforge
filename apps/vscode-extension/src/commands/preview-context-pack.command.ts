import { commands, window, workspace } from 'vscode';
import type { ContextPackWizard } from '../workflows/context-pack-wizard.js';

/**
 * Commande VS Code : contextForge.previewContextPack.
 * Lance le wizard en mode preview uniquement (s'arrête après la preview).
 *
 * Aucune logique métier — délégation pure au wizard et au Core.
 */
export function registerPreviewContextPackCommand(preparePreview: {
  execute(
    input: import('@contextforge/core').PreparePreviewInput,
  ): Promise<import('@contextforge/contracts').ContextPackPreview>;
}): void {
  commands.registerCommand('contextForge.previewContextPack', async () => {
    const folders = workspace.workspaceFolders;

    if (!folders || folders.length === 0) {
      window.showErrorMessage(
        'Aucun workspace ouvert. Ouvrez un projet avant de prévisualiser un Context Pack.',
      );
      return;
    }

    const projectRoot = folders[0]?.uri.fsPath ?? '';

    try {
      // Récupérer objectif, profil, sources, tokenLimit via le wizard simplifié
      const { ObjectiveInputView } = await import('../views/objective-input.js');
      const objectiveView = new ObjectiveInputView();
      const objectiveResult = await objectiveView.collect();
      if (objectiveResult.cancelled || !objectiveResult.objective) return;
      const objective = objectiveResult.objective;

      const { ProfilePickerView } = await import('../views/profile-picker.js');
      const profilePicker = new ProfilePickerView();
      const profileResult = await profilePicker.collect();
      if (profileResult.cancelled || !profileResult.profile) return;
      const profile = profileResult.profile;

      const { SourcePickerView } = await import('../views/source-picker.js');
      const sourcePicker = new SourcePickerView();
      const sourceResult = await sourcePicker.collect();
      if (sourceResult.cancelled || !sourceResult.paths) return;
      const selectedPaths = sourceResult.paths;

      const { TokenLimitPickerView } = await import('../views/token-limit-picker.js');
      const tokenPicker = new TokenLimitPickerView();
      const tokenResult = await tokenPicker.collect();
      if (tokenResult.cancelled || !tokenResult.tokenLimit) return;
      const tokenLimit = tokenResult.tokenLimit;

      const preview = await window.withProgress(
        {
          location: { viewId: 'workbench.progress' } as never,
          title: 'ContextForge — Génération de la preview...',
          cancellable: false,
        },
        async () => {
          return await preparePreview.execute({
            projectRoot,
            objective,
            profile,
            selectedPaths,
            tokenLimit,
          });
        },
      );

      const { PreviewPanel } = await import('../views/preview-panel.js');
      const previewPanel = new PreviewPanel();
      await previewPanel.show(preview);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la preview.';
      window.showErrorMessage(`Erreur de preview : ${message}`);
    }
  });
}
