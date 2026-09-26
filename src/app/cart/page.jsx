"use client";
import Link from "next/link";
import { useCart } from "@/components/CartContext";

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <main className="max-w-[600px] mx-auto px-6 py-16 text-center">
        <div className="text-5xl mb-4">🛍️</div>
        <h1 className="font-serif text-xl mb-2">Your cart is empty</h1>
        <p className="text-sm text-muted mb-6">Looks like you haven't added anything yet.</p>
        <Link href="/shop" className="btn-primary">Start Shopping</Link>
      </main>
    );
  }

  return (
    <main className="max-w-[900px] mx-auto px-5 md:px-8 py-6">
      <h1 className="font-serif text-2xl mb-5">Your Cart</h1>

      <div className="space-y-3 mb-6">
        {items.map((i) => (
          <div key={`${i.productId}-${i.size}-${i.color}`} className="card flex gap-3 p-3">
            <img src={i.image} alt={i.name} className="w-20 h-24 object-cover rounded-lg" />
            <div className="flex-1">
              <div className="text-sm font-semibold">{i.name}</div>
              <div className="text-xs text-muted font-sans mt-0.5">
                {i.size && <span>Size: {i.size} </span>}
                {i.color && <span>· Color: {i.color}</span>}
              </div>
              <div className="text-sm font-bold text-pink-deep mt-1">৳ {i.price.toLocaleString("en-BD")}</div>
              <div className="flex items-center gap-3 mt-2 font-sans">
                <button onClick={() => updateQty(i.productId, i.size, i.color, i.qty - 1)} className="w-7 h-7 border border-line rounded text-xs">−</button>
                <span className="text-xs w-4 text-center">{i.qty}</span>
                <button onClick={() => updateQty(i.productId, i.size, i.color, i.qty + 1)} className="w-7 h-7 border border-line rounded text-xs">+</button>
                <button onClick={() => removeItem(i.productId, i.size, i.color)} className="text-xs text-muted ml-3 underline">Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4 mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted">Subtotal</span>
          <span className="font-bold">৳ {subtotal.toLocaleString("en-BD")}</span>
        </div>
        <p className="text-xs text-muted">Delivery fee & discounts calculated at checkout.</p>
      </div>

      <Link href="/checkout" className="btn-primary w-full text-center block">Proceed to Checkout →</Link>
    </main>
  );
}
