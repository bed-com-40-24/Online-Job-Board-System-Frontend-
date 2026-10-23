import { createHash, randomBytes } from "node:crypto";
import oracledb from "oracledb";
import { NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/mail";
import { getOracleConnection } from "@/lib/oracle";

export const runtime = "nodejs";

type AdminRow = { ADMIN_ID: number };

const genericResponse = {
  message: "If an administrator account exists for that email, a reset link will be sent.",
};

export async function POST(request: Request) {
  let connection: oracledb.Connection | undefined;

  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const appUrl = process.env.APP_URL;
    if (!appUrl) throw new Error("APP_URL is not configured.");

    connection = await getOracleConnection();
    const result = await connection.execute<AdminRow>(
      `SELECT admin_id FROM administrators WHERE email = :email`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const admin = result.rows?.[0];

    if (admin) {
      const token = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(token).digest("hex");

      await connection.execute(
        `UPDATE administrator_password_resets
         SET used_at = SYSTIMESTAMP
         WHERE admin_id = :adminId AND used_at IS NULL`,
        { adminId: admin.ADMIN_ID },
      );
      await connection.execute(
        `INSERT INTO administrator_password_resets (admin_id, token_hash, expires_at)
         VALUES (:adminId, :tokenHash, SYSTIMESTAMP + INTERVAL '1' HOUR)`,
        { adminId: admin.ADMIN_ID, tokenHash },
      );
      await connection.commit();

      const resetUrl = new URL("/admin/reset-password", appUrl);
      resetUrl.searchParams.set("token", token);
      try {
        await sendPasswordResetEmail(email, resetUrl.toString(), "administrator");
      } catch (error) {
        console.error("Password reset email could not be sent.", error);
        await connection.execute(
          `UPDATE administrator_password_resets
           SET used_at = SYSTIMESTAMP
           WHERE admin_id = :adminId AND used_at IS NULL`,
          { adminId: admin.ADMIN_ID },
        );
        await connection.commit();
        return NextResponse.json(
          { error: "The password reset email could not be sent. Check the mail configuration and try again." },
          { status: 503 },
        );
      }
    }

    return NextResponse.json(genericResponse);
  } catch (error) {
    console.error("Administrator password reset request failed.", error);
    return NextResponse.json(
      { error: "The password reset email could not be sent. Check the mail configuration and try again." },
      { status: 503 },
    );
  } finally {
    await connection?.close();
  }
}
