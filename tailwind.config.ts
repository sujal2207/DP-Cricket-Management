import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        surface: {
          light: "#ffffff",
          dark: "#0f172a",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-noto-sans-gujarati)",
          "Noto Sans Gujarati",
          "var(--font-hind-vadodara)",
          "Hind Vadodara",
          "var(--font-inter)",
          "sans-serif",
        ],
        gujarati: [
          "var(--font-noto-sans-gujarati)",
          "Noto Sans Gujarati",
          "var(--font-hind-vadodara)",
          "Hind Vadodara",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.2), 0 0 0 1px rgb(255 255 255 / 0.03)",
        "card-hover": "0 12px 24px -8px rgb(0 0 0 / 0.35), 0 0 0 1px rgb(255 255 255 / 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
