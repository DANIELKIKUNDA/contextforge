import { describe, expect, it } from 'vitest';
import type { LastPackRegistryPort } from '../../ports/last-pack-registry.port.js';
import { OpenLastContextPack } from '../../use-cases/open-last-context-pack.js';

describe('OpenLastContextPack', () => {
  it('retourne le chemin du dernier pack enregistré', () => {
    const fakeRegistry: LastPackRegistryPort = {
      get: (_projectRoot: string) => '/output/pack-123',
      set: () => {},
      clear: () => {},
    };
    const useCase = new OpenLastContextPack(fakeRegistry);

    const result = useCase.execute('/test-project');
    expect(result).toBe('/output/pack-123');
  });

  it("retourne undefined si aucun pack n'a été enregistré", () => {
    const fakeRegistry: LastPackRegistryPort = {
      get: (_projectRoot: string) => undefined,
      set: () => {},
      clear: () => {},
    };
    const useCase = new OpenLastContextPack(fakeRegistry);

    const result = useCase.execute('/test-project');
    expect(result).toBeUndefined();
  });
});
