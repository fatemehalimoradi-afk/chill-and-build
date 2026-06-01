import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

// GET /api/teams — all teams with members
export async function GET() {
  const teams = db.prepare(`
    SELECT t.id, t.name, t.created_by, t.created_at,
           u.display_name AS creator_name, u.email AS creator_email
    FROM teams t
    JOIN users u ON u.id = t.created_by
    ORDER BY t.created_at DESC
  `).all() as {
    id: number; name: string | null; created_by: number; created_at: string;
    creator_name: string; creator_email: string;
  }[];

  const result = teams.map(team => {
    const members = db.prepare(`
      SELECT u.id, u.display_name, u.email, u.role
      FROM team_members tm JOIN users u ON u.id = tm.user_id
      WHERE tm.team_id = ?
    `).all(team.id) as { id: number; display_name: string; email: string; role: string }[];
    return { ...team, members };
  });

  return NextResponse.json(result);
}

// POST /api/teams — create a solo team (no teammate)
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = db.prepare("SELECT team_id FROM team_members WHERE user_id = ?").get(session.userId);
  if (existing) return NextResponse.json({ error: "You are already in a team." }, { status: 409 });

  const teamId = db.transaction(() => {
    const t = db.prepare("INSERT INTO teams (created_by) VALUES (?)").run(session.userId);
    const id = t.lastInsertRowid as number;
    db.prepare("INSERT INTO team_members (team_id, user_id) VALUES (?, ?)").run(id, session.userId);
    return id;
  })();

  return NextResponse.json({ ok: true, teamId });
}
