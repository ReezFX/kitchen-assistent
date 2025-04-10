/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "#e5e7eb",
        background: "#ffffff",
        foreground: "#111827",
        muted: {
          DEFAULT: "#f3f4f6",
          foreground: "#6b7280",
        },
        black: "#000000",
      },
    },
  },
  plugins: [],
} 