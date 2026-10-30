import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const cookieName = "admin_session";
const sessionDurationSeconds = 60 * 60 * 8;

export type AdminSession = {
  id: string;
  email: string;
  fullName: string;
};

function sessionKey() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  }

  return new TextEncoder().encode(secret);
}

export async function createAdminSession(admin: AdminSession) {
  const secret = sessionKey();
  const cookieStore = await cookies();

  const token = await new SignJWT({ email: admin.email, fullName: admin.fullName })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("online-job-board-admin")
    .setAudience("online-job-board-admin")
    .setSubject(admin.id)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);

  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionDurationSeconds,
  });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  if (!token) return null;

  const secret = sessionKey();

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
      issuer: "online-job-board-admin",
      audience: "online-job-board-admin",
    });

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.fullName !== "string"
    ) {
      return null;
    }

    return { id: payload.sub, email: payload.email, fullName: payload.fullName };
  } catch {
    return null;
  }
}

export async function clearAdminSession() {
  (await cookies()).delete(cookieName);
}
