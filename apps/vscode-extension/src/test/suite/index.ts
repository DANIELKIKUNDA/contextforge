import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Mocha from 'mocha';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function run(): Promise<void> {
  const mocha = new Mocha({
    ui: 'bdd',
    color: true,
    timeout: 30000,
  });

  const extensionTestFile = path.resolve(__dirname, '..', 'integration', 'extension.test.js');
  mocha.addFile(extensionTestFile);

  await mocha.loadFilesAsync();

  const failures = await new Promise<number>((resolve) => {
    mocha.run((failuresCount) => {
      resolve(failuresCount);
    });
  });

  if (failures > 0) {
    throw new Error(`${failures} Mocha test(s) failed.`);
  }
}
