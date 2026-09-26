"use client";
import { useEffect, useRef, useState } from "react";
import ImageCropperModal from "@/components/ImageCropperModal";

// Arch-shaped thumbnail (matches the live "Shop by category" cards) used
// everywhere in this page (add-form preview, main-category row, sub-category
// row). Clicking it opens a file picker, then the picked photo goes through
// the position/zoom adjuster before it's uploaded.
function CategoryThumb({ src, name, size = 44, uploading, onPick }) {
  const inputRef = useRef(null);
  const width = size;
  const height = Math.round(size * (4 / 3));
  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      title="Click to upload/change photo"
      className="relative shrink-0 rounded-t-full rounded-b-md overflow-hidden bg-beige border border-line hover:border-gold-accent transition-colors group"
      style={{ width, height }}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted font-serif" style={{ fontSize: size * 0.4 }}>
          {name ? name.charAt(0) : "+"}
        </div>
      )}
      <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-colors flex items-center justify-center">
        <span className="opacity-0 group-hover:opacity-100 text-white text-[9px] font-bold">
          {uploading ? "..." : "Edit"}
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onPick(file);
        }}
      />
    </button>
  );
}

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState([]);          // tree: main cats with subCategories
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // add-new-category form
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploadingNew, setUploadingNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const [open, setOpen] = useState({});          // { [catId]: true } -> sub list expanded
  const [subFor, setSubFor] = useState(null);    // catId whose "+ Sub" input is open
  const [subName, setSubName] = useState("");
  const [renaming, setRenaming] = useState(null); // { id, value }
  const [confirm, setConfirm] = useState(null);   // { id, name, blocked?, message }
  const [uploadingFor, setUploadingFor] = useState(null); // category id currently uploading a photo

  // Position/zoom adjuster modal state — holds the raw picked file until the
  // admin confirms the crop, then hands the result to whichever handler
  // requested it (new-category form vs. an existing category/sub-category).
  const [cropFile, setCropFile] = useState(null);
  const cropSaveRef = useRef(null);

  function openCropper(file, onDone) {
    cropSaveRef.current = onDone;
    setCropFile(file);
  }
  function closeCropper() {
    setCropFile(null);
    cropSaveRef.current = null;
  }
  async function handleCropSave(blob) {
    const done = cropSaveRef.current;
    closeCropper();
    if (done) await done(blob);
  }

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/categories", { cache: "no-store" }).then((r) => r.json());
      setCats(r.categories || []);
    } catch {
      setErr("Could not load categories.");
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  // Uploads a file (or a cropped Blob) and returns its public URL, or null on failure.
  async function uploadImage(file) {
    const fd = new FormData();
    fd.append("file", file, file.name || "photo.jpg");
    const r = await fetch("/api/admin/upload", { method: "POST", body: fd }).then((r) => r.json());
    if (r.error) {
      setErr(r.error);
      return null;
    }
    return r.url;
  }

  function handleNewImagePick(file) {
    openCropper(file, async (blob) => {
      setUploadingNew(true);
      setErr("");
      const url = await uploadImage(blob);
      setUploadingNew(false);
      if (url) setNewImageUrl(url);
    });
  }

  async function add(e) {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    setErr("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), parentId: parentId || null, imageUrl: newImageUrl }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) return setErr(data.error || "Could not add category.");
    setName("");
    setParentId("");
    setNewImageUrl("");
    load();
  }

  async function addSub(catId) {
    if (!subName.trim()) return;
    setErr("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: subName.trim(), parentId: catId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setErr(data.error || "Could not add sub-category.");
    setSubName("");
    setSubFor(null);
    setOpen((o) => ({ ...o, [catId]: true }));
    load();
  }

  async function saveRename() {
    if (!renaming?.value.trim()) return;
    setErr("");
    const res = await fetch(`/api/admin/categories/${renaming.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: renaming.value.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setErr(data.error || "Could not rename.");
    setRenaming(null);
    load();
  }

  // Uploads a new (adjusted) photo for an existing category/sub-category and saves it right away.
  function handleExistingImagePick(catId, file) {
    openCropper(file, async (blob) => {
      setUploadingFor(catId);
      setErr("");
      const url = await uploadImage(blob);
      if (url) {
        const res = await fetch(`/api/admin/categories/${catId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: url }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) setErr(data.error || "Could not save photo.");
        else load();
      }
      setUploadingFor(null);
    });
  }

  function askDelete(cat) {
    setErr("");
    const subCount = cat.subCategories?.length || 0;
    if (subCount > 0) {
      return setConfirm({
        id: cat.id,
        name: cat.name,
        blocked: true,
        message: `This category has ${subCount} sub-categor${subCount === 1 ? "y" : "ies"}. Delete or move those first, then delete this one.`,
      });
    }
    if (cat.productCount > 0) {
      return setConfirm({
        id: cat.id,
        name: cat.name,
        blocked: true,
        message: `This category has ${cat.productCount} product${cat.productCount === 1 ? "" : "s"}. Move those products to another category first, then delete.`,
      });
    }
    setConfirm({
      id: cat.id,
      name: cat.name,
      blocked: false,
      message: "This will be removed from the site menu as well. This cannot be undone.",
    });
  }

  async function doDelete() {
    if (!confirm || confirm.blocked) return;
    const res = await fetch(`/api/admin/categories/${confirm.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setConfirm(null);
    if (!res.ok) return setErr(data.error || "Could not delete.");
    load();
  }

  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">Categories</h1>

      {/* ---- Add new ---- */}
      <form onSubmit={add} className="card p-4 mb-4 flex flex-wrap gap-3 items-end">
        <CategoryThumb
          src={newImageUrl}
          name={name}
          size={56}
          uploading={uploadingNew}
          onPick={handleNewImagePick}
        />
        <div className="flex-1 min-w-[180px]">
          <label className="label">New category name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Winter collection"
          />
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="label">Parent</label>
          <select className="input" value={parentId} onChange={(e) => setParentId(e.target.value)}>
            <option value="">— Main category —</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button className="btn-primary !py-2.5 !px-5 !text-xs" disabled={saving}>
          {saving ? "Adding..." : "+ Add"}
        </button>
        <p className="basis-full text-[11px] text-muted -mt-1">
          Click the shape to upload a photo — you'll be able to drag and zoom to position it, like a profile photo.
        </p>
      </form>

      {cropFile && (
        <ImageCropperModal
          file={cropFile}
          aspect={3 / 4}
          shape="arch"
          onCancel={closeCropper}
          onSave={handleCropSave}
        />
      )}

      {err && (
        <div className="mb-4 text-xs text-pink-deep bg-pink-lighter border border-pink-light rounded-lg px-3 py-2">
          {err}
        </div>
      )}

      {/* ---- List ---- */}
      {loading ? (
        <p className="text-sm text-muted py-8 text-center">Loading...</p>
      ) : cats.length === 0 ? (
        <p className="text-sm text-muted py-8 text-center">No categories yet. Add one above.</p>
      ) : (
        <div className="space-y-3">
          {cats.map((c) => {
            const isOpen = !!open[c.id];
            const subs = c.subCategories || [];
            return (
              <div key={c.id} className="card">
                {/* main row */}
                <div className="flex flex-wrap items-center gap-3 p-4">
                  <button
                    type="button"
                    onClick={() => setOpen((o) => ({ ...o, [c.id]: !isOpen }))}
                    className={`text-muted text-xs w-5 h-5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    aria-label="Toggle sub-categories"
                  >
                    ▾
                  </button>

                  <CategoryThumb
                    src={c.imageUrl}
                    name={c.name}
                    size={44}
                    uploading={uploadingFor === c.id}
                    onPick={(file) => handleExistingImagePick(c.id, file)}
                  />

                  <div className="flex-1 min-w-[180px]">
                    {renaming?.id === c.id ? (
                      <div className="flex gap-2">
                        <input
                          className="input !py-2 max-w-[260px]"
                          autoFocus
                          value={renaming.value}
                          onChange={(e) => setRenaming({ ...renaming, value: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveRename();
                            if (e.key === "Escape") setRenaming(null);
                          }}
                        />
                        <button type="button" onClick={saveRename} className="btn-primary !py-2 !px-4 !text-xs">Save</button>
                        <button type="button" onClick={() => setRenaming(null)} className="text-xs text-muted px-2">Cancel</button>
                      </div>
                    ) : (
                      <>
                        <div className="font-bold text-sm">{c.name}</div>
                        <div className="text-[11px] text-muted mt-0.5">
                          /shop?category={c.slug} · {c.productCount} product{c.productCount === 1 ? "" : "s"}
                          {subs.length > 0 && ` · ${subs.length} sub-categor${subs.length === 1 ? "y" : "ies"}`}
                        </div>
                      </>
                    )}
                  </div>

                  {renaming?.id !== c.id && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => { setSubFor(subFor === c.id ? null : c.id); setSubName(""); }}
                        className="text-[11px] font-bold border border-line rounded-md px-3 py-1.5 hover:bg-cream"
                      >
                        + Sub
                      </button>
                      <button
                        type="button"
                        onClick={() => setRenaming({ id: c.id, value: c.name })}
                        className="text-[11px] font-bold border border-line rounded-md px-3 py-1.5 hover:bg-cream"
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={() => askDelete(c)}
                        className="text-[11px] font-bold border border-pink-mid text-pink-deep rounded-md px-3 py-1.5 hover:bg-pink-lighter"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* add sub input */}
                {subFor === c.id && (
                  <div className="px-4 pb-4 -mt-1 flex gap-2">
                    <input
                      className="input !py-2 max-w-[260px]"
                      autoFocus
                      placeholder={`New sub-category in ${c.name}`}
                      value={subName}
                      onChange={(e) => setSubName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addSub(c.id);
                        if (e.key === "Escape") setSubFor(null);
                      }}
                    />
                    <button type="button" onClick={() => addSub(c.id)} className="btn-primary !py-2 !px-4 !text-xs">Add</button>
                    <button type="button" onClick={() => setSubFor(null)} className="text-xs text-muted px-2">Cancel</button>
                  </div>
                )}

                {/* sub list */}
                {isOpen && (
                  <div className="border-t border-line">
                    {subs.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-muted">No sub-categories.</div>
                    ) : (
                      subs.map((s) => (
                        <div key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-line last:border-b-0 bg-cream/40">
                          <div className="w-5 shrink-0" />
                          <CategoryThumb
                            src={s.imageUrl}
                            name={s.name}
                            size={36}
                            uploading={uploadingFor === s.id}
                            onPick={(file) => handleExistingImagePick(s.id, file)}
                          />
                          <div className="flex-1 min-w-[160px]">
                            {renaming?.id === s.id ? (
                              <div className="flex gap-2">
                                <input
                                  className="input !py-2 max-w-[240px]"
                                  autoFocus
                                  value={renaming.value}
                                  onChange={(e) => setRenaming({ ...renaming, value: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveRename();
                                    if (e.key === "Escape") setRenaming(null);
                                  }}
                                />
                                <button type="button" onClick={saveRename} className="btn-primary !py-2 !px-4 !text-xs">Save</button>
                                <button type="button" onClick={() => setRenaming(null)} className="text-xs text-muted px-2">Cancel</button>
                              </div>
                            ) : (
                              <>
                                <div className="text-sm">{s.name}</div>
                                <div className="text-[11px] text-muted mt-0.5">
                                  {s.productCount} product{s.productCount === 1 ? "" : "s"}
                                </div>
                              </>
                            )}
                          </div>
                          {renaming?.id !== s.id && (
                            <div className="flex gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => setRenaming({ id: s.id, value: s.name })}
                                className="text-[11px] font-bold border border-line rounded-md px-3 py-1.5 hover:bg-white"
                              >
                                Rename
                              </button>
                              <button
                                type="button"
                                onClick={() => askDelete(s)}
                                className="text-[11px] font-bold border border-pink-mid text-pink-deep rounded-md px-3 py-1.5 hover:bg-pink-lighter"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* confirm / blocked banner for this row (main or its subs) */}
                {confirm && (confirm.id === c.id || subs.some((s) => s.id === confirm.id)) && (
                  <div className="m-4 mt-0 rounded-lg border border-pink-mid bg-pink-lighter p-4">
                    <div className="text-sm font-bold text-pink-deep mb-1">
                      Delete “{confirm.name}”?
                    </div>
                    <p className="text-xs text-ink mb-3">{confirm.message}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirm(null)}
                        className="text-[11px] font-bold border border-line bg-white rounded-md px-4 py-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={doDelete}
                        disabled={confirm.blocked}
                        className={`text-[11px] font-bold rounded-md px-4 py-2 ${
                          confirm.blocked
                            ? "bg-pink-light text-white cursor-not-allowed"
                            : "bg-pink-deep text-white"
                        }`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
