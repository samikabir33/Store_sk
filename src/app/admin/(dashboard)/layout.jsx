import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { orders, products, users, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import { AdminSidebarLinks, AdminMobileNav } from "@/components/admin/AdminSidebarNav";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { getAllowedKeys, roleLabelFor } from "@/lib/permissions";

const NAV = [
  { href: "/admin", label: "Dashboard", key: "dashboard" },
  { href: "/admin/products", label: "Products", key: "products" },
  { href: "/admin/banners", label: "Banners", key: "banners" },
  { href: "/admin/categories", label: "Categories", key: "categories" },
  { href: "/admin/orders", label: "Orders", key: "orders" },
  { href: "/admin/stock", label: "Stock Search", key: "stock" },
  { href: "/admin/coupons", label: "Coupons", key: "coupons" },
  { href: "/admin/settings", label: "Delivery Settings", key: "settings" },
  { href: "/admin/customers", label: "Customers", key: "customers" },
  { href: "/admin/team", label: "Manage Admins", key: "team" },
];

export default async function AdminLayout({ children }) {
  const session = await getSession();
  if (!session || !["admin", "owner"].includes(session.role)) {
    redirect("/admin/login");
  }

  const allowedKeys = getAllowedKeys(session);
  const nav = NAV.filter((n) => allowedKeys.includes(n.key));
  const roleLabel = roleLabelFor(session);
  const sessionForDisplay = { ...session, role: roleLabel };

  const allOrders = await db.select().from(orders);
  const allProducts = await db.select().from(products);
  const pendingCount = allOrders.filter((o) => o.status === "pending").length;
  const lowStockCount = allProducts.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = allProducts.filter((p) => p.stock === 0).length;
  const initial = (session.name || "A").trim().charAt(0).toUpperCase();

  const isOwner = session.role === "owner";
  const avatarUrl = isOwner
    ? (await db.select().from(settings).where(eq(settings.key, "owner_avatar_url")).get())?.value || ""
    : (await db.select().from(users).where(eq(users.id, session.id)).get())?.avatarUrl || "";

  return (
    <div className="min-h-screen bg-cream flex max-w-[1280px] mx-auto">
      <aside className="hidden md:flex w-64 shrink-0 bg-white border-r border-line flex-col min-h-screen sticky top-0">
        <div className="px-4 py-5 border-b border-line flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-pink-lighter text-pink-deep flex items-center justify-center font-serif text-base">
            F
          </div>
          <div>
            <div className="font-serif text-lg leading-tight">Fahmida's</div>
            <div className="text-[9px] tracking-[3px] text-pink-deep">ADMIN PANEL</div>
          </div>
        </div>

        <AdminSidebarLinks nav={nav} pendingCount={pendingCount} />

        <div className="px-4 py-4 border-t border-line flex items-center gap-2.5">
          <Link href="/admin/profile" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-pink-deep text-white flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate">{session.name}</div>
              <div className="text-[10px] text-muted uppercase">{roleLabel}</div>
            </div>
          </Link>
          <div className="ml-auto">
            <AdminLogoutButton />
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden bg-white border-b border-line px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
          <AdminMobileNav nav={nav} pendingCount={pendingCount} session={session} roleLabel={roleLabel} avatarUrl={avatarUrl} />
          <div className="font-serif text-lg flex-1">Fahmida's Admin</div>
          <AdminLogoutButton />
        </div>
        <AdminTopbar
          session={sessionForDisplay}
          pendingCount={pendingCount}
          lowStockCount={lowStockCount}
          outOfStockCount={outOfStockCount}
          avatarUrl={avatarUrl}
        />
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
