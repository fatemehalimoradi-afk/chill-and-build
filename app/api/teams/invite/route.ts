import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { sendInvitationEmail } from "@/lib/email";

// POST /api/teams/invite
// Case A: inviter has no team yet  → sends invite; team created on acceptance
// Case B: inviter has a solo team  → sends invite; invitee joins existing team on acceptance
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { inviteeId } = await req.json();
  if (!inviteeId) return NextResponse.json({ error: "inviteeId required." }, { status: 400 });

  // Inviter must not already be in a full team
  const myMembership = db.prepare("SELECT team_id FROM team_members WHERE user_id = ?").get(session.userId) as
    { team_id: number } | undefined;

  if (myMembership) {
    const count = (db.prepare("SELECT COUNT(*) as c FROM team_members WHERE team_id = ?").get(myMembership.team_id) as { c: number }).c;
    if (count >= 2) return NextResponse.json({ error: "Your team is already full." }, { status: 409 });
  }

  const invitee = db.prepare("SELECT id, email, display_name FROM users WHERE id = ?").get(inviteeId) as
    { id: number; email: string; display_name: string } | undefined;
  if (!invitee) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const inviteeTeam = db.prepare("SELECT team_id FROM team_members WHERE user_id = ?").get(invitee.id);
  if (inviteeTeam) return NextResponse.json({ error: "That user is already in a team." }, { status: 409 });

  // Cancel any pending invite from this inviter to this invitee
  db.prepare("UPDATE invitations SET status = 'cancelled' WHERE inviter_id = ? AND invitee_id = ? AND status = 'pending'")
    .run(session.userId, invitee.id);

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  // team_id is the existing solo team (if any), otherwise NULL
  db.prepare(`
    INSERT INTO invitations (team_id, inviter_id, invitee_id, token, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(myMembership?.team_id ?? null, session.userId, invitee.id, token, expiresAt);

  const inviter = db.prepare("SELECT display_name FROM users WHERE id = ?").get(session.userId) as { display_name: string };
  const teamName = myMembership
    ? (db.prepare("SELECT name FROM teams WHERE id = ?").get(myMembership.team_id) as { name: string | null }).name
    : null;

  await sendInvitationEmail({
    to: invitee.email,
    inviterName: inviter.display_name || session.email,
    teamName,
    token,
  });

  return NextResponse.json({ ok: true });
}
