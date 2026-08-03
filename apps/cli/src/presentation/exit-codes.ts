/**
 * Codes de sortie stables pour la CLI ContextForge.
 * Conformes aux contrats existants et aux documents officiels.
 */
export const ExitCodes = {
  /** Succès. */
  SUCCESS: 0,
  /** Erreur de validation des arguments ou options. */
  VALIDATION_ERROR: 1,
  /** Erreur de configuration. */
  CONFIGURATION_ERROR: 2,
  /** Erreur d'entrée utilisateur (fichier manquant, chemin invalide, etc.). */
  USER_INPUT_ERROR: 3,
  /** Erreur de sécurité (secret détecté, fichier sensible). */
  SECURITY_ERROR: 4,
  /** Erreur de génération. */
  GENERATION_ERROR: 5,
  /** Opération annulée (Ctrl+C). */
  CANCELLED: 130,
  /** Erreur interne inattendue. */
  INTERNAL_ERROR: 99,
} as const;

export type ExitCode = (typeof ExitCodes)[keyof typeof ExitCodes];
