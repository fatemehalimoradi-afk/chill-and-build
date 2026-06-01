import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });

    const user = db.prepare("SELECT id, email, display_name FROM users WHERE email = ?").get(email) as
      { id: number; email: string; display_name: string } | undefined;

    // Always return success — never reveal whether the email exists
    if (!user) return NextResponse.json({ ok: true });

    // Invalidate any previous unused tokens for this user
    db.prepare("UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0").run(user.id);

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    db.prepare("INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)").run(user.id, token, expiresAt);

    await sendPasswordResetEmail({ to: user.email, displayName: user.display_name, token });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
