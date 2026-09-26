"use client";
import { useState } from "react";
import { IconShield, IconBell, IconKey, IconLock } from "./icons";

const TABS = [
  { key: "security", label: "Security", icon: <IconLock /> },
  { key: "notification", label: "Notification", icon: <IconBell /> },
  { key: "preferences", label: "Preferences", icon: <IconShield /> },
];

export default function ProfileTabs({ isOwner }) {
  const [tab, setTab] = useState("security");

  return (
    <div className="card p-0 overflow-hidden">
      <div className="flex border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={
              "flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 -mb-px " +
              (tab === t.key ? "border-pink-deep text-pink-deep" : "border-transparent text-muted hover:text-ink")
            }
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === "security" && <SecurityTab isOwner={isOwner} />}
        {tab === "notification" && <ComingSoonTab
          rows={[
            { title: "Order notifications", desc: "Get notified when a new order comes in." },
            { title: "Low stock alerts", desc: "Get notified when a product is running low." },
            { title: "Marketing emails", desc: "Occasional tips and product updates." },
          ]}
        />}
        {tab === "preferences" && <ComingSoonTab
          rows={[
            { title: "Language", desc: "English (default)" },
            { title: "Currency", desc: "৳ BDT (Bangladeshi Taka)" },
            { title: "Theme", desc: "Light (default)" },
          ]}
        />}
      </div>
    </div>
  );
}

function SecurityTab({ isOwner }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [status, setStatus] = useState({ saving: false, error: "", success: "" });

  if (isOwner) {
    return (
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-pink-lighter text-pink-deep flex items-center justify-center shrink-0">
          <IconKey />
        </div>
        <div>
          <div className="text-sm font-bold text-ink">Change Password</div>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            The Owner password is set through an environment variable on the server, so it can't be
            changed from this page. Update <code className="bg-pink-lighter px-1 rounded">OWNER_PASSWORD</code> and
            redeploy to change it.
          </p>
        </div>
      </div>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setStatus({ saving: false, error: "", success: "" });
    if (form.newPassword !== form.confirmPassword) {
      setStatus({ saving: false, error: "New passwords don't match.", success: "" });
      return;
    }
    setStatus({ saving: true, error: "", success: "" });
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus({ saving: false, error: "", success: "Password updated." });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setStatus({ saving: false, error: err.message, success: "" });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={submit} className="max-w-sm flex flex-col gap-3">
        <div>
          <div className="text-sm font-bold text-ink">Change Password</div>
          <p className="text-xs text-muted mt-0.5">Keep your account secure with a strong password.</p>
        </div>
        <input
          type="password"
          required
          placeholder="Current password"
          className="input"
          value={form.currentPassword}
          onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="New password"
          className="input"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        />
        <input
          type="password"
          required
          placeholder="Confirm new password"
          className="input"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
        />
        {status.error && <div className="text-xs text-red-600">{status.error}</div>}
        {status.success && <div className="text-xs text-green-600">{status.success}</div>}
        <button
          type="submit"
          disabled={status.saving}
          className="self-start bg-pink-deep text-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-60"
        >
          {status.saving ? "Updating..." : "Update Password"}
        </button>
      </form>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-pink-lighter text-pink-deep flex items-center justify-center shrink-0">
            <IconShield />
          </div>
          <div>
            <div className="text-sm font-bold text-ink">Two-Factor Authentication</div>
            <div className="text-xs text-muted mt-0.5">Add an extra layer of security to your account.</div>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-muted bg-pink-lighter px-2 py-1 rounded-full shrink-0">
          Coming soon
        </span>
      </div>
    </div>
  );
}

function ComingSoonTab({ rows }) {
  return (
    <div className="flex flex-col gap-4">
      {rows.map((r) => (
        <div key={r.title} className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-ink">{r.title}</div>
            <div className="text-xs text-muted mt-0.5">{r.desc}</div>
          </div>
          <span className="text-[10px] font-semibold text-muted bg-pink-lighter px-2 py-1 rounded-full shrink-0">
            Coming soon
          </span>
        </div>
      ))}
    </div>
  );
}
