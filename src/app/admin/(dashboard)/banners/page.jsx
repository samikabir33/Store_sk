"use client";
import { useEffect, useState } from "react";
import ImageCropperModal from "@/components/ImageCropperModal";

const EMPTY_FORM = {
  placement: "hero",
  eyebrow: "",
  title: "",
  subtitle: "",
  imageUrl: "",
  linkUrl: "/shop",
  buttonText: "Shop Now",
  sortOrder: 0,
  textPosition: "middle-left",
  buttonPosition: "bottom-left",
};

const POSITIONS = [
  ["top-left", "top-center", "top-right"],
  ["middle-left", "middle-center", "middle-right"],
  ["bottom-left", "bottom-center", "bottom-right"],
];

function PositionPicker({ label, value, onChange }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="grid grid-cols-3 gap-1.5 w-28">
        {POSITIONS.flat().map((pos) => (
          <button
            key={pos}
            type="button"
            title={pos.replace("-", " ")}
            onClick={() => onChange(pos)}
            className={`w-8 h-8 rounded-md border flex items-center justify-center ${
              value === pos ? "bg-pink-deep border-pink-deep" : "border-line hover:bg-pink-lighter"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${value === pos ? "bg-white" : "bg-muted"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [cropFile, setCropFile] = useState(null);

  async function load() {
    const r = await fetch("/api/admin/banners").then((r) => r.json());
    setBanners(r.banners || []);
  }
  useEffect(() => { load(); }, []);

  async function uploadFile(file) {
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file, file.name || "photo.jpg");
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd }).then((r) => r.json());
      if (r.error) {
        setError(r.error);
      } else {
        setForm((f) => ({ ...f, imageUrl: r.url }));
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  // Every placement now goes through the same drag/zoom cropper first —
  // just framed differently to match where the image is actually shown:
  // Hero Slider is a wide banner, Promo Section is a wide strip, and
  // About Us Photo goes into the same arch shape as the About page itself.
  // This stops important parts of the source image (a model's face, a
  // product) from being accidentally cut off by an automatic center-crop.
  const CROPPER_CONFIG = {
    hero: { aspect: 16 / 7, shape: "rect", imageType: "hero banner" },
    promo: { aspect: 3 / 1, shape: "rect", imageType: "promo banner" },
    about: { aspect: 4 / 5, shape: "arch", imageType: "About Us photo" },
  };

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCropFile(file);
  }

  async function handleCropSave(blob) {
    setCropFile(null);
    await uploadFile(blob);
  }

  function startEdit(b) {
    setEditingId(b.id);
    setForm({
      placement: b.placement === "promo" ? "promo" : b.placement === "about" ? "about" : "hero",
      eyebrow: b.eyebrow || "",
      title: b.title || "",
      subtitle: b.subtitle || "",
      imageUrl: b.imageUrl || "",
      linkUrl: b.linkUrl || "/shop",
      buttonText: b.buttonText || "Shop Now",
      sortOrder: b.sortOrder ?? 0,
      textPosition: b.textPosition || "middle-left",
      buttonPosition: b.buttonPosition || "bottom-left",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.imageUrl) {
      setError("Banner image URL is required.");
      return;
    }
    if (editingId) {
      await fetch(`/api/admin/banners/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    cancelEdit();
    load();
  }

  async function toggle(b) {
    await fetch(`/api/admin/banners/${b.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: b.active !== 1 }),
    });
    load();
  }

  async function remove(id) {
    if (!confirm("Delete this banner?")) return;
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="font-serif text-2xl mb-1">Homepage Banners</h1>
      <p className="text-sm text-muted mb-6">
        <strong>Hero Slider</strong> banners rotate at the very top of the homepage. <strong>Promo Section</strong> is the single
        wide banner strip between "New Arrivals" and "Best Sellers" — only the first active one (lowest Order) is shown there.
        <strong> About Us Photo</strong> is the portrait photo on the About Us page — only the first active one (lowest Order)
        is used there; Title/Subtitle/Button aren't shown for it, only the image matters.
        Leave Title/Subtitle blank if your image already has text baked in — the button still shows either way. Use{" "}
        <strong>Text Position</strong> and <strong>Button Position</strong> to move them out of the way of your image's own design.
      </p>

      <form onSubmit={submit} className="card p-4 mb-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="label">Placement</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, placement: "hero" })}
                className={`text-xs font-semibold px-3 py-2 rounded-md border ${form.placement === "hero" ? "bg-pink-deep text-white border-pink-deep" : "border-line text-muted"}`}
              >
                Hero Slider (top)
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, placement: "promo" })}
                className={`text-xs font-semibold px-3 py-2 rounded-md border ${form.placement === "promo" ? "bg-pink-deep text-white border-pink-deep" : "border-line text-muted"}`}
              >
                Promo Section (New Arrivals → Best Sellers)
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, placement: "about" })}
                className={`text-xs font-semibold px-3 py-2 rounded-md border ${form.placement === "about" ? "bg-pink-deep text-white border-pink-deep" : "border-line text-muted"}`}
              >
                About Us Photo
              </button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="label">Image URL *</label>
            <input className="input" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
            <div className="flex items-center gap-3 mt-2">
              <label className="text-xs font-semibold text-pink-deep border border-pink-deep rounded-md px-3 py-1.5 cursor-pointer hover:bg-pink-lighter">
                {uploading ? "Uploading..." : "অথবা কম্পিউটার থেকে ছবি বাছাই করুন"}
                <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} className="hidden" />
              </label>
              {form.imageUrl && (
                <img src={form.imageUrl} alt="Preview" className="w-16 h-10 object-cover rounded border border-line" />
              )}
            </div>
            <p className="text-[11px] text-muted mt-1.5">
              You'll be able to drag and zoom to position it before it saves.
            </p>
          </div>
          <div>
            <label className="label">Link (where it goes on click)</label>
            <input className="input" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="/shop" />
          </div>
          <div>
            <label className="label">Eyebrow (small label above title)</label>
            <input className="input" value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} placeholder="NEW SEASON" />
          </div>
          <div>
            <label className="label">Title (optional)</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={form.placement === "promo" ? "Timeless Styles For Every Occasion" : "Elevate Your Wardrobe"} />
          </div>
          <div>
            <label className="label">Subtitle (optional)</label>
            <input className="input" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder={form.placement === "promo" ? "Explore the latest trends in ethnic & modern wear." : "NEW COLLECTION"} />
          </div>
          <div>
            <label className="label">Button text</label>
            <input className="input" value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} placeholder="Shop Now" />
          </div>
          <div>
            <label className="label">Order (0 shows first)</label>
            <input type="number" className="input" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
          </div>
          <div className="md:col-span-2 flex flex-wrap gap-8 pt-2 border-t border-line">
            <PositionPicker label="Text Position" value={form.textPosition} onChange={(p) => setForm({ ...form, textPosition: p })} />
            <PositionPicker label="Button Position" value={form.buttonPosition} onChange={(p) => setForm({ ...form, buttonPosition: p })} />
          </div>
        </div>
        {error && <p className="text-sm text-pink-deep">{error}</p>}
        <div className="flex gap-2">
          <button disabled={uploading} className="btn-primary !py-2.5 !px-5 !text-xs disabled:opacity-40">{editingId ? "Save Changes" : "+ Add Banner"}</button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="text-xs text-muted underline">Cancel</button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {banners.length === 0 && <p className="text-sm text-muted">No banners yet. Add one above.</p>}
        {banners.map((b) => (
          <div key={b.id} className="card p-3 flex flex-col md:flex-row gap-3 md:items-center">
            <img src={b.imageUrl} alt={b.title || "Banner"} className="w-full md:w-40 h-24 object-cover rounded-lg bg-pink-lighter" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{b.title || <span className="text-muted italic">No title</span>}</div>
              <div className="text-xs text-muted truncate">{b.subtitle}</div>
              <div className="text-[11px] text-muted mt-1">Links to: {b.linkUrl} · Order: {b.sortOrder}</div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  b.placement === "promo"
                    ? "bg-amber-100 text-amber-700"
                    : b.placement === "about"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {b.placement === "promo" ? "Promo Section" : b.placement === "about" ? "About Us Photo" : "Hero Slider"}
              </span>
              <button
                onClick={() => toggle(b)}
                className={`text-[10px] px-2 py-0.5 rounded-full ${b.active === 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
              >
                {b.active === 1 ? "Active" : "Inactive"}
              </button>
              <button onClick={() => startEdit(b)} className="text-xs text-pink-deep font-semibold">Edit</button>
              <button onClick={() => remove(b.id)} className="text-xs text-muted underline">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {cropFile && (
        <ImageCropperModal
          file={cropFile}
          aspect={CROPPER_CONFIG[form.placement].aspect}
          shape={CROPPER_CONFIG[form.placement].shape}
          imageType={CROPPER_CONFIG[form.placement].imageType}
          outputWidth={form.placement === "hero" ? 1600 : form.placement === "promo" ? 1400 : 800}
          onCancel={() => setCropFile(null)}
          onSave={handleCropSave}
        />
      )}
    </div>
  );
}
