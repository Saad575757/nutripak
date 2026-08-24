import { NextResponse } from "next/server";
import { parseBody, requireApiSession, withErrorHandling } from "@/lib/api";
import { startSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/validations/auth";

export const PATCH = withErrorHandling(async (request: Request) => {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  const parsed = await parseBody(request, profileSchema);
  if (parsed.error) return parsed.error;

  const email = parsed.data.email.toLowerCase();

  const emailClash = await prisma.admin.findFirst({
    where: { email, id: { not: auth.session.id } },
    select: { id: true },
  });
  if (emailClash) {
    return NextResponse.json(
      { message: "That email address is already in use." },
      { status: 409 }
    );
  }

  const updated = await prisma.admin.update({
    where: { id: auth.session.id },
    data: { name: parsed.data.name.trim(), email },
    select: { id: true, name: true, email: true },
  });

  // Refresh the session so the header shows the new identity immediately.
  await startSession({
    id: updated.id,
    email: updated.email,
    name: updated.name,
  });

  return NextResponse.json({ message: "Profile updated successfully." });
});
