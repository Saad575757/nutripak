import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "server-only";
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  createSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "./token";

export { SESSION_COOKIE_NAME };
export type { SessionPayload };

/** Reads and verifies the session from cookies. Returns null when unauthenticated. */
export async function readSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

/** For server components — redirects to login when there is no valid session. */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await readSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export async function startSession(payload: SessionPayload): Promise<void> {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
  });
}

export async function endSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}
