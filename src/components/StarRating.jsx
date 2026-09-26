export default function StarRating({ rating = 0, size = 12, showEmpty = true }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-[1px] text-gold-accent leading-none">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill={i <= full ? "currentColor" : showEmpty ? "none" : "currentColor"}
          stroke="currentColor"
          strokeWidth={i <= full ? 0 : 1}
          className={i <= full ? "" : "opacity-40"}
        >
          <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L1.3 7.7l6.1-.6L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}
