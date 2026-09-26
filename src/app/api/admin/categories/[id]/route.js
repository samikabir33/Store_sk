import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession, requireRole } from "@/lib/auth";
import { makeUniqueSlug } from "@/lib/categories";

export const dynamic = "force-dynamic";

async function guard() {
  const session = await getSession();
  if (!requireRole(session, ["admin", "owner"])) return null;
  return session;
}

// ---- Rename and/or update the image of a category ----
export async function PATCH(req, { params }) {
  if (!(await guard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const hasName = typeof body?.name === "string";
  const hasImage = typeof body?.imageUrl === "string";

  if (!hasName && !hasImage)
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });

  const rows = await db.select().from(categories);
  const current = rows.find((c) => c.id === id);
  if (!current) return NextResponse.json({ error: "Category not found." }, { status: 404 });

  const patch = {};

  if (hasName) {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });

    const duplicate = rows.find(
      (c) =>
        c.id !== id &&
        (c.parentId || null) === (current.parentId || null) &&
        c.name.trim().toLowerCase() === name.toLowerCase()
    );
    if (duplicate)
      return NextResponse.json({ error: `"${name}" already exists here.` }, { status: 409 });

    patch.name = name;
    patch.slug = makeUniqueSlug(rows, name, id);
  }

  if (hasImage) {
    patch.imageUrl = body.imageUrl.trim();
  }

  await db.update(categories).set(patch).where(eq(categories.id, id));

  return NextResponse.json({ ok: true, ...patch });
}

// ---- Delete a category (blocked while products / sub-categories exist) ----
export async function DELETE(req, { params }) {
  if (!(await guard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const rows = await db.select().from(categories);
  const current = rows.find((c) => c.id === id);
  if (!current) return NextResponse.json({ error: "Category not found." }, { status: 404 });

  const subs = rows.filter((c) => c.parentId === id);
  if (subs.length)
    return NextResponse.json(
      {
        error: `This category has ${subs.length} sub-categor${
          subs.length === 1 ? "y" : "ies"
        }. Delete or move them first.`,
        subCount: subs.length,
      },
      { status: 409 }
    );

  const prodRows = await db.select().from(products).where(eq(products.categoryId, id));
  if (prodRows.length)
    return NextResponse.json(
      {
        error: `This category has ${prodRows.length} product${
          prodRows.length === 1 ? "" : "s"
        }. Move them to another category first, then delete.`,
        productCount: prodRows.length,
      },
      { status: 409 }
    );

  await db.delete(categories).where(eq(categories.id, id));
  return NextResponse.json({ ok: true });
}
