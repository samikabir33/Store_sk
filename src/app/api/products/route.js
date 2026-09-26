import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, like, and } from "drizzle-orm";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("category");
  const filter = searchParams.get("filter"); // new | best-selling
  const q = searchParams.get("q");

  let rows = await db.select().from(products).where(eq(products.status, "active"));

  if (categorySlug) {
    const cat = await db.select().from(categories).where(eq(categories.slug, categorySlug)).get();
    if (cat) rows = rows.filter((p) => p.categoryId === cat.id);
    else rows = [];
  }

  if (filter === "new") rows = rows.filter((p) => p.isNew === 1);
  if (filter === "best-selling") rows = rows.filter((p) => p.isFeatured === 1);

  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter((p) => p.name.toLowerCase().includes(needle));
  }

  return NextResponse.json({ products: rows });
}
