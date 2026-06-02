import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

// POST /api/teams/leave — leave current team; delete team if empty
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = db.prepare("SELECT team_id FROM team_members WHERE user_id = ?").get(session.userId) as
    { team_id: number } | undefined;

  if (!membership) {
    return NextResponse.json({ error: "You are not in a team." }, { status: 404 });
  }

  const teamId = membership.team_id;

  const teamDeleted = db.transaction(() => {
    db.prepare("DELETE FROM team_members WHERE team_id = ? AND user_id = ?").run(teamId, session.userId);

    const count = (db.prepare("SELECT COUNT(*) as c FROM team_members WHERE team_id = ?").get(teamId) as { c: number }).c;
    if (count === 0) {
      db.prepare("DELETE FROM teams WHERE id = ?").run(teamId);
      return true;
    }
    return false;
  })();

  return NextResponse.json({ ok: true, teamDeleted });
}
