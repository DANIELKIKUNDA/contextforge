/**
 * Generates unique identifiers for packs, previews, etc.
 */
export interface IdGeneratorPort {
  generatePackId(): string;
  generatePreviewId(): string;
}
