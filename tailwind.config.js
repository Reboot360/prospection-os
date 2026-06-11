/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0D0D0E",
        ivory: "#F8F5EF",
        linen: "#E6D9C7",
        champagne: "#CBB999",
        ocean: "#0E2A47",
        mist: "#E9EEF2"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"],
        display: ["Cormorant Garamond", "Georgia", "serif"]
      },
      boxShadow: {
        soft: "0 18px 60px rgba(13, 13, 14, 0.10)"
      }
    }
  },
  plugins: []
};
