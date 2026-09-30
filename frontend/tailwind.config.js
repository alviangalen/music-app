/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0a0b0e",
        surface: "#12141a",
        "surface-card": "#181b24",
        "surface-hover": "#222734",
        accent: {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
          glow: "rgba(99, 102, 241, 0.4)",
        },
        primary: "#f8fafc",
        secondary: "#94a3b8",
        muted: "#64748b",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      keyframes: {
        equalize: {
          "0%, 100%": { height: "4px" },
          "50%": { height: "18px" },
        },
      },
      animation: {
        equalize: "equalize 0.8s ease-in-out infinite",
        "equalize-mid": "equalize 0.6s ease-in-out infinite 0.2s",
        "equalize-slow": "equalize 1s ease-in-out infinite 0.4s",
      },
    },
  },
  plugins: [],
};