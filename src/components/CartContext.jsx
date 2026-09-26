"use client";
import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const KEY = "ff_cart";

export function CartProvider({ children }) {
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

  function addItem(product, qty = 1, size, color) {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.productId === product.id && i.size === size && i.color === color
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: JSON.parse(product.images || "[]")[0],
          qty,
          size,
          color,
        },
      ];
    });
  }

  function updateQty(productId, size, color, qty) {
    setItems((prev) =>
      prev
        .map((i) =>
          i.productId === productId && i.size === size && i.color === color
            ? { ...i, qty }
            : i
        )
        .filter((i) => i.qty > 0)
    );
  }

  function removeItem(productId, size, color) {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.size === size && i.color === color))
    );
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQty, removeItem, clearCart, subtotal, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
