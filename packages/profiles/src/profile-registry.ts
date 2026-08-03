import type { ProfileId } from '@contextforge/contracts';
import type { ProfileDefinition, ProfileRegistryPort } from '@contextforge/core';
import { aiGeneralProfile } from './ai-general.profile.js';
import { codeReviewProfile } from './code-review.profile.js';
import { customProfile } from './custom.profile.js';
import { documentationProfile } from './documentation.profile.js';
import { onboardingProfile } from './onboarding.profile.js';
import { uiUxProfile } from './ui-ux.profile.js';

const PROFILES: readonly ProfileDefinition[] = [
  aiGeneralProfile,
  codeReviewProfile,
  documentationProfile,
  onboardingProfile,
  uiUxProfile,
  customProfile,
];

export class ProfileRegistry implements ProfileRegistryPort {
  list(): ProfileDefinition[] {
    return [...PROFILES];
  }

  resolve(id: ProfileId): ProfileDefinition | undefined {
    return PROFILES.find((p) => p.id === id);
  }
}
