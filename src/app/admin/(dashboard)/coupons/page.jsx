"use client";
import { useEffect, useState } from "react";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: "", type: "percent", value: "" });

  async function load() {
    const r = await fetch("/api/admin/coupons").then((r) => r.json());
    setCoupons(r.coupons || []);
  }
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    if (!form.code || !form.value) return;
    await fetch("/api/admin/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ code: "", type: "percent", value: "" });
    load();
  }

  async function toggle(c) {
    await fetch(`/api/admin/coupons/${c.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: c.active !== 1 }) });
    load();
  }

  async function remove(id) {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">Coupons</h1>

      <form onSubmit={add} className="card p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div><label className="label">Code</label><input className="input w-32" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="FAHMIDA10" /></div>
        <div><label className="label">Type</label>
          <select className="input w-32" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="percent">Percent (%)</option>
            <option value="flat">Flat (৳)</option>
          </select>
        </div>
        <div><label className="label">Value</label><input type="number" className="input w-28" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="10" /></div>
        <button className="btn-primary !py-2.5 !px-5 !text-xs">+ Add Coupon</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-pink-lighter text-xs">
            <tr><th className="text-left p-3">Code</th><th className="text-left p-3">Discount</th><th className="text-left p-3">Status</th><th className="text-left p-3">Actions</th></tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-t border-line">
                <td className="p-3 font-bold">{c.code}</td>
                <td className="p-3">{c.type === "percent" ? `${c.value}%` : `৳${c.value}`}</td>
                <td className="p-3">
                  <button onClick={() => toggle(c)} className={`text-[10px] px-2 py-0.5 rounded-full ${c.active === 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {c.active === 1 ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="p-3"><button onClick={() => remove(c.id)} className="text-xs text-muted underline">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
