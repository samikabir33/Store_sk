import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const myOrders = await db.select().from(orders).where(eq(orders.userId, session.id)).orderBy(desc(orders.createdAt));

  return (
    <div>
      <h1 className="font-serif text-2xl mb-1">My Orders</h1>
      <p className="text-sm text-muted mb-6">{myOrders.length} order{myOrders.length === 1 ? "" : "s"} placed so far.</p>

      <h2 className="text-sm font-bold mb-3">Order History</h2>
      {myOrders.length === 0 ? (
        <p className="text-sm text-muted">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-3">
          {myOrders.map((o) => (
            <div key={o.id} className="card p-4 flex justify-between items-center">
              <div>
                <div className="text-sm font-bold">{o.orderNumber}</div>
                <div className="text-xs text-muted">{new Date(o.createdAt).toLocaleDateString()}</div>
                <a
                  href={`/api/account/orders/${o.id}/invoice`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-pink-deep font-semibold underline"
                >
                  Download Invoice
                </a>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-pink-deep">৳ {o.total.toLocaleString("en-BD")}</div>
                <div className="text-[11px] uppercase text-muted">{o.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
