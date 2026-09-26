"use client";
import { useState } from "react";
import AutocompleteInput from "./AutocompleteInput";
import { BD_LOCATIONS } from "@/lib/data/bd-locations";

const districtNames = BD_LOCATIONS.map((d) => d.district);

function resolvedDistrict(text) {
  const match = BD_LOCATIONS.find((d) => d.district.toLowerCase() === (text || "").trim().toLowerCase());
  return match ? match.district : null;
}

function thanasFor(districtText) {
  const match = BD_LOCATIONS.find((d) => d.district.toLowerCase() === (districtText || "").trim().toLowerCase());
  return match ? match.thanas : [];
}

// Only clear the already-picked Thana when the District actually resolves to
// a *different* real district than before — not on every keystroke while
// the person is still typing/editing it.
function districtChanged(oldText, newText) {
  return resolvedDistrict(oldText) !== resolvedDistrict(newText);
}

const EMPTY_FORM = {
  label: "Home",
  detailedAddress: "",
  district: "",
  thana: "",
  deliveryArea: "inside_dhaka",
  altPhone: "",
  isDefault: false,
};

export default function AddressesManager({ initial }) {
  const [list, setList] = useState(initial);
  const [showForm, setShowForm] = useState(initial.length === 0);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    const r = await fetch("/api/account/addresses").then((r) => r.json());
    setList(r.addresses || []);
  }

  function startAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError("");
  }

  function startEdit(a) {
    setEditingId(a.id);
    setForm({
      label: a.label || "Home",
      detailedAddress: a.detailedAddress || "",
      district: a.district || "",
      thana: a.thana || "",
      deliveryArea: a.deliveryArea === "outside_dhaka" ? "outside_dhaka" : "inside_dhaka",
      altPhone: a.altPhone || "",
      isDefault: a.isDefault === 1,
    });
    setShowForm(true);
    setError("");
  }

  function cancel() {
    setShowForm(list.length === 0);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.detailedAddress.trim() || !form.district.trim() || !form.thana.trim()) {
      setError("Detailed address, district, and thana are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(editingId ? `/api/account/addresses/${editingId}` : "/api/account/addresses", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save this address.");
      await refresh();
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function setDefault(id) {
    await fetch(`/api/account/addresses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    refresh();
  }

  async function remove(id) {
    if (!confirm("Delete this address?")) return;
    await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="space-y-4 max-w-[600px]">
      {list.map((a) => (
        <div key={a.id} className="card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-ink">{a.label}</span>
                {a.isDefault === 1 && (
                  <span className="text-[9px] uppercase tracking-wide bg-pink-lighter text-pink-deep px-1.5 py-0.5 rounded-full font-bold">
                    Default
                  </span>
                )}
              </div>
              <p className="text-xs text-muted leading-relaxed">{a.detailedAddress}</p>
              <p className="text-xs text-muted mt-0.5">
                {a.thana}, {a.district} · {a.deliveryArea === "outside_dhaka" ? "Outside Dhaka" : "Inside Dhaka"}
              </p>
              {a.altPhone && <p className="text-xs text-muted mt-0.5">Alt phone: {a.altPhone}</p>}
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0 text-xs">
              <button onClick={() => startEdit(a)} className="text-pink-deep font-semibold">Edit</button>
              {a.isDefault !== 1 && (
                <button onClick={() => setDefault(a.id)} className="text-muted underline">Set as default</button>
              )}
              <button onClick={() => remove(a.id)} className="text-muted underline">Delete</button>
            </div>
          </div>
        </div>
      ))}

      {!showForm && (
        <button onClick={startAdd} className="btn-primary !py-2.5 !px-5 !text-xs">
          + Add New Address
        </button>
      )}

      {showForm && (
        <form onSubmit={submit} className="card p-4 space-y-3 !overflow-visible">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Label</label>
              <input className="input" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Home / Office" />
            </div>
            <div>
              <label className="label">Alt Phone (optional)</label>
              <input className="input" value={form.altPhone} onChange={(e) => setForm({ ...form, altPhone: e.target.value })} placeholder="+880 1XXXXXXXXX" />
            </div>
          </div>
          <div>
            <label className="label">Detailed Address *</label>
            <textarea
              className="input"
              rows={2}
              value={form.detailedAddress}
              onChange={(e) => setForm({ ...form, detailedAddress: e.target.value })}
              placeholder="House, road, area..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <AutocompleteInput
                label="District *"
                value={form.district}
                onChange={(v) => setForm({ ...form, district: v, thana: districtChanged(form.district, v) ? "" : form.thana })}
                options={districtNames}
                placeholder="e.g. Dhaka"
              />
            </div>
            <div>
              <AutocompleteInput
                label="Thana *"
                value={form.thana}
                onChange={(v) => setForm({ ...form, thana: v })}
                options={thanasFor(form.district)}
                placeholder={thanasFor(form.district).length ? "e.g. Gulshan" : "Type your district first"}
              />
            </div>
          </div>
          <div>
            <label className="label">Delivery Area</label>
            <div className="flex gap-2">
              {[["inside_dhaka", "Inside Dhaka"], ["outside_dhaka", "Outside Dhaka"]].map(([val, label]) => (
                <label
                  key={val}
                  className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer text-xs ${
                    form.deliveryArea === val ? "border-pink-deep bg-pink-lighter" : "border-line"
                  }`}
                >
                  <input type="radio" name="deliveryArea" checked={form.deliveryArea === val} onChange={() => setForm({ ...form, deliveryArea: val })} />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
            Set as default address
          </label>

          {error && <p className="text-sm text-pink-deep">{error}</p>}

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary !py-2.5 !px-5 !text-xs disabled:opacity-50">
              {saving ? "Saving..." : editingId ? "Save Changes" : "+ Add Address"}
            </button>
            <button type="button" onClick={cancel} className="text-xs text-muted underline">Cancel</button>
          </div>
        </form>
      )}

      {list.length === 0 && !showForm && (
        <p className="text-sm text-muted">No saved addresses yet.</p>
      )}
    </div>
  );
}
