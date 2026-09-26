"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import {
  IconDashboard,
  IconBag,
  IconImage,
  IconGrid,
  IconBox,
  IconSearch,
  IconTag,
  IconTruck,
  IconUser,
  IconKey,
  IconMenu,
  IconX,
} from "./icons";

const ICONS = {
  dashboard: IconDashboard,
  products: IconBag,
  banners: IconImage,
  categories: IconGrid,
  orders: IconBox,
  stock: IconSearch,
  coupons: IconTag,
  settings: IconTruck,
  customers: IconUser,
  team: IconKey,
};

function isActive(pathname, href) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

function NavLinks({ nav, pendingCount, pathname, onNavigate }) {
  return (
    <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2.5 overflow-y-auto">
      {nav.map((n) => {
        const Icon = ICONS[n.key] || IconDashboard;
        const active = isActive(pathname, n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={onNavigate}
            className={
              "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm border-l-2 transition-colors " +
              (active
                ? "bg-pink-lighter text-pink-deep font-semibold border-pink-deep"
                : "text-ink border-transparent hover:bg-pink-lighter/60 hover:text-pink-deep")
            }
          >
            <Icon className={active ? "text-pink-deep" : "text-muted"} />
            <span>{n.label}</span>
            {n.key === "orders" && pendingCount > 0 && (
              <span className="ml-auto bg-pink-deep text-white text-[10px] leading-none px-1.5 py-1 rounded-full font-semibold">
                {pendingCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

// Desktop sidebar nav links (used inside the fixed <aside> in layout.jsx).
export function AdminSidebarLinks({ nav, pendingCount }) {
  const pathname = usePathname();
  return <NavLinks nav={nav} pendingCount={pendingCount} pathname={pathname} />;
}

// Mobile: a hamburger button that opens a full slide-in drawer with the same
// nav (and profile/logout footer) as the desktop sidebar, instead of the old
// horizontal scrolling pill bar.
export function AdminMobileNav({ nav, pendingCount, session, roleLabel, avatarUrl }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const initial = (session?.name || "A").trim().charAt(0).toUpperCase();

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="w-9 h-9 -ml-1.5 flex items-center justify-center text-ink shrink-0"
      >
        <IconMenu />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />
      )}

      <div
        className={
          "fixed top-0 left-0 h-full w-72 max-w-[80vw] bg-white z-50 flex flex-col shadow-xl transition-transform duration-200 " +
          (open ? "translate-x-0" : "-translate-x-full")
        }
      >
        <div className="px-4 py-4 border-b border-line flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-pink-lighter text-pink-deep flex items-center justify-center font-serif text-base">
            F
          </div>
          <div className="flex-1">
            <div className="font-serif text-lg leading-tight">Fahmida's</div>
            <div className="text-[9px] tracking-[3px] text-pink-deep">ADMIN PANEL</div>
          </div>
          <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center text-muted">
            <IconX />
          </button>
        </div>

        <NavLinks nav={nav} pendingCount={pendingCount} pathname={pathname} onNavigate={() => setOpen(false)} />

        <div className="px-4 py-4 border-t border-line flex items-center gap-2.5">
          <Link href="/admin/profile" onClick={() => setOpen(false)} className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full bg-pink-deep text-white flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold truncate">{session?.name}</div>
              <div className="text-[10px] text-muted uppercase">{roleLabel}</div>
            </div>
          </Link>
          <AdminLogoutButton />
        </div>
      </div>
    </>
  );
}
