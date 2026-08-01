import type { ProfileId } from '@contextforge/contracts';
import type { ProfileDefinition, ProfileRegistryPort } from '@contextforge/core';
import { aiGeneralProfile } from './ai-general.profile';
import { codeReviewProfile } from './code-review.profile';
import { customProfile } from './custom.profile';
import { documentationProfile } from './documentation.profile';
import { onboardingProfile } from './onboarding.profile';
import { uiUxProfile } from './ui-ux.profile';

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
