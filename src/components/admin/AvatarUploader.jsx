"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconCamera } from "./icons";
import ImageCropperModal from "@/components/ImageCropperModal";

export default function AvatarUploader({ initial, avatarUrl }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(avatarUrl || "");
  const [cropFile, setCropFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function onFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setCropFile(file);
  }

  async function onCropSave(blob) {
    setCropFile(null);
    setPreview(URL.createObjectURL(blob)); // instant local preview while it uploads
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", blob, "avatar.jpg");
      const res = await fetch("/api/admin/avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      setPreview(data.url);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setPreview(avatarUrl || "");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative shrink-0">
      <div className="w-20 h-20 rounded-full bg-pink-deep text-white flex items-center justify-center text-2xl font-bold overflow-hidden">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Profile photo" className="w-full h-full object-cover" />
        ) : (
          initial
        )}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title="Change photo"
        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-ink text-white flex items-center justify-center hover:opacity-90 disabled:opacity-60"
      >
        <IconCamera />
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

      {uploading && <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-muted whitespace-nowrap">Uploading...</div>}
      {error && <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-red-600 whitespace-nowrap">{error}</div>}

      {cropFile && (
        <ImageCropperModal
          file={cropFile}
          aspect={1}
          shape="circle"
          imageType="profile photo"
          outputWidth={400}
          onCancel={() => setCropFile(null)}
          onSave={onCropSave}
        />
      )}
    </div>
  );
}
