import { NextResponse } from "next/server";
import {
  jsonError,
  parseBody,
  requireApiSession,
  withErrorHandling,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { productStatusSchema } from "@/validations/product";

type RouteContext = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandling(
  async (request: Request, context: RouteContext) => {
    const auth = await requireApiSession();
    if (auth.response) return auth.response;

    const { id } = await context.params;

    const parsed = await parseBody(request, productStatusSchema);
    if (parsed.error) return parsed.error;

    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return jsonError("Product not found.", 404);
    }

    await prisma.product.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({
      message:
        parsed.data.status === "ACTIVE"
          ? "Product activated."
          : "Product deactivated.",
    });
  }
);
