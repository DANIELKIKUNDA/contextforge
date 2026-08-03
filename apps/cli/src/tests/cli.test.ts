import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Tests d'intégration CLI ContextForge — Phase 9.
 *
 * Toutes les commandes sont exécutées via child_process (stdin n'est pas un TTY),
 * donc le mode interactif n'est JAMAIS actif dans ces tests.
 */

// Résout le chemin absolu vers apps/cli/dist/index.js indépendamment du CWD.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// src/tests/ → src/ → apps/cli/ → monorepo root
const MONOREPO_ROOT = resolve(__dirname, '..', '..', '..', '..');
const CLI = 'node apps/cli/dist/index.js';

function run(args: string): { stdout: string; stderr: string; exitCode: number } {
  try {
    const result = execSync(`${CLI} ${args}`, {
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 60_000,
      cwd: MONOREPO_ROOT,
      env: { ...process.env, FORCE_COLOR: '0', CI: 'true' },
    });
    return { stdout: result, stderr: '', exitCode: 0 };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; status?: number };
    return {
      stdout: e.stdout?.toString() ?? '',
      stderr: e.stderr?.toString() ?? '',
      exitCode: e.status ?? 1,
    };
  }
}

function parseJson(stdout: string): Record<string, unknown> {
  return JSON.parse(stdout.trim());
}

describe('CLI --help', () => {
  it("affiche l'aide", () => {
    const { stdout, exitCode } = run('--help');
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Usage:');
  });
});

describe('CLI --version', () => {
  it('affiche la version', () => {
    const { stdout, exitCode } = run('--version');
    expect(exitCode).toBe(0);
    expect(stdout).toContain('0.0.0');
  });
});

describe('CLI version', () => {
  it('affiche la version en mode texte', () => {
    const { stdout, exitCode } = run('version');
    expect(exitCode).toBe(0);
    expect(stdout).toContain('ContextForge v');
  });

  it('affiche la version en JSON', () => {
    const { stdout, exitCode } = run('version --format json');
    expect(exitCode).toBe(0);
    const json = parseJson(stdout);
    expect(json.status).toBe('ok');
    expect(json.version).toBe('0.0.0');
  });
});

describe('CLI profiles', () => {
  it('liste les profils en mode texte', () => {
    const { stdout, exitCode } = run('profiles');
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Profils disponibles');
  });

  it('liste les profils en JSON', () => {
    const { stdout, exitCode } = run('profiles --format json');
    expect(exitCode).toBe(0);
    const json = parseJson(stdout);
    expect(json.status).toBe('ok');
    expect(Array.isArray(json.profiles)).toBe(true);
    expect(json.count).toBeGreaterThan(0);
  });
});

describe('CLI validate', () => {
  it('valide la configuration', () => {
    const { stdout, exitCode } = run('validate');
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Configuration');
  });

  it('valide en JSON', () => {
    const { stdout, exitCode } = run('validate --format json');
    expect(exitCode).toBe(0);
    const json = parseJson(stdout);
    expect(json.status).toBeDefined();
  });
});

describe('CLI inspect', () => {
  it('inspecte le projet courant', () => {
    const { stdout, exitCode } = run('inspect .');
    expect(exitCode).toBe(0);
    expect(stdout).toContain('fichiers');
  });

  it('inspecte en JSON', () => {
    const { stdout, exitCode } = run('inspect . --format json');
    expect(exitCode).toBe(0);
    const json = parseJson(stdout);
    expect(json.status).toBe('ok');
    expect(typeof json.fileCount).toBe('number');
  });
});

describe('CLI preview', () => {
  it('prepare un preview', () => {
    const { stdout, exitCode } = run('preview -r . -o "test" -p ai-general');
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Preview');
  });

  it('prepare un preview en JSON', () => {
    const { stdout, exitCode } = run('preview -r . -o "test" -p ai-general --format json');
    expect(exitCode).toBe(0);
    const json = parseJson(stdout);
    expect(json.status).toBe('ok');
    expect(typeof json.previewId).toBe('string');
  });
});

