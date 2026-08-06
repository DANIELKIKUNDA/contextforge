// Ports
export type { FileDiscoveryPort, CancellationToken } from './ports/file-discovery.port.js';
export type {
  FileContentReaderPort,
  ReadFileOptions,
  ReadFileResult,
} from './ports/file-content-reader.port.js';
export type { SecurityScannerPort } from './ports/security-scanner.port.js';
export type { SizingPort, FileSizeMetrics, AggregateSizeMetrics } from './ports/sizing.port.js';
export type {
  PackingPort,
  PackableFile,
  OversizedFile,
  PackingResult,
} from './ports/packing.port.js';
export type {
  ContextPackWriterPort,
  ContextPackWriteRequest,
} from './ports/context-pack-writer.port.js';
export type {
  ConfigurationPort,
  ConfigurationLoadResult,
  ConfigurationProvenance,
} from './ports/configuration.port.js';
export type { ProfileRegistryPort, ProfileDefinition } from './ports/profile-registry.port.js';
export type { ClockPort } from './ports/clock.port.js';
export type { IdGeneratorPort } from './ports/id-generator.port.js';
export type { ProgressReporterPort, ProgressEvent } from './ports/progress-reporter.port.js';
export type { CancellationPort } from './ports/cancellation.port.js';
export type { LastPackRegistryPort } from './ports/last-pack-registry.port.js';

// Errors
export { CoreError } from './errors/core-error.js';
export { ErrorCodes } from './errors/error-codes.js';
export type { ErrorCode } from './errors/error-codes.js';
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
} from './errors/core-errors.js';

// Domain
export { ContextPack } from './domain/context-pack.js';
export {
  validateTransition,
  isTerminal,
  TERMINAL_STATUSES,
} from './domain/context-pack-state-machine.js';

// Phase 7 — Services
export { FileDecisionService } from './services/file-decision-service.js';
export { RequestFingerprintService } from './services/request-fingerprint-service.js';
export { ProjectInspectionService } from './services/project-inspection-service.js';
export type { ProjectInspectionResult } from './services/project-inspection-service.js';

// Phase 7 — Use Cases
export { ValidateContextForgeConfiguration } from './use-cases/validate-contextforge-configuration.js';
export type { ConfigValidationResult } from './use-cases/validate-contextforge-configuration.js';
export { InspectProjectSources } from './use-cases/inspect-project-sources.js';
export type {
  InspectProjectSourcesInput,
  InspectProjectSourcesOutput,
} from './use-cases/inspect-project-sources.js';
export { ListAvailableProfiles } from './use-cases/list-available-profiles.js';
export type { ListAvailableProfilesOutput } from './use-cases/list-available-profiles.js';
export { PrepareContextPackPreview } from './use-cases/prepare-context-pack-preview.js';
export type { PreparePreviewInput } from './use-cases/prepare-context-pack-preview.js';

// Phase 8 — Use Cases
export { GenerateContextPack } from './use-cases/generate-context-pack.js';
export { CancelContextPackGeneration } from './use-cases/cancel-context-pack-generation.js';
export { OpenLastContextPack } from './use-cases/open-last-context-pack.js';
