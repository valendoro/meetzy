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
        bg: "#080808",
        surface: "#111111",
        "surface-2": "#1a1a1a",
        border: "#222222",
        text: "#F0EDE8",
        muted: "#6b6b6b",
        accent: "#6366f1",
        "accent-2": "#8b5cf6",
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
