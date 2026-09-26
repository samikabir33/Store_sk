import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, orders, orderItems } from "@/db/schema";
import { eq, and, desc, ne } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getSession } from "@/lib/auth";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId is required." }, { status: 400 });

  const rows = await db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));

  const count = rows.length;
  const average = count > 0 ? rows.reduce((s, r) => s + r.rating, 0) / count : 0;
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: rows.filter((r) => r.rating === star).length,
  }));

  return NextResponse.json({ reviews: rows, count, average, breakdown });
}

export async function POST(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please login to write a review." }, { status: 401 });
  }

  const { productId, rating, comment } = await req.json();
  if (!productId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "A product and a rating (1-5) are required." }, { status: 400 });
  }

  // Server-side verification: this user must have a non-cancelled order that contains this product.
  const myOrders = await db
    .select()
    .from(orders)
    .where(and(eq(orders.userId, session.id), ne(orders.status, "cancelled")));

  let verifiedOrderId = null;
  for (const order of myOrders) {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    if (items.some((i) => i.productId === productId)) {
      verifiedOrderId = order.id;
      break;
    }
  }

  if (!verifiedOrderId) {
    return NextResponse.json(
      { error: "Only customers who have purchased this product can write a review." },
      { status: 403 }
    );
  }

  const existing = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.orderId, verifiedOrderId), eq(reviews.productId, productId)))
    .get();

  if (existing) {
    return NextResponse.json({ error: "You've already reviewed this product for this order." }, { status: 409 });
  }

  await db.insert(reviews).values({
    id: nanoid(),
    productId,
    userId: session.id,
    orderId: verifiedOrderId,
    customerName: session.name,
    rating: Math.round(rating),
    comment: (comment || "").slice(0, 1000),
    createdAt: Date.now(),
  });

  return NextResponse.json({ ok: true });
}