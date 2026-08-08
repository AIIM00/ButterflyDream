/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],

  theme: {
    extend: {
      colors: {
        brand: {
          ivory: "#F8F5F1",
          surface: "#FFFFFF",
          cream: "#FBF8F3",

          espresso: "#241D20",
          muted: "#6F666A",

          forest: "#163B2B",
          emerald: "#0B2118",

          champagne: "#C9A66B",
          "champagne-hover": "#B78F54",
          "pale-champagne": "#F2E8D8",

          bronze: "#6B4A2E",
          "bronze-hover": "#513720",

          border: "#E6DFDA",

          success: "#367056",
          error: "#A94747",
        },
      },

      fontFamily: {
        display: ["Bodoni Moda", "Georgia", "serif"],

        body: [
          "Manrope",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
      },
    },
  },

  plugins: [],
};
