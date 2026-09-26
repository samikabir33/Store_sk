import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession, requireRole } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!requireRole(session, ["admin", "owner"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customers = await db.select().from(users).where(eq(users.role, "customer"));
  const allOrders = await db.select().from(orders);

  const data = customers.map((c) => {
    const custOrders = allOrders.filter((o) => o.userId === c.id);
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      joinedAt: c.createdAt,
      totalOrders: custOrders.length,
      totalSpent: custOrders.reduce((s, o) => s + o.total, 0),
    };
  });

  // Also include guest checkout customers (no account, order data only)
  const guestOrders = allOrders.filter((o) => !o.userId);
  const guestMap = {};
  guestOrders.forEach((o) => {
    const key = o.phone;
    if (!guestMap[key]) {
      guestMap[key] = {
        id: "guest-" + key,
        name: o.customerName,
        email: o.email || "",
        phone: o.phone,
        joinedAt: o.createdAt,
        totalOrders: 0,
        totalSpent: 0,
        guest: true,
      };
    }
    guestMap[key].totalOrders += 1;
    guestMap[key].totalSpent += o.total;
  });

  return NextResponse.json({ customers: [...data, ...Object.values(guestMap)] });
}
