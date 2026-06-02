import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken } from "@/lib/jwt";
import { isValidLunchId } from "@/lib/lunch";
import { COOKIE_NAME } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password, displayName, role, lunch } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const ALLOWED_DOMAINS = ["fastbundle.co", "rooberah.co"];
    const domain = email.split("@")[1]?.toLowerCase();
    if (!ALLOWED_DOMAINS.includes(domain)) {
      return NextResponse.json(
        { error: "Only @fastbundle.co and @rooberah.co emails are allowed." },
        { status: 403 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    if (!lunch || !isValidLunchId(lunch)) {
      return NextResponse.json({ error: "Please select a valid lunch option." }, { status: 400 });
    }

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 12);

    const result = db.prepare(`
      INSERT INTO users (email, password, display_name, role, lunch)
      VALUES (?, ?, ?, ?, ?)
    `).run(email, hash, displayName ?? null, role ?? null, lunch);

    const token = signToken({ userId: result.lastInsertRowid as number, email });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
