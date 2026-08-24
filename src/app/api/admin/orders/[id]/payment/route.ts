import { NextResponse } from "next/server";
import {
  jsonError,
  parseBody,
  requireApiSession,
  withErrorHandling,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { updatePaymentStatusSchema } from "@/validations/order";

type RouteContext = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandling(
  async (request: Request, context: RouteContext) => {
    const auth = await requireApiSession();
    if (auth.response) return auth.response;

    const { id } = await context.params;

    const parsed = await parseBody(request, updatePaymentStatusSchema);
    if (parsed.error) return parsed.error;

    const existing = await prisma.order.findUnique({
      where: { id },
      select: { id: true, orderNumber: true },
    });
    if (!existing) {
      return jsonError("Order not found.", 404);
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { paymentStatus: parsed.data.paymentStatus },
      select: { paymentStatus: true },
    });

    return NextResponse.json({
      message:
        updated.paymentStatus === "COLLECTED"
          ? `COD payment for ${existing.orderNumber} marked as collected.`
          : `COD payment for ${existing.orderNumber} marked as pending.`,
      paymentStatus: updated.paymentStatus,
    });
  }
);
