import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const cookieName = "employer_session";
const sessionDurationSeconds = 60 * 60 * 8;

export type EmployerSession = {
  id: string;
  email: string;
  companyName: string;
};

function sessionKey() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters.");
  }

  return new TextEncoder().encode(secret);
}

export async function createEmployerSession(employer: EmployerSession) {
  const token = await new SignJWT({
    email: employer.email,
    companyName: employer.companyName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(employer.id)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(sessionKey());

  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionDurationSeconds,
  });
}

export async function getEmployerSession(): Promise<EmployerSession | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, sessionKey());
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.companyName !== "string"
    ) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      companyName: payload.companyName,
    };
  } catch {
    return null;
  }
}

export async function clearEmployerSession() {
  (await cookies()).delete(cookieName);
}