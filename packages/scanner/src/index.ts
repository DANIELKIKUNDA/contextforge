export { normalizePath, toAbsolutePath } from './path-normalizer';
export { DEFAULT_EXCLUSIONS, isDefaultExcludedDir } from './default-exclusions';
export { loadGitignore, isIgnoredByGitignore } from './gitignore-loader';
export {
  loadContextforgeIgnore,
  isIgnoredByContextforgeIgnore,
} from './contextforge-ignore-loader';
export { FOLLOW_SYMLINKS_V1, isSymlink, shouldRejectSymlink } from './symlink-policy';
export { detectFileKind } from './file-kind-detector';
export { detectEncoding } from './encoding-detector';
export type { EncodingResult } from './encoding-detector';
export { NodeFileDiscoveryAdapter } from './node-file-discovery.adapter';
export { NodeFileContentReaderAdapter } from './node-file-content-reader.adapter';
