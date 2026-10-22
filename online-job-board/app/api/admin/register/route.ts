import { timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import oracledb from "oracledb";
import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/admin-session";
import { getOracleConnection } from "@/lib/oracle";

export const runtime = "nodejs";

type AdminRow = { ADMIN_ID: number; EMAIL: string; FULL_NAME: string };

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
    const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const setupKey = typeof body?.setupKey === "string" ? body.setupKey : "";
    const expectedKey = process.env.ADMIN_SIGNUP_KEY;

    if (!expectedKey || Buffer.byteLength(expectedKey) < 32) {
      return NextResponse.json(
        { error: "Administrator registration is disabled. Configure a secure ADMIN_SIGNUP_KEY first." },
        { status: 503 },
      );
    }

    const suppliedKeyBytes = Buffer.from(setupKey);
    const expectedKeyBytes = Buffer.from(expectedKey);
    const validSetupKey =
      suppliedKeyBytes.length === expectedKeyBytes.length &&
      timingSafeEqual(suppliedKeyBytes, expectedKeyBytes);

    if (!validSetupKey) {
      return NextResponse.json({ error: "The administrator setup key is incorrect." }, { status: 403 });
    }

    if (
      fullName.length < 2 ||
      fullName.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 320 ||
      password.length < 12 ||
      Buffer.byteLength(password) > 72
    ) {
      return NextResponse.json(
        { error: "Enter your name, a valid email, and a password of at least 12 characters." },
        { status: 400 },
      );
    }

    connection = await getOracleConnection();
    const passwordHash = await bcrypt.hash(password, 12);
    await connection.execute(
      `INSERT INTO administrators (email, password_hash, full_name)
       VALUES (:email, :passwordHash, :fullName)`,
      { email, passwordHash, fullName },
    );

    const adminResult = await connection.execute<AdminRow>(
      `SELECT admin_id, email, full_name
       FROM administrators
       WHERE email = :email`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const admin = adminResult.rows?.[0];
    if (!admin) throw new Error("New administrator account could not be loaded.");

    await connection.commit();
    await createAdminSession({
      id: String(admin.ADMIN_ID),
      email: admin.EMAIL,
      fullName: admin.FULL_NAME,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    await connection?.rollback();
    if (isDuplicateEmail(error)) {
      return NextResponse.json(
        { error: "An administrator account with that email already exists." },
        { status: 409 },
      );
    }
    console.error("Administrator registration failed.", error);
    return NextResponse.json(
      { error: "Administrator registration is unavailable. Check the server and database configuration." },
      { status: 503 },
    );
  } finally {
    await connection?.close();
  }
}
