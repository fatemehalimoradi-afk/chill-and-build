import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) return NextResponse.json({ error: "Token and password are required." }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

    const reset = db.prepare("SELECT * FROM password_resets WHERE token = ?").get(token) as
      { id: number; user_id: number; used: number; expires_at: string } | undefined;

    if (!reset) return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 404 });
    if (reset.used) return NextResponse.json({ error: "This reset link has already been used." }, { status: 410 });
    if (new Date(reset.expires_at) < new Date()) return NextResponse.json({ error: "This reset link has expired." }, { status: 410 });

    const hash = await bcrypt.hash(password, 12);

    db.transaction(() => {
      db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hash, reset.user_id);
      db.prepare("UPDATE password_resets SET used = 1 WHERE id = ?").run(reset.id);
    })();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
