import type { Config } from "tailwindcss";

/** Colours are CSS variables (see globals.css) so light/dark themes swap at runtime. */
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: v("base"),
        surface: { DEFAULT: v("surface"), 2: v("surface-2") },
        line: v("line"),
        ink: { DEFAULT: v("ink"), 2: v("ink-2"), 3: v("ink-3"), 4: v("ink-4") },
        accent: {
          200: v("accent-200"),
          300: v("accent-300"),
          400: v("accent-400"),
          500: v("accent-500"),
          600: v("accent-600"),
          700: v("accent-700"),
        },
        sugar: { 50: "#fbfcff", 100: "#f4f7fd", 200: "#e8eef9" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "var(--font-ar)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 10px 40px -12px rgb(var(--accent-500) / .45)",
        glass: "0 1px 0 0 rgb(255 255 255 / .35) inset, 0 20px 50px -24px rgb(var(--shadow) / .35)",
      },
      backgroundImage: {
        "accent-gradient": "linear-gradient(135deg, rgb(var(--accent-300)) 0%, rgb(var(--accent-500)) 55%, rgb(var(--accent-700)) 100%)",
        "hero-glow": "radial-gradient(60% 50% at 50% 0%, rgb(var(--accent-400) / .22) 0%, transparent 70%)",
      },
      backdropBlur: { xs: "2px" },
      keyframes: {
        shimmer: { "0%": { backgroundPosition: "-400px 0" }, "100%": { backgroundPosition: "400px 0" } },
        floaty: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        snow: { "0%": { transform: "translateY(-10vh)" }, "100%": { transform: "translateY(110vh)" } },
      },
      animation: { shimmer: "shimmer 1.6s linear infinite", floaty: "floaty 6s ease-in-out infinite" },
    },
  },
  plugins: [],
};
export default config;
