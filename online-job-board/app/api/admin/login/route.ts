import bcrypt from "bcryptjs";
import oracledb from "oracledb";
import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/admin-session";
import { getOracleConnection } from "@/lib/oracle";

export const runtime = "nodejs";

type AdminRow = {
  ADMIN_ID: number;
  EMAIL: string;
  PASSWORD_HASH: string;
  FULL_NAME: string;
};

export async function POST(request: Request) {
  let connection: oracledb.Connection | undefined;

  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
      return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
    }

    connection = await getOracleConnection();
    const result = await connection.execute<AdminRow>(
      `SELECT admin_id, email, password_hash, full_name
       FROM administrators
       WHERE email = :email`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const admin = result.rows?.[0];

    if (
      !admin ||
      Buffer.byteLength(password) > 72 ||
      !(await bcrypt.compare(password, admin.PASSWORD_HASH))
    ) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }

    await createAdminSession({
      id: String(admin.ADMIN_ID),
      email: admin.EMAIL,
      fullName: admin.FULL_NAME,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Administrator login failed.", error);
    return NextResponse.json(
      { error: "Administrator sign-in is unavailable. Check the server and database configuration." },
      { status: 503 },
    );
  } finally {
    await connection?.close();
  }
}
