/**
 * Remembers the last generated ContextPack for the "Open Last" command.
 */
export interface LastPackRegistryPort {
  get(projectRoot: string): string | undefined;
  set(projectRoot: string, packPath: string): void;
  clear(projectRoot: string): void;
}
