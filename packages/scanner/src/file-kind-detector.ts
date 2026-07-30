import type { FileContentKind } from '@contextforge/contracts';

const TEXT_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.md',
  '.txt',
  '.yml',
  '.yaml',
  '.css',
  '.html',
  '.xml',
  '.svg',
  '.env',
  '.gitignore',
  '.editorconfig',
  '.csv',
  '.sql',
  '.sh',
  '.bash',
  '.zsh',
  '.py',
  '.java',
  '.cs',
  '.go',
  '.rs',
  '.php',
  '.rb',
  '.c',
  '.h',
  '.cpp',
  '.hpp',
  '.toml',
  '.ini',
  '.cfg',
  '.lock',
]);

const BINARY_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.pdf',
  '.zip',
  '.tar',
  '.gz',
  '.exe',
  '.dll',
  '.so',
  '.dylib',
  '.class',
  '.jar',
  '.war',
  '.ear',
  '.vsix',
  '.mp4',
  '.mp3',
  '.wav',
  '.ogg',
  '.webm',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.otf',
]);

/**
 * Detects file content kind based on extension and optional binary check.
 *
 * Categories:
 * - text: known text extension
 * - binary: known binary extension or detected binary content
 * - unknown: extension not recognized
 */
export function detectFileKind(extension: string, buffer?: Buffer): FileContentKind {
  const lower = extension.toLowerCase();

  if (BINARY_EXTENSIONS.has(lower)) {
    return 'binary';
  }

  if (TEXT_EXTENSIONS.has(lower)) {
    return 'text';
  }

  // Check actual buffer content for NUL bytes (binary indicator)
  if (buffer && buffer.length > 0) {
    if (isBinaryContent(buffer)) {
      return 'binary';
    }
    // If no NUL bytes found, treat as text
    return 'text';
  }

  return 'unknown';
}

/**
 * Detects binary content by checking for NUL bytes in the first chunk.
 * A single NUL byte strongly suggests binary data.
 */
function isBinaryContent(buffer: Buffer): boolean {
  const sampleSize = Math.min(buffer.length, 8192);
  for (let i = 0; i < sampleSize; i++) {
    if (buffer[i] === 0) {
      return true;
    }
  }
  return false;
}
