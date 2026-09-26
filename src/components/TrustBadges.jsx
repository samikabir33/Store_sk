// Animated "Free Shipping / Cash on Delivery / Easy Returns / Secure Payment"
// strip shown under the hero banner. Pure CSS + inline SVG, no client JS
// needed, so this stays a server component.
export default function TrustBadges() {
  return (
    <section className="px-5 md:px-8 py-6 md:py-8 max-w-[1280px] mx-auto font-sans">
      <style>{`
        @keyframes tb-truckBounce { 0%,100%{ transform:translateY(0);} 50%{ transform:translateY(-1.3px);} }
        .tb-truckBody{ animation:tb-truckBounce 0.55s ease-in-out infinite; transform-origin:center; transform-box:fill-box; }
        @keyframes tb-wheelSpin { from{ transform:rotate(0deg);} to{ transform:rotate(360deg);} }
        .tb-wheelSpin{ animation:tb-wheelSpin 0.5s linear infinite; transform-box:fill-box; transform-origin:center; }
        @keyframes tb-flowLine { 0%{ opacity:0; transform:translateX(3px);} 25%{ opacity:1; transform:translateX(0);} 75%{ opacity:1; transform:translateX(-2px);} 100%{ opacity:0; transform:translateX(-5px);} }
        .tb-sl1{ animation:tb-flowLine 0.8s linear infinite; }
        .tb-sl2{ animation:tb-flowLine 0.8s linear infinite 0.2s; }
        .tb-sl3{ animation:tb-flowLine 0.8s linear infinite 0.4s; }

        @keyframes tb-coinPulse { 0%,100%{ transform:scale(1);} 50%{ transform:scale(1.08);} }
        .tb-coinPulse{ animation:tb-coinPulse 1.3s ease-in-out infinite; transform-box:fill-box; transform-origin:center; }
        @keyframes tb-ringPulse { 0%,100%{ opacity:0.35; transform:scale(1);} 50%{ opacity:0.9; transform:scale(1.06);} }
        .tb-ringPulse{ animation:tb-ringPulse 1.3s ease-in-out infinite; transform-box:fill-box; transform-origin:center; }

        @keyframes tb-rotateCCW { from{ transform:rotate(0deg);} to{ transform:rotate(-360deg);} }
        .tb-returnSpin{ animation:tb-rotateCCW 2.4s linear infinite; transform-box:fill-box; transform-origin:center; }

        @keyframes tb-shieldDraw { 0%{ stroke-dashoffset:64;} 35%{ stroke-dashoffset:0;} 90%{ stroke-dashoffset:0;} 100%{ stroke-dashoffset:64;} }
        .tb-shieldPath{ stroke-dasharray:64; animation:tb-shieldDraw 3s ease-in-out infinite; }
        @keyframes tb-checkDraw { 0%,40%{ stroke-dashoffset:14;} 60%,90%{ stroke-dashoffset:0;} 100%{ stroke-dashoffset:14;} }
        .tb-checkPath{ stroke-dasharray:14; animation:tb-checkDraw 3s ease-in-out infinite; }

        .tb-noscrollbar{ scrollbar-width:none; -ms-overflow-style:none; }
        .tb-noscrollbar::-webkit-scrollbar{ display:none; }
      `}</style>

      <div className="rounded-[20px] bg-gradient-to-b from-white to-cream border border-line shadow-[0_14px_40px_rgba(43,35,32,0.10),0_2px_6px_rgba(43,35,32,0.06)] overflow-hidden">
        <div className="grid grid-cols-4">
          {/* Free Shipping */}
          <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-1 md:gap-3.5 px-1 md:px-5 py-3 md:py-6 border-r border-line last:border-r-0">
            <div className="w-8 h-8 md:w-[52px] md:h-[52px] shrink-0 flex items-center justify-center">
              <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="tbTruck" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFB25C" />
                    <stop offset="100%" stopColor="#E8582A" />
                  </linearGradient>
                </defs>
                <g className="tb-truckBody" stroke="url(#tbTruck)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 15.5V6.5a1 1 0 0 1 1-1H12v10H2.5Z" fill="rgba(255,150,70,0.16)" />
                  <path d="M12 8.3h3.9L18.5 11.4v4.1H12z" fill="rgba(255,150,70,0.22)" />
                </g>
                <circle className="tb-wheelSpin" cx="6.3" cy="17" r="1.8" fill="none" stroke="#E8582A" strokeWidth="1.5" />
                <line className="tb-wheelSpin" x1="6.3" y1="15.6" x2="6.3" y2="17" stroke="#E8582A" strokeWidth="1" />
                <circle className="tb-wheelSpin" cx="16" cy="17" r="1.8" fill="none" stroke="#E8582A" strokeWidth="1.5" />
                <line className="tb-wheelSpin" x1="16" y1="15.6" x2="16" y2="17" stroke="#E8582A" strokeWidth="1" />
                <line className="tb-sl1" x1="0" y1="9" x2="2" y2="9" stroke="#FFB25C" strokeWidth="1.5" strokeLinecap="round" />
                <line className="tb-sl2" x1="0" y1="11.2" x2="2" y2="11.2" stroke="#FFB25C" strokeWidth="1.5" strokeLinecap="round" />
                <line className="tb-sl3" x1="0" y1="13.4" x2="2" y2="13.4" stroke="#FFB25C" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="text-[8px] md:text-xs font-bold text-ink leading-tight">Free Shipping</div>
              <div className="text-[6.5px] md:text-[11px] text-muted mt-0.5 leading-snug">On orders over ৳1400</div>
            </div>
          </div>

          {/* Cash on Delivery */}
          <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-1 md:gap-3.5 px-1 md:px-5 py-3 md:py-6 border-r border-line last:border-r-0">
            <div className="w-8 h-8 md:w-[52px] md:h-[52px] shrink-0 flex items-center justify-center">
              <svg width="100%" height="100%" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="tbCoin" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4ADE80" />
                    <stop offset="100%" stopColor="#0B7C4B" />
                  </linearGradient>
                </defs>
                <circle className="tb-ringPulse" cx="12" cy="12" r="10" fill="none" stroke="url(#tbCoin)" strokeWidth="1.3" />
                <g className="tb-coinPulse">
                  <circle cx="12" cy="12" r="7.2" fill="none" stroke="url(#tbCoin)" strokeWidth="1.5" />
                  <text x="12" y="15.5" fontSize="10.5" textAnchor="middle" fill="url(#tbCoin)" fontFamily="Georgia, serif" fontWeight="bold">
                    ৳
                  </text>
                </g>
              </svg>
            </div>
            <div>
              <div className="text-[8px] md:text-xs font-bold text-ink leading-tight">Cash on Delivery</div>
              <div className="text-[6.5px] md:text-[11px] text-muted mt-0.5 leading-snug">Available</div>
            </div>
          </div>

          {/* Easy Returns */}
          <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-1 md:gap-3.5 px-1 md:px-5 py-3 md:py-6 border-r border-line last:border-r-0">
            <div className="w-8 h-8 md:w-[52px] md:h-[52px] shrink-0 flex items-center justify-center">
              <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="tbArrow1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#7DB8FF" />
                    <stop offset="100%" stopColor="#2450B0" />
                  </linearGradient>
                  <linearGradient id="tbArrow2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3B6FE0" />
                    <stop offset="100%" stopColor="#12306E" />
                  </linearGradient>
                </defs>
                <g className="tb-returnSpin">
                  <path d="M20 11A8 8 0 0 0 6.34 5.34L4 8" stroke="url(#tbArrow1)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 4V8H8" stroke="url(#tbArrow1)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 13A8 8 0 0 0 17.66 18.66L20 16" stroke="url(#tbArrow2)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 20V16H16" stroke="url(#tbArrow2)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </svg>
            </div>
            <div>
              <div className="text-[8px] md:text-xs font-bold text-ink leading-tight">Easy Returns</div>
              <div className="text-[6.5px] md:text-[11px] text-muted mt-0.5 leading-snug">Within 3 days</div>
            </div>
          </div>

          {/* Secure Payment */}
          <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-1 md:gap-3.5 px-1 md:px-5 py-3 md:py-6">
            <div className="w-8 h-8 md:w-[52px] md:h-[52px] shrink-0 flex items-center justify-center">
              <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="tbShield" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3ED598" />
                    <stop offset="100%" stopColor="#04381F" />
                  </linearGradient>
                </defs>
                <path
                  className="tb-shieldPath"
                  d="M12 3 5.6 5.4v5.4c0 4.4 2.7 7.5 6.4 8.7 3.7-1.2 6.4-4.3 6.4-8.7V5.4L12 3Z"
                  fill="rgba(4,56,31,0.10)"
                  stroke="url(#tbShield)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path className="tb-checkPath" d="M9 12.2 11 14.2 15 9.8" stroke="url(#tbShield)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="text-[8px] md:text-xs font-bold text-ink leading-tight">Secure Payment</div>
              <div className="text-[6.5px] md:text-[11px] text-muted mt-0.5 leading-snug">100% secure</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
