import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // ── Auto Roi brand colors ──────────────────────────────
        "ar-black":       "#0A0A0A",
        "ar-dark":        "#111111",

        // Nuances de gris (toutes les variantes utilisées dans les composants)
        "ar-gray-900":    "#1A1A1A",
        "ar-gray-700":    "#2A2A2A",
        "ar-gray-500":    "#6B6B6B",
        "ar-gray-300":    "#AAAAAA",
        "ar-gray-200":    "#DDDDDD",
        "ar-gray-100":    "#F4F4F4",
        "ar-gray":        "#2A2A2A",  // rétrocompat
        "ar-surface":     "#FAFAFA",

        // Or — accent signature luxe automobile
        "ar-gold":        "#C9A84C",
        "ar-gold-light":  "#F0D080",
        "ar-gold-dark":   "#8B6914",
        "ar-silver":      "#C0C0C0",

        // Services tiers
        "ar-whatsapp":    "#25D366",

        // États sémantiques (hex pour que les modificateurs d'opacité fonctionnent)
        "ar-danger":      "#DC2626",
        "ar-success":     "#22C55E",
        "ar-info":        "#1A3A5C",

        // ── Shadcn/UI CSS variables ───────────────────────────
        border:       "hsl(var(--border))",
        input:        "hsl(var(--input))",
        ring:         "hsl(var(--ring))",
        background:   "hsl(var(--background))",
        foreground:   "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans:    ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-playfair)", "serif"],
        mono:    ["Geist Mono", "Courier New", "monospace"],
      },
      boxShadow: {
        "card":       "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        "gold":       "var(--shadow-gold)",
        "gold-lg":    "var(--shadow-gold-lg)",
        "glow":       "var(--shadow-glow)",
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
