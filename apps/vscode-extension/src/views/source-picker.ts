import { window, workspace } from 'vscode';
import type { Uri } from 'vscode';

/**
 * Résultat de la sélection des sources.
 */
export interface SourcePickerResult {
  /** Chemins relatifs sélectionnés, ou undefined si annulé. */
  paths?: string[];
  /** true si l'utilisateur a annulé. */
  cancelled: boolean;
}

/**
 * Vue de sélection des sources à inclure dans le Context Pack.
 * Propose des options rapides et un sélecteur de dossier/fichiers.
 */
export class SourcePickerView {
  /**
   * Affiche les options de sélection des sources et retourne le résultat.
   *
   * @returns Les chemins sélectionnés ou l'état d'annulation.
   */
  async collect(): Promise<SourcePickerResult> {
    const choice = await window.showQuickPick(
      [
        {
          label: '$(folder) Tout le workspace',
          description: 'Inclure tous les fichiers du workspace',
          value: 'workspace',
        },
        {
          label: '$(folder-opened) Sélectionner des dossiers...',
          description: 'Choisir des dossiers spécifiques',
          value: 'folders',
        },
        {
          label: '$(file) Sélectionner des fichiers...',
          description: 'Choisir des fichiers spécifiques',
          value: 'files',
        },
        {
          label: '$(root-folder) Racine du workspace uniquement',
          description: 'Fichiers à la racine seulement',
          value: 'root',
        },
      ],
      {
        title: 'ContextForge — Choisir les sources',
        placeHolder: 'Que voulez-vous inclure dans le Context Pack ?',
        ignoreFocusOut: true,
      },
    );

    if (!choice) {
      return { cancelled: true };
    }

    switch (choice.value) {
      case 'workspace': {
        // Tout le workspace — on utilise un tableau vide pour signaler "tout"
        const folders = workspace.workspaceFolders;
        if (!folders || folders.length === 0) {
          return { cancelled: true };
        }
        return { paths: ['.'], cancelled: false };
      }

      case 'folders': {
        return this.pickFolders();
      }

      case 'files': {
        return this.pickFiles();
      }

      case 'root': {
        return { paths: ['.'], cancelled: false };
      }

      default:
        return { cancelled: true };
    }
  }

  /**
   * Ouvre un sélecteur de dossiers.
   */
  private async pickFolders(): Promise<SourcePickerResult> {
    const uris = await window.showOpenDialog({
      title: 'ContextForge — Sélectionner des dossiers',
      canSelectFolders: true,
      canSelectFiles: false,
      canSelectMany: true,
      openLabel: 'Inclure ces dossiers',
    });

    if (!uris || uris.length === 0) {
      return { cancelled: true };
    }

    const rootPath = this.getWorkspaceRoot();
    const paths = uris
      .map((uri) => this.toRelativePath(uri, rootPath))
      .filter((p): p is string => p !== undefined);

    return { paths: paths.length > 0 ? paths : ['.'], cancelled: false };
  }

  /**
   * Ouvre un sélecteur de fichiers.
   */
  private async pickFiles(): Promise<SourcePickerResult> {
    const uris = await window.showOpenDialog({
      title: 'ContextForge — Sélectionner des fichiers',
      canSelectFolders: false,
      canSelectFiles: true,
      canSelectMany: true,
      openLabel: 'Inclure ces fichiers',
    });

    if (!uris || uris.length === 0) {
      return { cancelled: true };
    }

    const rootPath = this.getWorkspaceRoot();
    const paths = uris
      .map((uri) => this.toRelativePath(uri, rootPath))
      .filter((p): p is string => p !== undefined);

    return { paths: paths.length > 0 ? paths : ['.'], cancelled: false };
  }

  /**
   * Convertit un URI VS Code en chemin relatif par rapport à la racine du workspace.
   */
  private toRelativePath(uri: Uri, root: string): string | undefined {
    const fullPath = uri.fsPath;
    if (!fullPath.startsWith(root)) {
      return undefined;
    }
    const relative = fullPath.slice(root.length).replace(/\\/g, '/').replace(/^\//, '');
    return relative || '.';
  }

  /**
   * Récupère la racine du premier dossier de workspace.
   */
  private getWorkspaceRoot(): string {
    const folders = workspace.workspaceFolders;
    if (folders && folders.length > 0 && folders[0]) {
      return folders[0].uri.fsPath;
    }
    return '';
  }
}
