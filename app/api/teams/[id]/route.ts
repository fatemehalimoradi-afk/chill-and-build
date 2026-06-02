import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { isTeamNameTaken, normalizeTeamName } from "@/lib/teams";

// PATCH /api/teams/[id] — update team name
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const teamId = Number(id);
  const { name } = await req.json();

  const trimmed = normalizeTeamName(name ?? "");
  if (!trimmed) return NextResponse.json({ error: "Team name is required." }, { status: 400 });

  const member = db.prepare("SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ?").get(teamId, session.userId);
  if (!member) return NextResponse.json({ error: "Not your team." }, { status: 403 });

  if (isTeamNameTaken(trimmed, teamId)) {
    return NextResponse.json({ error: "That team name is already taken." }, { status: 409 });
  }

  try {
    db.prepare("UPDATE teams SET name = ? WHERE id = ?").run(trimmed, teamId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("UNIQUE constraint failed")) {
      return NextResponse.json({ error: "That team name is already taken." }, { status: 409 });
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}
