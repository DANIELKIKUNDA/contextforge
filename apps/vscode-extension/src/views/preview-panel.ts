import type { ContextPackPreview } from '@contextforge/contracts';
import { ViewColumn, window } from 'vscode';

/**
 * Panel de preview affiché dans une webview VS Code.
 * Affiche le résumé de la preview (objectif, profil, fichiers, tokens, warnings, fingerprint)
 * sans exposer de secret brut.
 */
export class PreviewPanel {
  private static readonly VIEW_TYPE = 'contextForge.preview';

  /**
   * Affiche la preview dans un panel VS Code.
   *
   * @param preview - La preview à afficher.
   * @returns Promise résolue quand le panel est affiché.
   */
  async show(preview: ContextPackPreview): Promise<void> {
    const panel = window.createWebviewPanel(
      PreviewPanel.VIEW_TYPE,
      'ContextForge — Preview',
      ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [],
      },
    );

    panel.webview.html = this.buildHtml(preview);
  }

  /**
   * Construit le HTML de la webview avec CSP stricte.
   * Aucun script distant, aucun style distant, aucun accès réseau.
   */
  private buildHtml(preview: ContextPackPreview): string {
    const nonce = this.generateNonce();

    const decisions = preview.decisions ?? [];
    const includedCount = preview.includedCount ?? 0;
    const excludedCount = preview.excludedCount ?? 0;
    const blockedCount = preview.blockedCount ?? 0;
    const oversizedCount = preview.oversizedCount ?? 0;
    const failedCount = preview.failedCount ?? 0;
    const estimatedTokens = preview.estimatedTokens ?? 0;
    const estimatedVolumes = preview.estimatedVolumes ?? 0;
    const warnings = preview.warnings ?? [];

    // Échapper HTML pour éviter les injections
    const escapeHtml = (str: string): string =>
      str
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#039;');

    const objective = escapeHtml(String(preview.objective ?? 'Non défini'));
    const profile = escapeHtml(String(preview.profile ?? 'Non défini'));
    const fingerprint = escapeHtml(String(preview.requestFingerprint ?? 'N/A'));

    const warningsHtml =
      warnings.length > 0
        ? warnings.map((w) => `<li class="warning-item">${escapeHtml(String(w))}</li>`).join('')
        : '<li class="no-warnings">Aucun avertissement</li>';

    const filesSummary = decisions
      .filter((d) => d.status === 'included')
      .slice(0, 50)
      .map((d) => {
        const path = 'file' in d && d.file ? String(d.file.relativePath ?? '') : '';
        const tokens = 'estimatedTokens' in d ? d.estimatedTokens : 0;
        return `<tr><td class="file-path">${escapeHtml(path)}</td><td class="file-tokens">${tokens}</td></tr>`;
      })
      .join('');

    const totalFiles = includedCount + excludedCount + blockedCount + oversizedCount + failedCount;
    const moreFiles =
      includedCount > 50
        ? `<p class="more-files">... et ${includedCount - 50} fichiers supplémentaires</p>`
        : '';

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}'; img-src 'none'; font-src 'none';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ContextForge Preview</title>
  <style nonce="${nonce}">
    :root {
      --bg: var(--vscode-editor-background, #1e1e1e);
      --fg: var(--vscode-editor-foreground, #d4d4d4);
      --border: var(--vscode-panel-border, #3c3c3c);
      --accent: var(--vscode-textLink-foreground, #3794ff);
      --warning: var(--vscode-editorWarning-foreground, #cca700);
      --error: var(--vscode-editorError-foreground, #f48771);
      --success: var(--vscode-terminal-ansiGreen, #4ec9b0);
      --heading: var(--vscode-editor-foreground, #e0e0e0);
      --card-bg: var(--vscode-sideBar-background, #252526);
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--vscode-font-family, -apple-system, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      color: var(--fg);
      background: var(--bg);
      padding: 16px;
      line-height: 1.5;
    }
    h1 { font-size: 1.3em; color: var(--heading); margin-bottom: 12px; }
    h2 { font-size: 1.1em; color: var(--heading); margin: 16px 0 8px; border-bottom: 1px solid var(--border); padding-bottom: 4px; }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 12px;
    }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .stat { display: flex; justify-content: space-between; padding: 4px 0; }
    .stat-label { color: var(--fg); opacity: 0.8; }
    .stat-value { font-weight: 600; }
    .stat-value.success { color: var(--success); }
    .stat-value.warning { color: var(--warning); }
    .stat-value.error { color: var(--error); }
    .fingerprint { font-family: var(--vscode-editor-font-family, monospace); font-size: 0.85em; word-break: break-all; opacity: 0.7; }
    .warning-list { list-style: none; }
    .warning-item { padding: 2px 0; color: var(--warning); }
    .warning-item::before { content: '⚠ '; }
    .no-warnings { opacity: 0.6; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 4px 8px; border-bottom: 1px solid var(--border); color: var(--heading); }
    td { padding: 3px 8px; border-bottom: 1px solid var(--border); }
    .file-path { word-break: break-all; }
    .file-tokens { text-align: right; font-family: monospace; }
    .more-files { font-style: italic; opacity: 0.7; margin-top: 8px; text-align: center; }
    .footer { margin-top: 16px; text-align: center; font-size: 0.85em; opacity: 0.5; }
  </style>
</head>
<body>
  <h1>ContextForge — Aperçu du Context Pack</h1>

  <div class="card">
    <div class="grid">
      <div class="stat">
        <span class="stat-label">Objectif</span>
        <span class="stat-value">${objective}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Profil</span>
        <span class="stat-value">${profile}</span>
      </div>
    </div>
  </div>

  <h2>Résumé des fichiers</h2>
  <div class="card">
    <div class="grid">
      <div class="stat">
        <span class="stat-label">Total</span>
        <span class="stat-value">${totalFiles}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Inclus</span>
        <span class="stat-value success">${includedCount}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Exclus</span>
        <span class="stat-value">${excludedCount}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Bloqués</span>
        <span class="stat-value error">${blockedCount}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Oversized</span>
        <span class="stat-value warning">${oversizedCount}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Échecs</span>
        <span class="stat-value error">${failedCount}</span>
      </div>
    </div>
  </div>

  <h2>Estimation</h2>
  <div class="card">
    <div class="grid">
      <div class="stat">
        <span class="stat-label">Tokens estimés</span>
        <span class="stat-value">${estimatedTokens.toLocaleString()}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Volumes prévus</span>
        <span class="stat-value">${estimatedVolumes}</span>
      </div>
    </div>
  </div>

  <h2>Fichiers inclus (${Math.min(includedCount, 50)}/${includedCount})</h2>
  <table>
    <thead>
      <tr><th>Fichier</th><th>Tokens</th></tr>
    </thead>
    <tbody>
      ${filesSummary || '<tr><td colspan="2">Aucun fichier inclus</td></tr>'}
    </tbody>
  </table>
  ${moreFiles}

  <h2>Avertissements</h2>
  <div class="card">
    <ul class="warning-list">
      ${warningsHtml}
    </ul>
  </div>

  <h2>Fingerprint</h2>
  <div class="card">
    <p class="fingerprint">${fingerprint}</p>
  </div>

  <div class="footer">
    ContextForge V1 — Généré localement, offline-first
  </div>

  <script nonce="${nonce}">
    // Script minimal pour l'accessibilité clavier
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        // VS Code gère la fermeture du panel via l'API
      }
    });
  </script>
</body>
</html>`;
  }

  /**
   * Génère un nonce cryptographique pour la CSP.
   */
  private generateNonce(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    // Utiliser crypto.getRandomValues pour un vrai nonce
    const values = new Uint32Array(16);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(values);
    } else {
      // Fallback pour les environnements sans crypto (tests)
      for (let i = 0; i < 16; i++) {
        values[i] = Math.floor(Math.random() * 0xffffffff);
      }
    }
    for (let i = 0; i < 16; i++) {
      const val = values[i];
      if (val !== undefined) {
        result += chars[val % chars.length];
      }
    }
    return result;
  }
}
