"use client";
import { useEffect, useState } from "react";
import ImageCropperModal from "@/components/ImageCropperModal";

export default function AdminProductsPage() {
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankForm());
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [cropFile, setCropFile] = useState(null);

  function blankForm() {
    return {
      name: "", description: "", price: "", compareAtPrice: "", categoryId: "", stock: "", sku: "",
      sizes: "S,M,L,XL", colors: "", images: [], colorImages: {},
      isNew: false, isFeatured: false,
    };
  }

  async function load() {
    const [p, c] = await Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ]);
    setItems(p.products || []);
    setCats(c.categories || []);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    setForm(blankForm());
    setUploadError("");
    setNewImageUrl("");
    setShowForm(true);
  }

  function openEdit(p) {
    setEditing(p);
    setForm({
      name: p.name, description: p.description, price: p.price, compareAtPrice: p.compareAtPrice || "", categoryId: p.categoryId,
      stock: p.stock, sku: p.sku || "", sizes: JSON.parse(p.sizes || "[]").join(","),
      colors: JSON.parse(p.colors || "[]").join(","),
      images: JSON.parse(p.images || "[]"),
      colorImages: JSON.parse(p.colorImages || "{}"),
      isNew: p.isNew === 1, isFeatured: p.isFeatured === 1,
    });
    setUploadError("");
    setNewImageUrl("");
    setShowForm(true);
  }

  // ---- Photos ----
  function addImageUrl() {
    const url = newImageUrl.trim();
    if (!url) return;
    setForm((f) => ({ ...f, images: [...f.images, url] }));
    setNewImageUrl("");
  }

  // Picking a file opens the drag/zoom cropper first (square frame, matching
  // how product photos are displayed) instead of uploading it raw — the
  // admin controls exactly how the product is framed rather than an
  // automatic center-crop cutting it off.
  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCropFile(file);
  }

  async function handleCropSave(blob) {
    setCropFile(null);
    setUploadError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", blob, "product.jpg");
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd }).then((r) => r.json());
      if (r.error) {
        setUploadError(r.error);
      } else {
        setForm((f) => ({ ...f, images: [...f.images, r.url] }));
      }
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url) {
    setForm((f) => {
      const nextColorImages = { ...f.colorImages };
      Object.keys(nextColorImages).forEach((color) => {
        if (nextColorImages[color] === url) delete nextColorImages[color];
      });
      return { ...f, images: f.images.filter((i) => i !== url), colorImages: nextColorImages };
    });
  }

  function setColorImage(color, url) {
    setForm((f) => {
      const next = { ...f.colorImages };
      if (url) next[color] = url;
      else delete next[color];
      return { ...f, colorImages: next };
    });
  }

  const colorList = form.colors.split(",").map((c) => c.trim()).filter(Boolean);

  async function save(e) {
    e.preventDefault();
    if (form.images.length === 0) {
      setUploadError("Add at least one photo.");
      return;
    }
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      categoryId: form.categoryId,
      stock: Number(form.stock),
      sku: form.sku,
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: colorList,
      images: form.images,
      colorImages: form.colorImages,
      isNew: form.isNew,
      isFeatured: form.isFeatured,
    };
    if (editing) {
      await fetch(`/api/admin/products/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setShowForm(false);
    load();
  }

  async function remove(id) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    load();
  }

  async function toggleStatus(p) {
    await fetch(`/api/admin/products/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: p.status === "active" ? "hidden" : "active" }) });
    load();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-2xl">Products</h1>
        <button onClick={openNew} className="btn-primary !py-2 !px-4 !text-xs">+ Add Product</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-pink-lighter text-xs">
            <tr>
              <th className="text-left p-3">Product</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Price</th>
              <th className="text-left p-3">Stock</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="p-3">{p.name}</td>
                <td className="p-3 text-xs text-muted">{cats.find((c) => c.id === p.categoryId)?.name || "—"}</td>
                <td className="p-3">৳ {p.price.toLocaleString("en-BD")}</td>
                <td className="p-3">
                  <span className={p.stock === 0 ? "text-pink-deep font-bold" : p.stock <= 5 ? "text-gold font-bold" : ""}>{p.stock}</span>
                </td>
                <td className="p-3">
                  <button onClick={() => toggleStatus(p)} className={`text-xs px-2 py-0.5 rounded-full ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {p.status}
                  </button>
                </td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => openEdit(p)} className="text-xs text-pink-deep underline">Edit</button>
                  <button onClick={() => remove(p.id)} className="text-xs text-muted underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-3">
            <h2 className="font-serif text-xl mb-2">{editing ? "Edit Product" : "Add Product"}</h2>
            <div><label className="label">Name</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="label">Description</label><textarea className="input h-16" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Price (৳)</label><input required type="number" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
              <div><label className="label">Compare-at Price (৳) — optional</label><input type="number" className="input" placeholder="e.g. 1100" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Stock</label><input required type="number" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
            </div>
            <div><label className="label">Category</label>
              <select required className="input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Select category</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.parentId ? "— " : ""}{c.name}</option>)}
              </select>
            </div>

            {/* ---- Photos (multiple) ---- */}
            <div>
              <label className="label">Photos *</label>
              {form.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.images.map((url) => (
                    <div key={url} className="relative">
                      <img src={url} alt="" className="w-16 h-16 object-cover rounded border border-line" />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-ink text-white text-[10px] flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mb-2">
                <input
                  className="input"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://..."
                />
                <button type="button" onClick={addImageUrl} className="btn-outline !py-1.5 !px-3 !text-xs whitespace-nowrap">Add URL</button>
              </div>
              <label className="text-xs font-semibold text-pink-deep border border-pink-deep rounded-md px-3 py-1.5 cursor-pointer hover:bg-pink-lighter inline-block">
                {uploading ? "Uploading..." : "কম্পিউটার থেকে ছবি বাছাই করুন"}
                <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} className="hidden" />
              </label>
              {uploadError && <p className="text-xs text-pink-deep mt-1">{uploadError}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">SKU</label><input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
              <div><label className="label">Sizes (comma-separated)</label><input className="input" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} /></div>
            </div>
            <div><label className="label">Colors (comma-separated)</label><input className="input" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="Black, White, Red" /></div>

            {/* ---- Color -> Photo mapping ---- */}
            {colorList.length > 0 && form.images.length > 0 && (
              <div>
                <label className="label">Photo for each color (optional)</label>
                <p className="text-[11px] text-muted mb-2">Customer picking this color on the product page will see this photo. Leave unset to just show the first photo.</p>
                <div className="space-y-2">
                  {colorList.map((color) => (
                    <div key={color} className="flex items-center gap-2">
                      <span className="text-xs font-semibold w-20 shrink-0 truncate">{color}</span>
                      <select
                        className="input !py-1.5 !text-xs"
                        value={form.colorImages[color] || ""}
                        onChange={(e) => setColorImage(color, e.target.value)}
                      >
                        <option value="">No specific photo</option>
                        {form.images.map((url, i) => (
                          <option key={url} value={url}>Photo {i + 1}</option>
                        ))}
                      </select>
                      {form.colorImages[color] && (
                        <img src={form.colorImages[color]} alt="" className="w-9 h-9 object-cover rounded border border-line shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.isNew} onChange={(e) => setForm({ ...form, isNew: e.target.checked })} /> New Arrival</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Best Seller</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
              <button disabled={uploading} className="btn-primary flex-1 disabled:opacity-40">{editing ? "Save Changes" : "Add Product"}</button>
            </div>
          </form>
        </div>
      )}

      {cropFile && (
        <ImageCropperModal
          file={cropFile}
          aspect={1}
          shape="rect"
          imageType="product photo"
          outputWidth={1000}
          onCancel={() => setCropFile(null)}
          onSave={handleCropSave}
        />
      )}
    </div>
  );
}
