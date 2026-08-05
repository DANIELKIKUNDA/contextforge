import { describe, expect, it, vi } from 'vitest';
import { VscodeProgressAdapter } from '../../adapters/vscode-progress.adapter';

describe('VscodeProgressAdapter', () => {
  it("transmet l'événement de progression à VS Code", () => {
    const reportSpy = vi.fn();
    const progress = { report: reportSpy };
    const adapter = new VscodeProgressAdapter(progress as never);

    adapter.report({
      phase: 'generating' as const,
      percent: 50,
      message: 'test message',
      processed: 5,
      total: 10,
    });

    expect(reportSpy).toHaveBeenCalledOnce();
    expect(reportSpy).toHaveBeenCalledWith({
      message: '[generating] test message',
      increment: 50,
    });
  });

  it('inclut currentItem dans le message si présent', () => {
    const reportSpy = vi.fn();
    const progress = { report: reportSpy };
    const adapter = new VscodeProgressAdapter(progress as never);

    adapter.report({
      phase: 'generating' as const,
      percent: 50,
      message: 'test message',
      processed: 5,
      total: 10,
      currentItem: 'src/index.ts',
    });

    expect(reportSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: '[generating] test message : src/index.ts' }),
    );
  });

  it("calcule l'incrément à partir de processed/total", () => {
    const reportSpy = vi.fn();
    const progress = { report: reportSpy };
    const adapter = new VscodeProgressAdapter(progress as never);

    adapter.report({
      phase: 'generating' as const,
      percent: 0,
      message: 'test',
      processed: 3,
      total: 10,
    });

    expect(reportSpy).toHaveBeenCalledWith(expect.objectContaining({ increment: 30 }));
  });

  it("utilise percent si total n'est pas défini", () => {
    const reportSpy = vi.fn();
    const progress = { report: reportSpy };
    const adapter = new VscodeProgressAdapter(progress as never);

    adapter.report({ phase: 'generating' as const, percent: 75, message: 'test', processed: 0 });

    expect(reportSpy).toHaveBeenCalledWith(expect.objectContaining({ increment: 75 }));
  });
});
