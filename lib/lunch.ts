import { db } from "./db";

export type LunchOption = {
  id: string;
  name: string;
  ingredients: string;
};

export function getLunchOptions(): LunchOption[] {
  return db
    .prepare(
      "SELECT id, name, ingredients FROM lunch_options ORDER BY sort_order ASC, name ASC"
    )
    .all() as LunchOption[];
}

export function isValidLunchId(id: string): boolean {
  return Boolean(db.prepare("SELECT 1 FROM lunch_options WHERE id = ?").get(id));
}

export function getLunchLabel(id: string | null | undefined): string | null {
  if (!id) return null;
  const row = db
    .prepare("SELECT name FROM lunch_options WHERE id = ?")
    .get(id) as { name: string } | undefined;
  return row?.name ?? id;
}
