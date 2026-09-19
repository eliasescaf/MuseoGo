/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        fredoka: ["Fredoka_700Bold"],
        nunito: ["Nunito_700Bold", "sans-serif"],
        nunitoBlack: ["Nunito_900Black", "sans-serif"],
      }
    },
  },
  presets: [require("nativewind/preset")],
  plugins: [],
};