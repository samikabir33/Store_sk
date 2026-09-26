"use client";
import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    delivery_fee_inside_dhaka: "80",
    delivery_fee_outside_dhaka: "120",
    free_shipping_threshold: "2000",
    bkash_number: "",
    nagad_number: "",
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((r) => {
      setForm((f) => ({ ...f, ...r.settings }));
      setLoading(false);
    });
  }, []);

  async function save(e) {
    e.preventDefault();
    await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <p className="text-sm text-muted">Loading...</p>;

  return (
    <div>
      <h1 className="font-serif text-2xl mb-1">Delivery & Payment Settings</h1>
      <p className="text-sm text-muted mb-6">Update delivery fees and your bKash/Nagad "Send Money" numbers — changes apply instantly at checkout, no code needed.</p>

      <form onSubmit={save} className="card p-6 max-w-md space-y-4">
        <div>
          <label className="label">Inside Dhaka Delivery Fee (৳)</label>
          <input type="number" className="input" value={form.delivery_fee_inside_dhaka} onChange={(e) => setForm({ ...form, delivery_fee_inside_dhaka: e.target.value })} />
        </div>
        <div>
          <label className="label">Outside Dhaka Delivery Fee (৳)</label>
          <input type="number" className="input" value={form.delivery_fee_outside_dhaka} onChange={(e) => setForm({ ...form, delivery_fee_outside_dhaka: e.target.value })} />
        </div>
        <div>
          <label className="label">Free Shipping Threshold (৳)</label>
          <input type="number" className="input" value={form.free_shipping_threshold} onChange={(e) => setForm({ ...form, free_shipping_threshold: e.target.value })} />
          <p className="text-[11px] text-muted mt-1">Orders above this amount get free delivery.</p>
        </div>

        <div className="pt-2 border-t border-line">
          <label className="label">bKash "Send Money" Number</label>
          <input className="input" value={form.bkash_number} onChange={(e) => setForm({ ...form, bkash_number: e.target.value })} placeholder="01700-000000" />
        </div>
        <div>
          <label className="label">Nagad "Send Money" Number</label>
          <input className="input" value={form.nagad_number} onChange={(e) => setForm({ ...form, nagad_number: e.target.value })} placeholder="01700-000000" />
          <p className="text-[11px] text-muted mt-1">Customers will see this number at checkout and enter their Transaction ID + sender number after sending money.</p>
        </div>

        {saved && <p className="text-xs text-green-700">✓ Settings saved successfully.</p>}
        <button className="btn-primary w-full">Save Settings</button>
      </form>
    </div>
  );
}