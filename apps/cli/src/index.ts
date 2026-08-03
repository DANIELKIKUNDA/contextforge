#!/usr/bin/env node
/**
 * Point d'entrée CLI ContextForge — Phase 9.
 *
 * Architecture : commande → validation → composition root → use case → présentation → code de sortie.
 * La CLI ne contient aucune logique métier.
 * Tous les ports sont assemblés avec leurs implémentations concrètes.
 *
 * Mode interactif : utilise @inquirer/prompts pour demander les valeurs manquantes
 * lorsque le terminal est interactif (TTY) et que --non-interactive n'est pas passé.
 * Aucun prompt en mode JSON ou en CI.
 */
import { existsSync } from 'node:fs';
import { ConfigurationService } from '@contextforge/configuration';
import {
  GenerateContextPack,
  InspectProjectSources,
  ListAvailableProfiles,
  OpenLastContextPack,
  PrepareContextPackPreview,
  ProjectInspectionService,
  ValidateContextForgeConfiguration,
} from '@contextforge/core';
import type {
  CancellationPort,
  ClockPort,
  ConfigurationPort,
  ContextPackWriterPort,
  IdGeneratorPort,
  LastPackRegistryPort,
  PackingPort,
  ProgressReporterPort,
  SizingPort,
} from '@contextforge/core';
import { PackingStrategy } from '@contextforge/packer';
import { ProfileRegistry } from '@contextforge/profiles';
import { NodeFileContentReaderAdapter, NodeFileDiscoveryAdapter } from '@contextforge/scanner';
import { SecurityScanner } from '@contextforge/security';
import { SizingStrategy } from '@contextforge/sizing';
import { Command } from 'commander';
import { CliContextPackWriter } from './adapters/cli-context-pack-writer.js';
import { ExitCodes } from './presentation/exit-codes.js';
import { OutputFormatter } from './presentation/output-formatter.js';

const VALID_FORMATS = ['text', 'json'] as const;
const VERSION = '0.0.0';

const program = new Command();

program
  .name('contextforge')
  .description('ContextForge — Générateur local de Context Packs structurés')
  .version(VERSION)
  .option('--format <format>', 'Format de sortie (text | json)', 'text')
  .option('--non-interactive', 'Désactive les prompts interactifs', false);

/**
 * Valide le format global avant toute commande.
 */
program.hook('preAction', (_cmd, actionCmd) => {
  const globalFormat = program.opts().format as string;
  if (!VALID_FORMATS.includes(globalFormat as 'text' | 'json')) {
    process.stderr.write(`error: unknown format '${globalFormat}'. Allowed: text, json\n`);
    process.exit(1);
  }
  // Ignorer l'argument non utilisé actionCmd
  void actionCmd;
});

/**
 * Détermine si le mode interactif est disponible.
 * Vrai si stdin est un TTY ET que --non-interactive n'est pas passé
 * ET que --format n'est pas json (le JSON ne doit jamais être pollué).
 */
function isInteractive(): boolean {
  const opts = program.opts<{ format: string; nonInteractive: boolean }>();
  if (opts.nonInteractive) {
    return false;
  }
  if (opts.format === 'json') {
    return false;
  }
  return process.stdin.isTTY === true;
}

let _cancelled = false;
const cancellation: CancellationPort = {
  get isCancelled() {
    return _cancelled;
  },
  throwIfCancelled() {
    if (_cancelled) throw new Error('Opération annulée');
  },
};

function cancelOperation(): void {
  _cancelled = true;
}

let sigintReceived = false;

function createDeps(spinner?: { text: string }) {
  const progressReporter: ProgressReporterPort = {
    report: (event) => {
      if (spinner) {
        spinner.text = `[${event.phase}] ${event.message}`;
      }
    },
  };

  return {
    configurationPort: new ConfigurationService() as ConfigurationPort,
    profileRegistry: new ProfileRegistry(),
    fileDiscovery: new NodeFileDiscoveryAdapter(),
    fileReader: new NodeFileContentReaderAdapter(),
    securityScanner: new SecurityScanner(),
    sizingPort: new SizingStrategy() as SizingPort,
    packingPort: new PackingStrategy() as PackingPort,
    progressReporter,
    contextPackWriter: new CliContextPackWriter() as ContextPackWriterPort,
    clock: { now: () => new Date() } as ClockPort,
    idGenerator: {
      generatePackId: () => `pack-${Date.now()}`,
      generatePreviewId: () => `preview-${Date.now()}`,
    } as IdGeneratorPort,
    lastPackRegistry: {
      get: () => undefined,
      set: () => {},
      clear: () => {},
    } as LastPackRegistryPort,
  };
}

