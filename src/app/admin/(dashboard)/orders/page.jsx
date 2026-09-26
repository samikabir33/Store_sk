"use client";
import { useEffect, useState } from "react";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const STATUS_COLORS = {
  pending: "bg-gray-100 text-gray-600",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-gold/20 text-gold",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-pink-lighter text-pink-deep",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all");

  async function load() {
    const r = await fetch("/api/orders").then((r) => r.json());
    setOrders(r.orders || []);
  }
  useEffect(() => { load(); }, []);

  async function updateStatus(id, status) {
    await fetch(`/api/admin/orders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    load();
  }

  async function togglePaymentVerified(o) {
    await fetch(`/api/admin/orders/${o.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentVerified: o.paymentVerified === 1 ? 0 : 1 }) });
    load();
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <h1 className="font-serif text-2xl mb-4">Orders</h1>

      <div className="flex gap-2 mb-5 flex-wrap">
        {["all", ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`text-xs px-3 py-1.5 rounded-full font-semibold capitalize ${filter === s ? "bg-pink-deep text-white" : "bg-pink-lighter text-pink-deep"}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-sm text-muted">No orders in this filter.</p>}
        {filtered.map((o) => (
          <div key={o.id} className="card p-4">
            <div className="flex justify-between items-start cursor-pointer" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
              <div>
                <div className="text-sm font-bold">{o.orderNumber}</div>
                <div className="text-xs text-muted">{o.customerName} · {o.phone}</div>
                <div className="text-xs text-muted">{new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-pink-deep">৳ {o.total.toLocaleString("en-BD")}</div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                {o.paymentMethod !== "cod" && (
                  <div className={`text-[10px] mt-1 font-semibold ${o.paymentVerified === 1 ? "text-green-700" : "text-gold"}`}>
                    {o.paymentVerified === 1 ? "✓ Payment Verified" : "⚠ Payment Unverified"}
                  </div>
                )}
              </div>
            </div>

            {expanded === o.id && (
              <div className="mt-3 pt-3 border-t border-line text-xs space-y-2">
                <div><strong>Address:</strong> {o.detailedAddress}, {o.thana}, {o.district} ({o.deliveryArea === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"})</div>
                <div><strong>Payment:</strong> {o.paymentMethod.toUpperCase()}</div>
                {o.paymentMethod !== "cod" && (
                  <div className="bg-pink-lighter rounded-lg p-2.5 space-y-1">
                    <div><strong>Transaction ID:</strong> {o.transactionId || "—"}</div>
                    <div><strong>Sender number ends in:</strong> {o.senderNumberLast4 || "—"}</div>
                    <div className="text-[11px] text-muted">Check this TrxID against your {o.paymentMethod === "bkash" ? "bKash" : "Nagad"} statement, then mark it verified.</div>
                    <button
                      onClick={() => togglePaymentVerified(o)}
                      className={`text-[11px] px-3 py-1 rounded-full font-semibold mt-1 ${o.paymentVerified === 1 ? "bg-green-600 text-white" : "bg-ink text-white"}`}
                    >
                      {o.paymentVerified === 1 ? "✓ Payment Verified — click to undo" : "Mark Payment as Verified"}
                    </button>
                  </div>
                )}
                {o.deliveryNote && <div><strong>Note:</strong> {o.deliveryNote}</div>}
                <div><strong>Subtotal:</strong> ৳{o.subtotal} · <strong>Delivery:</strong> ৳{o.deliveryFee} · <strong>Discount:</strong> ৳{o.discount}</div>
                <div className="flex gap-2 flex-wrap pt-2 items-center">
                  {STATUSES.map((s) => (
                    <button key={s} onClick={() => updateStatus(o.id, s)} className={`text-[11px] px-2.5 py-1 rounded-full capitalize border ${o.status === s ? "bg-ink text-white border-ink" : "border-line"}`}>
                      {s}
                    </button>
                  ))}
                  <a
                    href={`/api/admin/orders/${o.id}/invoice`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] px-2.5 py-1 rounded-full font-semibold bg-pink-deep text-white ml-auto"
                  >
                    ⬇ Download Invoice
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}