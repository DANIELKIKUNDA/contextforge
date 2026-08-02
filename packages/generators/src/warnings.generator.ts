/** Génère le rapport JSON des avertissements. */
export class WarningsGenerator {
  generate(warnings: string[]): string {
    return JSON.stringify(
      warnings.map((w) => ({ message: w })),
      null,
      2,
    );
  }
}
