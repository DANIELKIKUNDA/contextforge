import type { ConfigurationPort, LastPackRegistryPort } from '@contextforge/core';
import {
  GenerateContextPack,
  OpenLastContextPack,
  PrepareContextPackPreview,
  ValidateContextForgeConfiguration,
} from '@contextforge/core';
import { PackingStrategy } from '@contextforge/packer';
import { ProfileRegistry } from '@contextforge/profiles';
import { NodeFileContentReaderAdapter } from '@contextforge/scanner';
import { NodeFileDiscoveryAdapter } from '@contextforge/scanner';
import { SecurityScanner } from '@contextforge/security';
import { SizingStrategy } from '@contextforge/sizing';
import type { ExtensionContext } from 'vscode';
import { VscodeConfigurationAdapter } from './adapters/vscode-configuration.adapter.js';
import { VscodeContextPackWriter } from './adapters/vscode-context-pack-writer.js';
import { VscodeLastPackRegistryAdapter } from './adapters/vscode-last-pack-registry.adapter.js';
import { ContextPackWizard } from './workflows/context-pack-wizard.js';

export interface CompositionRoot {
  readonly preparePreview: PrepareContextPackPreview;
  readonly generatePack: GenerateContextPack;
  readonly validateConfiguration: ValidateContextForgeConfiguration;
  readonly openLastPack: OpenLastContextPack;
  readonly configurationPort: ConfigurationPort;
  readonly lastPackRegistry: LastPackRegistryPort;
  readonly wizard: ContextPackWizard;
}

/** Fakes pour les ports remplacés dynamiquement par le wizard VS Code. */
function stubProgress() {
  return { report: () => {} };
}
function stubCancellation() {
  return { isCancelled: false, throwIfCancelled: () => {} };
}

/**
 * Assemble toutes les implémentations concrètes.
 * Le ContextPackWriterPort est le vrai VscodeContextPackWriter.
 */
export function createCompositionRoot(context: ExtensionContext): CompositionRoot {
  const configurationPort = new VscodeConfigurationAdapter();
  const lastPackRegistry = new VscodeLastPackRegistryAdapter(context.workspaceState);
  const fileDiscovery = new NodeFileDiscoveryAdapter();
  const fileContentReader = new NodeFileContentReaderAdapter();
  const securityScanner = new SecurityScanner();
  const sizingPort = new SizingStrategy();
  const packingPort = new PackingStrategy();
  const profileRegistry = new ProfileRegistry();

  // VRAI adaptateur — pas de stub
  const contextPackWriter = new VscodeContextPackWriter();

  const preparePreview = new PrepareContextPackPreview(
    configurationPort,
    profileRegistry,
    fileDiscovery,
    fileContentReader,
    securityScanner,
    sizingPort,
    packingPort,
    stubProgress(),
    stubCancellation(),
  );

  const generatePack = new GenerateContextPack(
    contextPackWriter, // ← vraie implémentation
    fileContentReader,
    stubProgress(),
    stubCancellation(),
    { now: () => new Date() },
    {
      generatePackId: () => `pack-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      generatePreviewId: () => `preview-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    },
    lastPackRegistry,
  );

  const validateConfiguration = new ValidateContextForgeConfiguration(configurationPort);
  const openLastPack = new OpenLastContextPack(lastPackRegistry);

  const wizard = new ContextPackWizard(
    preparePreview,
    generatePack,
    configurationPort,
    profileRegistry,
  );

  return {
    preparePreview,
    generatePack,
    validateConfiguration,
    openLastPack,
    configurationPort,
    lastPackRegistry,
    wizard,
  };
}
