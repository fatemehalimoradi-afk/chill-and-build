import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await params;

  const inv = db.prepare("SELECT * FROM invitations WHERE token = ?").get(token) as {
    id: number; invitee_id: number; status: string;
  } | undefined;

  if (!inv) return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
  if (inv.invitee_id !== session.userId) return NextResponse.json({ error: "This invitation is not for you." }, { status: 403 });
  if (inv.status !== "pending") return NextResponse.json({ error: "Invitation already used." }, { status: 409 });

  db.prepare("UPDATE invitations SET status = 'declined' WHERE id = ?").run(inv.id);
  return NextResponse.json({ ok: true });
}
