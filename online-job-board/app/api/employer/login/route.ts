import bcrypt from "bcryptjs";
import oracledb from "oracledb";
import { NextResponse } from "next/server";
import { createEmployerSession } from "@/lib/employer-session";
import { getOracleConnection } from "@/lib/oracle";

export const runtime = "nodejs";

type EmployerRow = {
  EMPLOYER_ID: number;
  EMAIL: string;
  PASSWORD_HASH: string;
  COMPANY_NAME: string;
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
    const result = await connection.execute<EmployerRow>(
      `SELECT employer_id, email, password_hash, company_name
       FROM employers WHERE email = :email`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const employer = result.rows?.[0];

    if (
      !employer ||
      new TextEncoder().encode(password).length > 72 ||
      !(await bcrypt.compare(password, employer.PASSWORD_HASH))
    ) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }

    await createEmployerSession({
      id: String(employer.EMPLOYER_ID),
      email: employer.EMAIL,
      companyName: employer.COMPANY_NAME,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Employer login failed.", error);
    return NextResponse.json(
      { error: "Sign-in is unavailable. Check the server configuration and try again." },
      { status: 503 },
    );
  } finally {
    await connection?.close();
  }
}