import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getSession, requireRole } from "@/lib/auth";

export async function GET(req) {
  const session = await getSession();
  if (!requireRole(session, ["admin", "owner"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase().trim();

  let rows = await db.select().from(products);
  if (q) {
    rows = rows.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.sku || "").toLowerCase().includes(q)
    );
  }

  rows.sort((a, b) => a.stock - b.stock);

  return NextResponse.json({
    products: rows.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stock: p.stock,
      price: p.price,
      status: p.status,
    })),
  });
}