// ─── Commandes ────────────────────────────────────────────────────

program
  .command('version')
  .description('Affiche la version de ContextForge')
  .action(() => {
    const fmt = new OutputFormatter(program.opts().format as 'text' | 'json');
    if (fmt.isJson()) {
      fmt.log({ version: VERSION, status: 'ok' });
    } else {
      process.stdout.write(`ContextForge v${VERSION}\n`);
    }
  });

program
  .command('profiles')
  .description('Liste les profils disponibles')
  .action(() => {
    const fmt = new OutputFormatter(program.opts().format as 'text' | 'json');
    try {
      const useCase = new ListAvailableProfiles(new ProfileRegistry());
      const output = useCase.execute();
      if (fmt.isJson()) {
        fmt.log(fmt.formatProfiles(output));
      } else {
        process.stdout.write('Profils disponibles :\n\n');
        for (const p of output.profiles) {
          process.stdout.write(`  ${p.id} — ${p.name}\n    ${p.description}\n\n`);
        }
      }
    } catch (err) {
      fmt.diag((err as Error).message);
      process.exit(ExitCodes.INTERNAL_ERROR);
    }
  });

program
  .command('validate')
  .description('Valide la configuration ContextForge')
  .action(async () => {
    const fmt = new OutputFormatter(program.opts().format as 'text' | 'json');
    try {
      const deps = createDeps();
      const useCase = new ValidateContextForgeConfiguration(deps.configurationPort);
      const result = await useCase.execute();
      if (fmt.isJson()) {
        fmt.log(fmt.formatValidate(result));
      } else {
        process.stdout.write(
          result.errors.length === 0
            ? '✅ Configuration valide\n'
            : `❌ ${result.errors.join('\n')}\n`,
        );
      }
    } catch (err) {
      fmt.diag((err as Error).message);
      process.exit(ExitCodes.CONFIGURATION_ERROR);
    }
  });

