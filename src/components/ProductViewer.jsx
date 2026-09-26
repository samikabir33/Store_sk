"use client";
import { useState } from "react";
import ProductActions from "@/components/ProductActions";

function IconZoom(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M21 21l-4.8-4.8" />
      <path d="M10.5 8v5M8 10.5h5" />
    </svg>
  );
}

export default function ProductViewer({ product, images, colorImages, sizes, colors, children }) {
  const [color, setColor] = useState(colors[0] || null);
  const [manualImage, setManualImage] = useState(null); // thumbnail click overrides the color photo

  // Hover-zoom lens (desktop)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // Fullscreen lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoomedIn, setZoomedIn] = useState(false);

  const colorPhoto = color ? colorImages[color] : null;
  const activeImage = manualImage || colorPhoto || images[0];

  function handleColorChange(c) {
    setColor(c);
    setManualImage(null); // switching color should show that color's photo again
  }

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }

  function openLightbox() {
    const idx = images.indexOf(activeImage);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setZoomedIn(false);
    setLightboxOpen(true);
  }

  function prevImage(e) {
    e.stopPropagation();
    setZoomedIn(false);
    setLightboxIndex((i) => (i - 1 + images.length) % images.length);
  }
  function nextImage(e) {
    e.stopPropagation();
    setZoomedIn(false);
    setLightboxIndex((i) => (i + 1) % images.length);
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <div
          className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-pink-light cursor-zoom-in group"
          onMouseMove={handleMouseMove}
          onClick={openLightbox}
        >
          <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />

          {/* Hover zoom lens — desktop only */}
          <div
            className="hidden md:block absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
            style={{
              backgroundImage: `url(${activeImage})`,
              backgroundSize: "220%",
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              backgroundRepeat: "no-repeat",
            }}
          />

          <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center pointer-events-none shadow">
            <IconZoom className="w-[18px] h-[18px] text-ink" />
          </div>
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {images.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setManualImage(url)}
                className={`w-14 h-14 shrink-0 rounded-lg overflow-hidden border-2 ${
                  activeImage === url ? "border-pink-deep" : "border-line"
                }`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        {children}
        <ProductActions
          product={product}
          sizes={sizes}
          colors={colors}
          color={color}
          onColorChange={handleColorChange}
          activeImage={activeImage}
        />
      </div>

      {/* Fullscreen zoom lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center text-xl z-10"
          >
            ✕
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                aria-label="Previous photo"
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center text-2xl z-10"
              >
                ‹
              </button>
              <button
                onClick={nextImage}
                aria-label="Next photo"
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center text-2xl z-10"
              >
                ›
              </button>
            </>
          )}

          <div
            className={`max-w-full max-h-full ${zoomedIn ? "overflow-auto" : "overflow-hidden"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightboxIndex]}
              alt={product.name}
              onClick={() => setZoomedIn((z) => !z)}
              className={
                zoomedIn
                  ? "max-w-none cursor-zoom-out"
                  : "max-w-[92vw] max-h-[82vh] object-contain cursor-zoom-in mx-auto"
              }
            />
          </div>

          {images.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setZoomedIn(false); setLightboxIndex(i); }}
                  aria-label={`Photo ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === lightboxIndex ? "w-5 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}

          <p className="absolute bottom-4 right-4 text-[11px] text-white/60 hidden md:block">
            Click photo to {zoomedIn ? "zoom out" : "zoom in"}
          </p>
        </div>
      )}
    </div>
  );
}
