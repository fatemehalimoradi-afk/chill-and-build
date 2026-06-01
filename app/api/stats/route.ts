import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const { count: registeredCount } = db
    .prepare("SELECT COUNT(*) as count FROM users")
    .get() as { count: number };

  const { count: teamsCount } = db
    .prepare("SELECT COUNT(*) as count FROM teams")
    .get() as { count: number };

  // First 3 display names for the "X, Y, Z & N others are in" copy
  const topUsers = db
    .prepare("SELECT display_name, email FROM users ORDER BY created_at ASC LIMIT 3")
    .all() as { display_name: string; email: string }[];

  const names = topUsers.map(u => u.display_name || u.email.split("@")[0]);

  return NextResponse.json({ registeredCount, teamsCount, names });
}
