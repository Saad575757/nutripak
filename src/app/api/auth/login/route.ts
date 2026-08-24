import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api";
import { verifyPassword } from "@/lib/auth/password";
import { startSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/validations/auth";

export const POST = withErrorHandling(async (request: Request) => {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 }
    );
  }

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Enter a valid email address and password." },
      { status: 422 }
    );
  }

  const admin = await prisma.admin.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  // Same generic message for unknown email and wrong password.
  if (!admin || !(await verifyPassword(parsed.data.password, admin.passwordHash))) {
    return NextResponse.json(
      { message: "Invalid email or password." },
      { status: 401 }
    );
  }

  await startSession({ id: admin.id, email: admin.email, name: admin.name });

  return NextResponse.json({
    message: "Signed in successfully.",
    admin: { id: admin.id, name: admin.name, email: admin.email },
  });
});
