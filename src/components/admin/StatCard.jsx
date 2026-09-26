import { IconArrowUp, IconArrowDown } from "./icons";

export default function StatCard({ label, value, icon, iconBg, trend }) {
  return (
    <div className="card p-4 md:p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: iconBg || "#fdf1f3", color: "#e8879a" }}
        >
          {icon}
        </div>
      </div>
      <div>
        <div className="text-xl md:text-2xl font-bold leading-tight">{value}</div>
        <div className="text-xs text-muted mt-0.5">{label}</div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-[11px]">
          <span
            className={
              "inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded " +
              (trend.direction === "up"
                ? "text-green-600 bg-green-50"
                : trend.direction === "down"
                ? "text-pink-deep bg-pink-lighter"
                : "text-muted bg-pink-lighter")
            }
          >
            {trend.direction === "up" && <IconArrowUp />}
            {trend.direction === "down" && <IconArrowDown />}
            {trend.pct}%
          </span>
          <span className="text-muted">vs last week</span>
        </div>
      )}
    </div>
  );
}
