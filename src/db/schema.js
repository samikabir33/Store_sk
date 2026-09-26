import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ===== Users (Customer / Admin / Owner) =====
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  dateOfBirth: text("date_of_birth"), // stored as "YYYY-MM-DD"
  gender: text("gender"), // male | female | other | "" (prefer not to say)
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("customer"), // customer | admin | owner
  adminRole: text("admin_role"), // ceo | admin | order_manager | inventory_manager (only set when role = "admin")
  createdAt: integer("created_at").notNull(),
});

// ===== Categories (supports parent > sub-category, e.g. Accessories > Handbags) =====
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  parentId: text("parent_id"),
  sortOrder: integer("sort_order").notNull().default(0),
  imageUrl: text("image_url").notNull().default(""),
});

// ===== Products =====
export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  price: real("price").notNull(),
  compareAtPrice: real("compare_at_price"), // optional "original price" shown struck-through when higher than price
  images: text("images").notNull().default("[]"), // JSON array of URLs
  categoryId: text("category_id").notNull(),
  stock: integer("stock").notNull().default(0),
  sku: text("sku"),
  sizes: text("sizes").notNull().default("[]"), // JSON array e.g. ["S","M","L"]
  colors: text("colors").notNull().default("[]"),
  colorImages: text("color_images").notNull().default("{}"), // JSON object {"Black": "url", "White": "url"}
  isNew: integer("is_new").notNull().default(0),
  isFeatured: integer("is_featured").notNull().default(0),
  status: text("status").notNull().default("active"), // active | hidden
  createdAt: integer("created_at").notNull(),
});

// ===== Addresses (saved addresses for logged-in customers) =====
export const addresses = sqliteTable("addresses", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  label: text("label").notNull().default("Home"),
  detailedAddress: text("detailed_address").notNull(),
  district: text("district").notNull(),
  thana: text("thana").notNull(),
  deliveryArea: text("delivery_area").notNull(), // inside_dhaka | outside_dhaka
  altPhone: text("alt_phone"),
  isDefault: integer("is_default").notNull().default(0),
});

// ===== Orders =====
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: text("user_id"), // nullable -> guest checkout
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  detailedAddress: text("detailed_address").notNull(),
  district: text("district").notNull(),
  thana: text("thana").notNull(),
  deliveryArea: text("delivery_area").notNull(), // inside_dhaka | outside_dhaka
  transactionId: text("transaction_id"), // bKash/Nagad "Send Money" TrxID entered by customer
  senderNumberLast4: text("sender_number_last4"), // last 4 digits of the number they sent money FROM
  paymentVerified: integer("payment_verified").notNull().default(0), // admin marks this after checking bKash/Nagad statement
  altPhone: text("alt_phone"),
  deliveryNote: text("delivery_note"),
  paymentMethod: text("payment_method").notNull(), // cod | bkash | nagad
  couponCode: text("coupon_code"),
  subtotal: real("subtotal").notNull(),
  deliveryFee: real("delivery_fee").notNull(),
  discount: real("discount").notNull().default(0),
  total: real("total").notNull(),
  status: text("status").notNull().default("pending"), // pending|confirmed|shipped|delivered|cancelled
  createdAt: integer("created_at").notNull(),
});

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  price: real("price").notNull(),
  qty: integer("qty").notNull(),
  size: text("size"),
  color: text("color"),
});

// ===== Homepage banners (admin-managed) =====
// placement: "hero" = top rotating slider, "promo" = single banner strip
// shown between the New Arrivals and Best Sellers sections.
// textPosition / buttonPosition: where the eyebrow+title+subtitle block, and
// the CTA button, sit on top of the image — one of 9 anchor points
// ("top-left".."bottom-right", or "middle-center" for dead center). Lets an
// admin whose image already has its own baked-in design (logo, price badge,
// etc.) move the site's own text/button out of the way instead of it being
// stuck in one fixed spot.
export const banners = sqliteTable("banners", {
  id: text("id").primaryKey(),
  placement: text("placement").notNull().default("hero"),
  eyebrow: text("eyebrow").notNull().default(""),
  title: text("title").notNull().default(""),
  subtitle: text("subtitle").notNull().default(""),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url").notNull().default("/shop"),
  buttonText: text("button_text").notNull().default("Shop Now"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: integer("active").notNull().default(1),
  textPosition: text("text_position").notNull().default("middle-left"),
  buttonPosition: text("button_position").notNull().default("bottom-left"),
});

// ===== Coupons =====
export const coupons = sqliteTable("coupons", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  type: text("type").notNull(), // percent | flat
  value: real("value").notNull(),
  active: integer("active").notNull().default(1),
  expiresAt: integer("expires_at"),
});

// ===== Site settings (admin-editable, e.g. delivery fees) =====
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// ===== Cart (persisted per logged-in user) =====
export const cartItems = sqliteTable("cart_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  productId: text("product_id").notNull(),
  qty: integer("qty").notNull().default(1),
  size: text("size"),
  color: text("color"),
});

// ===== Product Reviews (only verified buyers can post) =====
export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  userId: text("user_id").notNull(),
  orderId: text("order_id").notNull(), // proves this user bought this product
  customerName: text("customer_name").notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment").notNull().default(""),
  createdAt: integer("created_at").notNull(),
});

// ===== Password Reset OTPs (5-digit code emailed to the user) =====
export const passwordResets = sqliteTable("password_resets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  email: text("email").notNull(),
  otp: text("otp").notNull(),
  expiresAt: integer("expires_at").notNull(),
  used: integer("used").notNull().default(0), // 0 | 1
  createdAt: integer("created_at").notNull(),
});

// ===== Newsletter subscribers (homepage "Join Our Newsletter" form) =====
export const newsletterSubscribers = sqliteTable("newsletter_subscribers", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at").notNull(),
});
