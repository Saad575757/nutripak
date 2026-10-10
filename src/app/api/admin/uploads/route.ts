import { NextResponse } from "next/server";
import { jsonError, requireApiSession, withErrorHandling } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Only raster image formats are accepted. SVG is intentionally excluded
// because it can carry scripts when served from the same origin.
const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export const POST = withErrorHandling(async (request: Request) => {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("Invalid upload request.", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return jsonError("No image was provided.", 400);
  }
  if (file.size === 0) {
    return jsonError("The selected file is empty.", 400);
  }
  if (file.size > MAX_FILE_SIZE) {
    return jsonError("Images must be 5 MB or smaller.", 413);
  }

  const extension = ALLOWED_TYPES[file.type.toLowerCase()];
  if (!extension) {
    return jsonError(
      "Unsupported file type. Use a PNG, JPEG, WebP, GIF or AVIF image.",
      415
    );
  }

  const data = new Uint8Array(await file.arrayBuffer());
  const created = await prisma.media.create({
    data: {
      filename: file.name || `upload.${extension}`,
      mimeType: file.type.toLowerCase(),
      size: data.byteLength,
      data,
    },
    select: { id: true },
  });

  return NextResponse.json(
    {
      message: "Image uploaded successfully.",
      id: created.id,
      url: `/api/media/${created.id}`,
    },
    { status: 201 }
  );
});
