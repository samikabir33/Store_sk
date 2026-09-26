import Database from "better-sqlite3";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "fahmidas.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

const initSql = fs.readFileSync(path.join(__dirname, "init.sql"), "utf-8");
db.exec(initSql);

// --- Safe migration: add new payment-verification columns to orders if this DB
// already existed before this update
const migrations = [
  "ALTER TABLE orders ADD COLUMN transaction_id TEXT",
  "ALTER TABLE orders ADD COLUMN sender_number_last4 TEXT",
  "ALTER TABLE orders ADD COLUMN payment_verified INTEGER NOT NULL DEFAULT 0",
];
for (const sql of migrations) {
  try { db.exec(sql); } catch (e) { /* column already exists — safe to ignore */ }
}

const now = Date.now();

// ---------- Categories ----------
const mainCategories = [
  "Party Wear", "Anarkali", "Saree", "Blouses", "Tops", "Kurtis",
  "1-Piece Set", "2-Piece Sets", "3-Piece Sets", "Inner Wear",
];

const catIds = {};
const insertCat = db.prepare(
  "INSERT OR IGNORE INTO categories (id, name, slug, parent_id, sort_order) VALUES (?,?,?,?,?)"
);

mainCategories.forEach((name, i) => {
  const id = nanoid();
  catIds[name] = id;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  insertCat.run(id, name, slug, null, i);
});

// Accessories with sub-categories
const accId = nanoid();
insertCat.run(accId, "Accessories", "accessories", null, 10);
["Handbags", "Jewelry", "Scarves", "Belts"].forEach((sub, i) => {
  const id = nanoid();
  catIds[sub] = id;
  insertCat.run(id, sub, sub.toLowerCase(), accId, i);
});

// Footwear with sub-categories
const footId = nanoid();
insertCat.run(footId, "Footwear", "footwear", null, 11);
["Heels", "Flats", "Sandals"].forEach((sub, i) => {
  const id = nanoid();
  catIds[sub] = id;
  insertCat.run(id, sub, sub.toLowerCase(), footId, i);
});

// ---------- Products ----------
const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO products
  (id, name, slug, description, price, images, category_id, stock, sku, sizes, colors, is_new, is_featured, status, created_at)
  VALUES (@id,@name,@slug,@description,@price,@images,@categoryId,@stock,@sku,@sizes,@colors,@isNew,@isFeatured,@status,@createdAt)
`);

const sampleProducts = [
  { name: "Floral Maxi Dress", cat: "Party Wear", price: 2850, stock: 18, img: "https://images.unsplash.com/photo-1763152608881-67c80e52d0fc?w=700&h=900&fit=crop&q=80", isNew: 1 },
  { name: "Linen Blend Shirt", cat: "Tops", price: 1950, stock: 32, img: "https://images.unsplash.com/photo-1753395298691-eb93244d76c1?w=700&h=900&fit=crop&q=80", isNew: 1 },
  { name: "Pleated Skirt", cat: "1-Piece Set", price: 2250, stock: 12, img: "https://images.unsplash.com/photo-1696443290811-f8585678e9f1?w=700&h=900&fit=crop&q=80", isNew: 0 },
  { name: "Tailored Blazer Coat", cat: "2-Piece Sets", price: 3450, stock: 9, img: "https://images.unsplash.com/photo-1747817230321-4ad317ac0809?w=700&h=900&fit=crop&q=80", isNew: 1 },
  { name: "Little Black Dress", cat: "Party Wear", price: 2650, stock: 4, img: "https://images.unsplash.com/photo-1633994048003-071f6c11e26a?w=700&h=900&fit=crop&q=80", isNew: 0 },
  { name: "Rose Wrap Dress", cat: "Anarkali", price: 2950, stock: 0, img: "https://images.unsplash.com/photo-1763152608881-67c80e52d0fc?w=700&h=900&fit=crop&q=80", isNew: 0 },
  { name: "Classic Blouse", cat: "Blouses", price: 1750, stock: 25, img: "https://images.unsplash.com/photo-1753395298691-eb93244d76c1?w=700&h=900&fit=crop&q=80", isNew: 0 },
  { name: "Embroidered Kurti", cat: "Kurtis", price: 1850, stock: 20, img: "https://images.unsplash.com/photo-1747817230321-4ad317ac0809?w=700&h=900&fit=crop&q=80", isNew: 0 },
];

sampleProducts.forEach((p) => {
  insertProduct.run({
    id: nanoid(),
    name: p.name,
    slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + nanoid(4),
    description: `${p.name} - premium quality fabric, crafted for everyday elegance.`,
    price: p.price,
    images: JSON.stringify([p.img]),
    categoryId: catIds[p.cat],
    stock: p.stock,
    sku: "FF-" + nanoid(6).toUpperCase(),
    sizes: JSON.stringify(["S", "M", "L", "XL"]),
    colors: JSON.stringify(["Pink", "Black", "Beige"]),
    isNew: p.isNew,
    isFeatured: 1,
    status: "active",
    createdAt: now,
  });
});

// ---------- Users ----------
// NOTE: Owner login is NOT seeded here anymore. It authenticates directly
// against the OWNER_EMAIL / OWNER_PASSWORD environment variables (see
// src/app/api/auth/login/route.js), so no owner credentials ever live in
// this codebase or the database.
//
// Additional admin/staff accounts are created by the Owner from the
// Admin > Team page (src/app/api/admin/team/route.js), which inserts them
// straight into the `users` table with role "admin".

// ---------- Coupon ----------
const insertCoupon = db.prepare(`
  INSERT OR IGNORE INTO coupons (id, code, type, value, active, expires_at)
  VALUES (?,?,?,?,?,?)
`);
insertCoupon.run(nanoid(), "FAHMIDA10", "percent", 10, 1, null);

// ---------- Settings (admin-editable) ----------
const insertSetting = db.prepare(`
  INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)
`);
insertSetting.run("delivery_fee_inside_dhaka", "80");
insertSetting.run("delivery_fee_outside_dhaka", "120");
insertSetting.run("free_shipping_threshold", "2000");
insertSetting.run("bkash_number", "01622-132041");
insertSetting.run("nagad_number", "01622-132041");

// ---------- Default hero banner (admin can add more from Admin > Banners) ----------
const insertBanner = db.prepare(`
  INSERT OR IGNORE INTO banners (id, title, subtitle, image_url, link_url, button_text, sort_order, active)
  VALUES (?,?,?,?,?,?,?,?)
`);
insertBanner.run(
  "default-hero-banner",
  "Elevate Your Wardrobe",
  "NEW COLLECTION",
  "https://images.unsplash.com/photo-1675294292199-aac27f952585?w=900&h=1000&fit=crop&q=80",
  "/shop",
  "Shop Now",
  0,
  1
);

console.log("✅ Database seeded successfully at", dbPath);
console.log("   (Owner logs in via OWNER_EMAIL / OWNER_PASSWORD env vars — not seeded here)");

// Close the connection explicitly instead of letting the process exit
// clean it up implicitly — avoids a native better-sqlite3 crash
// ("Assertion failed: (env) != nullptr" / Statement::~Statement()) on exit.
db.close();
