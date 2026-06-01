import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = db.prepare(`
    SELECT u.id, u.display_name, u.email, u.role,
           tm.team_id
    FROM users u
    LEFT JOIN team_members tm ON tm.user_id = u.id
    ORDER BY u.display_name COLLATE NOCASE ASC
  `).all() as { id: number; display_name: string; email: string; role: string; team_id: number | null }[];

  return NextResponse.json(users);
}
