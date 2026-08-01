# ADR 001 — Correct packing port data flow and oversized-file traceability

- **Status**: accepted
- **Date**: 2026-07-31
- **Phase**: 5 (Sizing and Packing)

## Context

The original `PackingPort` contract (defined in Phase 2) accepted:

```typescript
pack(includedFiles: SourceFile[], tokenLimit: number, profile: ProfileId): PackVolume[]
```

During Phase 5 implementation planning, a contractual contradiction was discovered:
`SourceFile` contains neither `content` nor `estimatedTokens`, yet the packer
must know each file's token count to distribute files across volumes.

`SizingPort` produces `FileSizeMetrics` (including `estimatedTokens`) from content
strings, but there is no mechanism to pass these metrics into `PackingPort`.

The document 04 §10 (Phase 7 — Preview) describes the correct flow:
1. Scanner reads files → `SourceFile[]` + content
2. Security scans content → findings
3. Core takes `FileDecision[]`
4. **Sizing** estimates tokens → `FileSizeMetrics`
5. **Packing** distributes files → `PackVolume[]`

Steps 4 and 5 require sizing results to flow into packing.

Additionally, `PackVolume[]` has no mechanism to report files that exceed the
token limit — the `oversized-file-policy.ts` file listed in doc 04 §8.2 needs
a result type that supports traceable exclusion.

## Decision

Replace the `PackingPort` contract with enriched types:

```typescript
export interface PackableFile {
  readonly file: SourceFile;
  readonly metrics: FileSizeMetrics;
}

export interface OversizedFile {
  readonly fileId: ContextPackId;
  readonly estimatedTokens: number;
  readonly tokenLimit: number;
  readonly reasonCode: 'file-too-large';
}

export interface PackingResult {
  readonly volumes: readonly PackVolume[];
  readonly oversizedFiles: readonly OversizedFile[];
}

export interface PackingPort {
  pack(
    includedFiles: readonly PackableFile[],
    tokenLimit: number,
    profile: ProfileId,
  ): PackingResult;
}
```

`PackableFile` bundles a `SourceFile` with its `FileSizeMetrics` — no token
recalculation needed in the packer.

`OversizedFile` reports files exceeding the limit with stable traceability.

`PackingResult` returns both successful volumes and oversized files.

## Rejected alternatives

**Map<string, number>** — passing a separate map of `relativePath → estimatedTokens`
was rejected because it decouples the metrics from the file, requires the packer
to perform lookups, and introduces ambiguity when `SourceFile` identities collide.

**Adding `estimatedTokens` to `SourceFile`** — rejected because `SourceFile`
is a contracts-level model produced by the scanner. Sizing is a separate concern
that should not pollute the scanner's output type.

**Passing `content` to PackingPort** — rejected because it would make the packer
depend on file content, violating single responsibility and requiring the packer
to call sizing internally.

## Consequences

- `PackingPort` signature changes — all future implementors of this port must
  work with `PackableFile` and return `PackingResult`.
- `PackVolume` remains unchanged — only the port contract is updated.
- `oversized-file-policy.ts` (doc 04 §8.2) can now produce typed `OversizedFile[]`
  results that flow through `PackingResult`.
- No changes to `packages/contracts` are required.
- No changes to `packages/scanner`, `packages/security`, `packages/sizing`, or
  `packages/packer` are required yet.

## V1 compatibility

This change is fully backward-compatible for all implemented phases (0–4).
No existing code references `PackingPort` with actual implementations — it was
defined as an interface stub in Phase 2.