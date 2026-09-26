import { db } from "@/db";
import { banners } from "@/db/schema";
import { eq, asc, and } from "drizzle-orm";

export const metadata = {
  title: "About Us",
  description:
    "Learn about Fahmida's Fashion — a Bangladesh-based women's fashion brand offering premium sarees, three-piece sets, salwar kameez, and party wear with a focus on quality and timeless style.",
};

const FEATURES = [
  {
    title: "Premium Quality",
    desc: "Only the finest fabrics and craftsmanship.",
    icon: (
      <path d="M6 3h12l3 5-9 13L3 8l3-5Z M3 8h18 M9 3l-2 5 5 13 5-13-2-5" />
    ),
  },
  {
    title: "Elegant Designs",
    desc: "Trendy, timeless and made for you.",
    icon: <path d="M12 20.3s-7-4.4-9.3-8.7C1.2 8.6 3 5.5 6.2 5.2c1.9-.2 3.5.8 5.8 3 2.3-2.2 3.9-3.2 5.8-3 3.2.3 5 3.4 3.5 6.4C19 15.9 12 20.3 12 20.3Z" />,
  },
  {
    title: "Comfort First",
    desc: "Feel good in every move you make.",
    icon: <path d="M6 20c0-5.5 2-9 6-9s6 3.5 6 9 M12 11V4 M9 6.5c1-1.2 4-1.2 6 1.5" />,
  },
  {
    title: "Trusted by Thousands",
    desc: "Your satisfaction means everything.",
    icon: <path d="M12 3 5 5.5V11c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V5.5L12 3Zm-2.5 8.5 1.8 1.8 3.2-3.6" />,
  },
];

function FlowerFlourish(props) {
  return (
    <svg viewBox="0 0 160 160" fill="none" stroke="currentColor" strokeWidth="1" {...props}>
      <path d="M80 20c30 10 50 35 55 65-30 5-55-10-70-35" />
      <path d="M20 90c25 5 45 25 50 55-30 0-55-20-60-50" />
      <circle cx="82" cy="82" r="3" fill="currentColor" stroke="none" />
      <path d="M82 82c-15-10-30-8-45 5" />
      <path d="M82 82c8-18 22-25 40-22" />
    </svg>
  );
}

export default async function AboutPage() {
  // Admin-managed via /admin/banners (Placement: "About Us Photo") — falls
  // back to a placeholder photo when none has been added yet.
  const aboutBanner = await db
    .select()
    .from(banners)
    .where(and(eq(banners.placement, "about"), eq(banners.active, 1)))
    .orderBy(asc(banners.sortOrder))
    .get();

  const aboutPhoto =
    aboutBanner?.imageUrl ||
    "https://images.unsplash.com/photo-1610030469668-8e9b1a3e5b8b?w=1000&h=1250&fit=crop&q=80";
  const aboutPhotoAlt = aboutBanner?.title || "A woman wearing an elegant embroidered outfit from Fahmida's Fashion";

  return (
    <main className="bg-cream">
      {/* Intro: story + photo */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 py-14 md:py-20 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[11px] tracking-[0.25em] font-bold text-gold-accent">ABOUT US</span>
            <span className="h-px w-10 bg-gold-accent/50" />
          </div>
          <h1 className="font-serif text-4xl md:text-[42px] leading-tight text-ink mb-1">
            More Than Just Fashion
          </h1>
          <p className="font-script text-4xl md:text-5xl text-gold-accent mb-6">It's a Lifestyle</p>

          <p className="text-[15px] text-muted leading-relaxed mb-4 max-w-[460px]">
            Fahmida's Fashion brings timeless, elegant clothing to women across Bangladesh — crafted
            with care and designed for everyday confidence.
          </p>
          <p className="text-[15px] text-muted leading-relaxed mb-8 max-w-[460px]">
            From party wear and sarees to everyday kurtis and accessories, every piece is chosen to
            help you feel graceful, comfortable, and yourself.
          </p>

          <div className="flex items-center gap-3 mb-6 max-w-[460px]">
            <span className="h-px flex-1 bg-line" />
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-gold-accent" fill="currentColor">
              <path d="M12 3c2 3 2 6 0 9-2-3-2-6 0-9Zm0 9c3-1 6 0 8 3-3 1-6 0-8-3Zm0 0c-3-1-6 0-8 3 3 1 6 0 8-3Z" />
            </svg>
            <span className="h-px flex-1 bg-line" />
          </div>

          <p className="font-script text-2xl text-rose-deep flex items-center gap-2">
            Thank you for being a part of our journey <span className="text-lg">♡</span>
          </p>
        </div>

        <div className="relative">
          <div className="w-full aspect-[4/5] rounded-t-[999px] rounded-b-2xl overflow-hidden border border-line">
            <img
              src={aboutPhoto}
              alt={aboutPhotoAlt}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="bg-pink-lighter border-y border-line">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-10 md:py-12 grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-line">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex flex-col items-center text-center gap-3 px-4 py-4">
              <div className="w-14 h-14 rounded-full bg-cream border border-line flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#8B6B3D" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  {f.icon}
                </svg>
              </div>
              <div>
                <div className="text-sm font-bold text-ink">{f.title}</div>
                <p className="text-xs text-muted mt-1 leading-relaxed max-w-[160px]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="relative overflow-hidden py-16 md:py-20 px-6 text-center">
        <FlowerFlourish className="absolute -left-4 bottom-0 w-40 h-40 text-gold-accent/15 pointer-events-none" />
        <FlowerFlourish className="absolute -right-4 bottom-0 w-40 h-40 text-gold-accent/15 pointer-events-none scale-x-[-1]" />

        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="h-px w-10 bg-gold-accent/50" />
          <span className="text-[11px] tracking-[0.25em] font-bold text-gold-accent">OUR MISSION</span>
          <span className="h-px w-10 bg-gold-accent/50" />
        </div>
        <h2 className="font-serif text-3xl md:text-[34px] text-ink mb-3">
          Empowering Women Through Fashion
        </h2>
        <p className="text-sm text-muted max-w-[460px] mx-auto leading-relaxed mb-6">
          We believe every woman deserves to feel beautiful, confident and special — no matter the
          occasion.
        </p>
        <div className="flex items-center justify-center gap-3 max-w-[300px] mx-auto">
          <span className="h-px flex-1 bg-line" />
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-gold-accent" fill="currentColor">
            <path d="M12 3c2 3 2 6 0 9-2-3-2-6 0-9Zm0 9c3-1 6 0 8 3-3 1-6 0-8-3Zm0 0c-3-1-6 0-8 3 3 1 6 0 8-3Z" />
          </svg>
          <span className="h-px flex-1 bg-line" />
        </div>
      </section>
    </main>
  );
}
