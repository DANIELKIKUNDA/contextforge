// Ports
export type { FileDiscoveryPort, CancellationToken } from './ports/file-discovery.port';
export type {
  FileContentReaderPort,
  ReadFileOptions,
  ReadFileResult,
} from './ports/file-content-reader.port';
export type { SecurityScannerPort } from './ports/security-scanner.port';
export type { SizingPort, FileSizeMetrics, AggregateSizeMetrics } from './ports/sizing.port';
export type {
  PackingPort,
  PackableFile,
  OversizedFile,
  PackingResult,
} from './ports/packing.port';
export type { ContextPackWriterPort } from './ports/context-pack-writer.port';
export type {
  ConfigurationPort,
  ConfigurationLoadResult,
  ConfigurationProvenance,
} from './ports/configuration.port';
export type { ProfileRegistryPort, ProfileDefinition } from './ports/profile-registry.port';
export type { ClockPort } from './ports/clock.port';
export type { IdGeneratorPort } from './ports/id-generator.port';
export type { ProgressReporterPort, ProgressEvent } from './ports/progress-reporter.port';
export type { CancellationPort } from './ports/cancellation.port';
export type { LastPackRegistryPort } from './ports/last-pack-registry.port';

// Errors
export { CoreError } from './errors/core-error';
export { ErrorCodes } from './errors/error-codes';
export type { ErrorCode } from './errors/error-codes';
export {
  ValidationError,
  ConfigurationError,
  ProjectNotFoundError,
  PathOutsideWorkspaceError,
  ScanError,
  FileReadError,
  UnsupportedEncodingError,
  SecurityViolationError,
  PackingError,
  GenerationError,
  OutputValidationError,
  PreviewMismatchError,
  CancellationError,
  LastPackNotFoundError,
  InvalidStateTransitionError,
  InvalidAggregateError,
} from './errors/core-errors';

// Domain
export { ContextPack } from './domain/context-pack';
export {
  validateTransition,
  isTerminal,
  TERMINAL_STATUSES,
} from './domain/context-pack-state-machine';
