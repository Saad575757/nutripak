import { NextResponse } from "next/server";
import {
  jsonError,
  parseBody,
  requireApiSession,
  withErrorHandling,
} from "@/lib/api";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/validations/auth";

export const POST = withErrorHandling(async (request: Request) => {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  const parsed = await parseBody(request, changePasswordSchema);
  if (parsed.error) return parsed.error;

  const admin = await prisma.admin.findUnique({
    where: { id: auth.session.id },
    select: { id: true, passwordHash: true },
  });
  if (!admin) {
    return jsonError("Account not found.", 404);
  }

  const currentValid = await verifyPassword(
    parsed.data.currentPassword,
    admin.passwordHash
  );
  if (!currentValid) {
    return NextResponse.json(
      { message: "Your current password is incorrect." },
      { status: 422 }
    );
  }

  if (await verifyPassword(parsed.data.newPassword, admin.passwordHash)) {
    return NextResponse.json(
      { message: "New password must be different from the current one." },
      { status: 422 }
    );
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordHash },
  });

  return NextResponse.json({ message: "Password changed successfully." });
});
