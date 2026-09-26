"use client";
import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext(null);
const KEY = "ff_wishlist";

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, loaded]);

  function isWishlisted(productId) {
    return items.some((i) => i.productId === productId);
  }

  function addItem(product) {
    setItems((prev) => {
      if (prev.some((i) => i.productId === product.id)) return prev;
      return [
        ...prev,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: JSON.parse(product.images || "[]")[0],
        },
      ];
    });
  }

  function removeItem(productId) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function toggleItem(product) {
    setItems((prev) => {
      if (prev.some((i) => i.productId === product.id)) {
        return prev.filter((i) => i.productId !== product.id);
      }
      return [
        ...prev,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: JSON.parse(product.images || "[]")[0],
        },
      ];
    });
  }

  const count = items.length;

  return (
    <WishlistContext.Provider
      value={{ items, addItem, removeItem, toggleItem, isWishlisted, count }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}