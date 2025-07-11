/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography";
import textShadow from "tailwindcss-textshadow";
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FAF8F5",
        "primary-text": "#2E2623",
        "secondary-text": "#7A6C66",
        accent: "#E86E45",
        "accent-light": "#F5DDCF",
        white: "#FFFFFF",
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["Lato", "sans-serif"],
      },
      boxShadow: {
        "2xl-top":
          "0 -20px 25px -5px rgb(0 0 0 / 0.1), 0 -8px 10px -6px rgb(0 0 0 / 0.1)",
      },
      textShadow: {
        md: "0 2px 4px rgb(0 0 0 / 0.30)"
      },
    },
  },
  plugins: [typography, textShadow],
};
