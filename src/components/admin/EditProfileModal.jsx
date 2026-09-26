"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconEdit, IconX } from "./icons";

export default function EditProfileModal({ isOwner, name, phone }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: name || "", phone: phone || "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (isOwner) {
    return (
      <button
        type="button"
        title="Owner details are set via environment variables and can't be edited here."
        className="inline-flex items-center gap-1.5 bg-white/70 text-ink/50 text-xs font-semibold px-3.5 py-2 rounded-lg cursor-not-allowed"
        disabled
      >
        <IconEdit /> Edit Profile
      </button>
    );
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 bg-white text-pink-deep border border-pink-deep/30 text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-pink-lighter"
      >
        <IconEdit /> Edit Profile
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <form
            onSubmit={save}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold text-ink">Edit Profile</div>
              <button type="button" onClick={() => setOpen(false)} className="text-muted hover:text-ink">
                <IconX />
              </button>
            </div>

            <label className="block text-xs font-semibold text-ink mb-1">Full Name</label>
            <input
              className="input mb-3"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />

            <label className="block text-xs font-semibold text-ink mb-1">Phone</label>
            <input
              className="input mb-3"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+880 1XXXXXXXXX"
            />

            {error && <div className="text-xs text-red-600 mb-3">{error}</div>}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-pink-deep text-white text-sm font-semibold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
