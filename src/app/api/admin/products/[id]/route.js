import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession, requireRole } from "@/lib/auth";

export async function PUT(req, { params }) {
  const session = await getSession();
  if (!requireRole(session, ["admin", "owner"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, description, price, compareAtPrice, images, categoryId, stock, sku, sizes, colors, colorImages, isNew, isFeatured, status } = body;

  await db
    .update(products)
    .set({
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: Number(price) }),
      ...(compareAtPrice !== undefined && { compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null }),
      ...(images !== undefined && { images: JSON.stringify(images) }),
      ...(categoryId !== undefined && { categoryId }),
      ...(stock !== undefined && { stock: Number(stock) }),
      ...(sku !== undefined && { sku }),
      ...(sizes !== undefined && { sizes: JSON.stringify(sizes) }),
      ...(colors !== undefined && { colors: JSON.stringify(colors) }),
      ...(colorImages !== undefined && { colorImages: JSON.stringify(colorImages) }),
      ...(isNew !== undefined && { isNew: isNew ? 1 : 0 }),
      ...(isFeatured !== undefined && { isFeatured: isFeatured ? 1 : 0 }),
      ...(status !== undefined && { status }),
    })
    .where(eq(products.id, id));

  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!requireRole(session, ["admin", "owner"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(products).where(eq(products.id, id));
  return NextResponse.json({ ok: true });
}
