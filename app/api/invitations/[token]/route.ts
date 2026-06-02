import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/invitations/[token] — fetch invitation details
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const inv = db.prepare(`
    SELECT i.id, i.status, i.expires_at, i.team_id,
           u.display_name AS inviter_name, u.email AS inviter_email,
           u2.display_name AS invitee_name, u2.email AS invitee_email, u2.id AS invitee_id,
           t.name AS team_name
    FROM invitations i
    JOIN users u  ON u.id  = i.inviter_id
    JOIN users u2 ON u2.id = i.invitee_id
    LEFT JOIN teams t  ON t.id  = i.team_id
    WHERE i.token = ?
  `).get(token) as {
    id: number; status: string; expires_at: string; team_id: number;
    inviter_name: string; inviter_email: string;
    invitee_name: string; invitee_email: string; invitee_id: number;
    team_name: string | null;
  } | undefined;

  if (!inv) return NextResponse.json({ error: "Invitation not found." }, { status: 404 });

  const expired = new Date(inv.expires_at) < new Date();
  return NextResponse.json({ ...inv, expired });
}
