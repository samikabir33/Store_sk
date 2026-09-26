import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateInvoicePdf } from "@/lib/invoice";

// Guest invoice download — same verification as /api/track-order (order number + phone),
// used by the public "Track Order" page.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber");
  const phone = searchParams.get("phone");

  if (!orderNumber || !phone) {
    return NextResponse.json({ error: "Order number and phone are required." }, { status: 400 });
  }

  const order = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber.trim())).get();
  if (!order || order.phone !== phone.trim()) {
    return NextResponse.json({ error: "No matching order found." }, { status: 404 });
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  const pdfBytes = await generateInvoicePdf(order, items);

  return new NextResponse(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.pdf"`,
    },
  });
}
