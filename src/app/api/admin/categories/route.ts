import { NextResponse } from "next/server";
import {
  parseBody,
  requireApiSession,
  slugify,
  withErrorHandling,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { categoryFormSchema } from "@/validations/category";

function normalizeOptional(value?: string): string | null {
  return value && value.trim().length > 0 ? value.trim() : null;
}

export const POST = withErrorHandling(async (request: Request) => {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  const parsed = await parseBody(request, categoryFormSchema);
  if (parsed.error) return parsed.error;
  const input = parsed.data;

  const name = input.name.trim();
  const existingName = await prisma.category.findUnique({
    where: { name },
    select: { id: true },
  });
  if (existingName) {
    return NextResponse.json(
      { message: `A category named "${name}" already exists.` },
      { status: 409 }
    );
  }

  // Derive a unique slug from the name.
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let suffix = 2;
  for (;;) {
    const clash = await prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!clash) break;
    slug = `${baseSlug}-${suffix++}`;
  }

  await prisma.category.create({
    data: {
      name,
      slug,
      description: normalizeOptional(input.description),
      imageUrl: normalizeOptional(input.imageUrl),
      isActive: input.isActive,
    },
  });

  return NextResponse.json(
    { message: "Category created successfully." },
    { status: 201 }
  );
});