program
  .command('inspect')
  .description("Inspecte les sources d'un projet")
  .argument('[projectRoot]', 'Racine du projet', '.')
  .action(async (projectRoot: string) => {
    const fmt = new OutputFormatter(program.opts().format as 'text' | 'json');
    try {
      let root = projectRoot;
      if (projectRoot === '.' && isInteractive()) {
        const { input } = await import('@inquirer/prompts');
        const answer = await input({
          message: 'Racine du projet à inspecter (ex: . ou /chemin/projet)',
          default: '.',
        });
        if (answer === undefined || answer === '') {
          process.exit(ExitCodes.CANCELLED);
        }
        root = answer;
      }

      // Validation du chemin
      if (root && !existsSync(root)) {
        fmt.diag(`Erreur : le chemin '${root}' n'existe pas.`);
        process.exit(ExitCodes.USER_INPUT_ERROR);
      }

      const useCase = new InspectProjectSources(
        new NodeFileDiscoveryAdapter(),
        new ProjectInspectionService(),
      );
      const output = await useCase.execute({ projectRoot: root });
      if (fmt.isJson()) {
        fmt.log(fmt.formatInspect(output));
      } else {
        process.stdout.write(`📁 ${output.structure.fileCount} fichiers découverts\n`);
        process.stdout.write(`📂 ${output.structure.directoryCount} répertoires\n`);
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      if (e.message?.includes('canceled') || e.message?.includes('abandoned')) {
        process.exit(ExitCodes.CANCELLED);
      }
      fmt.diag((err as Error).message);
      process.exit(ExitCodes.USER_INPUT_ERROR);
    }
  });

program
  .command('preview')
  .description('Prépare un preview de Context Pack')
  .option('-r, --root <path>', 'Racine du projet')
  .option('-o, --objective <text>', 'Objectif du pack')
  .option('-p, --profile <id>', 'Profil')
  .option('-t, --token-limit <number>', 'Limite de tokens', '32000')
  .action(async (opts: Record<string, string>) => {
    const fmt = new OutputFormatter(program.opts().format as 'text' | 'json');
    const isJson = fmt.isJson();
    const ora = isJson ? undefined : await import('ora');
    const spinner = ora ? ora.default({ text: 'Analyse en cours...' }).start() : undefined;

    let root = opts.root;
    let objective = opts.objective;
    let profile = opts.profile;
    let tokenLimit = opts.tokenLimit;

    if (isInteractive()) {
      const { input } = await import('@inquirer/prompts');
      if (!root) {
        root = await input({
          message: 'Racine du projet (ex: .)',
          default: '.',
        });
        if (root === undefined) process.exit(ExitCodes.CANCELLED);
      }
      if (!objective) {
        objective = await input({
          message: 'Objectif du pack (ex: "Revue de code du module auth")',
        });
        if (objective === undefined) process.exit(ExitCodes.CANCELLED);
      }
      if (!profile) {
        profile = await input({
          message: 'Profil (ai-general | code-review | ui-ux | custom)',
          default: 'ai-general',
        });
        if (profile === undefined) process.exit(ExitCodes.CANCELLED);
      }
      if (!tokenLimit) {
        const answer = await input({
          message: 'Limite de tokens',
          default: '32000',
        });
        if (answer === undefined) process.exit(ExitCodes.CANCELLED);
        tokenLimit = answer;
      }
    }

    if (!root || !objective || !profile) {
      fmt.diag('Erreur : les options --root, --objective et --profile sont obligatoires.');
      process.exit(ExitCodes.USER_INPUT_ERROR);
    }

    if (root && !existsSync(root)) {
      fmt.diag(`Erreur : le chemin '${root}' n'existe pas.`);
      process.exit(ExitCodes.USER_INPUT_ERROR);
    }

    try {
      const deps = createDeps(spinner as unknown as { text: string } | undefined);
      const useCase = new PrepareContextPackPreview(
        deps.configurationPort,
        deps.profileRegistry,
        deps.fileDiscovery,
        deps.fileReader,
        deps.securityScanner,
        deps.sizingPort,
        deps.packingPort,
        deps.progressReporter,
        cancellation,
      );
      const preview = await useCase.execute({
        projectRoot: root as string,
        objective: objective as string,
        profile: profile as 'ai-general',
        selectedPaths: ['.'],
        tokenLimit: Number(tokenLimit),
      });

      spinner?.succeed('Preview terminé');

      if (isJson) {
        fmt.log(fmt.formatPreview(preview));
      } else {
        process.stdout.write(`📦 Preview: ${preview.previewId}\n`);
        process.stdout.write(
          `✅ Inclus: ${preview.includedCount} | 🚫 Bloqués: ${preview.blockedCount}\n`,
        );
        process.stdout.write(`📊 Tokens: ~${preview.estimatedTokens}\n`);
      }
    } catch (err) {
      spinner?.fail('Échec');
      if (sigintReceived) {
        process.exit(ExitCodes.CANCELLED);
      }
      fmt.diag((err as Error).message);
      process.exit(ExitCodes.USER_INPUT_ERROR);
    }
  });

program
  .command('generate')
  .description('Génère un Context Pack')
  .option('-r, --root <path>', 'Racine du projet')
  .option('-o, --objective <text>', 'Objectif du pack')
  .option('-p, --profile <id>', 'Profil')
  .option('-t, --token-limit <number>', 'Limite de tokens', '32000')
  .action(async (opts: Record<string, string>) => {
    const fmt = new OutputFormatter(program.opts().format as 'text' | 'json');
    const isJson = fmt.isJson();
    const ora = isJson ? undefined : await import('ora');
    const spinner = ora ? ora.default({ text: 'Génération en cours...' }).start() : undefined;

    let root = opts.root;
    let objective = opts.objective;
    let profile = opts.profile;
    let tokenLimit = opts.tokenLimit;

    if (isInteractive()) {
      const { input } = await import('@inquirer/prompts');
      if (!root) {
        root = await input({
          message: 'Racine du projet (ex: .)',
          default: '.',
        });
        if (root === undefined) process.exit(ExitCodes.CANCELLED);
      }
      if (!objective) {
        objective = await input({
          message: 'Objectif du pack (ex: "Revue de code du module auth")',
        });
        if (objective === undefined) process.exit(ExitCodes.CANCELLED);
      }
      if (!profile) {
        profile = await input({
          message: 'Profil (ai-general | code-review | ui-ux | custom)',
          default: 'ai-general',
        });
        if (profile === undefined) process.exit(ExitCodes.CANCELLED);
      }
      if (!tokenLimit) {
        const answer = await input({
          message: 'Limite de tokens',
          default: '32000',
        });
        if (answer === undefined) process.exit(ExitCodes.CANCELLED);
        tokenLimit = answer;
      }
    }

    if (!root || !objective || !profile) {
      fmt.diag('Erreur : les options --root, --objective et --profile sont obligatoires.');
      process.exit(ExitCodes.USER_INPUT_ERROR);
    }

    if (root && !existsSync(root)) {
      fmt.diag(`Erreur : le chemin '${root}' n'existe pas.`);
      process.exit(ExitCodes.USER_INPUT_ERROR);
    }

    try {
      const deps = createDeps(spinner as unknown as { text: string } | undefined);

      const previewUseCase = new PrepareContextPackPreview(
        deps.configurationPort,
        deps.profileRegistry,
        deps.fileDiscovery,
        deps.fileReader,
        deps.securityScanner,
        deps.sizingPort,
        deps.packingPort,
        deps.progressReporter,
        cancellation,
      );
      const preview = await previewUseCase.execute({
        projectRoot: root as string,
        objective: objective as string,
        profile: profile as 'ai-general',
        selectedPaths: ['.'],
        tokenLimit: Number(tokenLimit),
      });

      const genUseCase = new GenerateContextPack(
        deps.contextPackWriter,
        deps.fileReader,
        deps.progressReporter,
        cancellation,
        deps.clock,
        deps.idGenerator,
        deps.lastPackRegistry,
      );
      const result = await genUseCase.execute(
        {
          projectRoot: root as string,
          objective: objective as string,
          profile: profile as 'ai-general',
          selectedPaths: ['.'],
          tokenLimit: Number(tokenLimit),
          previewId: preview.previewId,
          requestFingerprint: preview.requestFingerprint,
        },
        preview,
      );

      spinner?.succeed('Génération terminée');

      if (isJson) {
        fmt.log(fmt.formatGenerate(result));
      } else {
        process.stdout.write(`📦 Pack: ${result.packId}\n`);
        process.stdout.write(`📁 ${result.outputDirectory}\n`);
        process.stdout.write(`✅ Inclus: ${result.includedCount} | ⏱ ${result.durationMs}ms\n`);
      }
    } catch (err) {
      spinner?.fail('Échec');
      if (sigintReceived) {
        process.exit(ExitCodes.CANCELLED);
      }
      fmt.diag((err as Error).message);
      process.exit(ExitCodes.GENERATION_ERROR);
    }
  });

program
  .command('open-last')
  .description('Ouvre le dernier Context Pack généré')
  .argument('<projectRoot>', 'Racine du projet')
  .action((projectRoot: string) => {
    const fmt = new OutputFormatter(program.opts().format as 'text' | 'json');
    try {
      const deps = createDeps();
      const useCase = new OpenLastContextPack(deps.lastPackRegistry);
      const path = useCase.execute(projectRoot);
      if (fmt.isJson()) {
        fmt.log(fmt.formatOpenLast(path));
      } else {
        process.stdout.write(path ? `📂 Dernier pack: ${path}\n` : 'Aucun pack trouvé\n');
      }
    } catch (err) {
      fmt.diag((err as Error).message);
      process.exit(ExitCodes.INTERNAL_ERROR);
    }
  });

program
  .command('init')
  .description('Initialise la configuration ContextForge')
  .option('-f, --force', 'Écraser un fichier existant')
  .action(async (options: { force?: boolean }) => {
    const fmt = new OutputFormatter(program.opts().format as 'text' | 'json');
    try {
      const fs = await import('node:fs');
      const fsp = await import('node:fs/promises');
      const configPath = '.contextforge/config.yaml';
      if (fs.existsSync(configPath) && !options.force) {
        fmt.diag('Configuration existante. Utilisez --force pour écraser.');
        process.exit(ExitCodes.USER_INPUT_ERROR);
      }
      await fsp.mkdir('.contextforge', { recursive: true });
      await fsp.writeFile(
        configPath,
        '# ContextForge Configuration\noutputDirectory: .contextforge/output\n',
        'utf-8',
      );
      if (fmt.isJson()) {
        fmt.log({ status: 'ok', configPath });
      } else {
        process.stdout.write(`✅ Configuration créée : ${configPath}\n`);
      }
    } catch (err) {
      fmt.diag((err as Error).message);
      process.exit(ExitCodes.INTERNAL_ERROR);
    }
  });

process.on('SIGINT', () => {
  sigintReceived = true;
  cancelOperation();
  process.stderr.write('\n⚡ Annulation demandée — nettoyage en cours...\n');
});

program.parse();
