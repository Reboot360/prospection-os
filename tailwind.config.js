/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
 colors: {
  ink: "#163A5F",
  ivory: "#FAF8F3",
  linen: "#E8E2D6",
  champagne: "#D6A84F",
  ocean: "#1E88C8",
  mist: "#EAF5F8"
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
