import { createHash, randomBytes } from "node:crypto";
import oracledb from "oracledb";
import { NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/mail";
import { getOracleConnection } from "@/lib/oracle";

export const runtime = "nodejs";

type EmployerRow = { EMPLOYER_ID: number };

const genericResponse = {
  message: "If an account exists for that email, a reset link will be sent.",
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
    const result = await connection.execute<EmployerRow>(
      `SELECT employer_id FROM employers WHERE email = :email`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const employer = result.rows?.[0];

    if (employer) {
      const token = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(token).digest("hex");

      await connection.execute(
        `UPDATE employer_password_resets
         SET used_at = SYSTIMESTAMP
         WHERE employer_id = :employerId AND used_at IS NULL`,
        { employerId: employer.EMPLOYER_ID },
      );
      await connection.execute(
        `INSERT INTO employer_password_resets (employer_id, token_hash, expires_at)
         VALUES (:employerId, :tokenHash, SYSTIMESTAMP + INTERVAL '1' HOUR)`,
        { employerId: employer.EMPLOYER_ID, tokenHash },
      );
      await connection.commit();

      const resetUrl = new URL("/employer/reset-password", appUrl);
      resetUrl.searchParams.set("token", token);

      try {
        await sendPasswordResetEmail(email, resetUrl.toString(), "employer");
      } catch (error) {
        console.error("Password reset email could not be sent.", error);
        await connection.execute(
          `UPDATE employer_password_resets
           SET used_at = SYSTIMESTAMP
           WHERE employer_id = :employerId AND used_at IS NULL`,
          { employerId: employer.EMPLOYER_ID },
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
    console.error("Employer password reset request failed.", error);
    return NextResponse.json(
      { error: "Password reset is unavailable. Check the server configuration and try again." },
      { status: 503 },
    );
  } finally {
    await connection?.close();
  }
}