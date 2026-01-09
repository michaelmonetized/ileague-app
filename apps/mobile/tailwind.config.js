/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7c3aed",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#a855f7",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#10b981",
          foreground: "#ffffff",
        },
        background: "#ffffff",
        foreground: "#0f172a",
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },
        border: "#e2e8f0",
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
      },
      fontFamily: {
        sans: ["Inter"],
        display: ["Inter"],
      },
    },
  },
  plugins: [],
};
