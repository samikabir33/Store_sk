import Link from "next/link";

function IconHeart(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20.5s-7-4.35-9.5-8.6C.9 8.6 2.2 5 5.6 4.3c2-.4 3.9.5 5 2.2a1 1 0 0 0 1.6 0c1.1-1.7 3-2.6 5-2.2 3.4.7 4.7 4.3 3.1 7.6-2.5 4.25-9.3 8.6-9.3 8.6z" />
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
function IconFacebook(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-7.6h2.6l.4-3h-3v-1.9c0-.87.24-1.46 1.5-1.46h1.6V4.35A21 21 0 0 0 13.9 4.2c-2.1 0-3.5 1.28-3.5 3.63v2.02h-2.4v3h2.4V21h3.1z" />
    </svg>
  );
}
function IconInstagram(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="17" cy="7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

const shopLinks = [
  ["New Arrivals", "/shop?filter=new"],
  ["Best Sellers", "/shop?filter=best-selling"],
  ["Sarees", "/shop?category=saree"],
  ["Three Piece", "/shop?category=3-piece-sets"],
  ["Party Wear", "/shop?category=party-wear"],
  ["Accessories", "/shop?category=accessories"],
];
const supportLinks = [
  ["Track Order", "/track-order"],
  ["Shipping Policy", "/contact"],
  ["Returns", "/contact"],
  ["Size Guide", "/contact"],
  ["FAQ", "/contact"],
];
const companyLinks = [
  ["About Us", "/about"],
  ["Contact", "/contact"],
  ["Privacy Policy", "/contact"],
  ["Terms & Conditions", "/contact"],
  ["Refund Policy", "/contact"],
];

export default function SiteFooter() {
  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="md:hidden flex justify-around items-center py-3 pb-5 bg-white border-t border-line fixed bottom-0 left-0 right-0 text-[10px] text-muted z-30">
        <Link href="/" className="flex flex-col items-center gap-1 text-rose-deep font-bold">
          <span className="text-lg">⌂</span>Home
        </Link>
        <Link href="/shop" className="flex flex-col items-center gap-1">
          <span className="text-lg">▦</span>Shop
        </Link>
        <Link href="/shop?filter=new" className="flex flex-col items-center gap-1">
          <span className="text-lg">✦</span>New Arrival
        </Link>
        <Link href="/account/wishlist" className="flex flex-col items-center gap-1">
          <IconHeart className="w-[18px] h-[18px]" />Wishlist
        </Link>
        <Link href="/account" className="flex flex-col items-center gap-1">
          <IconUser className="w-[18px] h-[18px]" />Account
        </Link>
      </nav>

      {/* Desktop footer */}
      <footer className="block bg-charcoal text-[#e8dcd6] px-5 md:px-8 pt-10 md:pt-14 pb-24 md:pb-6">
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-8 md:gap-10">
          <div className="col-span-2">
            <h4 className="font-serif text-xl text-white mb-2">Fahmida's Fashion</h4>
            <p className="text-[11px] tracking-wide text-gold-accent mb-4">Style with Elegance</p>
            <p className="text-[12.5px] leading-7 text-[#c9bab3] max-w-[280px]">
              Timeless designs for the modern woman. Elegant, graceful pieces crafted for everyday confidence.
            </p>
            <div className="flex gap-3 mt-5">
              <a href="#" aria-label="Facebook" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:border-gold-accent hover:text-gold-accent transition-colors">
                <IconFacebook className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:border-gold-accent hover:text-gold-accent transition-colors">
                <IconInstagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white text-[13px] font-bold mb-3">Shop</h4>
            {shopLinks.map(([label, href]) => (
              <p key={label} className="text-[12.5px] leading-7">
                <Link href={href} className="hover:text-gold-accent transition-colors">{label}</Link>
              </p>
            ))}
          </div>

          <div>
            <h4 className="text-white text-[13px] font-bold mb-3">Support</h4>
            {supportLinks.map(([label, href]) => (
              <p key={label} className="text-[12.5px] leading-7">
                <Link href={href} className="hover:text-gold-accent transition-colors">{label}</Link>
              </p>
            ))}
          </div>

          <div>
            <h4 className="text-white text-[13px] font-bold mb-3">Company</h4>
            {companyLinks.map(([label, href]) => (
              <p key={label} className="text-[12.5px] leading-7">
                <Link href={href} className="hover:text-gold-accent transition-colors">{label}</Link>
              </p>
            ))}
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto mt-10 pt-5 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3 text-[11.5px] text-[#a8988f]">
          <span>© {new Date().getFullYear()} Fahmida's Fashion. All rights reserved.</span>
          <span className="text-[10px] tracking-wide">Cash on Delivery · bKash · Nagad</span>
        </div>
      </footer>
    </>
  );
}
