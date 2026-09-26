import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req) {
  const { orderNumber, phone } = await req.json();
  if (!orderNumber || !phone) {
    return NextResponse.json({ error: "Order number and phone are required." }, { status: 400 });
  }

  const order = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber.trim())).get();
  if (!order || order.phone !== phone.trim()) {
    return NextResponse.json({ error: "No matching order found. Check your order number and phone." }, { status: 404 });
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return NextResponse.json({ order, items });
}
