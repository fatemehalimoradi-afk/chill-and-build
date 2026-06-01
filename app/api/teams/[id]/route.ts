import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

// PATCH /api/teams/[id] — update team name
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const teamId = Number(id);
  const { name } = await req.json();

  if (!name?.trim()) return NextResponse.json({ error: "Team name is required." }, { status: 400 });

  // Must be a member of the team
  const member = db.prepare("SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ?").get(teamId, session.userId);
  if (!member) return NextResponse.json({ error: "Not your team." }, { status: 403 });

  db.prepare("UPDATE teams SET name = ? WHERE id = ?").run(name.trim(), teamId);
  return NextResponse.json({ ok: true });
}
