import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession, requireRole } from "@/lib/auth";

export async function PUT(req, { params }) {
  const session = await getSession();
  if (!requireRole(session, ["admin", "owner"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status, paymentVerified } = await req.json();

  const update = {};
  if (status !== undefined) {
    const allowed = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    update.status = status;
  }
  if (paymentVerified !== undefined) {
    update.paymentVerified = paymentVerified ? 1 : 0;
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  await db.update(orders).set(update).where(eq(orders.id, id));
  return NextResponse.json({ ok: true });
}