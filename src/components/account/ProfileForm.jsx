"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ImageCropperModal from "@/components/ImageCropperModal";

export default function ProfileForm({ initial }) {
  const router = useRouter();
  const inputRef = useRef(null);

  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [cropFile, setCropFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [dateOfBirth, setDateOfBirth] = useState(initial.dateOfBirth);
  const [gender, setGender] = useState(initial.gender);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function onPickPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) setCropFile(file);
  }

  async function onCropSave(blob) {
    setCropFile(null);
    setUploadingAvatar(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", blob, "avatar.jpg");
      const res = await fetch("/api/account/avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      setAvatarUrl(data.url);
      router.refresh(); // so the sidebar's avatar updates too
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Full name can't be empty.");
      return;
    }
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, dateOfBirth, gender }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save changes.");
      setSaved(true);
      router.refresh(); // so the sidebar's name updates too
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const initial_letter = (name || "A").trim().charAt(0).toUpperCase();

  return (
    <div className="card p-5 md:p-6 max-w-[560px]">
      {/* Profile photo */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-line">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          title="Click to change photo"
          className="relative w-20 h-20 rounded-full bg-pink-deep text-white flex items-center justify-center text-2xl font-bold overflow-hidden shrink-0 group"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile photo" className="w-full h-full object-cover" />
          ) : (
            initial_letter
          )}
          <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 text-white text-[10px] font-bold">
              {uploadingAvatar ? "..." : "Edit"}
            </span>
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
        </button>
        <div>
          <div className="text-sm font-bold text-ink">Profile Photo</div>
          <p className="text-[11px] text-muted mt-0.5">
            Click the circle to upload a photo — you'll be able to drag and zoom to position it.
          </p>
        </div>
      </div>

      {/* Personal information */}
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="label">Full Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input opacity-60 cursor-not-allowed" value={initial.email} disabled />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880 1XXXXXXXXX" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Date of Birth</label>
            <input type="date" className="input" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
          </div>
          <div>
            <label className="label">Gender</label>
            <select className="input" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-pink-deep">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary !py-2.5 !px-6 !text-xs disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saved && <span className="text-xs text-green-600 font-semibold">Saved ✓</span>}
        </div>
      </form>

      {cropFile && (
        <ImageCropperModal
          file={cropFile}
          aspect={1}
          shape="circle"
          outputWidth={400}
          onCancel={() => setCropFile(null)}
          onSave={onCropSave}
        />
      )}
    </div>
  );
}
