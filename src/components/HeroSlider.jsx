"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Maps a 9-point anchor ("top-left".."bottom-right", "middle-center") to the
// classes that position an absolutely-positioned block inside the banner.
const ANCHOR_CLASSES = {
  "top-left": "top-5 left-5 md:top-10 md:left-14 items-start text-left",
  "top-center": "top-5 left-1/2 -translate-x-1/2 md:top-10 items-center text-center",
  "top-right": "top-5 right-5 md:top-10 md:right-14 items-end text-right",
  "middle-left": "top-1/2 -translate-y-1/2 left-5 md:left-14 items-start text-left",
  "middle-center": "top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 items-center text-center",
  "middle-right": "top-1/2 -translate-y-1/2 right-5 md:right-14 items-end text-right",
  "bottom-left": "bottom-5 left-5 md:bottom-10 md:left-14 items-start text-left",
  "bottom-center": "bottom-5 left-1/2 -translate-x-1/2 md:bottom-10 items-center text-center",
  "bottom-right": "bottom-5 right-5 md:bottom-10 md:right-14 items-end text-right",
};

function anchorClasses(position, fallback = "middle-left") {
  return ANCHOR_CLASSES[position] || ANCHOR_CLASSES[fallback];
}

export default function HeroSlider({ slides }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides]);

  if (!slides || slides.length === 0) return null;

  const goTo = (i) => setIndex(i);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <section className="relative px-4 md:px-8 my-4 md:my-6 max-w-[1280px] mx-auto">
      <div className="relative rounded-2xl overflow-hidden min-h-[320px] md:min-h-[480px] bg-beige">
        <div
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{
            width: `${slides.length * 100}%`,
            transform: `translateX(-${index * (100 / slides.length)}%)`,
          }}
        >
          {slides.map((banner) => {
            const hasText = banner.eyebrow || banner.title || banner.subtitle;
            return (
              <div key={banner.id} className="relative shrink-0" style={{ width: `${100 / slides.length}%` }}>
                <img
                  src={banner.imageUrl}
                  alt={banner.title || "Banner"}
                  className="w-full h-full object-cover min-h-[320px] md:min-h-[480px]"
                />

                {/* Text block (eyebrow/title/subtitle) - positioned independently of the
                    button below, so it can be moved out of the way of a pre-designed
                    image. Only rendered when there's actually text to show. */}
                {hasText && (
                  <div className={`absolute flex flex-col max-w-[420px] px-2 ${anchorClasses(banner.textPosition)}`}>
                    <div className="bg-charcoal/45 backdrop-blur-[2px] rounded-lg px-4 py-3 md:px-5 md:py-4">
                      {banner.eyebrow && (
                        <div className="text-[10px] tracking-[0.25em] font-bold text-gold-accent mb-2">
                          {banner.eyebrow}
                        </div>
                      )}
                      {banner.title && (
                        <h1 className="font-serif text-2xl md:text-4xl text-white leading-tight mb-2">
                          {banner.title}
                        </h1>
                      )}
                      {banner.subtitle && (
                        <p className="text-[13px] md:text-sm text-white/85 leading-relaxed">
                          {banner.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* CTA button - positioned independently, and always shown regardless of
                    whether title/subtitle are set (fixes it disappearing when Title was
                    left blank on purpose because the image already has its own text). */}
                <div className={`absolute flex px-2 ${anchorClasses(banner.buttonPosition, "bottom-left")}`}>
                  <Link
                    href={banner.linkUrl || "/shop"}
                    className="inline-block bg-white text-ink text-xs font-bold tracking-wide px-6 py-3 rounded-md shadow-md hover:bg-gold-accent hover:text-white transition-colors"
                  >
                    {banner.buttonText || "Shop Now"} →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {slides.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 hover:bg-white flex items-center justify-center text-rose-deep text-lg shadow-md transition-colors"
            >
              ←
            </button>
            <button
              onClick={next}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 hover:bg-white flex items-center justify-center text-rose-deep text-lg shadow-md transition-colors"
            >
              →
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? "w-6 bg-gold-accent" : "w-1.5 bg-white/70"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
