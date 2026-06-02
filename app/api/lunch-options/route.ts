import { NextResponse } from "next/server";
import { getLunchOptions } from "@/lib/lunch";

export async function GET() {
  return NextResponse.json(getLunchOptions());
}
