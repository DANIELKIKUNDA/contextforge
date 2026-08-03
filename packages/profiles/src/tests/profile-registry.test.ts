import type { ProfileId } from '@contextforge/contracts';
import { describe, expect, it } from 'vitest';
import { aiGeneralProfile } from '../ai-general.profile.js';
import { codeReviewProfile } from '../code-review.profile.js';
import { customProfile } from '../custom.profile.js';
import { documentationProfile } from '../documentation.profile.js';
import { onboardingProfile } from '../onboarding.profile.js';
import { ProfileRegistry } from '../profile-registry.js';
import { uiUxProfile } from '../ui-ux.profile.js';

describe('ProfileRegistry', () => {
  const registry = new ProfileRegistry();

  describe('list()', () => {
    it('returns all six profiles', () => {
      const profiles = registry.list();
      expect(profiles).toHaveLength(6);
    });

    it('includes ai-general profile', () => {
      const profiles = registry.list();
      expect(profiles.find((p) => p.id === 'ai-general')).toBeDefined();
    });

    it('includes code-review profile', () => {
      const profiles = registry.list();
      expect(profiles.find((p) => p.id === 'code-review')).toBeDefined();
    });

    it('includes documentation profile', () => {
      const profiles = registry.list();
      expect(profiles.find((p) => p.id === 'documentation')).toBeDefined();
    });

    it('includes onboarding profile', () => {
      const profiles = registry.list();
      expect(profiles.find((p) => p.id === 'onboarding')).toBeDefined();
    });

    it('includes ui-ux profile', () => {
      const profiles = registry.list();
      expect(profiles.find((p) => p.id === 'ui-ux')).toBeDefined();
    });

    it('includes custom profile', () => {
      const profiles = registry.list();
      expect(profiles.find((p) => p.id === 'custom')).toBeDefined();
    });

    it('returns a new array each time (no mutation)', () => {
      const list1 = registry.list();
      const list2 = registry.list();
      expect(list1).not.toBe(list2);
    });
  });

  describe('resolve()', () => {
    it('resolves ai-general by id', () => {
      const profile = registry.resolve('ai-general');
      expect(profile).toBeDefined();
      expect(profile?.id).toBe('ai-general');
      expect(profile?.name).toBe('AI General');
    });

    it('resolves code-review by id', () => {
      const profile = registry.resolve('code-review');
      expect(profile).toBeDefined();
      expect(profile?.id).toBe('code-review');
    });

    it('resolves documentation by id', () => {
      const profile = registry.resolve('documentation');
      expect(profile).toBeDefined();
      expect(profile?.id).toBe('documentation');
    });

    it('resolves onboarding by id', () => {
      const profile = registry.resolve('onboarding');
      expect(profile).toBeDefined();
      expect(profile?.id).toBe('onboarding');
    });

    it('resolves ui-ux by id', () => {
      const profile = registry.resolve('ui-ux');
      expect(profile).toBeDefined();
      expect(profile?.id).toBe('ui-ux');
    });

    it('resolves custom by id', () => {
      const profile = registry.resolve('custom');
      expect(profile).toBeDefined();
      expect(profile?.id).toBe('custom');
    });

    it('returns undefined for unknown profile id', () => {
      const profile = registry.resolve('unknown' as ProfileId);
      expect(profile).toBeUndefined();
    });
  });

  describe('profile integrity', () => {
    const profiles = [
      aiGeneralProfile,
      codeReviewProfile,
      documentationProfile,
      onboardingProfile,
      uiUxProfile,
      customProfile,
    ];

    it.each(profiles)('$id has a non-empty name', (profile) => {
      expect(profile.name.length).toBeGreaterThan(0);
    });

    it.each(profiles)('$id has a non-empty description', (profile) => {
      expect(profile.description.length).toBeGreaterThan(0);
    });

    it.each(profiles)('$id has a positive defaultTokenLimit', (profile) => {
      expect(profile.defaultTokenLimit).toBeGreaterThan(0);
    });

    it.each(profiles)('$id has unique id', () => {
      const ids = profiles.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(profiles.length);
    });
  });

  describe('specific profile values', () => {
    it('ai-general has code-related extensions', () => {
      expect(aiGeneralProfile.priorityExtensions).toContain('.ts');
      expect(aiGeneralProfile.priorityExtensions).toContain('.js');
      expect(aiGeneralProfile.defaultTokenLimit).toBe(200000);
    });

    it('code-review focuses on source and tests', () => {
      expect(codeReviewProfile.suggestedDirectories).toContain('src');
      expect(codeReviewProfile.suggestedDirectories).toContain('tests');
      expect(codeReviewProfile.outputCategories).toContain('code');
      expect(codeReviewProfile.outputCategories).toContain('tests');
    });

    it('documentation focuses on docs and markdown', () => {
      expect(documentationProfile.priorityExtensions).toContain('.md');
      expect(documentationProfile.suggestedDirectories).toContain('docs');
      expect(documentationProfile.outputCategories).toContain('docs');
    });

    it('onboarding includes overview docs and key source files', () => {
      expect(onboardingProfile.suggestedDirectories).toContain('docs');
      expect(onboardingProfile.suggestedDirectories).toContain('src');
      expect(onboardingProfile.priorityExtensions).toContain('.md');
      expect(onboardingProfile.priorityExtensions).toContain('.ts');
    });

    it('ui-ux has frontend-focused extensions', () => {
      expect(uiUxProfile.priorityExtensions).toContain('.tsx');
      expect(uiUxProfile.priorityExtensions).toContain('.css');
      expect(uiUxProfile.suggestedDirectories).toContain('components');
      expect(uiUxProfile.suggestedDirectories).toContain('pages');
    });

    it('custom has empty defaults for user customization', () => {
      expect(customProfile.suggestedDirectories).toHaveLength(0);
      expect(customProfile.priorityExtensions).toHaveLength(0);
      expect(customProfile.outputCategories).toHaveLength(0);
    });
  });
});
