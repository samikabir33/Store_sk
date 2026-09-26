"use client";
import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }
  return (
    <button onClick={handleLogout} className="text-xs bg-ink text-white px-3 py-1.5 rounded-md font-semibold">
      Logout
    </button>
  );
}
