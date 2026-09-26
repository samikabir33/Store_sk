import "./globals.css";
import { Playfair_Display, Inter, Italianno } from "next/font/google";
import SiteChrome from "@/components/SiteChrome";
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import { getSession } from "@/lib/auth";
import { getCategoryTree } from "@/lib/categories";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["500", "600", "700"],
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
});
const italianno = Italianno({
  subsets: ["latin"],
  variable: "--font-script",
  weight: "400",
});

export const metadata = {
  metadataBase: new URL("https://fahmidasfashion.store"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Fahmida's Fashion | Online Women's Fashion Store in Bangladesh",
    template: "%s | Fahmida's Fashion",
  },
  description:
    "Shop premium women's fashion online in Bangladesh. Discover stylish three-piece sets, salwar kameez, sarees, kurtis, party wear, and the latest fashion collection with fast delivery and secure shopping.",
  keywords: [
    "Fahmida's Fashion",
    "Fahmida's Fashion Bangladesh",
    "Fahmida Fashion",
    "Fahmida Fashion BD",
    "Fahmida Store",
    "Fahmida Fashion Store",
    "Fahmida Online Store",
    "Fahmida Boutique",
    "Fahmida Boutique Bangladesh",
    "Fahmida Clothing",
    "Fahmida Women's Fashion",
    "Online Fashion Store Bangladesh",
    "Online Boutique Bangladesh",
    "Women's Fashion Bangladesh",
    "Ladies Fashion Bangladesh",
    "Women's Clothing Online",
    "Women's Clothing Store",
    "Fashion Boutique",
    "Premium Women's Fashion",
    "Luxury Women's Clothing",
    "Latest Women's Fashion",
    "Trendy Women's Clothing",
    "Ethnic Wear Bangladesh",
    "Traditional Women's Wear",
    "Western Women's Wear",
    "Casual Women's Clothing",
    "Party Wear for Women",
    "Eid Collection",
    "Festive Collection",
    "New Arrival Fashion",
    "Exclusive Fashion Collection",
    "Ready-to-Wear Collection",

    "Sharee",
    "Saree",
    "Saree Online",
    "Saree Bangladesh",
    "Cotton Saree",
    "Silk Saree",
    "Jamdani Saree",
    "Party Wear Saree",
    "Designer Saree",
    "Printed Saree",
    "Embroidered Saree",

    "3 Piece",
    "Three Piece",
    "3 Piece Dress",
    "Three Piece Dress",
    "Cotton Three Piece",
    "Printed Three Piece",
    "Embroidered Three Piece",
    "Lawn Three Piece",
    "Pakistani Three Piece",
    "Indian Three Piece",
    "Luxury Three Piece",
    "Party Wear Three Piece",

    "2 Piece",
    "Two Piece",
    "2 Piece Dress",
    "Two Piece Dress",
    "Cotton Two Piece",
    "Printed Two Piece",
    "Casual Two Piece",

    "1 Piece",
    "One Piece",
    "One Piece Dress",
    "Women's One Piece",
    "Casual One Piece",
    "Party Wear One Piece",
    "Maxi Dress",
    "Gown",

    "Salwar Kameez",
    "Kameez",
    "Pakistani Dress",
    "Indian Dress",
    "Anarkali",
    "Kurti",
    "Kurti",
    "Long Kurti",
    "Short Kurti",
    "Designer Kurti",
    "Printed Kurti",
    "Cotton Kurti",
    "Embroidered Kurti",

    "Tops",
    "Women's Tops",
    "Casual Tops",
    "Party Tops",
    "Crop Tops",
    "Long Tops",
    "Cotton Tops",
    "Designer Tops",
    "T-Shirts",
    "Women's T-Shirts",
    "Shirts",
    "Women's Shirts",
    "Tunics",

    "Blouse",
    "Saree Blouse",
    "Designer Blouse",
    "Readymade Blouse",
    "Blouse Piece",

    "Inner Wear",
    "Women's Inner Wear",
    "Women's Innerwear",
    "Bras",
    "Bra",
    "Sports Bra",
    "Padded Bra",
    "Non Padded Bra",
    "T-Shirt Bra",
    "Push Up Bra",
    "Cotton Bra",
    "Wireless Bra",
    "Lace Bra",
    "Panties",
    "Cotton Panties",
    "Brief Panties",
    "Hipster Panties",
    "Bikini Panties",
    "Boyshort Panties",
    "High Waist Panties",
    "Lingerie",
    "Lingerie Set",
    "Lingerie Sets",
    "Women's Lingerie",
    "Nightwear",
    "Night Dress",
    "Nighty",
    "Sleepwear",
    "Camisole",
    "Slip Dress",
    "Shapewear",

    "Hijab",
    "Hijab Collection",
    "Premium Hijab",
    "Cotton Hijab",
    "Chiffon Hijab",
    "Georgette Hijab",
    "Silk Hijab",
    "Scarf",
    "Women's Scarf",

    "Women's Bag",
    "Handbag",
    "Shoulder Bag",
    "Crossbody Bag",
    "Tote Bag",
    "Wallet",
    "Purse",

    "Jewelry",
    "Fashion Jewelry",
    "Earrings",
    "Necklace",
    "Bracelet",
    "Ring",
    "Hair Accessories",

    "Women's Shoes",
    "Sandals",
    "Heels",
    "Flats",

    "Buy Women's Clothing Online",
    "Buy Saree Online",
    "Buy Three Piece Online",
    "Buy Two Piece Online",
    "Buy Kurti Online",
    "Buy Tops Online",
    "Buy Blouse Online",
    "Buy Lingerie Online",
    "Buy Bras Online",
    "Buy Panties Online",
    "Online Shopping Bangladesh",
    "Fashion Online Shopping",
    "Cash on Delivery Bangladesh",
    "Fast Delivery Bangladesh",
    "Best Women's Fashion Store",
    "Best Online Boutique Bangladesh",
    "Affordable Women's Fashion",
    "Premium Fashion Bangladesh",
    "Designer Women's Clothing",
    "Women's Clothing Bangladesh"
  ],
  authors: [{ name: "Fahmida's Fashion" }],
  openGraph: {
    title:
      "Fahmida's Fashion | Online Women's Fashion Store in Bangladesh | Three Piece, Saree & Salwar Kameez",
    description:
      "Shop premium women's fashion online in Bangladesh. Discover stylish three-piece sets, salwar kameez, sarees, kurtis, party wear, and the latest fashion collection with fast delivery and secure shopping.",
    url: "https://fahmidasfashion.store",
    siteName: "Fahmida's Fashion",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Fahmida's Fashion | Online Women's Fashion Store in Bangladesh | Three Piece, Saree & Salwar Kameez",
    description:
      "Shop premium women's fashion online in Bangladesh. Discover stylish three-piece sets, salwar kameez, sarees, kurtis, party wear, and the latest fashion collection with fast delivery and secure shopping.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }) {
  const session = await getSession();
  const categories = await getCategoryTree();

  // Organization/WebSite structured data — one of the signals Google uses to
  // decide what brand name to display next to the favicon in search results
  // (instead of the raw domain). Doesn't force it instantly; Google applies
  // this over time as it re-crawls and builds confidence in the brand name.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://fahmidasfashion.store/#organization",
        name: "Fahmida's Fashion",
        alternateName: "Fahmida's Fashion",
        url: "https://fahmidasfashion.store",
        logo: "https://fahmidasfashion.store/logo.png",
      },
      {
        "@type": "WebSite",
        "@id": "https://fahmidasfashion.store/#website",
        name: "Fahmida's Fashion",
        url: "https://fahmidasfashion.store",
        publisher: { "@id": "https://fahmidasfashion.store/#organization" },
      },
    ],
  };

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${italianno.variable}`}>
      <body className="bg-cream font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <CartProvider>
          <WishlistProvider>
            <SiteChrome session={session} categories={categories}>{children}</SiteChrome>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
