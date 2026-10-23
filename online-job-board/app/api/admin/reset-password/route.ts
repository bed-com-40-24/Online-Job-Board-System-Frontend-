import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import oracledb from "oracledb";
import { NextResponse } from "next/server";
import { getOracleConnection } from "@/lib/oracle";

export const runtime = "nodejs";

type ResetRow = { ADMIN_ID: number };

export async function POST(request: Request) {
  let connection: oracledb.Connection | undefined;

  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const token = typeof body?.token === "string" ? body.token : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!/^[a-f0-9]{64}$/.test(token) || password.length < 12 || Buffer.byteLength(password) > 72) {
      return NextResponse.json(
        { error: "Use a valid reset link and a password of at least 12 characters." },
        { status: 400 },
      );
    }

    connection = await getOracleConnection();
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const result = await connection.execute<ResetRow>(
      `SELECT admin_id
       FROM administrator_password_resets
       WHERE token_hash = :tokenHash
         AND used_at IS NULL
         AND expires_at > SYSTIMESTAMP
       FOR UPDATE`,
      { tokenHash },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const reset = result.rows?.[0];

    if (!reset) {
      await connection.rollback();
      return NextResponse.json(
        { error: "This reset link is invalid or expired. Request a new one." },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await connection.execute(
      `UPDATE administrators SET password_hash = :passwordHash WHERE admin_id = :adminId`,
      { passwordHash, adminId: reset.ADMIN_ID },
    );
    await connection.execute(
      `UPDATE administrator_password_resets
       SET used_at = SYSTIMESTAMP
       WHERE admin_id = :adminId AND used_at IS NULL`,
      { adminId: reset.ADMIN_ID },
    );
    await connection.commit();

    return NextResponse.json({ ok: true });
  } catch (error) {
    await connection?.rollback();
    console.error("Administrator password reset failed.", error);
    return NextResponse.json(
      { error: "Password reset is unavailable. Check the server and database configuration." },
      { status: 503 },
    );
  } finally {
    await connection?.close();
  }
}
