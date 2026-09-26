import Link from "next/link";

export default function PromoBanner({
  image = "https://images.unsplash.com/photo-1610030469668-8e9b1a3e5b8b?w=1400&h=700&fit=crop&q=80",
  eyebrow = "NEW SEASON",
  title = "Timeless Styles For Every Occasion",
  subtitle = "Explore the latest trends in ethnic & modern wear.",
  href = "/shop",
  cta = "Shop Collection",
}) {
  return (
    <section className="px-5 md:px-8 pb-8 md:pb-10 max-w-[1280px] mx-auto">
      <div className="relative rounded-2xl overflow-hidden min-h-[220px] md:min-h-[320px] flex items-center bg-charcoal">
        <img
          src={image}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/40 to-transparent" />
        <div className="relative z-10 px-6 md:px-14 py-8 max-w-[440px]">
          {eyebrow && (
            <div className="text-[10px] tracking-[0.2em] font-bold text-gold-accent mb-2">{eyebrow}</div>
          )}
          {title && (
            <h3 className="font-serif text-2xl md:text-4xl text-white leading-tight mb-2">{title}</h3>
          )}
          {subtitle && (
            <p className="text-[12.5px] md:text-sm text-white/80 mb-5">{subtitle}</p>
          )}
          <Link
            href={href}
            className="inline-block bg-white text-ink text-xs font-bold tracking-wide px-6 py-3 rounded-md hover:bg-gold-accent hover:text-white transition-colors"
          >
            {cta} →
          </Link>
        </div>
      </div>
    </section>
  );
}
