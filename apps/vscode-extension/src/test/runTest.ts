import { mkdtemp, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runTests } from '@vscode/test-electron';

const vscodeTestVersion = '1.131.0';

interface TestPaths {
  readonly extensionDevelopmentPath: string;
  readonly extensionTestsPath: string;
  readonly testWorkspace: string;
  readonly profileArgs: readonly string[];
  readonly temporaryRoot?: string;
}

async function resolveTestPaths(extensionRoot: string): Promise<TestPaths> {
  if (process.platform !== 'win32') {
    return {
      extensionDevelopmentPath: extensionRoot,
      extensionTestsPath: path.join(extensionRoot, 'dist', 'test', 'suite', 'index.js'),
      testWorkspace: path.join(extensionRoot, 'fixtures', 'workspace'),
      profileArgs: [],
    };
  }

  const temporaryRoot = await mkdtemp(path.join(tmpdir(), 'contextforge-vscode-'));
  const extensionJunction = path.join(temporaryRoot, 'extension');

  try {
    await symlink(extensionRoot, extensionJunction, 'junction');
  } catch (error) {
    await rm(temporaryRoot, { recursive: true, force: true });
    throw error;
  }

  return {
    extensionDevelopmentPath: extensionJunction,
    extensionTestsPath: path.join(extensionJunction, 'dist', 'test', 'suite', 'index.js'),
    testWorkspace: path.join(extensionJunction, 'fixtures', 'workspace'),
    profileArgs: [
      `--extensions-dir=${path.join(temporaryRoot, 'extensions')}`,
      `--user-data-dir=${path.join(temporaryRoot, 'user-data')}`,
      '--disable-gpu',
    ],
    temporaryRoot,
  };
}

/**
 * Point d'entrée pour l'exécution des tests d'intégration VS Code.
 */
async function main(): Promise<void> {
  let temporaryRoot: string | undefined;

  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const paths = await resolveTestPaths(path.resolve(__dirname, '..', '..'));
    temporaryRoot = paths.temporaryRoot;
    // biome-ignore lint/performance/noDelete: Electron active le mode Node pour toute valeur définie.
    delete process.env.ELECTRON_RUN_AS_NODE;

    await runTests({
      extensionDevelopmentPath: paths.extensionDevelopmentPath,
      extensionTestsPath: paths.extensionTestsPath,
      version: vscodeTestVersion,
      launchArgs: [
        paths.testWorkspace,
        ...paths.profileArgs,
        '--disable-extensions',
        '--disable-workspace-trust',
      ],
    });
  } catch (err) {
    console.error('Failed to run tests:', err);
    process.exitCode = 1;
  } finally {
    if (temporaryRoot !== undefined) {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  }
}

main();
