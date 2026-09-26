# Fahmida's Fashion — Full Stack E-Commerce

A complete e-commerce site for Fahmida's Fashion: customer storefront (mobile + desktop
responsive), cart & checkout, order tracking, and a full Admin/Owner dashboard — no code
changes needed after deployment.

## Tech Stack

- **Frontend + Backend:** Next.js 15 (App Router, React 19) — one project, both sides
- **Database:** SQLite (via `better-sqlite3` + Drizzle ORM) — file-based, zero setup
- **Auth:** JWT sessions in httpOnly cookies (`jose`), passwords hashed with `bcryptjs`
- **Styling:** Tailwind CSS, matching the pink/gold Fahmida's Fashion brand theme

> **Why SQLite for now?** It needs no external account or internet connection to run —
> you can start the whole site with one command. See **"Moving to Postgres for
> production"** below for how to switch to a cloud database (recommended before your
> real public launch, since a plain SQLite file is not ideal for a live multi-admin site).

---

## 1. Run it locally

```bash
npm install
npm run db:seed     # creates the database + sample products/categories/logins
npm run dev          # starts at http://localhost:3000
```

Open **http://localhost:3000** for the storefront and **http://localhost:3000/admin/login**
for the admin dashboard.

### Demo logins (created by the seed script)

| Role  | Email                          | Password       |
|-------|---------------------------------|----------------|
| Owner | owner@fahmidasfashion.com       | Owner@12345    |
| Admin | admin@fahmidasfashion.com       | Admin@12345    |

**Change these passwords (or delete these accounts and create your own) before going live.**
As Owner, go to **Admin → Manage Admins** to add real staff accounts and remove the demo ones.

---

## 2. What's included

### Customer-facing
- Responsive homepage (mobile drawer menu + desktop mega-menu), Shop/category pages,
  product detail pages with size/color/qty selection
- Cart (persists in the browser), Checkout (Contact info, Shipping address with
  Inside/Outside Dhaka delivery toggle, coupon code, COD/bKash/Nagad payment)
- Guest checkout supported (no account required to order)
- Customer signup/login, order history under "My Account"
- Public order tracking by order number + phone (no login needed)

### Admin / Owner dashboard (`/admin`)
- **Dashboard** — revenue, orders, low/out-of-stock counts at a glance
- **Products** — add/edit/delete, images, sizes, colors, stock, price, category, New/Best-seller tags
- **Categories** — add main categories and sub-categories (e.g. Accessories → Handbags)
- **Orders** — view details, update status (pending → confirmed → shipped → delivered)
- **Stock / Inventory Search** — search any product by name or SKU to see live stock
- **Coupons** — create percent/flat discount codes, activate/deactivate
- **Delivery Settings** — edit Inside Dhaka / Outside Dhaka delivery fees and free-shipping
  threshold — changes apply instantly at checkout, no code or redeploy needed
- **Customers** — see every customer (registered + guest checkout), **Export CSV** button
- **Manage Admins** (Owner only) — add/remove admin accounts

Everything above is editable from the dashboard UI — this is the "no code changes after
deploy" requirement in practice.

---

## 3. Project structure

```
src/
  app/                    → pages & API routes (Next.js App Router)
    admin/(dashboard)/    → admin pages (guarded, admin/owner only)
    admin/login/          → staff login (separate from customer login)
    api/                  → all backend endpoints
    ...                   → customer-facing pages
  components/             → shared React components (header, cart, product card...)
  db/
    schema.js             → all database tables (Drizzle)
    init.sql              → raw SQL to create tables
    seed.mjs              → creates tables + demo data (run via `npm run db:seed`)
  lib/
    auth.js               → JWT session helpers, role checks
    utils.js               → small helpers (currency formatting, order numbers)
data/
    fahmidas.db            → the SQLite database file (created by seed script)
```

---

## 4. Deploying

You can deploy this Next.js app to any Node host (Vercel, Railway, a VPS, etc). A few
things to set up yourself since they need your own accounts/credentials:

1. **Environment variable:** set `JWT_SECRET` to a long random string in production
   (used to sign login sessions). Without it, a default dev secret is used — fine for
   testing, **not safe for a live site**.
2. **Database file persistence:** SQLite is a single file (`data/fahmidas.db`). Most
   serverless hosts (like Vercel) reset the filesystem on every deploy, which would wipe
   your data — so for SQLite you need a host with a persistent disk (e.g. Railway,
   Render, or your own VPS), not a serverless platform.
3. Run `npm run build && npm run start` (or your host's equivalent) after setting the
   environment variable.

### Moving to Postgres for production (recommended)

For a live public store handling real orders, a hosted Postgres database (e.g.
**Supabase** or **Neon**) is more robust than a single SQLite file — it survives
redeploys, handles concurrent admin users safely, and lets you host the app on
serverless platforms like Vercel. To switch:

1. Create a free Postgres database on Supabase or Neon (you'll need your own account —
   this is the one step I can't do for you from here).
2. Swap the Drizzle driver from `drizzle-orm/better-sqlite3` to `drizzle-orm/postgres-js`
   (or `drizzle-orm/neon-http`) in `src/db/index.js`, and update `src/db/schema.js` column
   types from SQLite (`sqlite-core`) to Postgres (`pg-core`) — the table/column layout
   stays the same, only the import and a few type names change (e.g. `integer` with
   0/1 booleans → real `boolean`).
3. Set `DATABASE_URL` to your Supabase/Neon connection string as an environment variable.
4. Re-run the equivalent of the seed script against the new database.

Happy to do this migration for you in a follow-up once you've created the Supabase/Neon
project and shared the connection details.

---

## 5. Notes / known simplifications

- Product images currently use direct image URLs (stored as a field on each product,
  editable from Admin → Products). For real product photos, upload them somewhere (e.g.
  Supabase Storage, Cloudinary) and paste the URL in — a direct file-upload button can be
  added later.
- bKash/Nagad are currently recorded as the chosen payment method but don't process a
  real payment automatically (no live payment gateway wired in) — orders are confirmed
  manually by Admin, same as Cash on Delivery. Real bKash/Nagad merchant API integration
  can be added when you have merchant credentials.
- Delivery districts/thanas are free-text fields — a fixed BD district/thana dropdown
  list can be added later if you'd prefer stricter validation.
