import type {
  ContextPackPreview,
  ContextPackResult,
  GenerateContextPackInput,
  ProfileId,
} from '@contextforge/contracts';
import type { CancellationPort, ConfigurationPort, ProfileRegistryPort } from '@contextforge/core';
import type { PreparePreviewInput } from '@contextforge/core';
import type { CancellationToken } from 'vscode';
import { ProgressLocation, commands, window } from 'vscode';
import { VscodeCancellationAdapter } from '../adapters/vscode-cancellation.adapter.js';
import { VscodeProgressAdapter } from '../adapters/vscode-progress.adapter.js';
import { ObjectiveInputView } from '../views/objective-input.js';
import { PreviewPanel } from '../views/preview-panel.js';
import { ProfilePickerView } from '../views/profile-picker.js';
import { SourcePickerView } from '../views/source-picker.js';
import { TokenLimitPickerView } from '../views/token-limit-picker.js';

/**
 * Résultat du wizard complet.
 */
export interface WizardResult {
  /** Preview produite, ou undefined si annulé. */
  preview?: ContextPackPreview;
  /** Résultat de la génération, ou undefined si preview seulement. */
  result?: ContextPackResult;
  /** true si l'utilisateur a annulé à une étape. */
  cancelled: boolean;
  /** Étape à laquelle l'annulation a eu lieu. */
  cancelledAt?: string;
}

/**
 * Wizard principal du parcours ContextForge.
 *
 * Flux :
 * 1. Vérifier workspace
 * 2. Objectif
 * 3. Profil
 * 4. Sources
 * 5. Limite tokens
 * 6. Preview
 * 7. Confirmation
 * 8. Génération avec progression
 * 9. Résultat
 * 10. Proposer ouverture
 *
 * Toute la logique métier reste dans le Core.
 * Le wizard est un pur orchestrateur d'interface.
 */
export class ContextPackWizard {
  constructor(
    private readonly preparePreview: {
      execute(input: PreparePreviewInput): Promise<ContextPackPreview>;
    },
    private readonly generatePack: {
      execute(
        input: import('@contextforge/contracts').GenerateContextPackInput,
        preview: ContextPackPreview,
      ): Promise<ContextPackResult>;
    },
    private readonly configurationPort: ConfigurationPort,
    private readonly profileRegistry: ProfileRegistryPort,
  ) {}

  /**
   * Exécute le parcours complet.
   *
   * @param projectRoot - Racine du projet.
   * @param token - Token d'annulation VS Code.
   * @returns Résultat du wizard.
   */
  async run(projectRoot: string, token: CancellationToken): Promise<WizardResult> {
    // Étape 1 : vérifier workspace
    if (!projectRoot) {
      window.showErrorMessage(
        'Aucun workspace ouvert. Ouvrez un projet avant d’utiliser ContextForge.',
      );
      return { cancelled: true, cancelledAt: 'workspace' };
    }

    const cancellation = new VscodeCancellationAdapter(token);

    // Étape 2 : objectif
    cancellation.throwIfCancelled();
    const objectiveView = new ObjectiveInputView();
    const objectiveResult = await objectiveView.collect();
    if (objectiveResult.cancelled || !objectiveResult.objective) {
      return { cancelled: true, cancelledAt: 'objective' };
    }
    const objective = objectiveResult.objective;

    // Étape 3 : profil
    cancellation.throwIfCancelled();
    const profilePicker = new ProfilePickerView();
    const profileResult = await profilePicker.collect();
    if (profileResult.cancelled || !profileResult.profile) {
      return { cancelled: true, cancelledAt: 'profile' };
    }
    const profile = profileResult.profile;

    // Étape 4 : sources
    cancellation.throwIfCancelled();
    const sourcePicker = new SourcePickerView();
    const sourceResult = await sourcePicker.collect();
    if (sourceResult.cancelled || !sourceResult.paths) {
      return { cancelled: true, cancelledAt: 'sources' };
    }
    const selectedPaths = sourceResult.paths;

    // Étape 5 : limite tokens
    cancellation.throwIfCancelled();
    const tokenPicker = new TokenLimitPickerView();
    const tokenResult = await tokenPicker.collect();
    if (tokenResult.cancelled || !tokenResult.tokenLimit) {
      return { cancelled: true, cancelledAt: 'tokenLimit' };
    }
    const tokenLimit = tokenResult.tokenLimit;

    // Étape 6 : preview avec progression
    cancellation.throwIfCancelled();
    const preview = await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: 'ContextForge — Génération de la preview...',
        cancellable: true,
      },
      async (_progress, _progressToken) => {
        try {
          return await this.preparePreview.execute({
            projectRoot,
            objective,
            profile,
            selectedPaths,
            tokenLimit,
          });
        } catch (err) {
          if (err instanceof Error && err.name === 'UserCancellationError') {
            return undefined;
          }
          throw err;
        }
      },
    );

    if (!preview) {
      return { cancelled: true, cancelledAt: 'preview' };
    }

    // Étape 7 : afficher la preview
    const previewPanel = new PreviewPanel();
    await previewPanel.show(preview);

    // Étape 8 : confirmation
    const confirm = await window.showInformationMessage(
      'Voulez-vous générer le Context Pack avec cette preview ?',
      { modal: true },
      'Générer',
      'Annuler',
    );

    if (confirm !== 'Générer') {
      return { cancelled: true, cancelledAt: 'confirmation' };
    }

    // Étape 9 : génération avec progression
    cancellation.throwIfCancelled();
    try {
      const result = await window.withProgress(
        {
          location: ProgressLocation.Notification,
          title: 'ContextForge — Génération du Context Pack...',
          cancellable: true,
        },
        async (_progress, _progressToken) => {
          const input: GenerateContextPackInput = {
            projectRoot,
            objective,
            profile,
            selectedPaths,
            tokenLimit,
            previewId: preview.previewId,
            requestFingerprint: preview.requestFingerprint,
          };

          return await this.generatePack.execute(input, preview);
        },
      );

      // Étape 10 : résultat
      const openChoice = await window.showInformationMessage(
        `Context Pack généré avec succès ! ${result.includedCount} fichiers inclus, ${result.estimatedTokens.toLocaleString()} tokens.`,
        'Ouvrir le dossier',
        'Fermer',
      );
      if (openChoice === 'Ouvrir le dossier') {
        await commands.executeCommand('contextForge.openLastContextPack');
      }

      return { result, preview, cancelled: false };
    } catch (err) {
      if (err instanceof Error && err.name === 'UserCancellationError') {
        window.showWarningMessage('Génération annulée.');
        return { cancelled: true, cancelledAt: 'generation' };
      }

      // Ne pas afficher de stack trace brute
      const message = err instanceof Error ? err.message : 'Erreur inconnue lors de la génération.';
      window.showErrorMessage(`Erreur de génération : ${message}`);
      return { cancelled: true, cancelledAt: 'generation' };
    }
  }
}
