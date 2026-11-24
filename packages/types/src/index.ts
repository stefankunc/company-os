/**
 * Zentrale TypeScript-Typen & Daten-Schemas für das CNT-Monorepo.
 */

export type CntAppName = "Company-OS" | "Connect" | "Hyper" | "Analysis" | "Spark" | "Flux";

export interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}
