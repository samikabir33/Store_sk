import { db } from "@/db";
import { products, orders, users, categories, coupons, banners, orderItems } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { money } from "@/lib/utils";
import Link from "next/link";

import StatCard from "@/components/admin/StatCard";
import SalesChart from "@/components/admin/SalesChart";
import RecentOrdersCard from "@/components/admin/RecentOrdersCard";
import LowStockCard from "@/components/admin/LowStockCard";
import ProductManagementCard from "@/components/admin/ProductManagementCard";
import QuickActionsCard from "@/components/admin/QuickActionsCard";
import TopSellingCard, { computeTopSelling } from "@/components/admin/TopSellingCard";
import RecentCustomersCard from "@/components/admin/RecentCustomersCard";
import OrderStatusCard from "@/components/admin/OrderStatusCard";
import CategoriesCard, { computeCategoryCounts } from "@/components/admin/CategoriesCard";
import CouponsCard from "@/components/admin/CouponsCard";
import { IconBox, IconGrid, IconTruck, IconUser, IconBag, IconArrowUp } from "@/components/admin/icons";

const DAY = 24 * 60 * 60 * 1000;

function weekWindowCount(rows, dateField, valueFn) {
  const now = Date.now();
  const thisStart = now - 7 * DAY;
  const lastStart = now - 14 * DAY;
  let thisWeek = 0;
  let lastWeek = 0;
  for (const r of rows) {
    const t = r[dateField];
    const v = valueFn ? valueFn(r) : 1;
    if (t >= thisStart && t <= now) thisWeek += v;
    else if (t >= lastStart && t < thisStart) lastWeek += v;
  }
  return { thisWeek, lastWeek };
}

function calcTrend({ thisWeek, lastWeek }) {
  if (thisWeek === 0 && lastWeek === 0) return null;
  if (lastWeek === 0) return { pct: 100, direction: "up" };
  const pct = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  if (pct === 0) return { pct: 0, direction: "flat" };
  return { pct: Math.abs(pct), direction: pct > 0 ? "up" : "down" };
}

