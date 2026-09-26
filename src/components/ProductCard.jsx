"use client";
import Link from "next/link";
import { useWishlist } from "@/components/WishlistContext";
import StarRating from "@/components/StarRating";

export default function ProductCard({ product }) {
  const images = JSON.parse(product.images || "[]");
  const colors = (() => {
    try {
      return JSON.parse(product.colors || "[]");
    } catch {
      return [];
    }
  })();
  const outOfStock = product.stock <= 0;
  const { toggleItem, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const rating = product.avgRating || 0;
  const reviewCount = product.reviewCount || 0;

  function handleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block bg-white border border-line rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-blush">
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {product.isNew === 1 && (
            <span className="bg-charcoal text-white font-sans text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded">
              New
            </span>
          )}
          {hasDiscount && (
            <span className="bg-rose-deep text-white font-sans text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded">
              -{discountPercent}%
            </span>
          )}
        </div>
        {outOfStock && (
          <span className="absolute top-2 right-2 z-10 bg-ink/80 text-white font-sans text-[9px] font-bold px-1.5 py-0.5 rounded">
            SOLD OUT
          </span>
        )}
        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute bottom-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-sm shadow transition-transform group-hover:scale-105 ${
            wishlisted ? "bg-rose-deep text-white" : "bg-white/90 text-ink"
          }`}
        >
          {wishlisted ? "♥" : "♡"}
        </button>
        <img
          src={images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
        {images[1] && (
          <img
            src={images[1]}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
      </div>

      <div className="p-2.5 font-sans">
        <div className="text-[12.5px] mb-1 truncate text-ink">{product.name}</div>

        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          <span className="text-[13px] font-bold text-rose-deep">
            ৳{product.price.toLocaleString("en-BD")}
          </span>
          {hasDiscount && (
            <span className="text-[11px] text-muted line-through">
              ৳{product.compareAtPrice.toLocaleString("en-BD")}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          {reviewCount > 0 ? (
            <div className="flex items-center gap-1">
              <StarRating rating={rating} size={10} />
              <span className="text-[10px] text-muted">({reviewCount})</span>
            </div>
          ) : (
            <span className="text-[10px] text-muted">No reviews yet</span>
          )}

          {colors.length > 0 && (
            <div className="flex items-center gap-1">
              {colors.slice(0, 4).map((c, i) => (
                <span
                  key={i}
                  title={c}
                  className="w-2.5 h-2.5 rounded-full border border-line"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
