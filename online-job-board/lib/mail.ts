import "server-only";
import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  accountType: "employer" | "administrator",
) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;

  if (!host || !port || !user || !password || !from) {
    throw new Error("Password reset email is not configured.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass: password },
  });

  await transporter.sendMail({
    from,
    to: email,
    subject: `Reset your ${accountType} account password`,
    text: `Use this one-time link to reset your ${accountType} account password. It expires in one hour: ${resetUrl}`,
    html: `<p>Use this one-time link to reset your password. It expires in one hour.</p><p><a href="${resetUrl}">Reset password</a></p>`,
  });
}