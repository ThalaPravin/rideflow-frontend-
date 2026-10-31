import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#06080D",
          900: "#0A0D14",
          850: "#0E131E",
          800: "#111622",
          700: "#182030",
          600: "#222D42",
          500: "#334155",
        },
        neon: {
          emerald: "#00E599",
          emeraldDark: "#00B377",
          cyan: "#38BDF8",
          purple: "#A855F7",
          amber: "#F59E0B",
          rose: "#F43F5E",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.45)",
        neon: "0 0 25px -4px rgba(0, 229, 153, 0.45)",
        neonSmall: "0 0 12px -2px rgba(0, 229, 153, 0.5)",
        cyanGlow: "0 0 20px -3px rgba(56, 189, 248, 0.4)",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar-ping": "radar 2.5s cubic-bezier(0, 0, 0.2, 1) infinite",
        "float": "float 4s ease-in-out infinite",
      },
      keyframes: {
        radar: {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
