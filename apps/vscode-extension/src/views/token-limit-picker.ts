import { window } from 'vscode';

/**
 * Preset de limite de tokens.
 */
interface TokenLimitPreset {
  label: string;
  description: string;
  value: number;
}

/**
 * Résultat de la sélection de la limite de tokens.
 */
export interface TokenLimitPickerResult {
  /** La limite choisie, ou undefined si annulé. */
  tokenLimit?: number;
  /** true si l'utilisateur a annulé. */
  cancelled: boolean;
}

/**
 * Vue de sélection de la limite de tokens via QuickPick.
 * Propose des presets standards (4K à 128K).
 */
export class TokenLimitPickerView {
  private readonly presets: TokenLimitPreset[] = [
    { label: '4 000 tokens', description: 'GPT-3.5 (~12 pages)', value: 4000 },
    { label: '8 000 tokens', description: 'GPT-4 (~24 pages)', value: 8000 },
    { label: '16 000 tokens', description: 'GPT-4 Turbo (~48 pages)', value: 16000 },
    { label: '32 000 tokens', description: 'GPT-4 32K (~96 pages)', value: 32000 },
    { label: '64 000 tokens', description: 'Claude 3 (~192 pages)', value: 64000 },
    {
      label: '128 000 tokens',
      description: 'Claude 3 / GPT-4 Turbo 128K (~384 pages)',
      value: 128000,
    },
  ];

  /**
   * Affiche le QuickPick et retourne la sélection.
   *
   * @param defaultLimit - Limite présélectionnée (optionnelle).
   * @returns La limite choisie ou l'état d'annulation.
   */
  async collect(_defaultLimit?: number): Promise<TokenLimitPickerResult> {
    const selected = await window.showQuickPick(this.presets, {
      title: 'ContextForge — Limite de tokens',
      placeHolder: 'Choisissez la limite de tokens pour le Context Pack',
      matchOnDescription: true,
      ignoreFocusOut: true,
    });

    if (selected === undefined) {
      return { cancelled: true };
    }

    return { tokenLimit: selected.value, cancelled: false };
  }
}
