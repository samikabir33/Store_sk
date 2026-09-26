"use client";
import { useMemo, useState } from "react";
import { money } from "@/lib/utils";

const TABS = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

function buildBuckets(mode) {
  const now = new Date();
  const buckets = [];

  if (mode === "daily") {
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const end = new Date(start);
      end.setDate(start.getDate() + 1);
      buckets.push({
        label: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        full: start.toDateString(),
        start: start.getTime(),
        end: end.getTime(),
      });
    }
  } else if (mode === "weekly") {
    for (let i = 7; i >= 0; i--) {
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7 + 1);
      const start = new Date(end);
      start.setDate(end.getDate() - 7);
      buckets.push({
        label: `Wk ${8 - i}`,
        full: `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(
          end.getTime() - 86400000
        ).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        start: start.getTime(),
        end: end.getTime(),
      });
    }
  } else if (mode === "monthly") {
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      buckets.push({
        label: start.toLocaleDateString("en-US", { month: "short" }),
        full: start.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        start: start.getTime(),
        end: end.getTime(),
      });
    }
  } else {
    for (let i = 4; i >= 0; i--) {
      const y = now.getFullYear() - i;
      buckets.push({
        label: String(y),
        full: String(y),
        start: new Date(y, 0, 1).getTime(),
        end: new Date(y + 1, 0, 1).getTime(),
      });
    }
  }
  return buckets;
}

function normalize(vals) {
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  if (max === min) return vals.map(() => (max === 0 ? 0 : 0.5));
  return vals.map((v) => (v - min) / (max - min));
}

function buildPath(valuesNorm, w, h, padTop, padBottom) {
  const n = valuesNorm.length;
  const stepX = n > 1 ? w / (n - 1) : 0;
  const points = valuesNorm.map((v, i) => {
    const x = i * stepX;
    const y = padTop + (1 - v) * (h - padTop - padBottom);
    return [x, y];
  });
  const line = points.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  const area =
    line +
    ` L${points[points.length - 1][0].toFixed(1)},${h - padBottom} L${points[0][0].toFixed(1)},${h - padBottom} Z`;
  return { line, area, points };
}

const W = 640;
const H = 260;
const PAD_TOP = 20;
const PAD_BOTTOM = 30;

export default function SalesChart({ orders }) {
  const [mode, setMode] = useState("daily");
  const [hover, setHover] = useState(null);

  const buckets = useMemo(() => buildBuckets(mode), [mode]);

  const data = useMemo(() => {
    return buckets.map((b) => {
      const inBucket = orders.filter((o) => o.createdAt >= b.start && o.createdAt < b.end && o.status !== "cancelled");
      return {
        label: b.label,
        full: b.full,
        sales: inBucket.reduce((s, o) => s + o.total, 0),
        orders: inBucket.length,
      };
    });
  }, [orders, buckets]);

  const salesNorm = normalize(data.map((d) => d.sales));
  const ordersNorm = normalize(data.map((d) => d.orders));
  const salesPath = buildPath(salesNorm, W, H, PAD_TOP, PAD_BOTTOM);
  const ordersPath = buildPath(ordersNorm, W, H, PAD_TOP, PAD_BOTTOM);

  return (
    <div className="card p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="font-serif text-lg">Sales Overview</h3>
        <div className="flex items-center gap-1 bg-pink-lighter rounded-full p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setMode(t.key);
                setHover(null);
              }}
              className={
                "text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors " +
                (mode === t.key ? "bg-white text-pink-deep shadow-sm" : "text-muted hover:text-pink-deep")
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-2 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-pink-deep inline-block" /> Sales
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gold inline-block" /> Orders
        </span>
      </div>

      <div className="relative w-full" style={{ height: 240 }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e8879a" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#e8879a" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1={0}
              x2={W}
              y1={PAD_TOP + f * (H - PAD_TOP - PAD_BOTTOM)}
              y2={PAD_TOP + f * (H - PAD_TOP - PAD_BOTTOM)}
              stroke="#eadfda"
              strokeWidth="1"
            />
          ))}

          <path d={salesPath.area} fill="url(#salesFill)" />
          <path d={salesPath.line} fill="none" stroke="#e8879a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={ordersPath.line} fill="none" stroke="#c9a86a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" />

          {salesPath.points.map((p, i) => (
            <g key={i}>
              <rect
                x={i === 0 ? 0 : (p[0] + salesPath.points[i - 1][0]) / 2}
                y={0}
                width={
                  (i === salesPath.points.length - 1
                    ? W
                    : (p[0] + salesPath.points[i + 1][0]) / 2) -
                  (i === 0 ? 0 : (p[0] + salesPath.points[i - 1][0]) / 2)
                }
                height={H}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
              />
              <circle cx={p[0]} cy={p[1]} r={hover === i ? 5 : 3.5} fill="#e8879a" stroke="white" strokeWidth="1.5" />
              <circle cx={ordersPath.points[i][0]} cy={ordersPath.points[i][1]} r={hover === i ? 4.5 : 3} fill="#c9a86a" stroke="white" strokeWidth="1.5" />
            </g>
          ))}
        </svg>

        {hover !== null && (
          <div
            className="absolute z-10 bg-ink text-white text-[11px] rounded-lg px-3 py-2 shadow-lg pointer-events-none -translate-x-1/2"
            style={{
              left: `${(salesPath.points[hover][0] / W) * 100}%`,
              top: `${Math.max((salesPath.points[hover][1] / H) * 100 - 22, 2)}%`,
            }}
          >
            <div className="font-semibold mb-0.5">{data[hover].full}</div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-mid inline-block" /> Sales: {money(data[hover].sales)}
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" /> Orders: {data[hover].orders}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between text-[10px] text-muted mt-1 px-0.5">
        {data.map((d, i) => (
          <span key={i} className={hover === i ? "text-pink-deep font-semibold" : ""}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
