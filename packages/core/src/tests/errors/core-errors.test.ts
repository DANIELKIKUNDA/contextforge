import { describe, expect, it } from 'vitest';
import {
  CancellationError,
  ConfigurationError,
  FileReadError,
  GenerationError,
  InvalidAggregateError,
  InvalidStateTransitionError,
  LastPackNotFoundError,
  OutputValidationError,
  PackingError,
  PathOutsideWorkspaceError,
  PreviewMismatchError,
  ProjectNotFoundError,
  ScanError,
  SecurityViolationError,
  UnsupportedEncodingError,
  ValidationError,
} from '../../errors/core-errors';
import { ErrorCodes } from '../../errors/error-codes';

describe('Core errors', () => {
  it('ValidationError should have correct code and be recoverable', () => {
    const err = new ValidationError('Invalid input');
    expect(err.code).toBe(ErrorCodes.VALIDATION_ERROR);
    expect(err.recoverable).toBe(true);
    expect(err.name).toBe('ValidationError');
  });

  it('ConfigurationError should have correct code', () => {
    const err = new ConfigurationError('Bad config');
    expect(err.code).toBe(ErrorCodes.CONFIGURATION_ERROR);
    expect(err.recoverable).toBe(true);
  });

  it('ProjectNotFoundError should have correct code', () => {
    const err = new ProjectNotFoundError('Project missing');
    expect(err.code).toBe(ErrorCodes.PROJECT_NOT_FOUND);
    expect(err.recoverable).toBe(true);
  });

  it('PathOutsideWorkspaceError should have correct code', () => {
    const err = new PathOutsideWorkspaceError('Outside');
    expect(err.code).toBe(ErrorCodes.PATH_OUTSIDE_WORKSPACE);
    expect(err.recoverable).toBe(true);
  });

  it('ScanError should not be recoverable', () => {
    const err = new ScanError('Scan failed');
    expect(err.code).toBe(ErrorCodes.SCAN_ERROR);
    expect(err.recoverable).toBe(false);
  });

  it('FileReadError should be recoverable', () => {
    const err = new FileReadError('Cannot read');
    expect(err.code).toBe(ErrorCodes.FILE_READ_ERROR);
    expect(err.recoverable).toBe(true);
  });

  it('UnsupportedEncodingError should be recoverable', () => {
    const err = new UnsupportedEncodingError('Encoding not supported');
    expect(err.code).toBe(ErrorCodes.UNSUPPORTED_ENCODING);
    expect(err.recoverable).toBe(true);
  });

  it('SecurityViolationError should not be recoverable', () => {
    const err = new SecurityViolationError('.env blocked');
    expect(err.code).toBe(ErrorCodes.SECURITY_VIOLATION);
    expect(err.recoverable).toBe(false);
  });

  it('PackingError should not be recoverable', () => {
    const err = new PackingError('Cannot pack');
    expect(err.code).toBe(ErrorCodes.PACKING_ERROR);
    expect(err.recoverable).toBe(false);
  });

  it('GenerationError should not be recoverable', () => {
    const err = new GenerationError('Gen failed');
    expect(err.code).toBe(ErrorCodes.GENERATION_ERROR);
    expect(err.recoverable).toBe(false);
  });

  it('OutputValidationError should not be recoverable', () => {
    const err = new OutputValidationError('Output invalid');
    expect(err.code).toBe(ErrorCodes.OUTPUT_VALIDATION_ERROR);
    expect(err.recoverable).toBe(false);
  });

  it('PreviewMismatchError should be recoverable', () => {
    const err = new PreviewMismatchError('Mismatch');
    expect(err.code).toBe(ErrorCodes.PREVIEW_MISMATCH);
    expect(err.recoverable).toBe(true);
  });

  it('CancellationError should not be recoverable', () => {
    const err = new CancellationError('Cancelled');
    expect(err.code).toBe(ErrorCodes.CANCELLATION_ERROR);
    expect(err.recoverable).toBe(false);
  });

  it('LastPackNotFoundError should be recoverable', () => {
    const err = new LastPackNotFoundError('Not found');
    expect(err.code).toBe(ErrorCodes.LAST_PACK_NOT_FOUND);
    expect(err.recoverable).toBe(true);
  });

  it('InvalidStateTransitionError should hold from/to states', () => {
    const err = new InvalidStateTransitionError('draft', 'generated');
    expect(err.code).toBe(ErrorCodes.INVALID_STATE_TRANSITION);
    expect(err.from).toBe('draft');
    expect(err.to).toBe('generated');
    expect(err.message).toContain("'draft'");
    expect(err.message).toContain("'generated'");
  });

  it('InvalidAggregateError should not be recoverable', () => {
    const err = new InvalidAggregateError('Invalid aggregate state');
    expect(err.code).toBe(ErrorCodes.INVALID_AGGREGATE);
    expect(err.recoverable).toBe(false);
  });

  it('all errors should not contain file content or secrets in metadata by default', () => {
    const errors = [
      new ValidationError('test'),
      new SecurityViolationError('test'),
      new GenerationError('test'),
    ];
    for (const err of errors) {
      expect(err.metadata).toBeUndefined();
    }
  });

  it('errors should store metadata when provided', () => {
    const err = new ValidationError('test', { metadata: { field: 'objective' } });
    expect(err.metadata).toEqual({ field: 'objective' });
  });

  it('errors should store cause when provided', () => {
    const cause = new Error('root cause');
    const err = new ValidationError('test', { cause });
    expect(err.cause).toBe(cause);
  });

  describe('toJSON serialization', () => {
    it('should include code, message, and recoverable', () => {
      const err = new ValidationError('Invalid input');
      const json = JSON.parse(JSON.stringify(err));
      expect(json.code).toBe(ErrorCodes.VALIDATION_ERROR);
      expect(json.message).toBe('Invalid input');
      expect(json.recoverable).toBe(true);
    });

    it('should not include stack', () => {
      const err = new ValidationError('test');
      const json = JSON.parse(JSON.stringify(err));
      expect(json.stack).toBeUndefined();
    });

    it('should not include cause', () => {
      const cause = new Error('root');
      const err = new ValidationError('test', { cause });
      const json = JSON.parse(JSON.stringify(err));
      expect(json.cause).toBeUndefined();
    });

    it('should omit metadata when undefined', () => {
      const err = new ValidationError('test');
      const json = JSON.parse(JSON.stringify(err));
      expect(json.metadata).toBeUndefined();
      expect('metadata' in json).toBe(false);
    });

    it('should include metadata when provided', () => {
      const err = new ValidationError('test', { metadata: { field: 'objective' } });
      const json = JSON.parse(JSON.stringify(err));
      expect(json.metadata).toEqual({ field: 'objective' });
    });

    it('should preserve Error prototype', () => {
      const err = new ValidationError('test');
      expect(err instanceof Error).toBe(true);
      expect(err instanceof ValidationError).toBe(true);
    });

    it('should never include secrets or tokens in serialization', () => {
      const err = new SecurityViolationError('.env blocked', {
        metadata: { ruleId: 'SEC-001' },
      });
      const json = JSON.parse(JSON.stringify(err));
      expect(json.metadata).toEqual({ ruleId: 'SEC-001' });
      // Explicit: no secret field
      expect(json.secret).toBeUndefined();
      expect(json.token).toBeUndefined();
      expect(json.apiKey).toBeUndefined();
      expect(json.password).toBeUndefined();
    });
  });
});
