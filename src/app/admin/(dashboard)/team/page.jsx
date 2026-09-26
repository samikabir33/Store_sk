"use client";
import { useEffect, useState } from "react";

const ROLE_OPTIONS = [
  { value: "ceo", label: "CEO", hint: "Full access, same as Owner — including Manage Admins" },
  { value: "admin", label: "Admin", hint: "Full access to everything except Manage Admins" },
  { value: "order_manager", label: "Order Manager", hint: "Dashboard + Orders only" },
  { value: "inventory_manager", label: "Inventory Manager", hint: "Dashboard + Products + Stock Search only" },
];

const ROLE_LABELS = Object.fromEntries(ROLE_OPTIONS.map((r) => [r.value, r.label]));

export default function AdminTeamPage() {
  const [team, setTeam] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", adminRole: "admin" });
  const [error, setError] = useState("");

  async function load() {
    const r = await fetch("/api/admin/team").then((r) => r.json());
    setTeam(r.team || []);
  }
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setForm({ name: "", email: "", password: "", adminRole: "admin" });
    load();
  }

  async function remove(id) {
    if (!confirm("Remove this admin's access?")) return;
    await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
    load();
  }

  function roleLabel(u) {
    if (u.role === "owner") return "Owner";
    return ROLE_LABELS[u.adminRole] || "Admin";
  }

  return (
    <div>
      <h1 className="font-serif text-2xl mb-1">Manage Admins</h1>
      <p className="text-sm text-muted mb-6">Add staff with a specific role — each role only sees the pages it's allowed to use.</p>

      <form onSubmit={add} className="card p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div><label className="label">Name</label><input required className="input w-40" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><label className="label">Email</label><input required type="email" className="input w-52" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div><label className="label">Password</label><input required type="password" className="input w-36" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        <div>
          <label className="label">Role</label>
          <select className="input w-44" value={form.adminRole} onChange={(e) => setForm({ ...form, adminRole: e.target.value })}>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
        <button className="btn-primary !py-2.5 !px-5 !text-xs">+ Add Admin</button>
      </form>
      <p className="text-xs text-muted -mt-4 mb-4">
        {ROLE_OPTIONS.find((r) => r.value === form.adminRole)?.hint}
      </p>
      {error && <p className="text-sm text-pink-deep mb-4">{error}</p>}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-pink-lighter text-xs">
            <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Email</th><th className="text-left p-3">Role</th><th className="text-left p-3">Actions</th></tr>
          </thead>
          <tbody>
            {team.map((u) => (
              <tr key={u.id} className="border-t border-line">
                <td className="p-3">{u.name}</td>
                <td className="p-3 text-xs text-muted">{u.email}</td>
                <td className="p-3 text-xs uppercase font-bold">{roleLabel(u)}</td>
                <td className="p-3">
                  {u.role !== "owner" && <button onClick={() => remove(u.id)} className="text-xs text-pink-deep underline">Remove</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
