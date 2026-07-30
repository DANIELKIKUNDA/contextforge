export interface ValidateConfigurationInput {
  /** VS Code settings object. */
  readonly vsCodeSettings?: Record<string, unknown>;
  /** CLI options. */
  readonly cliOptions?: Record<string, unknown>;
  /** Path to .contextforge.json. */
  readonly projectConfigPath?: string;
}

export interface ValidateConfigurationOutput {
  readonly valid: boolean;
  readonly errors: string[];
  readonly warnings: string[];
  readonly effectiveConfiguration: Record<string, unknown>;
  readonly provenance: Record<string, string>;
}
