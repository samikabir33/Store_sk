// Central permission config for the admin panel.
// "key" values here match the `key` used in the sidebar NAV array
// (src/app/admin/(dashboard)/layout.jsx) and are also used by the
// middleware to gate both /admin/* pages and /api/admin/* routes.

export const ROLE_LABELS = {
  ceo: "CEO",
  admin: "Admin",
  order_manager: "Order Manager",
  inventory_manager: "Inventory Manager",
};

export const ADMIN_ROLES = ["ceo", "admin", "order_manager", "inventory_manager"];

const ALL_EXCEPT_TEAM = [
  "dashboard",
  "products",
  "banners",
  "categories",
  "orders",
  "stock",
  "coupons",
  "settings",
  "customers",
];
const ALL = [...ALL_EXCEPT_TEAM, "team"];

export const ROLE_PERMISSIONS = {
  ceo: ALL, // full access, same as owner, including Manage Admins
  admin: ALL_EXCEPT_TEAM, // full access except Manage Admins
  order_manager: ["dashboard", "orders"],
  inventory_manager: ["dashboard", "products", "stock"],
};

// Returns the list of nav/permission keys this session is allowed to use.
export function getAllowedKeys(session) {
  if (!session) return [];
  if (session.role === "owner") return ALL;
  if (session.role === "admin") {
    return ROLE_PERMISSIONS[session.adminRole] || ALL_EXCEPT_TEAM; // legacy admins (no adminRole set) keep full access minus Team
  }
  return [];
}

export function hasAccess(session, key) {
  return getAllowedKeys(session).includes(key);
}

export function canManageAdmins(session) {
  return hasAccess(session, "team");
}

export function roleLabelFor(session) {
  if (!session) return "";
  if (session.role === "owner") return "Owner";
  return ROLE_LABELS[session.adminRole] || "Admin";
}

// Longest-prefix match: path -> permission key. Used by middleware to gate
// both page routes (/admin/...) and admin API routes (/api/admin/...).
const PATH_KEY_RULES = [
  { prefix: "/admin/products", key: "products" },
  { prefix: "/admin/banners", key: "banners" },
  { prefix: "/admin/categories", key: "categories" },
  { prefix: "/admin/orders", key: "orders" },
  { prefix: "/admin/stock", key: "stock" },
  { prefix: "/admin/coupons", key: "coupons" },
  { prefix: "/admin/settings", key: "settings" },
  { prefix: "/admin/customers", key: "customers" },
  { prefix: "/admin/team", key: "team" },
  { prefix: "/admin", key: "dashboard" },

  { prefix: "/api/admin/products", key: "products" },
  { prefix: "/api/admin/banners", key: "banners" },
  { prefix: "/api/admin/categories", key: "categories" },
  { prefix: "/api/admin/orders", key: "orders" },
  { prefix: "/api/admin/stock", key: "stock" },
  { prefix: "/api/admin/coupons", key: "coupons" },
  { prefix: "/api/admin/settings", key: "settings" },
  { prefix: "/api/admin/customers", key: "customers" },
  { prefix: "/api/admin/team", key: "team" },
];

export function resolveKeyForPath(pathname) {
  const matches = PATH_KEY_RULES.filter((r) => pathname.startsWith(r.prefix));
  if (matches.length === 0) return null;
  matches.sort((a, b) => b.prefix.length - a.prefix.length);
  return matches[0].key;
}
