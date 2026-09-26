"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";

export default function ProductActions({ product, sizes, colors, color: colorProp, onColorChange, activeImage }) {
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const router = useRouter();
  const [size, setSize] = useState(sizes[0] || null);
  const [internalColor, setInternalColor] = useState(colors[0] || null);
  const color = colorProp !== undefined ? colorProp : internalColor;
  function setColor(c) {
    if (onColorChange) onColorChange(c);
    else setInternalColor(c);
  }
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const disabled = product.stock <= 0;

  // Use the photo currently shown (matches the selected color, if any) so cart/wishlist show the right image.
  const effectiveProduct = activeImage ? { ...product, images: JSON.stringify([activeImage]) } : product;

  function handleAdd() {
    addItem(effectiveProduct, qty, size, color);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div>
      {sizes.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-sans font-semibold mb-2">Size</div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`w-10 h-10 rounded-md border text-xs font-sans font-semibold ${
                  size === s ? "bg-pink-deep text-white border-pink-deep" : "border-line text-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-sans font-semibold mb-2">Color</div>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`px-3 h-9 rounded-md border text-xs font-sans font-semibold ${
                  color === c ? "bg-pink-deep text-white border-pink-deep" : "border-line text-ink"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.description && (
        <div className="mb-4">
          <div className="text-xs font-sans font-semibold mb-1.5">Product Description:</div>
          <p className="text-sm text-muted leading-relaxed break-words">{product.description}</p>
        </div>
      )}

      <div className="text-xs font-sans mb-5">
        {product.stock > 0 ? (
          <span className="text-green-700 font-semibold">
            In Stock {product.stock <= 5 ? `— Only ${product.stock} left!` : ""}
          </span>
        ) : (
          <span className="text-pink-deep font-semibold">Out of Stock</span>
        )}
      </div>

      <div className="mb-5">
        <div className="text-xs font-sans font-semibold mb-2">Quantity</div>
        <div className="flex items-center gap-3 font-sans">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 border border-line rounded-md">−</button>
          <span className="w-6 text-center">{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} className="w-9 h-9 border border-line rounded-md">+</button>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={handleAdd} disabled={disabled} className="btn-primary flex-1 disabled:opacity-40">
          {disabled ? "Out of Stock" : added ? "Added ✓" : "Add to Cart"}
        </button>
        <button
          onClick={() => { addItem(effectiveProduct, qty, size, color); router.push("/cart"); }}
          disabled={disabled}
          className="btn-outline flex-1 disabled:opacity-40"
        >
          Buy Now
        </button>
        <button
          onClick={() => toggleItem(effectiveProduct)}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`w-11 h-11 shrink-0 rounded-md border flex items-center justify-center text-lg ${
            wishlisted ? "bg-pink-deep text-white border-pink-deep" : "border-line text-ink"
          }`}
        >
          {wishlisted ? "♥" : "♡"}
        </button>
      </div>
    </div>
  );
}
