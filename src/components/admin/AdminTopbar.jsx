"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconSearch, IconBell, IconChevronDown, IconUser } from "./icons";
import AdminLogoutButton from "@/components/AdminLogoutButton";

export default function AdminTopbar({ session, pendingCount, lowStockCount, outOfStockCount, avatarUrl }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const alertCount = pendingCount + lowStockCount + outOfStockCount;
  const initial = (session.name || "A").trim().charAt(0).toUpperCase();

  useEffect(() => {
    function onClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    router.push(`/admin/stock?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="hidden md:flex items-center gap-4 px-8 py-4 bg-white border-b border-line sticky top-0 z-30">
      <form onSubmit={handleSearch} className="flex-1 max-w-sm relative">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products, SKU..."
          className="input pl-9 py-2 text-sm"
        />
      </form>

      <div className="ml-auto flex items-center gap-4">
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => setNotifOpen((v) => !v)}
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-ink hover:bg-pink-lighter"
          >
            <IconBell />
            {alertCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-pink-deep text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-line rounded-lg shadow-lg py-2 text-sm z-40">
              {alertCount === 0 && <div className="px-4 py-3 text-xs text-muted">No new alerts.</div>}
              {pendingCount > 0 && (
                <Link href="/admin/orders" className="flex justify-between px-4 py-2 hover:bg-pink-lighter">
                  <span>Pending orders</span>
                  <span className="font-bold text-pink-deep">{pendingCount}</span>
                </Link>
              )}
              {outOfStockCount > 0 && (
                <Link href="/admin/stock" className="flex justify-between px-4 py-2 hover:bg-pink-lighter">
                  <span>Out of stock products</span>
                  <span className="font-bold text-pink-deep">{outOfStockCount}</span>
                </Link>
              )}
              {lowStockCount > 0 && (
                <Link href="/admin/stock" className="flex justify-between px-4 py-2 hover:bg-pink-lighter">
                  <span>Low stock products</span>
                  <span className="font-bold text-gold">{lowStockCount}</span>
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-pink-lighter"
          >
            <div className="w-7 h-7 rounded-full bg-pink-deep text-white flex items-center justify-center text-[11px] font-bold overflow-hidden">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <span className="text-xs font-semibold">{session.name}</span>
            <IconChevronDown className="text-muted" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-line rounded-lg shadow-lg p-3 z-40">
              <div className="text-xs font-bold">{session.name}</div>
              <div className="text-[10px] text-muted uppercase mb-2">{session.role}</div>
              <Link
                href="/admin/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-1.5 text-xs font-semibold text-ink hover:text-pink-deep px-1 py-1.5 rounded hover:bg-pink-lighter mb-1"
              >
                <IconUser /> My Profile
              </Link>
              <div className="border-t border-line pt-2">
                <AdminLogoutButton />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
