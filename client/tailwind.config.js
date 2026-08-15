/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],

  theme: {
    extend: {
      colors: {
        brand: {
          /*
           * Backgrounds
           */
          page: "rgb(var(--theme-page) / <alpha-value>)",

          surface: "rgb(var(--theme-surface) / <alpha-value>)",

          "surface-soft": "rgb(var(--theme-surface-soft) / <alpha-value>)",

          "dark-surface": "rgb(var(--theme-dark-surface) / <alpha-value>)",

          /*
           * Text
           */
          text: "rgb(var(--theme-text) / <alpha-value>)",

          "text-muted": "rgb(var(--theme-text-muted) / <alpha-value>)",

          /*
           * Primary actions
           */
          primary: "rgb(var(--theme-primary) / <alpha-value>)",

          "primary-hover": "rgb(var(--theme-primary-hover) / <alpha-value>)",

          /*
           * Accents
           */
          "accent-fill": "rgb(var(--theme-accent-fill) / <alpha-value>)",

          "accent-fill-hover":
            "rgb(var(--theme-accent-fill-hover) / <alpha-value>)",

          "accent-soft": "rgb(var(--theme-accent-soft) / <alpha-value>)",

          "accent-text": "rgb(var(--theme-accent-text) / <alpha-value>)",

          "accent-text-hover":
            "rgb(var(--theme-accent-text-hover) / <alpha-value>)",

          /*
           * UI
           */
          border: "rgb(var(--theme-border) / <alpha-value>)",

          /*
           * Status
           */
          success: "rgb(var(--theme-success) / <alpha-value>)",

          error: "rgb(var(--theme-error) / <alpha-value>)",
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
