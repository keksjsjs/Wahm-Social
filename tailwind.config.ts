import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#050a18",
          900: "#0a1228",
          800: "#0f1a38",
          700: "#16244a",
          600: "#1f3160",
          500: "#2a4078",
        },
        gold: {
          300: "#f3dc9b",
          400: "#e9c76b",
          500: "#d4a944",
          600: "#b88a2b",
          700: "#8f6a1f",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Tajawal", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        gold: "0 0 0 1px rgba(212,169,68,.35), 0 10px 40px -10px rgba(212,169,68,.25)",
        card: "0 1px 0 0 rgba(255,255,255,.04) inset, 0 20px 50px -20px rgba(0,0,0,.6)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg,#f3dc9b 0%,#d4a944 45%,#8f6a1f 100%)",
        "hero-glow": "radial-gradient(60% 50% at 50% 0%, rgba(212,169,68,.18) 0%, rgba(5,10,24,0) 70%)",
      },
      keyframes: {
        shimmer: { "0%": { backgroundPosition: "-400px 0" }, "100%": { backgroundPosition: "400px 0" } },
        floaty: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
      },
      animation: { shimmer: "shimmer 1.6s linear infinite", floaty: "floaty 5s ease-in-out infinite" },
    },
  },
  plugins: [],
};
export default config;