export default async function AdminDashboardPage() {
  const session = await getSession();

  const [allProducts, allOrders, allUsers, allCategories, allCoupons, allBanners, allOrderItems] = await Promise.all([
    db.select().from(products),
    db.select().from(orders),
    db.select().from(users),
    db.select().from(categories),
    db.select().from(coupons),
    db.select().from(banners),
    db.select().from(orderItems),
  ]);

  const activeOrders = allOrders.filter((o) => o.status !== "cancelled");
  const totalSales = activeOrders.reduce((s, o) => s + o.total, 0);
  const pendingOrders = allOrders.filter((o) => o.status === "pending");
  const lowStockProducts = allProducts.filter((p) => p.stock <= 5).sort((a, b) => a.stock - b.stock);
  const registeredCustomers = allUsers.filter((u) => u.role === "customer");

  // ----- trend calculations (this week vs last week, based on createdAt) -----
  const salesTrend = calcTrend(weekWindowCount(activeOrders, "createdAt", (o) => o.total));
  const ordersTrend = calcTrend(weekWindowCount(allOrders, "createdAt"));
  const pendingTrend = calcTrend(weekWindowCount(pendingOrders, "createdAt"));
  const customersTrend = calcTrend(weekWindowCount(registeredCustomers, "createdAt"));
  const productsTrend = calcTrend(weekWindowCount(allProducts, "createdAt"));

  const statCards = [
    { label: "Total Sales", value: money(totalSales), icon: <IconBox />, trend: salesTrend },
    { label: "Total Orders", value: allOrders.length, icon: <IconBag />, trend: ordersTrend },
    { label: "Pending Orders", value: pendingOrders.length, icon: <IconTruck />, trend: pendingTrend },
    { label: "Total Customers", value: registeredCustomers.length, icon: <IconUser />, trend: customersTrend },
    { label: "Total Products", value: allProducts.length, icon: <IconGrid />, trend: productsTrend },
    { label: "Low Stock Products", value: lowStockProducts.length, icon: <IconArrowUp className="rotate-180" />, trend: null },
  ];

  // ----- Recent orders (latest 5) -----
  const recentOrders = [...allOrders].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

  // ----- Product management mini table (latest 5 products) -----
  const recentProducts = [...allProducts].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
  const categoryMap = Object.fromEntries(allCategories.map((c) => [c.id, c.name]));

  // ----- Top selling products from order items -----
  const topSelling = computeTopSelling(allOrderItems, allProducts, 5);

  // ----- Recent customers (registered + guest checkout, like the Customers API) -----
  const registeredWithStats = registeredCustomers.map((c) => {
    const custOrders = allOrders.filter((o) => o.userId === c.id);
    return {
      id: c.id,
      name: c.name,
      totalOrders: custOrders.length,
      totalSpent: custOrders.reduce((s, o) => s + o.total, 0),
      lastActivity: custOrders.length ? Math.max(...custOrders.map((o) => o.createdAt)) : c.createdAt,
    };
  });
  const guestOrders = allOrders.filter((o) => !o.userId);
  const guestMap = {};
  for (const o of guestOrders) {
    const key = o.phone;
    if (!guestMap[key]) {
      guestMap[key] = { id: "guest-" + key, name: o.customerName, totalOrders: 0, totalSpent: 0, lastActivity: 0 };
    }
    guestMap[key].totalOrders += 1;
    guestMap[key].totalSpent += o.total;
    guestMap[key].lastActivity = Math.max(guestMap[key].lastActivity, o.createdAt);
  }
  const recentCustomers = [...registeredWithStats, ...Object.values(guestMap)]
    .sort((a, b) => b.lastActivity - a.lastActivity)
    .slice(0, 5);

  // ----- Categories with product counts -----
  const categoryCounts = computeCategoryCounts(allCategories, allProducts);

  // ----- Welcome banner promo image (reuses admin-managed homepage banners) -----
  const promoBanner = [...allBanners].filter((b) => b.active).sort((a, b) => a.sortOrder - b.sortOrder)[0];

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* Welcome banner + promo image */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 md:gap-6">
        <div className="card p-5 md:p-6 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-gold text-sm mb-1">
            <span>✨</span>
            <span className="font-serif text-lg md:text-xl text-ink">Welcome back, {session?.name || "Admin"}!</span>
          </div>
          <p className="text-sm text-muted mb-2">Here's what's happening with your store today.</p>
          <p className="text-xs text-muted">{today}</p>
        </div>

        <div className="relative rounded-xl overflow-hidden min-h-[140px] shadow-sm">
          {promoBanner ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={promoBanner.imageUrl} alt={promoBanner.title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-pink-mid via-pink-light to-gold/40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
          <div className="relative h-full p-5 flex flex-col justify-between min-h-[140px]">
            <div className="text-white">
              {promoBanner?.subtitle && <div className="text-[10px] tracking-[3px] font-semibold mb-1">{promoBanner.subtitle}</div>}
              <div className="font-serif text-lg italic leading-tight">{promoBanner?.title || "Premium Fashion For Every Occasion"}</div>
            </div>
            <Link
              href="/admin/banners"
              className="inline-flex w-fit items-center gap-1.5 bg-ink/80 hover:bg-ink text-white text-xs font-semibold px-4 py-2 rounded-md backdrop-blur-sm"
            >
              Manage Banners →
            </Link>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {statCards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      {/* Sales overview + Low stock */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        <div className="xl:col-span-2">
          <SalesChart orders={allOrders} />
        </div>
        <LowStockCard products={lowStockProducts.slice(0, 5)} />
      </div>

      {/* Recent orders + Order status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        <div className="xl:col-span-2">
          <RecentOrdersCard orders={recentOrders} />
        </div>
        <OrderStatusCard orders={allOrders} />
      </div>

      {/* Product management + Quick actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        <div className="xl:col-span-2">
          <ProductManagementCard products={recentProducts} categoryMap={categoryMap} />
        </div>
        <QuickActionsCard />
      </div>

      {/* Top selling + Recent customers + Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <TopSellingCard items={topSelling} />
        <RecentCustomersCard customers={recentCustomers} />
        <CategoriesCard categories={categoryCounts} />
      </div>

      {/* Coupons */}
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <CouponsCard coupons={allCoupons} />
      </div>
    </div>
  );
}
