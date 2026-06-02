import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getLunchLabel, isValidLunchId } from "@/lib/lunch";
import { getSession } from "@/lib/session";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lunch } = await req.json();
  if (!lunch || !isValidLunchId(lunch)) {
    return NextResponse.json({ error: "Please select a valid lunch option." }, { status: 400 });
  }

  db.prepare("UPDATE users SET lunch = ? WHERE id = ?").run(lunch, session.userId);
  return NextResponse.json({ ok: true, lunch, lunch_label: getLunchLabel(lunch) });
}
