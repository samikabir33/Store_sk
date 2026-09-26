import { db } from "@/db";
import { users, orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession, requireRole } from "@/lib/auth";

function csvEscape(val) {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  const session = await getSession();
  if (!requireRole(session, ["admin", "owner"])) {
    return new Response("Unauthorized", { status: 401 });
  }

  const customers = await db.select().from(users).where(eq(users.role, "customer"));
  const allOrders = await db.select().from(orders);

  const rows = [
    ["Name", "Email", "Phone", "Joined", "Total Orders", "Total Spent (BDT)", "Type"],
  ];

  customers.forEach((c) => {
    const custOrders = allOrders.filter((o) => o.userId === c.id);
    rows.push([
      c.name,
      c.email,
      c.phone || "",
      new Date(c.createdAt).toISOString().split("T")[0],
      custOrders.length,
      custOrders.reduce((s, o) => s + o.total, 0),
      "Registered",
    ]);
  });

  const guestOrders = allOrders.filter((o) => !o.userId);
  const guestMap = {};
  guestOrders.forEach((o) => {
    if (!guestMap[o.phone]) {
      guestMap[o.phone] = { name: o.customerName, email: o.email || "", phone: o.phone, joined: o.createdAt, orders: 0, spent: 0 };
    }
    guestMap[o.phone].orders += 1;
    guestMap[o.phone].spent += o.total;
  });
  Object.values(guestMap).forEach((g) => {
    rows.push([g.name, g.email, g.phone, new Date(g.joined).toISOString().split("T")[0], g.orders, g.spent, "Guest"]);
  });

  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="fahmidas-fashion-customers-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
