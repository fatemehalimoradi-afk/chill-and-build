import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await params;

  const inv = db.prepare("SELECT * FROM invitations WHERE token = ?").get(token) as {
    id: number; team_id: number | null; inviter_id: number; invitee_id: number;
    status: string; expires_at: string;
  } | undefined;

  if (!inv) return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
  if (inv.invitee_id !== session.userId) return NextResponse.json({ error: "This invitation is not for you." }, { status: 403 });
  if (inv.status !== "pending") return NextResponse.json({ error: "Invitation already used." }, { status: 409 });
  if (new Date(inv.expires_at) < new Date()) return NextResponse.json({ error: "Invitation has expired." }, { status: 410 });

  const alreadyInTeam = db.prepare("SELECT team_id FROM team_members WHERE user_id = ?").get(session.userId);
  if (alreadyInTeam) return NextResponse.json({ error: "You are already in a team." }, { status: 409 });

  const teamId = db.transaction(() => {
    let tid = inv.team_id;

    if (tid) {
      // Inviter already had a solo team — verify it still has room
      const count = (db.prepare("SELECT COUNT(*) as c FROM team_members WHERE team_id = ?").get(tid) as { c: number }).c;
      if (count >= 2) throw new Error("Team is already full.");
    } else {
      // No team yet — create one now with the inviter as first member
      const t = db.prepare("INSERT INTO teams (created_by) VALUES (?)").run(inv.inviter_id);
      tid = t.lastInsertRowid as number;
      db.prepare("INSERT INTO team_members (team_id, user_id) VALUES (?, ?)").run(tid, inv.inviter_id);
    }

    // Add invitee
    db.prepare("INSERT INTO team_members (team_id, user_id) VALUES (?, ?)").run(tid, session.userId);
    db.prepare("UPDATE invitations SET status = 'accepted', team_id = ? WHERE id = ?").run(tid, inv.id);
    return tid;
  })();

  return NextResponse.json({ ok: true, teamId });
}
