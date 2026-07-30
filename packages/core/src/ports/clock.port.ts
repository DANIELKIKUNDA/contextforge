/**
 * Provides the current date/time.
 * Used for pack generation timestamps.
 */
export interface ClockPort {
  now(): Date;
}
