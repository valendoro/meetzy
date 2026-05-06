import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b0a0f",
        surface: "#16151f",
        "surface-2": "#1e1d2a",
        "surface-3": "#252433",
        border: "#2a2936",
        text: "#f3f1ec",
        muted: "#8f8a82",
        accent: "#7c6cff",
        "accent-2": "#e8a090",
      },
      fontFamily: {
        syne: ["var(--font-syne)", "sans-serif"],
        "dm-sans": ["var(--font-dm-sans)", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "pulse-ring": "pulse-ring 2s ease-out infinite",
        float: "float 4s ease-in-out infinite",
        "slide-up": "slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 0.3s ease-out forwards",
      },
    },
  },
  plugins: [],
} satisfies Config;
