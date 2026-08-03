import { VALID_TRANSITIONS } from '@contextforge/contracts';
import type { ContextPackStatus } from '@contextforge/contracts';
import { describe, expect, it } from 'vitest';
import {
  TERMINAL_STATUSES,
  isTerminal,
  validateTransition,
} from '../../domain/context-pack-state-machine.js';
import { InvalidStateTransitionError } from '../../errors/core-errors.js';

describe('ContextPack state machine', () => {
  describe('validateTransition', () => {
    it('should allow draft → previewed', () => {
      expect(() => validateTransition('draft', 'previewed')).not.toThrow();
    });

    it('should allow previewed → confirmed', () => {
      expect(() => validateTransition('previewed', 'confirmed')).not.toThrow();
    });

    it('should allow previewed → cancelled', () => {
      expect(() => validateTransition('previewed', 'cancelled')).not.toThrow();
    });

    it('should allow confirmed → generating', () => {
      expect(() => validateTransition('confirmed', 'generating')).not.toThrow();
    });

    it('should allow generating → generated', () => {
      expect(() => validateTransition('generating', 'generated')).not.toThrow();
    });

    it('should allow generating → failed', () => {
      expect(() => validateTransition('generating', 'failed')).not.toThrow();
    });

    it('should allow generating → cancelled', () => {
      expect(() => validateTransition('generating', 'cancelled')).not.toThrow();
    });

    it('should reject generated → anything', () => {
      expect(() => validateTransition('generated', 'draft')).toThrow(InvalidStateTransitionError);
    });

    it('should reject failed → anything', () => {
      expect(() => validateTransition('failed', 'draft')).toThrow(InvalidStateTransitionError);
    });

    it('should reject cancelled → anything', () => {
      expect(() => validateTransition('cancelled', 'draft')).toThrow(InvalidStateTransitionError);
    });

    it('should reject draft → generating (skip preview)', () => {
      expect(() => validateTransition('draft', 'generating')).toThrow(InvalidStateTransitionError);
    });

    it('should reject previewed → generated (skip confirmation)', () => {
      expect(() => validateTransition('previewed', 'generated')).toThrow(
        InvalidStateTransitionError,
      );
    });

    it('should reject draft → done (non-existent)', () => {
      expect(() => validateTransition('draft', 'done' as ContextPackStatus)).toThrow(
        InvalidStateTransitionError,
      );
    });
  });

  describe('isTerminal', () => {
    it('should classer generated as terminal', () => {
      expect(isTerminal('generated')).toBe(true);
    });

    it('should classer failed as terminal', () => {
      expect(isTerminal('failed')).toBe(true);
    });

    it('should classer cancelled as terminal', () => {
      expect(isTerminal('cancelled')).toBe(true);
    });

    it('should not classer draft as terminal', () => {
      expect(isTerminal('draft')).toBe(false);
    });

    it('should not classer generating as terminal', () => {
      expect(isTerminal('generating')).toBe(false);
    });
  });

  describe('TERMINAL_STATUSES', () => {
    it('should contain generated, failed, cancelled', () => {
      expect(TERMINAL_STATUSES.has('generated')).toBe(true);
      expect(TERMINAL_STATUSES.has('failed')).toBe(true);
      expect(TERMINAL_STATUSES.has('cancelled')).toBe(true);
      expect(TERMINAL_STATUSES.size).toBe(3);
    });
  });

  describe('determinism', () => {
    it('should produce the same result for the same transition', () => {
      const testTransition = () => validateTransition('draft', 'previewed');
      expect(testTransition).not.toThrow();
      expect(testTransition).not.toThrow();
    });
  });
});
