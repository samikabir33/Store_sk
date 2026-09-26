"use client";
import Link from "next/link";
import { useWishlist } from "@/components/WishlistContext";
import { useCart } from "@/components/CartContext";

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  if (items.length === 0) {
    return (
      <main className="max-w-[500px] mx-auto px-6 py-16 text-center">
        <div className="text-5xl mb-4">♡</div>
        <h1 className="font-serif text-xl mb-2">Your Wishlist</h1>
        <p className="text-sm text-muted">Save items you love and find them here later.</p>
        <Link href="/shop" className="btn-primary inline-block mt-6">Start Shopping</Link>
      </main>
    );
  }

  return (
    <main className="max-w-[900px] mx-auto px-5 md:px-8 py-10">
      <h1 className="font-serif text-xl mb-6">Your Wishlist</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.productId} className="card p-2.5 font-sans">
            <Link href={`/product/${item.slug}`} className="block">
              <div className="aspect-[3/4] overflow-hidden bg-pink-light rounded-md mb-2">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="text-[12.5px] mb-1 truncate">{item.name}</div>
              <div className="text-[13px] font-bold text-pink-deep mb-2">৳ {item.price.toLocaleString("en-BD")}</div>
            </Link>
            <div className="flex gap-2">
              <button
                onClick={() => addItem(item.productId ? { id: item.productId, name: item.name, price: item.price, images: JSON.stringify([item.image]) } : item)}
                className="btn-primary flex-1 text-xs py-2"
              >
                Add to Cart
              </button>
              <button
                onClick={() => removeItem(item.productId)}
                aria-label="Remove from wishlist"
                className="w-9 h-9 shrink-0 rounded-md border border-line text-ink"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}