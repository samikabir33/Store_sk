"use client";
import { useState } from "react";

const STATUS_STEPS = ["pending", "confirmed", "shipped", "delivered"];

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    const res = await fetch("/api/track-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, phone }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setResult(data);
  }

  const activeIdx = result ? STATUS_STEPS.indexOf(result.order.status) : -1;

  return (
    <main className="max-w-[500px] mx-auto px-6 py-10">
      <h1 className="font-serif text-2xl mb-1">Track Your Order</h1>
      <p className="text-sm text-muted mb-6">Enter your order number and phone number used at checkout.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div><label className="label">Order Number</label><input required className="input" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="FF2607-1234" /></div>
        <div><label className="label">Phone Number</label><input required className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" /></div>
        {error && <p className="text-sm text-pink-deep">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? "Searching..." : "Track Order"}</button>
      </form>

      {result && (
        <div className="mt-8 card p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-bold">Order {result.order.orderNumber}</div>
            <div className="text-xs text-pink-deep font-bold uppercase">{result.order.status}</div>
          </div>
          <div className="flex justify-between mb-6">
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className="flex-1 text-center">
                <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-[10px] font-bold ${i <= activeIdx ? "bg-pink-deep text-white" : "bg-pink-light text-muted"}`}>
                  {i + 1}
                </div>
                <div className="text-[10px] text-muted mt-1 capitalize">{s}</div>
              </div>
            ))}
          </div>
          <div className="space-y-1.5 text-xs">
            {result.items.map((it) => (
              <div key={it.id} className="flex justify-between">
                <span className="text-muted">{it.productName} × {it.qty}</span>
                <span>৳ {(it.price * it.qty).toLocaleString("en-BD")}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm font-bold mt-3 pt-3 border-t border-line">
            <span>Total</span><span className="text-pink-deep">৳ {result.order.total.toLocaleString("en-BD")}</span>
          </div>
          <a
            href={`/api/orders/invoice?orderNumber=${encodeURIComponent(result.order.orderNumber)}&phone=${encodeURIComponent(phone)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline w-full text-center mt-4 block"
          >
            ⬇ Download Invoice (PDF)
          </a>
        </div>
      )}
    </main>
  );
}
