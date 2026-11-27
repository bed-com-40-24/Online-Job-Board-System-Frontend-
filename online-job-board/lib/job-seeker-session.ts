import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const cookieName = "job_seeker_session";
const sessionDurationSeconds = 60 * 60 * 8;

export type JobSeekerSession = {
  id: string;
  email: string;
  displayName: string;
  accessToken: string;
  expiresIn?: number;
};

function sessionKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function createJobSeekerSession(user: JobSeekerSession) {
  const secret = sessionKey();
  const cookieStore = await cookies();
  const duration = Math.min(
    Math.max(user.expiresIn ?? sessionDurationSeconds, 1),
    sessionDurationSeconds,
  );
  const token = await new SignJWT({
    email: user.email,
    displayName: user.displayName,
    accessToken: user.accessToken,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("online-job-board-job-seeker")
    .setAudience("online-job-board-job-seeker")
    .setSubject(user.id)
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

export async function getJobSeekerSession(): Promise<JobSeekerSession | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, sessionKey(), {
      algorithms: ["HS256"],
      issuer: "online-job-board-job-seeker",
      audience: "online-job-board-job-seeker",
    });
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.displayName !== "string" ||
      typeof payload.accessToken !== "string"
    ) {
      return null;
    }
    return {
      id: payload.sub,
      email: payload.email,
      displayName: payload.displayName,
      accessToken: payload.accessToken,
      expiresIn: typeof payload.exp === "number"
        ? Math.max(1, Math.floor(payload.exp - Date.now() / 1000))
        : undefined,
    };
  } catch {
    return null;
  }
}

export async function clearJobSeekerSession() {
  (await cookies()).delete(cookieName);
}
