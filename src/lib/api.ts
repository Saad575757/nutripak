import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { readSession, type SessionPayload } from "@/lib/auth/session";

export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ message }, { status });
}

export const unauthorized = () => jsonError("Authentication required.", 401);
export const forbidden = () => jsonError("You do not have access to this resource.", 403);
export const notFound = (message = "The requested resource was not found.") =>
  jsonError(message, 404);

/** Returns the authenticated admin session, or a 401 response for API routes. */
export async function requireApiSession(): Promise<
  { session: SessionPayload; response?: never } | { session?: never; response: NextResponse }
> {
  const session = await readSession();
  if (!session) return { response: unauthorized() };
  return { session };
}

export async function parseBody<T>(
  request: Request,
  schema: ZodType<T>
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { error: jsonError("Invalid request body.", 400) };
  }

  try {
    return { data: schema.parse(raw) };
  } catch (error) {
    if (error instanceof ZodError) {
      const first = error.issues[0];
      return {
        error: jsonError(first?.message ?? "Validation failed.", 422),
      };
    }
    throw error;
  }
}

/** Wraps a route handler so unexpected failures never leak internals to clients. */
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>
): (...args: Args) => Promise<NextResponse> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error("[api] Unhandled error:", error);
      return jsonError("Something went wrong. Please try again.", 500);
    }
  };
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
