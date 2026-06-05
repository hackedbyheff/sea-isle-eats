import type { Config } from "tailwindcss";

/**
 * Palette tokens map to the CSS variables defined in app/globals.css (:root).
 * Using `rgb(var(--x) / <alpha-value>)` keeps Tailwind opacity modifiers
 * working (e.g. `text-ink/70`, `bg-teal/[0.08]`). To rebrand, edit the
 * variables in globals.css — not here.
 */
const withAlpha = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: withAlpha("--color-page"),
        ink: withAlpha("--color-ink"),
        cream: withAlpha("--color-cream"),
        coral: withAlpha("--color-coral"),
        teal: withAlpha("--color-teal"),
        "sand-deep": withAlpha("--color-sand-deep"),
        // Admin status tones (fixed — semantic, read fine on any background).
        "status-verified": "#2F7A6E",
        "status-verified-bg": "#D7EBE5",
        "status-needscall": "#E8674C",
        "status-needscall-bg": "#FBE2DB",
        "status-unverified": "#9A8C72",
        "status-unverified-bg": "#EFE3CC",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
