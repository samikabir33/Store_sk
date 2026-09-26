import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { generateInvoicePdf } from "@/lib/invoice";

// Logged-in customer downloading their own order invoice from "My Account".
export async function GET(req, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await db.select().from(orders).where(eq(orders.id, id)).get();
  if (!order || order.userId !== session.id) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
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