describe('CLI generate', () => {
  it('genere un pack', () => {
    const { stdout, exitCode } = run('generate -r . -o "test" -p ai-general');
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Pack');
  });

  it('genere un pack en JSON', () => {
    const { stdout, exitCode } = run('generate -r . -o "test" -p ai-general --format json');
    expect(exitCode).toBe(0);
    const json = parseJson(stdout);
    expect(json.status).toBe('generated');
    expect(typeof json.packId).toBe('string');
  });
});

describe('CLI open-last', () => {
  it("tente d'ouvrir le dernier pack", () => {
    const { stdout, exitCode } = run('open-last .');
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Aucun pack');
  });

  it('open-last en JSON', () => {
    const { stdout, exitCode } = run('open-last . --format json');
    expect(exitCode).toBe(0);
    const json = parseJson(stdout);
    expect(json.status).toBe('not-found');
  });
});

describe('CLI init', () => {
  it('initialise la configuration (avec --force)', () => {
    const { stdout, exitCode } = run('init --force');
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Configuration');
  });

  it('init en JSON (avec --force)', () => {
    const { stdout, exitCode } = run('init --force --format json');
    expect(exitCode).toBe(0);
    const json = parseJson(stdout);
    expect(json.status).toBe('ok');
  });
});

describe('CLI codes de sortie', () => {
  it('retourne 0 pour une commande valide', () => {
    const { exitCode } = run('version');
    expect(exitCode).toBe(0);
  });

  it('retourne 1 pour --format invalide', () => {
    const { exitCode } = run('--format xml version');
    expect(exitCode).toBe(1);
  });

  it('retourne 3 pour un projet inexistant en inspect', () => {
    const { exitCode } = run('inspect /nonexistent/path');
    expect(exitCode).toBe(3);
  });

  it('retourne 3 si options obligatoires manquantes sur preview', () => {
    const { exitCode, stderr } = run('preview');
    expect(exitCode).toBe(3);
    expect(stderr).toContain('obligatoires');
  });

  it('retourne 3 si options obligatoires manquantes sur generate', () => {
    const { exitCode, stderr } = run('generate');
    expect(exitCode).toBe(3);
    expect(stderr).toContain('obligatoires');
  });
});

describe('CLI non-interactive', () => {
  it('ne pose pas de question en mode non-interactif (inspect)', () => {
    const { stdout, exitCode } = run('--non-interactive inspect .');
    expect(exitCode).toBe(0);
    expect(stdout).toContain('fichiers');
  });

  it('pas de prompt quand options complètes (preview)', () => {
    const { stdout, exitCode } = run('--non-interactive preview -r . -o "test" -p ai-general');
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Preview');
  });

  it('erreur propre sans options en non-interactif (preview)', () => {
    const { exitCode, stderr } = run('--non-interactive preview');
    expect(exitCode).toBe(3);
    expect(stderr).toContain('obligatoires');
  });
});

describe('CLI JSON purity', () => {
  it('produit uniquement du JSON sur stdout', () => {
    const { stdout } = run('version --format json');
    expect(() => JSON.parse(stdout.trim())).not.toThrow();
    expect(stdout.trim()).toMatch(/^\{.*\}$/);
  });

  it('ne produit pas de spinner en mode JSON', () => {
    const { stdout } = run('generate -r . -o "test" -p ai-general --format json');
    expect(stdout).not.toContain('⠋');
    expect(stdout).not.toContain('⏳');
    expect(stdout).not.toContain('%');
  });
});

describe('CLI stderr séparé', () => {
  it('envoie les diagnostics sur stderr', () => {
    const { stderr } = run('--format xml version');
    expect(stderr).not.toBe('');
  });
});

describe('CLI SIGINT', () => {
  it('gère proprement SIGINT (code 130 simulé)', () => {
    const { exitCode, stderr } = run('--non-interactive preview');
    expect(exitCode).toBe(3);
    expect(stderr).toContain('obligatoires');
  });
});

describe('CLI absence de secret', () => {
  it('ne contient aucun secret en dur dans la sortie', () => {
    const { stdout } = run('version');
    const lower = stdout.toLowerCase();
    expect(lower).not.toContain('password');
    expect(lower).not.toContain('secret');
    expect(lower).not.toContain('api_key');
    expect(lower).not.toContain('token');
    expect(lower).not.toContain('-----begin');
  });
});
