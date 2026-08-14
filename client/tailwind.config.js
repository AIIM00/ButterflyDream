/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],

  theme: {
    extend: {
      colors: {
        brand: {
          ivory: "rgb(var(--brand-ivory) / <alpha-value>)",
          surface: "rgb(var(--brand-surface) / <alpha-value>)",
          cream: "rgb(var(--brand-cream) / <alpha-value>)",

          espresso: "rgb(var(--brand-espresso) / <alpha-value>)",
          muted: "rgb(var(--brand-muted) / <alpha-value>)",

          forest: "rgb(var(--brand-forest) / <alpha-value>)",
          emerald: "rgb(var(--brand-emerald) / <alpha-value>)",

          champagne: "rgb(var(--brand-champagne) / <alpha-value>)",

          "champagne-hover":
            "rgb(var(--brand-champagne-hover) / <alpha-value>)",

          "pale-champagne": "rgb(var(--brand-pale-champagne) / <alpha-value>)",

          bronze: "rgb(var(--brand-bronze) / <alpha-value>)",

          "bronze-hover": "rgb(var(--brand-bronze-hover) / <alpha-value>)",

          border: "rgb(var(--brand-border) / <alpha-value>)",

          success: "rgb(var(--brand-success) / <alpha-value>)",
          error: "rgb(var(--brand-error) / <alpha-value>)",
        },
      },

      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
    },
  },

  plugins: [],
};
