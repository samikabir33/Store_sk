import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getSession, requireRole } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!requireRole(session, ["admin", "owner"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select().from(products);
  return NextResponse.json({ products: rows });
}

export async function POST(req) {
  const session = await getSession();
  if (!requireRole(session, ["admin", "owner"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, description, price, compareAtPrice, images, categoryId, stock, sku, sizes, colors, colorImages, isNew, isFeatured } = body;

  if (!name || !price || !categoryId) {
    return NextResponse.json({ error: "Name, price and category are required." }, { status: 400 });
  }

  const id = nanoid();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + nanoid(5);

  await db.insert(products).values({
    id,
    name,
    slug,
    description: description || "",
    price: Number(price),
    compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
    images: JSON.stringify(images || []),
    categoryId,
    stock: Number(stock || 0),
    sku: sku || null,
    sizes: JSON.stringify(sizes || []),
    colors: JSON.stringify(colors || []),
    colorImages: JSON.stringify(colorImages || {}),
    isNew: isNew ? 1 : 0,
    isFeatured: isFeatured ? 1 : 0,
    status: "active",
    createdAt: Date.now(),
  });

  return NextResponse.json({ ok: true, id, slug });
}
