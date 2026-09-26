"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";

/* Simple stroke-based icons (no extra npm package needed) */
function IconMenu(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...props}>
      <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" />
    </svg>
  );
}
function IconClose(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...props}>
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}
function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}
function IconHeart(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20.5s-7-4.35-9.5-8.6C.9 8.6 2.2 5 5.6 4.3c2-.4 3.9.5 5 2.2a1 1 0 0 0 1.6 0c1.1-1.7 3-2.6 5-2.2 3.4.7 4.7 4.3 3.1 7.6-2.5 4.25-9.3 8.6-9.3 8.6z" />
    </svg>
  );
}
function IconBag(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 8h12l1 12.5a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 20.5L6 8z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  );
}
function IconUser(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.4-3.6 4.3-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
    </svg>
  );
}

export default function SiteHeader({ session, categories = [] }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [catOpen, setCatOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // The layout passes categories from the DB. If it didn't (or the list is
  // empty on first paint), fall back to the public API so the menu is never
  // stuck on old hard-coded names.
  const [navCats, setNavCats] = useState(categories);
  useEffect(() => { setNavCats(categories); }, [categories]);
  useEffect(() => {
    if (categories && categories.length) return;
    let alive = true;
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => { if (alive) setNavCats(d.categories || []); })
      .catch(() => {});
    return () => { alive = false; };
  }, [categories]);

  // Main categories without sub-categories -> plain links.
  // Main categories with sub-categories -> a titled column (e.g. Accessories).
  const plainCats = navCats.filter((c) => !(c.subCategories || []).length);
  const groupedCats = navCats.filter((c) => (c.subCategories || []).length > 0);

  return (
    <>
      {/* Promo strip */}
      <div className="bg-gradient-to-r from-pink-deep to-gold text-white text-[12px] py-2 px-4 flex justify-center gap-2 text-center">
        <span>🚚 Free Shipping on orders over ৳2000</span>
        <span className="opacity-60">|</span>
        <span>🏷️ Get 10% OFF on your first order | Use Code: FAHMIDA10</span>
      </div>

      {/* Desktop utility bar */}
      <div className="hidden md:block bg-pink-light text-[12px] text-[#5c4f49]">
        <div className="max-w-[1280px] mx-auto flex justify-center items-center px-8 py-1.5">
          <span>Welcome to Fahmida's Fashion</span>
        </div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 bg-white border-b border-line sticky top-0 z-40">
        <button
          className="md:hidden text-xl"
          aria-label="Open menu"
          onClick={() => setDrawerOpen(true)}
        >
          <IconMenu className="w-6 h-6" />
        </button>

        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Fahmida's Fashion"
            width={140}
            height={140}
            className="h-12 md:h-14 w-auto object-contain"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[13px] font-bold tracking-wide">
          <Link href="/">HOME</Link>
          <Link href="/shop">SHOP</Link>
          <div className="relative group">
            <span className="cursor-pointer inline-block py-2">CATEGORIES ▾</span>
            {/* Wrapper starts right under the trigger (top-full) with no gap, and its own
                padding (pt-2) bridges the visual gap so the mouse never leaves a hoverable
                descendant of .group while moving from the trigger down to the menu. */}
            <div className="hidden group-hover:block absolute top-full left-0 pt-2 z-50">
              <div className="grid grid-cols-3 gap-x-6 gap-y-1 bg-white border border-line rounded-lg shadow-xl p-4 min-w-[520px]">
                {navCats.length === 0 && (
                  <Link href="/shop" className="block text-[12.5px] font-normal px-1 py-1.5">
                    All Products
                  </Link>
                )}
                {plainCats.map((c) => (
                  <Link
                    key={c.id}
                    href={`/shop?category=${c.slug}`}
                    className="block text-[12.5px] font-normal px-1 py-1.5 rounded hover:bg-pink-lighter hover:text-pink-deep"
                  >
                    {c.name}
                  </Link>
                ))}
                {groupedCats.map((g) => (
                  <div key={g.id}>
                    <Link
                      href={`/shop?category=${g.slug}`}
                      className="block text-[11px] tracking-wide text-gold font-bold uppercase mt-2 mb-0.5 hover:text-pink-deep"
                    >
                      {g.name}
                    </Link>
                    {g.subCategories.map((s) => (
                      <Link
                        key={s.id}
                        href={`/shop?category=${s.slug}`}
                        className="block text-[12.5px] font-normal px-1 py-1.5 rounded hover:bg-pink-lighter hover:text-pink-deep"
                      >
                        {s.name}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Link href="/shop?filter=new">NEW ARRIVAL</Link>
          <Link href="/about">ABOUT US</Link>
          <Link href="/contact">CONTACT</Link>
        </nav>

        <div className="flex gap-3 md:gap-5 items-center text-ink">
          {/* Desktop: always-visible search bar */}
          <form
            action="/shop"
            method="GET"
            className="hidden md:flex items-center bg-cream border border-line rounded-full pl-4 pr-1 py-1 w-56 lg:w-72"
          >
            <input
              type="text"
              name="q"
              placeholder="Search"
              className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-muted"
            />
            <button
              type="submit"
              aria-label="Search"
              className="w-8 h-8 rounded-full bg-pink-deep text-white flex items-center justify-center shrink-0"
            >
              <IconSearch className="w-4 h-4" />
            </button>
          </form>

          {/* Mobile: icon that toggles a small search bar */}
          <div className="relative md:hidden">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen((o) => !o)}
              className="leading-none"
            >
              <IconSearch className="w-[22px] h-[22px]" />
            </button>
            {searchOpen && (
              <form
                action="/shop"
                method="GET"
                className="absolute right-0 top-9 bg-white border border-line rounded-lg shadow-xl p-2 flex gap-2 z-50"
              >
                <input
                  type="text"
                  name="q"
                  placeholder="Search products..."
                  autoFocus
                  className="border border-line rounded px-2 py-1.5 text-sm w-44 outline-none focus:border-pink-deep text-ink"
                />
                <button
                  type="submit"
                  className="bg-pink-deep text-white text-sm font-bold px-3 py-1.5 rounded whitespace-nowrap"
                >
                  Go
                </button>
              </form>
            )}
          </div>

          <Link href="/account/wishlist" aria-label="Wishlist" className="relative">
            <IconHeart className="w-[22px] h-[22px]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-pink-deep text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative">
            <IconBag className="w-[22px] h-[22px]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-pink-deep text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <Link href={session ? "/account" : "/login"} aria-label="Account"><IconUser className="w-[22px] h-[22px]" /></Link>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 bg-black/45 z-[90] transition-opacity md:hidden ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setDrawerOpen(false)}
      />
      <div
        className={`fixed top-0 left-0 bottom-0 w-[78%] max-w-[320px] bg-white z-[100] shadow-2xl flex flex-col transition-transform md:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-4.5 py-5 border-b border-line px-[18px]">
          <div className="font-serif text-[19px]">Fahmida's Fashion</div>
          <button onClick={() => setDrawerOpen(false)} className="text-muted" aria-label="Close menu">
            <IconClose className="w-5 h-5" />
          </button>
        </div>
        <nav className="py-2 overflow-y-auto flex-1 text-sm">
          <Link href="/" className="block px-[22px] py-3.5 font-bold" onClick={() => setDrawerOpen(false)}>HOME</Link>
          <Link href="/shop" className="block px-[22px] py-3.5 font-bold" onClick={() => setDrawerOpen(false)}>SHOP</Link>

          <div className="border-b border-line">
            <div
              className="flex justify-between items-center px-[22px] py-3.5 font-bold cursor-pointer"
              onClick={() => setCatOpen((o) => !o)}
            >
              CATEGORIES <span className={`text-xs text-muted transition-transform ${catOpen ? "rotate-180" : ""}`}>▾</span>
            </div>
            <div
              className="overflow-hidden bg-pink-lighter transition-all"
              style={{ maxHeight: catOpen ? "2000px" : "0px" }}
            >
              {plainCats.map((c) => (
                <Link
                  key={c.id}
                  href={`/shop?category=${c.slug}`}
                  className="block px-[34px] py-2.5 text-[13px] text-[#5c4f49]"
                  onClick={() => setDrawerOpen(false)}
                >
                  {c.name}
                </Link>
              ))}
              {groupedCats.map((g) => (
                <div key={g.id}>
                  <Link
                    href={`/shop?category=${g.slug}`}
                    className="block px-[34px] pt-3 pb-1 text-[10.5px] tracking-wide text-gold font-bold uppercase"
                    onClick={() => setDrawerOpen(false)}
                  >
                    {g.name}
                  </Link>
                  {g.subCategories.map((s) => (
                    <Link
                      key={s.id}
                      href={`/shop?category=${s.slug}`}
                      className="block px-[34px] py-2.5 text-[13px] text-[#5c4f49]"
                      onClick={() => setDrawerOpen(false)}
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <Link href="/shop?filter=new" className="block px-[22px] py-3.5 font-bold" onClick={() => setDrawerOpen(false)}>NEW ARRIVAL</Link>
          <Link href="/shop?filter=best-selling" className="block px-[22px] py-3.5 font-bold" onClick={() => setDrawerOpen(false)}>Top Selling</Link>
          <div className="h-px bg-line mx-[18px] my-2" />
          <Link href="/account/wishlist" className="block px-[22px] py-3.5 font-bold" onClick={() => setDrawerOpen(false)}>
            My Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
          </Link>
          <Link href="/track-order" className="block px-[22px] py-3.5 font-bold" onClick={() => setDrawerOpen(false)}>Track Order</Link>
          <div className="h-px bg-line mx-[18px] my-2" />
          <Link href="/about" className="block px-[22px] py-3.5 font-bold" onClick={() => setDrawerOpen(false)}>ABOUT US</Link>
          <Link href="/contact" className="block px-[22px] py-3.5 font-bold" onClick={() => setDrawerOpen(false)}>CONTACT</Link>
        </nav>
        <Link
          href={session ? "/account" : "/login"}
          className="flex items-center gap-2.5 px-[22px] py-4 border-t border-line"
          onClick={() => setDrawerOpen(false)}
        >
          <div className="w-9 h-9 rounded-full bg-pink-light flex items-center justify-center text-pink-deep">
            <IconUser className="w-[18px] h-[18px]" />
          </div>
          <div>
            <div className="text-[13px] font-bold">{session ? session.name : "My Account"}</div>
            <div className="text-[11px] text-muted">{session ? session.role : "Login / Sign up"}</div>
          </div>
        </Link>
      </div>
    </>
  );
}
