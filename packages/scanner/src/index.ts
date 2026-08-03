export { normalizePath, toAbsolutePath } from './path-normalizer.js';
export { DEFAULT_EXCLUSIONS, isDefaultExcludedDir } from './default-exclusions.js';
export { loadGitignore, isIgnoredByGitignore } from './gitignore-loader.js';
export {
  loadContextforgeIgnore,
  isIgnoredByContextforgeIgnore,
} from './contextforge-ignore-loader.js';
export { FOLLOW_SYMLINKS_V1, isSymlink, shouldRejectSymlink } from './symlink-policy.js';
export { detectFileKind } from './file-kind-detector.js';
export { detectEncoding } from './encoding-detector.js';
export type { EncodingResult } from './encoding-detector.js';
export { NodeFileDiscoveryAdapter } from './node-file-discovery.adapter.js';
export { NodeFileContentReaderAdapter } from './node-file-content-reader.adapter.js';
