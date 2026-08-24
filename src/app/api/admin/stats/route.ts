import { NextResponse } from "next/server";
import { requireApiSession, withErrorHandling } from "@/lib/api";
import { getDashboardStats } from "@/queries/dashboard";

/** GET /api/admin/stats — dashboard statistics for external consumption. */
export const GET = withErrorHandling(async () => {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  const stats = await getDashboardStats();
  return NextResponse.json(stats);
});
