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
    return null;
  }

  return new TextEncoder().encode(secret);
}

function encodeSessionValue(session: EmployerSession) {
  return encodeURIComponent(
    JSON.stringify({
      id: session.id,
      email: session.email,
      companyName: session.companyName,
      createdAt: Date.now(),
    }),
  );
}

function parseSessionValue(value: string): EmployerSession | null {
  try {
    const decoded = JSON.parse(decodeURIComponent(value)) as Partial<EmployerSession> & { createdAt?: number };

    if (
      typeof decoded.id !== "string" ||
      typeof decoded.email !== "string" ||
      typeof decoded.companyName !== "string"
    ) {
      return null;
    }

    return {
      id: decoded.id,
      email: decoded.email,
      companyName: decoded.companyName,
    };
  } catch {
    return null;
  }
}

export async function createEmployerSession(employer: EmployerSession) {
  const secret = sessionKey();
  const cookieStore = await cookies();

  if (!secret) {
    cookieStore.set(cookieName, encodeSessionValue(employer), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: sessionDurationSeconds,
    });
    return;
  }

  const token = await new SignJWT({
    email: employer.email,
    companyName: employer.companyName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(employer.id)
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

export async function getEmployerSession(): Promise<EmployerSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  if (!token) return null;

  const secret = sessionKey();
  if (!secret) {
    return parseSessionValue(token);
  }

  try {
    const { payload } = await jwtVerify(token, secret);
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