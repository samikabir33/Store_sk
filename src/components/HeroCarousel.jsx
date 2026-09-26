"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function HeroCarousel({ banners }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners.length) return null;

  const b = banners[index];

  function prev() {
    setIndex((i) => (i - 1 + banners.length) % banners.length);
  }
  function next() {
    setIndex((i) => (i + 1) % banners.length);
  }

  return (
    <section className="relative mx-4 md:mx-8 my-4 md:my-6 rounded-2xl overflow-hidden bg-pink-light min-h-[240px] md:min-h-[420px]">
      <Link href={b.linkUrl || "/shop"} className="absolute inset-0 z-0">
        <img
          key={b.id}
          src={b.imageUrl}
          alt={b.title || "Banner"}
          className="w-full h-full object-cover min-h-[240px] md:min-h-[420px]"
        />
      </Link>

      {(b.title || b.subtitle) && (
        <div className="absolute left-5 md:left-14 bottom-6 md:bottom-14 z-10 max-w-[75%] md:max-w-[46%] pointer-events-none">
          {b.subtitle && (
            <div className="font-sans text-[11px] md:text-xs tracking-[2px] text-pink-deep font-bold mb-2 bg-white/85 inline-block px-2 py-0.5 rounded">
              {b.subtitle}
            </div>
          )}
          {b.title && (
            <h1 className="font-serif text-[24px] md:text-5xl leading-tight mb-3 text-ink drop-shadow-[0_1px_6px_rgba(255,255,255,0.7)]">
              {b.title}
            </h1>
          )}
          <Link href={b.linkUrl || "/shop"} className="btn-primary pointer-events-auto inline-block">
            {b.buttonText || "Shop Now"}
          </Link>
        </div>
      )}

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous banner"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 hover:bg-white flex items-center justify-center text-lg"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next banner"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 hover:bg-white flex items-center justify-center text-lg"
          >
            ›
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {banners.map((bn, i) => (
              <button
                key={bn.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to banner ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-pink-deep" : "w-1.5 bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
