import Link from "next/link";
import { db } from "@/db";
import { users, products, orders, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { roleLabelFor } from "@/lib/permissions";
import { money } from "@/lib/utils";

import StatCard from "@/components/admin/StatCard";
import EditProfileModal from "@/components/admin/EditProfileModal";
import ProfileTabs from "@/components/admin/ProfileTabs";
import AvatarUploader from "@/components/admin/AvatarUploader";
import {
  IconBox, IconBag, IconUser, IconGrid, IconMail, IconPhone, IconCalendar,
  IconShield, IconCamera, IconClock, IconCrown, IconBell, IconGrid as IconQuick,
} from "@/components/admin/icons";

export default async function AdminProfilePage() {
  const session = await getSession();
  const isOwner = session.role === "owner";
  const roleLabel = roleLabelFor(session);

  // DB row for staff accounts (the env-based Owner has no row to look up).
  const dbUser = isOwner ? null : await db.select().from(users).where(eq(users.id, session.id)).get();
  const phone = dbUser?.phone || "";
  const avatarUrl = isOwner
    ? (await db.select().from(settings).where(eq(settings.key, "owner_avatar_url")).get())?.value || ""
    : dbUser?.avatarUrl || "";
  const joinedDate = dbUser?.createdAt
    ? new Date(dbUser.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
    : new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

  // ----- Live store stats (same source data as the main dashboard) -----
  const [allProducts, allOrders, allUsers] = await Promise.all([
    db.select().from(products),
    db.select().from(orders),
    db.select().from(users),
  ]);
  const activeOrders = allOrders.filter((o) => o.status !== "cancelled");
  const totalSales = activeOrders.reduce((s, o) => s + o.total, 0);
  const registeredCustomers = allUsers.filter((u) => u.role === "customer");

  // ----- Recent activity, built from real records (latest order/product/customer) -----
  const latestOrder = [...allOrders].sort((a, b) => b.createdAt - a.createdAt)[0];
  const latestProduct = [...allProducts].sort((a, b) => b.createdAt - a.createdAt)[0];
  const latestCustomer = [...registeredCustomers].sort((a, b) => b.createdAt - a.createdAt)[0];

  const activity = [
    { icon: <IconUser />, color: "bg-green-50 text-green-600", title: "Logged in", desc: `You logged in to the admin panel`, time: "Just now" },
    latestOrder && {
      icon: <IconBag />, color: "bg-pink-lighter text-pink-deep",
      title: "New Order", desc: `Order #${latestOrder.orderNumber || latestOrder.id} placed`, time: timeAgo(latestOrder.createdAt),
    },
    latestProduct && {
      icon: <IconBox />, color: "bg-blue-50 text-blue-600",
      title: "New Product", desc: `Added "${latestProduct.name}"`, time: timeAgo(latestProduct.createdAt),
    },
    latestCustomer && {
      icon: <IconUser />, color: "bg-amber-50 text-amber-600",
      title: "New Customer", desc: `${latestCustomer.name} registered`, time: timeAgo(latestCustomer.createdAt),
    },
  ].filter(Boolean);

  const quickActions = [
    { label: "Add Product", href: "/admin/products", icon: <IconBox /> },
    { label: "View Orders", href: "/admin/orders", icon: <IconBag /> },
    { label: "Manage Banners", href: "/admin/banners", icon: <IconCamera /> },
    { label: "Store Settings", href: "/admin/settings", icon: <IconShield /> },
  ];

  const initial = (session.name || "A").trim().charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* Hero header */}
      <div className="card p-5 md:p-7 bg-gradient-to-br from-pink-lighter via-white to-pink-lighter relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center gap-5 relative">
          <AvatarUploader initial={initial} avatarUrl={avatarUrl} />

          <div className="flex-1 min-w-0">
            {isOwner && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gold bg-white/70 px-2 py-0.5 rounded-full mb-1.5">
                <IconCrown /> Owner
              </span>
            )}
            <div className="font-serif text-xl text-ink">{session.name}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted mt-1">
              <IconMail /> {session.email}
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted mt-2.5">
              <span className="flex items-center gap-1.5"><IconCalendar /> Joined {joinedDate}</span>
              <span className="flex items-center gap-1.5"><IconShield /> Role: {roleLabel}</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Status: Active
              </span>
            </div>
          </div>

          <div className="md:self-start">
            <EditProfileModal isOwner={isOwner} name={session.name} phone={phone} />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Total Products" value={allProducts.length} icon={<IconGrid />} />
        <StatCard label="Total Orders" value={allOrders.length} icon={<IconBag />} />
        <StatCard label="Total Customers" value={registeredCustomers.length} icon={<IconUser />} />
        <StatCard label="Total Sales" value={money(totalSales)} icon={<IconBox />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Left column: profile info + tabs */}
        <div className="xl:col-span-2 flex flex-col gap-4 md:gap-6">
          <div className="card p-5">
            <div className="font-bold text-sm text-ink mb-4 flex items-center gap-2"><IconUser /> Profile Information</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <InfoRow icon={<IconUser />} label="Full Name" value={session.name} />
              <InfoRow icon={<IconMail />} label="Email" value={session.email} />
              <InfoRow icon={<IconPhone />} label="Phone" value={phone || "—"} />
              <InfoRow icon={<IconShield />} label="Role" value={roleLabel} />
              <InfoRow icon={<IconBox />} label="Store Name" value="Fahmida's Fashion" />
              <InfoRow icon={<IconCalendar />} label="Joined Date" value={joinedDate} />
            </div>
          </div>

          <ProfileTabs isOwner={isOwner} />
        </div>

        {/* Right column: recent activity + quick actions */}
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold text-sm text-ink flex items-center gap-2"><IconClock /> Recent Activity</div>
            </div>
            <div className="flex flex-col gap-3.5">
              {activity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={"w-8 h-8 rounded-lg flex items-center justify-center shrink-0 " + a.color}>{a.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-ink">{a.title}</div>
                    <div className="text-[11px] text-muted truncate">{a.desc}</div>
                  </div>
                  <div className="text-[10px] text-muted shrink-0">{a.time}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5 bg-pink-lighter/40">
            <div className="font-bold text-sm text-ink mb-3 flex items-center gap-2"><IconQuick /> Quick Actions</div>
            <div className="grid grid-cols-2 gap-2.5">
              {quickActions.map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className="flex items-center gap-2 bg-white border border-line rounded-lg px-3 py-2.5 text-xs font-semibold text-ink hover:border-pink-deep hover:text-pink-deep"
                >
                  {a.icon} {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-muted shrink-0">{icon}</span>
      <span className="text-muted w-24 shrink-0">{label}</span>
      <span className="font-semibold text-ink truncate">{value}</span>
    </div>
  );
}

function timeAgo(ts) {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
}
