
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx"
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#0b50da",
        "accent-warm": "#ff9a5c",
        "bg-white": "#ffffff",
        "soft-gray": "#f8fafc",
        "border-subtle": "#f1f5f9"
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"],
        "sans": ["Manrope", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "2xl": "1.5rem",
        "full": "9999px"
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}
