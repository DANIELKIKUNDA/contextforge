import { commands, window, workspace } from 'vscode';

/**
 * Commande VS Code : contextForge.validateConfiguration.
 * Vérifie la configuration ContextForge du workspace (settings.json, fichier projet).
 *
 * Aucune logique métier — délégation au port de configuration Core.
 */
export function registerValidateConfigurationCommand(configurationPort: {
  load(): Promise<{
    config: import('@contextforge/contracts').ContextForgeConfiguration;
    provenance: import('@contextforge/core').ConfigurationProvenance;
  }>;
}): void {
  commands.registerCommand('contextForge.validateConfiguration', async () => {
    try {
      const { config, provenance } = await configurationPort.load();

      const lines: string[] = [
        'Configuration ContextForge valide ✅',
        '',
        `Répertoire de sortie : ${config.outputDirectory}`,
        `Blocage fichiers sensibles : ${config.blockSensitiveFiles ? 'activé' : 'désactivé'}`,
        `Suivi des liens symboliques : ${config.followSymlinks ? 'activé' : 'désactivé'}`,
        `Taille max fichier : ${(config.maxFileSizeBytes ?? 1_048_576).toLocaleString()} octets`,
        `Lectures concurrentes max : ${config.maxConcurrentReads ?? 16}`,
        `Preview avant génération : ${config.previewBeforeGenerate ? 'activée' : 'désactivée'}`,
        '',
        'Provenance :',
        ...Object.entries(provenance).map(([key, source]) => `  - ${key} : ${source}`),
      ];

      window.showInformationMessage(lines.join('\n'), { modal: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue.';
      window.showErrorMessage(`Erreur de configuration : ${message}`);
    }
  });
}
