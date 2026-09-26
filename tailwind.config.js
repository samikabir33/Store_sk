/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: "#c9a86a",
        "pink-deep": "#e8879a",
        "pink-mid": "#f3b8c4",
        "pink-light": "#fbe3e8",
        "pink-lighter": "#fdf1f3",
        ink: "#2b2320",
        muted: "#8a7a72",
        cream: "#fffaf6",
        line: "#eadfda",

        /* ---- New premium palette (used on the redesigned homepage) ---- */
        ivory: "#FAF7F2",
        beige: "#EDE3DB",
        blush: "#EBC8CB",
        "rose-deep": "#9B5965",
        charcoal: "#24201F",
        "gold-accent": "#C9AA6A",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "Times New Roman", "serif"],
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
      },
    },
  },
  plugins: [],
};
