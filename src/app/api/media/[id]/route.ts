import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api";

type RouteContext = { params: Promise<{ id: string }> };

// Public so product and category images render in the storefront as well as
// the admin dashboard. Uploads remain authenticated via /api/admin/uploads.
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const media = await prisma.media.findUnique({
      where: { id },
      select: { data: true, mimeType: true, size: true },
    });

    if (!media) {
      return jsonError("Image not found.", 404);
    }

    const body = new Uint8Array(media.data);

    return new Response(body, {
      headers: {
        "Content-Type": media.mimeType,
        "Content-Length": String(media.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[api] Failed to serve media:", error);
    return jsonError("Something went wrong. Please try again.", 500);
  }
}
