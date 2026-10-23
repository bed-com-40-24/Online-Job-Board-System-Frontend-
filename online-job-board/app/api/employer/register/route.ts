import bcrypt from "bcryptjs";
import oracledb from "oracledb";
import { NextResponse } from "next/server";
import { createEmployerSession } from "@/lib/employer-session";
import { getOracleConnection } from "@/lib/oracle";

export const runtime = "nodejs";

type EmployerRow = {
  EMPLOYER_ID: number;
  EMAIL: string;
  COMPANY_NAME: string;
};

function isDuplicateEmail(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "errorNum" in error &&
    error.errorNum === 1
  );
}

export async function POST(request: Request) {
  let connection: oracledb.Connection | undefined;

  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const companyName = typeof body?.companyName === "string" ? body.companyName.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (
      companyName.length < 2 ||
      companyName.length > 200 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 320 ||
      password.length < 8 ||
      new TextEncoder().encode(password).length > 72
    ) {
      return NextResponse.json(
        { error: "Enter a company name, valid email, and password of at least 8 characters." },
        { status: 400 },
      );
    }

    connection = await getOracleConnection();
    const passwordHash = await bcrypt.hash(password, 12);
    await connection.execute(
      `INSERT INTO employers (email, password_hash, company_name)
       VALUES (:email, :passwordHash, :companyName)`,
      { email, passwordHash, companyName },
      { autoCommit: true },
    );

    const result = await connection.execute<EmployerRow>(
      `SELECT employer_id, email, company_name FROM employers WHERE email = :email`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const employer = result.rows?.[0];

    if (!employer) throw new Error("New employer record could not be loaded.");

    await createEmployerSession({
      id: String(employer.EMPLOYER_ID),
      email: employer.EMAIL,
      companyName: employer.COMPANY_NAME,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (isDuplicateEmail(error)) {
      return NextResponse.json(
        { error: "An employer account with that email already exists." },
        { status: 409 },
      );
    }

    console.error("Employer registration failed.", error);
    return NextResponse.json(
      { error: "Registration is unavailable. Check the server configuration and try again." },
      { status: 503 },
    );
  } finally {
    await connection?.close();
  }
}