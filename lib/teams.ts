import { db } from "./db";

export function normalizeTeamName(name: string): string {
  return name.trim();
}

export function isTeamNameTaken(name: string, excludeTeamId?: number): boolean {
  const normalized = normalizeTeamName(name).toLowerCase();
  if (!normalized) return false;

  const row = excludeTeamId
    ? db
        .prepare(
          "SELECT id FROM teams WHERE name IS NOT NULL AND LOWER(TRIM(name)) = ? AND id != ?"
        )
        .get(normalized, excludeTeamId)
    : db
        .prepare("SELECT id FROM teams WHERE name IS NOT NULL AND LOWER(TRIM(name)) = ?")
        .get(normalized);

  return Boolean(row);
}
