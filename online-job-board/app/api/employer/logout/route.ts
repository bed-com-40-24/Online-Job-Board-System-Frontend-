import { NextResponse } from "next/server";
import { clearEmployerSession } from "@/lib/employer-session";

export async function POST() {
  await clearEmployerSession();
  return NextResponse.json({ ok: true });
}