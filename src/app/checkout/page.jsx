"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [settings, setSettings] = useState({ deliveryFeeInsideDhaka: 80, deliveryFeeOutsideDhaka: 120, freeShippingThreshold: 2000, bkashNumber: "", nagadNumber: "" });
  const [form, setForm] = useState({
    customerName: "", phone: "", email: "",
    detailedAddress: "", district: "", thana: "",
    deliveryArea: "inside_dhaka", altPhone: "", deliveryNote: "",
    paymentMethod: "cod", transactionId: "", senderNumberLast4: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setSettings);
  }, []);

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function applyCoupon() {
    setCouponError("");
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, subtotal }),
    });
    const data = await res.json();
    if (!res.ok) {
      setCouponError(data.error);
      setCouponResult(null);
      return;
    }
    setCouponResult(data);
  }

  const freeShip = subtotal >= settings.freeShippingThreshold;
  const deliveryFee = freeShip ? 0 : form.deliveryArea === "inside_dhaka" ? settings.deliveryFeeInsideDhaka : settings.deliveryFeeOutsideDhaka;
  const discount = couponResult?.discount || 0;
  const total = subtotal + deliveryFee - discount;

  async function placeOrder(e) {
    e.preventDefault();
    setError("");
    if (items.length === 0) return;

    if (form.paymentMethod !== "cod") {
      if (!form.transactionId.trim() || !form.senderNumberLast4.trim()) {
        setError("Please enter the Transaction ID and last 4 digits of the number you sent money from.");
        return;
      }
      if (!/^\d{4}$/.test(form.senderNumberLast4.trim())) {
        setError("Sender number's last 4 digits should be exactly 4 numbers.");
        return;
      }
    }

    setLoading(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, name: i.name, price: i.price, qty: i.qty, size: i.size, color: i.color })),
        ...form,
        couponCode: couponResult?.code,
        discount,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong placing your order.");
      return;
    }
    clearCart();
    router.push(`/order-confirmation?orderNumber=${data.orderNumber}`);
  }

  if (items.length === 0) {
    return <main className="max-w-[500px] mx-auto px-6 py-16 text-center text-sm text-muted">Your cart is empty.</main>;
  }

  return (
    <main className="max-w-[900px] mx-auto px-5 md:px-8 py-6">
      <h1 className="font-serif text-2xl mb-5">Checkout</h1>

      <form onSubmit={placeOrder} className="grid md:grid-cols-[1.3fr_1fr] gap-6">
        <div className="space-y-4">
          <div className="card p-4">
            <h2 className="text-sm font-bold mb-3">👤 Contact Information</h2>
            <div className="space-y-3">
              <div><label className="label">Full Name *</label><input required className="input" value={form.customerName} onChange={(e) => update("customerName", e.target.value)} placeholder="Enter your full name" /></div>
              <div><label className="label">Phone Number *</label><input required className="input" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="01XXXXXXXXX" /></div>
              <div><label className="label">Email (optional)</label><input type="email" className="input" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="your@email.com" /></div>
            </div>
          </div>

          <div className="card p-4">
            <h2 className="text-sm font-bold mb-3">📍 Shipping Address</h2>
            <div className="space-y-3">
              <div>
                <label className="label">Delivery Area *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[["inside_dhaka", "Inside Dhaka", settings.deliveryFeeInsideDhaka], ["outside_dhaka", "Outside Dhaka", settings.deliveryFeeOutsideDhaka]].map(([val, label, fee]) => (
                    <label key={val} className={`flex items-center gap-2 border rounded-lg px-3 py-2.5 cursor-pointer ${form.deliveryArea === val ? "border-pink-deep bg-pink-lighter" : "border-line"}`}>
                      <input type="radio" name="area" checked={form.deliveryArea === val} onChange={() => update("deliveryArea", val)} />
                      <div>
                        <div className="text-xs font-bold">{label}</div>
                        <div className="text-[11px] text-muted">Delivery ৳ {fee}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">District *</label><input required className="input" value={form.district} onChange={(e) => update("district", e.target.value)} placeholder="e.g. Dhaka" /></div>
                <div><label className="label">Thana / Upazila *</label><input required className="input" value={form.thana} onChange={(e) => update("thana", e.target.value)} placeholder="e.g. Mirpur" /></div>
              </div>
              <div><label className="label">Detailed Address *</label><textarea required className="input h-16 resize-none" value={form.detailedAddress} onChange={(e) => update("detailedAddress", e.target.value)} placeholder="House, Road, Area" /></div>
              <div><label className="label">Alt. Phone (optional)</label><input className="input" value={form.altPhone} onChange={(e) => update("altPhone", e.target.value)} placeholder="01XXXXXXXXX" /></div>
              <div><label className="label">Note for Delivery (optional)</label><textarea className="input h-14 resize-none" value={form.deliveryNote} onChange={(e) => update("deliveryNote", e.target.value)} placeholder="Special instructions" /></div>
            </div>
          </div>

          <div className="card p-4">
            <h2 className="text-sm font-bold mb-3">💳 Payment Method</h2>
            <div className="space-y-2">
              {[["cod", "Cash on Delivery", "Pay when you receive your order"], ["bkash", "bKash", "Send Money & confirm below"], ["nagad", "Nagad", "Send Money & confirm below"]].map(([val, label, sub]) => (
                <label key={val} className={`flex items-center gap-3 border rounded-lg px-3 py-2.5 cursor-pointer ${form.paymentMethod === val ? "border-pink-deep bg-pink-lighter" : "border-line"}`}>
                  <input type="radio" name="pay" checked={form.paymentMethod === val} onChange={() => update("paymentMethod", val)} />
                  <div><div className="text-xs font-bold">{label}</div><div className="text-[11px] text-muted">{sub}</div></div>
                </label>
              ))}
            </div>

            {(form.paymentMethod === "bkash" || form.paymentMethod === "nagad") && (
              <div className="mt-3 bg-pink-lighter rounded-lg p-3 space-y-3">
                <div className="text-xs leading-relaxed">
                  <strong>ধাপ ১:</strong> এই {form.paymentMethod === "bkash" ? "bKash" : "Nagad"} নম্বরে <strong>Send Money</strong> করুন —
                  <div className="text-base font-bold text-pink-deep mt-1">
                    {form.paymentMethod === "bkash" ? settings.bkashNumber : settings.nagadNumber}
                  </div>
                  <span className="text-muted">(Personal নম্বর — Send Money অপশন ব্যবহার করুন, Payment না)</span>
                </div>
                <div className="text-xs"><strong>ধাপ ২:</strong> Send Money-এর পর যে Transaction ID (TrxID) পাবেন সেটা নিচে দিন —</div>
                <div>
                  <label className="label">Transaction ID (TrxID) *</label>
                  <input className="input" value={form.transactionId} onChange={(e) => update("transactionId", e.target.value.toUpperCase())} placeholder="e.g. 9G7H2K3L4M" />
                </div>
                <div>
                  <label className="label">যে নম্বর থেকে Send Money করেছেন — শেষ ৪ digit *</label>
                  <input
                    className="input"
                    inputMode="numeric"
                    maxLength={4}
                    value={form.senderNumberLast4}
                    onChange={(e) => update("senderNumberLast4", e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="e.g. 6789"
                  />
                  <p className="text-[11px] text-muted mt-1">যদি আপনি 01712-345678 নম্বর থেকে টাকা পাঠান, তাহলে এখানে লিখুন: 5678</p>
                </div>
                <p className="text-[11px] text-muted">Admin আপনার পাঠানো টাকা মিলিয়ে দেখে অর্ডার confirm করবে।</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card p-4 sticky top-20">
            <h2 className="text-sm font-bold mb-3">🧾 Order Summary</h2>
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
              {items.map((i) => (
                <div key={`${i.productId}-${i.size}-${i.color}`} className="flex justify-between text-xs">
                  <span className="text-muted">{i.name} × {i.qty}</span>
                  <span>৳ {(i.price * i.qty).toLocaleString("en-BD")}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mb-3">
              <input className="input flex-1" placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
              <button type="button" onClick={applyCoupon} className="bg-ink text-white text-xs font-bold px-4 rounded-lg">Apply</button>
            </div>
            {couponError && <p className="text-[11px] text-pink-deep mb-2">{couponError}</p>}
            {couponResult && <p className="text-[11px] text-green-700 mb-2">Coupon "{couponResult.code}" applied!</p>}

            <div className="border-t border-dashed border-line pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-muted"><span>Subtotal</span><span>৳ {subtotal.toLocaleString("en-BD")}</span></div>
              <div className="flex justify-between text-muted"><span>Delivery Fee</span><span>{freeShip ? "FREE" : `৳ ${deliveryFee}`}</span></div>
              {discount > 0 && <div className="flex justify-between text-muted"><span>Discount</span><span>− ৳ {discount.toLocaleString("en-BD")}</span></div>}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-dashed border-line"><span>Total</span><span className="text-pink-deep">৳ {total.toLocaleString("en-BD")}</span></div>
            </div>

            {error && <p className="text-xs text-pink-deep mt-3">{error}</p>}
            <button className="btn-primary w-full mt-4" disabled={loading}>
              {loading ? "Placing order..." : "Place Order →"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}