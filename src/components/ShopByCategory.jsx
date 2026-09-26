"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

// `cats` = [{ id, name, slug, thumbnail }], thumbnail already resolved server-side.
export default function ShopByCategory({ cats }) {
  const trackRef = useRef(null);
  const dragRef = useRef(null); // { startX, scrollLeft, moved }

  // A plain mouse wheel only ever sends vertical deltas, and this row has
  // no native vertical overflow, so without this the browser just scrolls
  // the whole page instead. React's onWheel prop is attached as a passive
  // listener, which silently ignores preventDefault() — so this has to be
  // a real addEventListener with { passive: false } to actually stop the
  // page from scrolling while redirecting the movement into the row.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    function handleWheel(e) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    }
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  if (!cats || cats.length === 0) return null;

  // Click-and-drag panning, so a mouse (no wheel or trackpad handy) can
  // still slide the row by dragging it like a carousel.
  function onPointerDown(e) {
    if (e.pointerType === "touch") return; // touch already scrolls natively
    dragRef.current = { startX: e.clientX, scrollLeft: trackRef.current.scrollLeft, moved: false };
    trackRef.current.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 3) dragRef.current.moved = true;
    trackRef.current.scrollLeft = dragRef.current.scrollLeft - dx;
  }

  function onPointerUp(e) {
    if (!dragRef.current) return;
    if (dragRef.current.moved) {
      // A real drag just happened — swallow the click it would otherwise
      // fire on release so it doesn't navigate to the category page.
      const link = e.target.closest?.("a");
      if (link) {
        const suppress = (ev) => {
          ev.preventDefault();
          link.removeEventListener("click", suppress);
        };
        link.addEventListener("click", suppress, { once: true });
      }
    }
    dragRef.current = null;
  }

  return (
    <section className="px-5 md:px-8 py-8 md:py-10 max-w-[1280px] mx-auto">
      <h2 className="font-sans text-[11px] md:text-xs font-extrabold tracking-[0.2em] text-center text-muted mb-1">
        SHOP BY CATEGORY
      </h2>
      <div className="w-8 h-[2px] bg-gold-accent mx-auto mb-6" />

      {/*
        Outer div is the actual scroll container. Inner row uses `w-fit
        mx-auto` (block-level centering) instead of `justify-center` on the
        flex row — flexbox centering combined with overflow has a
        well-known cross-browser bug where the browser refuses to let you
        scroll past the centered start point. Plain margin:auto centering
        doesn't have that bug. `overscroll-behavior-x: contain` stops any
        leftover horizontal overscroll from chaining to the page as well.
      */}
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className="overflow-x-auto no-scrollbar pb-1 cursor-grab active:cursor-grabbing"
        style={{ overscrollBehaviorX: "contain" }}
      >
        <div className="flex gap-4 md:gap-7 w-fit mx-auto">
          {cats.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className="flex flex-col items-center gap-3 shrink-0 group w-24 md:w-32"
            >
              <div className="w-full aspect-[3/4] rounded-t-full rounded-b-xl overflow-hidden bg-beige border border-line group-hover:border-gold-accent transition-colors">
                {c.thumbnail ? (
                  <img
                    src={c.thumbnail}
                    alt={c.name}
                    draggable={false}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted text-lg font-serif">
                    {c.name.charAt(0)}
                  </div>
                )}
              </div>
              <span className="text-[11.5px] md:text-xs font-semibold text-ink text-center whitespace-nowrap">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
