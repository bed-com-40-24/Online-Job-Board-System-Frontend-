import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const cookieName = "admin_session";
const sessionDurationSeconds = 60 * 60 * 8;

export type AdminSession = {
  id: string;
  email: string;
  fullName: string;
  accessToken?: string;
  expiresIn?: number;
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
  const duration = Math.min(
    Math.max(admin.expiresIn ?? sessionDurationSeconds, 1),
    sessionDurationSeconds,
  );

  const token = await new SignJWT({
    email: admin.email,
    fullName: admin.fullName,
    accessToken: admin.accessToken,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("online-job-board-admin")
    .setAudience("online-job-board-admin")
    .setSubject(admin.id)
    .setIssuedAt()
    .setExpirationTime(`${duration}s`)
    .sign(secret);

  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: duration,
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
      typeof payload.fullName !== "string" ||
      (payload.accessToken !== undefined && typeof payload.accessToken !== "string")
    ) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      fullName: payload.fullName,
      accessToken: payload.accessToken,
      expiresIn: typeof payload.exp === "number"
        ? Math.max(1, Math.floor(payload.exp - Date.now() / 1000))
        : undefined,
    };
  } catch {
    return null;
  }
}

export async function clearAdminSession() {
  (await cookies()).delete(cookieName);
}
