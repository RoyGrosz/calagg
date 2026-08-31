import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0b0d10",
          900: "#10141a",
          800: "#161c24",
          700: "#1e2630",
          600: "#2a3340",
        },
        mist: {
          100: "#e8edf4",
          300: "#b7c2d0",
          500: "#8b97a8",
        },
        mint: {
          300: "#8aefc9",
          400: "#5ee0b5",
          500: "#3cc99a",
        },
        sky: {
          400: "#7ab8ff",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 40px -20px rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
