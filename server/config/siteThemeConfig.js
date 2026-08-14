export const SITE_THEME_COLOR_DEFAULTS = {
  ivory: "#F8F5F1",
  surface: "#FFFFFF",
  cream: "#FBF8F3",

  espresso: "#241D20",
  muted: "#6F666A",

  forest: "#163B2B",
  emerald: "#0B2118",

  champagne: "#C9A66B",
  champagneHover: "#B78F54",
  paleChampagne: "#F2E8D8",

  bronze: "#6B4A2E",
  bronzeHover: "#513720",

  border: "#E6DFDA",

  success: "#367056",
  error: "#A94747",
};

export const SITE_THEME_FONT_OPTIONS = {
  display: [
    "Bodoni Moda",
    "Cormorant Garamond",
    "Playfair Display",
    "DM Serif Display",
  ],

  body: ["Manrope", "Inter", "Montserrat", "Poppins"],
};

export const DEFAULT_SITE_THEME = {
  colors: {
    ...SITE_THEME_COLOR_DEFAULTS,
  },

  fonts: {
    display: "Bodoni Moda",
    body: "Manrope",
  },
};

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function normalizeSiteTheme(theme) {
  return {
    colors: {
      ...DEFAULT_SITE_THEME.colors,
      ...(isPlainObject(theme?.colors) ? theme.colors : {}),
    },

    fonts: {
      ...DEFAULT_SITE_THEME.fonts,
      ...(isPlainObject(theme?.fonts) ? theme.fonts : {}),
    },
  };
}
