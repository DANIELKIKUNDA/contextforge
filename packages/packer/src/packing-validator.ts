import type { PackableFile, PackingResult } from '@contextforge/core';

/**
 * Validates packing invariants after a packing operation.
 * Returns validation errors, or empty array if valid.
 */
export function validatePackingResult(
  input: readonly PackableFile[],
  result: PackingResult,
  tokenLimit: number,
): string[] {
  const errors: string[] = [];
  const allFileIds = new Set<string>();

  // 1. Each file appears exactly once across volumes
  for (const vol of result.volumes) {
    for (const id of vol.fileIds) {
      const key = id as string;
      if (allFileIds.has(key)) {
        errors.push(`Duplicate file ID across volumes: ${key}`);
      }
      allFileIds.add(key);
    }
  }

  // 2. Each volume is non-empty
  for (const vol of result.volumes) {
    if (vol.fileIds.length === 0) {
      errors.push(`Volume ${vol.index} is empty.`);
    }
  }

  // 3. Each volume respects tokenLimit
  for (const vol of result.volumes) {
    if (vol.estimatedTokens > tokenLimit) {
      errors.push(
        `Volume ${vol.index} exceeds token limit: ${vol.estimatedTokens} > ${tokenLimit}`,
      );
    }
  }

  // 4. Output file names are unique
  const names = new Set<string>();
  for (const vol of result.volumes) {
    if (names.has(vol.outputFileName)) {
      errors.push(`Duplicate outputFileName: ${vol.outputFileName}`);
    }
    names.add(vol.outputFileName);
  }

  // 5. Oversized files not in volumes
  for (const os of result.oversizedFiles) {
    if (allFileIds.has(os.fileId as string)) {
      errors.push(`Oversized file ${os.fileId as string} appears in a volume.`);
    }
  }

  // 6. No file lost (accounting)
  const packableInput = input.filter((pf) => pf.metrics.estimatedTokens <= tokenLimit);
  if (
    allFileIds.size + result.oversizedFiles.length !==
    packableInput.length + result.oversizedFiles.length
  ) {
    errors.push('File accounting mismatch: some files are missing.');
  }

  return errors;
}
