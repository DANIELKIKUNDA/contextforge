import { window } from 'vscode';

/**
 * Résultat de la saisie d'un objectif.
 */
export interface ObjectiveInputResult {
  /** L'objectif saisi, ou undefined si annulé. */
  objective?: string;
  /** true si l'utilisateur a annulé la saisie. */
  cancelled: boolean;
}

/**
 * Vue de saisie de l'objectif métier.
 * Utilise vscode.window.showInputBox pour collecter l'objectif.
 *
 * Validation :
 * - longueur minimale : 10 caractères
 * - longueur maximale : 500 caractères
 * - pas uniquement des espaces
 */
export class ObjectiveInputView {
  /**
   * Affiche la boîte de saisie et retourne le résultat.
   *
   * @param defaultValue - Valeur pré-remplie (optionnelle).
   * @returns L'objectif saisi ou l'état d'annulation.
   */
  async collect(defaultValue?: string): Promise<ObjectiveInputResult> {
    const value = await window.showInputBox({
      title: 'ContextForge — Objectif du Context Pack',
      prompt: 'Décrivez l’objectif de ce Context Pack (10 à 500 caractères)',
      placeHolder: 'Exemple : Revue de code du module d’authentification',
      ...(defaultValue !== undefined ? { value: defaultValue } : {}),
      validateInput: (text: string) => this.validate(text),
      ignoreFocusOut: true,
    });

    if (value === undefined) {
      return { cancelled: true };
    }

    const trimmed = value.trim();
    if (trimmed.length < 10) {
      return { cancelled: true };
    }

    return { objective: trimmed, cancelled: false };
  }

  /**
   * Valide la saisie et retourne un message d'erreur ou undefined si valide.
   */
  private validate(text: string): string | undefined {
    const trimmed = text.trim();

    if (trimmed.length === 0) {
      return 'L’objectif ne peut pas être vide.';
    }

    if (trimmed.length < 10) {
      return `L’objectif doit contenir au moins 10 caractères (actuel : ${trimmed.length}).`;
    }

    if (trimmed.length > 500) {
      return `L’objectif ne peut pas dépasser 500 caractères (actuel : ${trimmed.length}).`;
    }

    return undefined;
  }
}
