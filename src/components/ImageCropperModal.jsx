"use client";
import { useEffect, useRef, useState } from "react";

// Instagram-style image adjuster: shows the picked image inside a fixed-aspect
// frame, lets the user drag to reposition, pinch/scroll/slide to zoom (always
// around the cursor / fingers, never leaving blank space), then
// exports exactly what's inside the frame as a JPEG blob. One reusable
// component, configured per use-case (profile photo, About Us photo, hero
// banner, promo banner, product photo, ...) via props — no duplicated
// cropper code anywhere else in the app.
//
// Props:
//   file          - the raw File (or cropped Blob re-edited) the user just picked
//   aspectRatio / aspect  - frame width / height, e.g. 1 for square, 4/5 portrait,
//                           16/7 for a wide hero banner
//   cropShape / shape     - "circle" | "arch" | "rect" — only affects the visual
//                           mask; the exported image is always a plain rectangle
//   minZoom, maxZoom      - zoom range (default 1x–3x)
//   initialZoom           - starting zoom level (default 1x = fits the frame)
//   outputWidth           - export resolution width in px (height derived from aspect,
//                           or pass outputHeight to override)
//   imageType / title     - label shown in the modal header, e.g. "profile photo"
//   onCancel(), onSave(blob)
export default function ImageCropperModal({
  file,
  aspect,
  aspectRatio,
  shape,
  cropShape,
  minZoom = 1,
  maxZoom = 3,
  initialZoom = 1,
  outputWidth = 800,
  outputHeight,
  imageType,
  title,
  onCancel,
  onSave,
}) {
  const ratio = aspectRatio || aspect || 1;
  const maskShape = cropShape || shape || "rect";

  // Frame sizes itself to the aspect ratio while staying comfortably inside
  // the viewport — so a tall circular profile crop and a wide hero-banner
  // crop both feel right, on desktop and mobile alike.
  const [viewport, setViewport] = useState({ w: 400, h: 800 });
  useEffect(() => {
    function update() {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxFrameW = Math.min(420, viewport.w - 64);
  const maxFrameH = Math.min(420, viewport.h * 0.48);
  const FRAME_W = Math.max(160, Math.min(maxFrameW, maxFrameH * ratio));
  const FRAME_H = FRAME_W / ratio;

  const [imgUrl, setImgUrl] = useState(null);
  const [natural, setNatural] = useState(null); // { w, h }
  // zoom = multiplier on the "cover" size; (x, y) = top-left of the scaled
  // image in frame px. Kept in a ref too so gestures / animation frames /
  // save always read the latest value (no stale closures).
  const [view, setView] = useState({ zoom: initialZoom, x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const imgRef = useRef(null);
  const frameRef = useRef(null);
  const viewRef = useRef(view);
  const geomRef = useRef({});
  const pointersRef = useRef(new Map()); // pointerId -> { x, y } in frame px
  const gestureRef = useRef(null); // active drag or pinch
  const animRef = useRef(null); // eased zoom target (wheel / reset)
  const inertiaRef = useRef(null); // { vx, vy } px/ms after a flick
  const rafRef = useRef(0);
  const wheelHandlerRef = useRef(null);
  const prevFrameRef = useRef(null);

  // Tuning: light easing + gentle inertia, nothing flashy.
  const EASE_MS = 90; // zoom easing time-constant
  const FRICTION_MS = 240; // flick decay time-constant

  // ---- geometry -----------------------------------------------------------
  // The image is laid out at its "cover" size (fills the frame exactly) and
  // then scaled by `zoom` with a CSS transform. Zoom is never allowed below
  // 1x cover, so the frame can never show blank space.
  const baseScale = natural ? Math.max(FRAME_W / natural.w, FRAME_H / natural.h) : 1;
  const baseW = natural ? Math.max(natural.w * baseScale, FRAME_W) : FRAME_W;
  const baseH = natural ? Math.max(natural.h * baseScale, FRAME_H) : FRAME_H;
  const zMin = Math.max(minZoom, 1);
  const zMax = Math.max(maxZoom, zMin);
  geomRef.current = { FRAME_W, FRAME_H, baseW, baseH, zMin, zMax, ready: !!natural };
  wheelHandlerRef.current = handleWheel;

  function clampZoom(z) {
    const g = geomRef.current;
    return Math.min(g.zMax, Math.max(g.zMin, z));
  }

  // Keep the scaled image covering the frame on every side.
  function clampPos(x, y, z) {
    const g = geomRef.current;
    return {
      x: Math.min(0, Math.max(g.FRAME_W - g.baseW * z, x)),
      y: Math.min(0, Math.max(g.FRAME_H - g.baseH * z, y)),
    };
  }

  function commit(v) {
    viewRef.current = v;
    setView(v);
  }

  // New view at `newZoom` that keeps the image point currently under the
  // frame-space focal point (fx, fy) exactly where it is.
  function zoomAt(newZoom, fx, fy, from = viewRef.current) {
    const z = clampZoom(newZoom);
    const ix = (fx - from.x) / from.zoom;
    const iy = (fy - from.y) / from.zoom;
    return { zoom: z, ...clampPos(fx - ix * z, fy - iy * z, z) };
  }

  function toFrame(e) {
    const el = frameRef.current;
    const r = el.getBoundingClientRect();
    return { x: e.clientX - r.left - el.clientLeft, y: e.clientY - r.top - el.clientTop };
  }

  function stopMotion() {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    animRef.current = null;
    inertiaRef.current = null;
  }

  // One rAF loop drives both the eased zoom and post-flick inertia.
  function runLoop() {
    if (rafRef.current) return;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(now - last, 50);
      last = now;
      let keep = false;

      const a = animRef.current;
      if (a) {
        const v = viewRef.current;
        const k = 1 - Math.exp(-dt / EASE_MS);
        let z = v.zoom + (a.zoom - v.zoom) * k;
        if (Math.abs(a.zoom - z) < 0.0005) z = a.zoom;
        let next;
        if (a.pos) {
          // reset: ease position as well
          let x = v.x + (a.pos.x - v.x) * k;
          let y = v.y + (a.pos.y - v.y) * k;
          if (Math.abs(a.pos.x - x) < 0.05) x = a.pos.x;
          if (Math.abs(a.pos.y - y) < 0.05) y = a.pos.y;
          next = { zoom: z, ...clampPos(x, y, z) };
          if (z === a.zoom && next.x === a.pos.x && next.y === a.pos.y) animRef.current = null;
          else keep = true;
        } else {
          // wheel / slider: focal point stays pinned under the cursor
          next = { zoom: z, ...clampPos(a.fx - a.ix * z, a.fy - a.iy * z, z) };
          if (z === a.zoom) animRef.current = null;
          else keep = true;
        }
        commit(next);
      }

      const m = inertiaRef.current;
      if (m) {
        const v = viewRef.current;
        const f = Math.exp(-dt / FRICTION_MS);
        m.vx *= f;
        m.vy *= f;
        const wantX = v.x + m.vx * dt;
        const wantY = v.y + m.vy * dt;
        const p = clampPos(wantX, wantY, v.zoom);
        if (p.x !== wantX) m.vx = 0;
        if (p.y !== wantY) m.vy = 0;
        commit({ zoom: v.zoom, x: p.x, y: p.y });
        if (Math.hypot(m.vx, m.vy) < 0.02) inertiaRef.current = null;
        else keep = true;
      }

      rafRef.current = keep ? requestAnimationFrame(tick) : 0;
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function centeredView(w, h, z) {
    const bs = Math.max(FRAME_W / w, FRAME_H / h);
    const bw = Math.max(w * bs, FRAME_W);
    const bh = Math.max(h * bs, FRAME_H);
    return { zoom: z, x: (FRAME_W - bw * z) / 2, y: (FRAME_H - bh * z) / 2 };
  }

  // Load the picked file into an <img> and figure out its natural size.
  useEffect(() => {
    if (!file) return;
    setLoadError(false);
    stopMotion();
    pointersRef.current.clear();
    gestureRef.current = null;
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    const im = new Image();
    im.onload = () => {
      const w = im.naturalWidth || im.width || 1;
      const h = im.naturalHeight || im.height || 1;
      const z = Math.min(zMax, Math.max(zMin, initialZoom));
      setNatural({ w, h });
      commit(centeredView(w, h, z));
    };
    im.onerror = () => setLoadError(true);
    im.src = url;
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  // Stop any running animation when the modal goes away.
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // If the frame is resized (window resize / rotation), scale the position
  // along with it so the framing the user chose is preserved.
  useEffect(() => {
    const prev = prevFrameRef.current;
    prevFrameRef.current = { w: FRAME_W, h: FRAME_H };
    if (!prev || !natural || (prev.w === FRAME_W && prev.h === FRAME_H)) return;
    const s = FRAME_W / prev.w;
    const v = viewRef.current;
    commit({ zoom: v.zoom, ...clampPos(v.x * s, v.y * s, v.zoom) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [FRAME_W, FRAME_H]);

  // Wheel must be a non-passive native listener, otherwise the browser
  // ignores preventDefault() and the page scrolls behind the modal.
  const frameMounted = !!imgUrl && !loadError;
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const onWheel = (e) => wheelHandlerRef.current && wheelHandlerRef.current(e);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [frameMounted]);

  if (!file || !imgUrl) return null;

  // ---- pointer (mouse / touch / pen) : drag + pinch ------------------------
  function beginGesture() {
    const pts = [...pointersRef.current.values()];
    const v = viewRef.current;
    if (pts.length >= 2) {
      const [a, b] = pts;
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      gestureRef.current = {
        type: "pinch",
        dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        zoom: v.zoom,
        ix: (mid.x - v.x) / v.zoom, // image point under the fingers' midpoint
        iy: (mid.y - v.y) / v.zoom,
      };
    } else if (pts.length === 1) {
      gestureRef.current = {
        type: "drag",
        sx: pts[0].x,
        sy: pts[0].y,
        ox: v.x,
        oy: v.y,
        lastT: performance.now(),
        lastX: v.x,
        lastY: v.y,
        vx: 0,
        vy: 0,
      };
    } else {
      gestureRef.current = null;
    }
  }

  function handlePointerDown(e) {
    if (!natural) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    stopMotion();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    pointersRef.current.set(e.pointerId, toFrame(e));
    beginGesture();
  }

  function handlePointerMove(e) {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, toFrame(e));
    const gst = gestureRef.current;
    if (!gst) return;
    e.preventDefault();

    if (gst.type === "pinch") {
      const [a, b] = [...pointersRef.current.values()];
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const z = clampZoom(gst.zoom * (d / gst.dist));
      // zoom around the fingers AND follow them if they travel (2-finger pan)
      commit({ zoom: z, ...clampPos(mid.x - gst.ix * z, mid.y - gst.iy * z, z) });
      return;
    }

    const p = pointersRef.current.get(e.pointerId);
    const v = viewRef.current;
    const pos = clampPos(gst.ox + (p.x - gst.sx), gst.oy + (p.y - gst.sy), v.zoom);
    const dt = e.timeStamp - gst.lastT;
    if (dt > 0) {
      gst.vx = gst.vx * 0.5 + ((pos.x - gst.lastX) / dt) * 0.5;
      gst.vy = gst.vy * 0.5 + ((pos.y - gst.lastY) / dt) * 0.5;
    }
    gst.lastT = e.timeStamp;
    gst.lastX = pos.x;
    gst.lastY = pos.y;
    commit({ zoom: v.zoom, ...pos });
  }

  function handlePointerUp(e) {
    if (!pointersRef.current.has(e.pointerId)) return;
    const g0 = gestureRef.current;
    pointersRef.current.delete(e.pointerId);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    // Flick: only if the finger/mouse was still moving when released.
    if (g0 && g0.type === "drag" && e.type === "pointerup" && pointersRef.current.size === 0) {
      const idle = e.timeStamp - g0.lastT;
      if (idle < 80 && Math.hypot(g0.vx, g0.vy) > 0.05) {
        inertiaRef.current = { vx: g0.vx, vy: g0.vy };
        runLoop();
      }
    }
    // Lifting one finger after a pinch resumes as a plain drag with the
    // remaining finger instead of ending the gesture.
    beginGesture();
  }

  // ---- wheel zoom (desktop, incl. trackpad pinch) --------------------------
  function handleWheel(e) {
    e.preventDefault();
    const g = geomRef.current;
    if (!g.ready) return;
    let dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 16;
    else if (e.deltaMode === 2) dy *= g.FRAME_H;
    dy = Math.max(-120, Math.min(120, dy));
    const k = e.ctrlKey ? 0.012 : 0.002; // trackpad pinch reports tiny deltas

    inertiaRef.current = null;
    const v = viewRef.current;
    const a = animRef.current;
    // accumulate on the pending target so fast wheel spins feel continuous
    const from = a && !a.pos ? a.zoom : v.zoom;
    const target = clampZoom(from * Math.exp(-dy * k));
    const p = toFrame(e);
    animRef.current = {
      zoom: target,
      fx: p.x,
      fy: p.y,
      ix: (p.x - v.x) / v.zoom, // image point under the cursor stays put
      iy: (p.y - v.y) / v.zoom,
    };
    runLoop();
  }

  // ---- slider / reset -----------------------------------------------------
  function handleSlider(val) {
    stopMotion();
    commit(zoomAt(val, FRAME_W / 2, FRAME_H / 2));
  }

  function handleReset() {
    if (!natural) return;
    stopMotion();
    const t = centeredView(natural.w, natural.h, clampZoom(initialZoom));
    animRef.current = { zoom: t.zoom, pos: clampPos(t.x, t.y, t.zoom) };
    runLoop();
  }

  async function handleSave() {
    if (!natural || saving) return;
    // Freeze whatever is on screen (cancel any easing / inertia) and export
    // exactly that zoom + position.
    stopMotion();
    const { zoom: z, x, y } = viewRef.current;
    setSaving(true);
    const outW = outputWidth;
    const outH = outputHeight || Math.round(outW / ratio);
    const outScale = outW / FRAME_W;

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      imgRef.current,
      0, 0, natural.w, natural.h,
      x * outScale, y * outScale, baseW * z * outScale, baseH * z * outScale
    );

    canvas.toBlob(
      (blob) => {
        setSaving(false);
        if (blob) onSave(blob);
      },
      "image/jpeg",
      0.92
    );
  }

  const maskClass =
    maskShape === "circle" ? "rounded-full" : maskShape === "arch" ? "rounded-t-full rounded-b-2xl" : "rounded-lg";
  const zoom = view.zoom;
  const zoomPct = Math.round(zoom * 100);
  const heading = title || (imageType ? `Adjust ${imageType}` : "Adjust photo");

  return (
    <div className="fixed inset-0 z-[100] bg-ink/60 flex items-center justify-center p-4">
      <div className="card w-full max-w-sm p-5">
        <h3 className="font-serif text-lg mb-1">{heading}</h3>

        {loadError ? (
          <>
            <p className="text-[12px] text-pink-deep mb-4">
              This file couldn't be opened as an image. Please choose a different photo.
            </p>
            <div className="flex justify-end">
              <button type="button" onClick={onCancel} className="btn-primary !py-2 !px-5 !text-xs">
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[11px] text-muted mb-4">
              Drag to reposition, pinch or scroll to zoom — just like adjusting a profile photo.
            </p>

            <div
              ref={frameRef}
              className={`relative mx-auto select-none touch-none overflow-hidden bg-beige border border-line ${maskClass}`}
              style={{ width: FRAME_W, height: FRAME_H, cursor: "grab" }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <img
                ref={imgRef}
                src={imgUrl}
                alt=""
                draggable={false}
                className="absolute top-0 left-0 pointer-events-none"
                style={{
                  width: baseW,
                  height: baseH,
                  maxWidth: "none",
                  transformOrigin: "0 0",
                  transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.zoom})`,
                  willChange: "transform",
                }}
              />
              {/* mask overlay so the shape's edge reads clearly even while dragging */}
              <div className="absolute inset-0 ring-1 ring-inset ring-gold-accent/60 pointer-events-none" />
            </div>

            <div className="flex items-center gap-3 mt-4">
              <span className="text-[11px] text-muted shrink-0">Zoom</span>
              <input
                type="range"
                min={zMin}
                max={zMax}
                step="0.01"
                value={zoom}
                onChange={(e) => handleSlider(parseFloat(e.target.value))}
                className="w-full accent-pink-deep"
              />
              <span className="text-[11px] text-muted shrink-0 w-10 text-right tabular-nums">{zoomPct}%</span>
            </div>

            <div className="flex items-center justify-between mt-1">
              <button type="button" onClick={handleReset} className="text-[11px] font-semibold text-muted underline underline-offset-2">
                Reset
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={onCancel} className="text-xs font-semibold text-muted px-4 py-2">
                  Cancel
                </button>
                <button type="button" onClick={handleSave} disabled={saving} className="btn-primary !py-2 !px-5 !text-xs">
                  {saving ? "Saving..." : "Save photo"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
