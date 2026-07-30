import type { ContextPackStatus } from '@contextforge/contracts';
import { CoreError } from './core-error';
import { ErrorCodes } from './error-codes';

/**
 * Input validation failed.
 */
export class ValidationError extends CoreError {
  readonly code = ErrorCodes.VALIDATION_ERROR;
  readonly recoverable = true;

  constructor(
    message: string,
    options?: { readonly cause?: unknown; readonly metadata?: Record<string, unknown> },
  ) {
    super(message, options);
    this.name = 'ValidationError';
  }
}

/**
 * Configuration is invalid or contradictory.
 */
export class ConfigurationError extends CoreError {
  readonly code = ErrorCodes.CONFIGURATION_ERROR;
  readonly recoverable = true;

  constructor(
    message: string,
    options?: { readonly cause?: unknown; readonly metadata?: Record<string, unknown> },
  ) {
    super(message, options);
    this.name = 'ConfigurationError';
  }
}

/**
 * Project root does not exist or is inaccessible.
 */
export class ProjectNotFoundError extends CoreError {
  readonly code = ErrorCodes.PROJECT_NOT_FOUND;
  readonly recoverable = true;

  constructor(
    message: string,
    options?: { readonly cause?: unknown; readonly metadata?: Record<string, unknown> },
  ) {
    super(message, options);
    this.name = 'ProjectNotFoundError';
  }
}

/**
 * A path resolves outside the project workspace.
 */
export class PathOutsideWorkspaceError extends CoreError {
  readonly code = ErrorCodes.PATH_OUTSIDE_WORKSPACE;
  readonly recoverable = true;

  constructor(
    message: string,
    options?: { readonly cause?: unknown; readonly metadata?: Record<string, unknown> },
  ) {
    super(message, options);
    this.name = 'PathOutsideWorkspaceError';
  }
}

/**
 * Global file discovery failed.
 */
export class ScanError extends CoreError {
  readonly code = ErrorCodes.SCAN_ERROR;
  readonly recoverable = false;

  constructor(
    message: string,
    options?: { readonly cause?: unknown; readonly metadata?: Record<string, unknown> },
  ) {
    super(message, options);
    this.name = 'ScanError';
  }
}

/**
 * File is unreadable (permissions, missing, etc.).
 */
export class FileReadError extends CoreError {
  readonly code = ErrorCodes.FILE_READ_ERROR;
  readonly recoverable = true;

  constructor(
    message: string,
    options?: { readonly cause?: unknown; readonly metadata?: Record<string, unknown> },
  ) {
    super(message, options);
    this.name = 'FileReadError';
  }
}

/**
 * File encoding is not supported.
 */
export class UnsupportedEncodingError extends CoreError {
  readonly code = ErrorCodes.UNSUPPORTED_ENCODING;
  readonly recoverable = true;

  constructor(
    message: string,
    options?: { readonly cause?: unknown; readonly metadata?: Record<string, unknown> },
  ) {
    super(message, options);
    this.name = 'UnsupportedEncodingError';
  }
}

/**
 * A security violation prevents the generation.
 */
export class SecurityViolationError extends CoreError {
  readonly code = ErrorCodes.SECURITY_VIOLATION;
  readonly recoverable = false;

  constructor(
    message: string,
    options?: { readonly cause?: unknown; readonly metadata?: Record<string, unknown> },
  ) {
    super(message, options);
    this.name = 'SecurityViolationError';
  }
}

/**
 * Packing constraints cannot be met.
 */
export class PackingError extends CoreError {
  readonly code = ErrorCodes.PACKING_ERROR;
  readonly recoverable = false;

  constructor(
    message: string,
    options?: { readonly cause?: unknown; readonly metadata?: Record<string, unknown> },
  ) {
    super(message, options);
    this.name = 'PackingError';
  }
}

/**
 * Output file generation failed.
 */
export class GenerationError extends CoreError {
  readonly code = ErrorCodes.GENERATION_ERROR;
  readonly recoverable = false;

  constructor(
    message: string,
    options?: { readonly cause?: unknown; readonly metadata?: Record<string, unknown> },
  ) {
    super(message, options);
    this.name = 'GenerationError';
  }
}

/**
 * Generated outputs failed post-write validation.
 */
export class OutputValidationError extends CoreError {
  readonly code = ErrorCodes.OUTPUT_VALIDATION_ERROR;
  readonly recoverable = false;

  constructor(
    message: string,
    options?: { readonly cause?: unknown; readonly metadata?: Record<string, unknown> },
  ) {
    super(message, options);
    this.name = 'OutputValidationError';
  }
}

/**
 * The generation request does not match the confirmed preview.
 */
export class PreviewMismatchError extends CoreError {
  readonly code = ErrorCodes.PREVIEW_MISMATCH;
  readonly recoverable = true;

  constructor(
    message: string,
    options?: { readonly cause?: unknown; readonly metadata?: Record<string, unknown> },
  ) {
    super(message, options);
    this.name = 'PreviewMismatchError';
  }
}

/**
 * Operation was cancelled.
 */
export class CancellationError extends CoreError {
  readonly code = ErrorCodes.CANCELLATION_ERROR;
  readonly recoverable = false;

  constructor(
    message: string,
    options?: { readonly cause?: unknown; readonly metadata?: Record<string, unknown> },
  ) {
    super(message, options);
    this.name = 'CancellationError';
  }
}

/**
 * No valid last pack was found.
 */
export class LastPackNotFoundError extends CoreError {
  readonly code = ErrorCodes.LAST_PACK_NOT_FOUND;
  readonly recoverable = true;

  constructor(
    message: string,
    options?: { readonly cause?: unknown; readonly metadata?: Record<string, unknown> },
  ) {
    super(message, options);
    this.name = 'LastPackNotFoundError';
  }
}

/**
 * An invalid state transition was attempted on a ContextPack.
 */
export class InvalidStateTransitionError extends CoreError {
  readonly code = ErrorCodes.INVALID_STATE_TRANSITION;
  readonly recoverable = false;

  constructor(
    readonly from: ContextPackStatus,
    readonly to: ContextPackStatus,
    options?: { readonly cause?: unknown; readonly metadata?: Record<string, unknown> },
  ) {
    super(`Invalid state transition from '${from}' to '${to}'.`, options);
    this.name = 'InvalidStateTransitionError';
  }
}

/**
 * The ContextPack aggregate is invalid in its current state.
 */
export class InvalidAggregateError extends CoreError {
  readonly code = ErrorCodes.INVALID_AGGREGATE;
  readonly recoverable = false;

  constructor(
    message: string,
    options?: { readonly cause?: unknown; readonly metadata?: Record<string, unknown> },
  ) {
    super(message, options);
    this.name = 'InvalidAggregateError';
  }
}
