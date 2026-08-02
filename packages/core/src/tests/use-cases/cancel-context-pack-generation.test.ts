import { describe, expect, it } from 'vitest';
import { CancellationError } from '../../errors/core-errors';
import type { CancellationPort } from '../../ports/cancellation.port';
import type { ProgressReporterPort } from '../../ports/progress-reporter.port';
import { CancelContextPackGeneration } from '../../use-cases/cancel-context-pack-generation';

describe('CancelContextPackGeneration', () => {
  it('lance une CancellationError avec le packId', () => {
    let reportedMessage = '';
    const fakeProgress: ProgressReporterPort = {
      report: (event) => {
        reportedMessage = event.message;
      },
    };
    const fakeCancellation: CancellationPort = {
      isCancelled: false,
      throwIfCancelled: () => {
        throw new Error('should not be called');
      },
    };

    const useCase = new CancelContextPackGeneration(fakeCancellation, fakeProgress);

    expect(() => {
      useCase.execute('pack-abc-123');
    }).toThrow(CancellationError);

    expect(reportedMessage).toContain('pack-abc-123');
  });

  it('tente de throw une CancellationError même si packId est vide', () => {
    const fakeProgress: ProgressReporterPort = {
      report: () => {},
    };
    const fakeCancellation: CancellationPort = {
      isCancelled: false,
      throwIfCancelled: () => {},
    };

    const useCase = new CancelContextPackGeneration(fakeCancellation, fakeProgress);

    let caught: Error | undefined;
    try {
      useCase.execute('');
    } catch (err) {
      caught = err as Error;
    }

    expect(caught).toBeInstanceOf(CancellationError);
  });
});
