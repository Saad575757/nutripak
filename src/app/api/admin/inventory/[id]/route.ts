import { NextResponse } from "next/server";
import {
  jsonError,
  parseBody,
  requireApiSession,
  withErrorHandling,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { stockUpdateSchema } from "@/validations/inventory";

type RouteContext = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandling(
  async (request: Request, context: RouteContext) => {
    const auth = await requireApiSession();
    if (auth.response) return auth.response;

    const { id } = await context.params;

    const parsed = await parseBody(request, stockUpdateSchema);
    if (parsed.error) return parsed.error;

    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!existing) {
      return jsonError("Product not found.", 404);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { stockQuantity: parsed.data.stockQuantity },
      select: { stockQuantity: true },
    });

    return NextResponse.json({
      message:
        updated.stockQuantity === 0
          ? `Stock updated to 0 — "${existing.name}" is now out of stock.`
          : "Stock updated successfully.",
      stockQuantity: updated.stockQuantity,
    });
  }
);
