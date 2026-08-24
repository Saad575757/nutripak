import { NextResponse } from "next/server";
import {
  jsonError,
  parseBody,
  requireApiSession,
  withErrorHandling,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { updateOrderStatusSchema } from "@/validations/order";

type RouteContext = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandling(
  async (request: Request, context: RouteContext) => {
    const auth = await requireApiSession();
    if (auth.response) return auth.response;

    const { id } = await context.params;

    const parsed = await parseBody(request, updateOrderStatusSchema);
    if (parsed.error) return parsed.error;

    const existing = await prisma.order.findUnique({
      where: { id },
      select: { id: true, orderNumber: true },
    });
    if (!existing) {
      return jsonError("Order not found.", 404);
    }

    await prisma.order.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({
      message: `Order status updated.`,
      status: parsed.data.status,
    });
  }
);
