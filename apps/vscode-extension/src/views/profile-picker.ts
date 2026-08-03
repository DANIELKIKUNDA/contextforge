import type { ProfileId } from '@contextforge/contracts';
import { window } from 'vscode';

/**
 * Élément affiché dans le QuickPick des profils.
 */
interface ProfileQuickPickItem {
  label: string;
  description: string;
  detail: string;
  id: ProfileId;
}

/**
 * Résultat de la sélection d'un profil.
 */
export interface ProfilePickerResult {
  /** Le profil choisi, ou undefined si annulé. */
  profile?: ProfileId;
  /** true si l'utilisateur a annulé. */
  cancelled: boolean;
}

/**
 * Vue de sélection du profil via QuickPick.
 * Affiche les profils disponibles avec description et détail.
 */
export class ProfilePickerView {
  private readonly profiles: ProfileQuickPickItem[] = [
    {
      label: 'AI General',
      description: 'ai-general',
      detail: 'Profil généraliste pour assistants IA — inclut tous les fichiers pertinents',
      id: 'ai-general' as ProfileId,
    },
    {
      label: 'Code Review',
      description: 'code-review',
      detail: 'Profil orienté revue de code — priorise la structure et la logique métier',
      id: 'code-review' as ProfileId,
    },
    {
      label: 'UI / UX',
      description: 'ui-ux',
      detail:
        'Profil orienté design system et composants UI — priorise styles, templates et interactions',
      id: 'ui-ux' as ProfileId,
    },
    {
      label: 'Personnalisé',
      description: 'custom',
      detail: 'Profil personnalisable via la configuration projet',
      id: 'custom' as ProfileId,
    },
  ];

  /**
   * Affiche le QuickPick et retourne la sélection.
   *
   * @param defaultProfile - Profil présélectionné (optionnel).
   * @returns Le profil choisi ou l'état d'annulation.
   */
  async collect(_defaultProfile?: ProfileId): Promise<ProfilePickerResult> {
    const items = [...this.profiles];

    const selected = await window.showQuickPick(items, {
      title: 'ContextForge — Choisir un profil',
      placeHolder: 'Sélectionnez le profil adapté à votre objectif',
      matchOnDescription: true,
      matchOnDetail: false,
      ignoreFocusOut: true,
    });

    if (selected === undefined) {
      return { cancelled: true };
    }

    return { profile: selected.id, cancelled: false };
  }
}
