const HEX_COLOR_PATTERN = /^#[0-9A-F]{6}$/i;

const COLOR_VARIABLES = {
  ivory: {
    rgb: "--brand-ivory",
    semantic: "--color-soft-ivory",
  },

  surface: {
    rgb: "--brand-surface",
    semantic: "--color-pure-white",
  },

  cream: {
    rgb: "--brand-cream",
    semantic: "--color-warm-cream",
  },

  espresso: {
    rgb: "--brand-espresso",
    semantic: "--color-deep-espresso",
  },

  muted: {
    rgb: "--brand-muted",
    semantic: "--color-warm-gray",
  },

  forest: {
    rgb: "--brand-forest",
    semantic: "--color-forest-velvet",
  },

  emerald: {
    rgb: "--brand-emerald",
    semantic: "--color-midnight-emerald",
  },

  champagne: {
    rgb: "--brand-champagne",
    semantic: "--color-antique-champagne",
  },

  champagneHover: {
    rgb: "--brand-champagne-hover",
    semantic: "--color-champagne-hover",
  },

  paleChampagne: {
    rgb: "--brand-pale-champagne",
    semantic: "--color-pale-champagne",
  },

  bronze: {
    rgb: "--brand-bronze",
    semantic: "--color-burnished-bronze",
  },

  bronzeHover: {
    rgb: "--brand-bronze-hover",
    semantic: "--color-dark-bronze",
  },

  border: {
    rgb: "--brand-border",
    semantic: "--color-warm-light-gray",
  },

  success: {
    rgb: "--brand-success",
    semantic: "--color-success",
  },

  error: {
    rgb: "--brand-error",
    semantic: "--color-error",
  },
};

const FONT_CONFIG = {
  "Bodoni Moda": {
    family: '"Bodoni Moda", Georgia, serif',

    google:
      "Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;0,6..96,600;1,6..96,400",
  },

  "Cormorant Garamond": {
    family: '"Cormorant Garamond", Georgia, serif',

    google: "Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400",
  },

  "Playfair Display": {
    family: '"Playfair Display", Georgia, serif',

    google: "Playfair+Display:ital,wght@0,400;0,500;0,600;1,400",
  },

  "DM Serif Display": {
    family: '"DM Serif Display", Georgia, serif',

    google: "DM+Serif+Display:ital@0;1",
  },

  Manrope: {
    family:
      '"Manrope", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

    google: "Manrope:wght@400;500;600;700",
  },

  Inter: {
    family:
      '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

    google: "Inter:wght@400;500;600;700",
  },

  Montserrat: {
    family:
      '"Montserrat", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

    google: "Montserrat:wght@400;500;600;700",
  },

  Poppins: {
    family:
      '"Poppins", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

    google: "Poppins:wght@400;500;600;700",
  },
};

function hexToRgbChannels(hex) {
  if (typeof hex !== "string" || !HEX_COLOR_PATTERN.test(hex)) {
    return null;
  }

  const normalized = hex.slice(1);

  const red = Number.parseInt(normalized.slice(0, 2), 16);

  const green = Number.parseInt(normalized.slice(2, 4), 16);

  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `${red} ${green} ${blue}`;
}

function applyColorVariables(element, colors) {
  if (!colors || typeof colors !== "object" || Array.isArray(colors)) {
    return;
  }

  for (const [key, value] of Object.entries(colors)) {
    const variableConfig = COLOR_VARIABLES[key];

    if (!variableConfig) {
      continue;
    }

    const rgbChannels = hexToRgbChannels(value);

    if (!rgbChannels) {
      continue;
    }

    element.style.setProperty(variableConfig.rgb, rgbChannels);

    element.style.setProperty(variableConfig.semantic, value);

    /*
     * AnnouncementBar currently uses this compatibility alias.
     */
    if (key === "champagne") {
      element.style.setProperty("--color-warm-champagne", value);
    }
  }
}

function applyFontVariables(element, fonts) {
  if (!fonts || typeof fonts !== "object" || Array.isArray(fonts)) {
    return;
  }

  const displayConfig = FONT_CONFIG[fonts.display];

  const bodyConfig = FONT_CONFIG[fonts.body];

  if (displayConfig) {
    element.style.setProperty("--font-display", displayConfig.family);
  }

  if (bodyConfig) {
    element.style.setProperty("--font-body", bodyConfig.family);
  }
}

function loadGoogleFonts(fonts) {
  const requestedFonts = [fonts?.display, fonts?.body]
    .map((fontName) => FONT_CONFIG[fontName]?.google)
    .filter(Boolean);

  if (requestedFonts.length === 0) {
    return;
  }

  const href =
    "https://fonts.googleapis.com/css2?" +
    requestedFonts.map((font) => `family=${font}`).join("&") +
    "&display=swap";

  const linkId = "butterfly-dream-runtime-fonts";

  let link = document.getElementById(linkId);

  if (!link) {
    link = document.createElement("link");

    link.id = linkId;
    link.rel = "stylesheet";

    document.head.appendChild(link);
  }

  if (link.href !== href) {
    link.href = href;
  }
}

export function applySiteTheme(element, theme) {
  if (!element || !theme) {
    return;
  }

  applyColorVariables(element, theme.colors);

  applyFontVariables(element, theme.fonts);

  loadGoogleFonts(theme.fonts);
}
