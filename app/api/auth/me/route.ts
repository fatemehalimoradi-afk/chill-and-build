import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = db.prepare(
    "SELECT id, email, display_name, role, skills, tshirt, lunch, allergies, created_at FROM users WHERE id = ?"
  ).get(session.userId) as {
    id: number; email: string; display_name: string; role: string;
    skills: string; tshirt: string; lunch: string; allergies: string; created_at: string;
  } | undefined;

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...user,
    skills: JSON.parse(user.skills ?? "[]"),
  });
}
