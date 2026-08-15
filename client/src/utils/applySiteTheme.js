const DEFAULT_THEME = {
  colors: {
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
  },

  fonts: {
    display: "Bodoni Moda",
    body: "Manrope",
  },
};

/*
 * Your API stores HEX:
 *
 * #C9A66B
 *
 * Tailwind needs:
 *
 * 201 166 107
 *
 * so opacity modifiers such as:
 *
 * bg-brand-accent-fill/20
 *
 * continue to work.
 */
function hexToRgbChannels(hex) {
  if (typeof hex !== "string") {
    return null;
  }

  const normalized = hex.trim().replace("#", "");

  if (!/^[0-9A-F]{6}$/i.test(normalized)) {
    return null;
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);

  const green = Number.parseInt(normalized.slice(2, 4), 16);

  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `${red} ${green} ${blue}`;
}

function normalizeTheme(theme) {
  return {
    colors: {
      ...DEFAULT_THEME.colors,
      ...(theme?.colors ?? {}),
    },

    fonts: {
      ...DEFAULT_THEME.fonts,
      ...(theme?.fonts ?? {}),
    },
  };
}

function setColorVariable(root, variableName, value) {
  const channels = hexToRgbChannels(value);

  if (!channels) {
    return;
  }

  root.style.setProperty(variableName, channels);
}

function applyGoogleFonts(displayFont, bodyFont) {
  const linkId = "butterfly-dream-storefront-fonts";

  let link = document.getElementById(linkId);

  if (!link) {
    link = document.createElement("link");

    link.id = linkId;
    link.rel = "stylesheet";

    document.head.appendChild(link);
  }

  const families = [displayFont, bodyFont]
    .filter(Boolean)
    .map(
      (font) =>
        `family=${encodeURIComponent(font).replace(/%20/g, "+")}:wght@400;500;600;700`,
    );

  link.href = `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}

export function applySiteTheme(theme) {
  const normalized = normalizeTheme(theme);

  const { colors, fonts } = normalized;

  const root = document.documentElement;

  /*
   * ================================================
   * WEBSITE FOUNDATIONS
   * ================================================
   */

  setColorVariable(root, "--theme-page", colors.ivory);

  setColorVariable(root, "--theme-surface", colors.surface);

  setColorVariable(root, "--theme-surface-soft", colors.cream);

  setColorVariable(root, "--theme-text", colors.espresso);

  setColorVariable(root, "--theme-text-muted", colors.muted);

  setColorVariable(root, "--theme-border", colors.border);

  /*
   * ================================================
   * PRIMARY ACTIONS
   * ================================================
   *
   * For now espresso is both:
   * - main text
   * - primary button
   *
   * We can separate these in the database later.
   */

  setColorVariable(root, "--theme-primary", colors.espresso);

  setColorVariable(root, "--theme-primary-hover", colors.emerald);

  /*
   * ================================================
   * DARK EDITORIAL AREAS
   * ================================================
   */

  setColorVariable(root, "--theme-dark-surface", colors.forest);

  /*
   * ================================================
   * ACCENTS / FEATURED PRODUCTS
   * ================================================
   */

  setColorVariable(root, "--theme-accent-fill", colors.champagne);

  setColorVariable(root, "--theme-accent-fill-hover", colors.champagneHover);

  setColorVariable(root, "--theme-accent-soft", colors.paleChampagne);

  setColorVariable(root, "--theme-accent-text", colors.bronze);

  setColorVariable(root, "--theme-accent-text-hover", colors.bronzeHover);

  /*
   * ================================================
   * STATUS
   * ================================================
   */

  setColorVariable(root, "--theme-success", colors.success);

  setColorVariable(root, "--theme-error", colors.error);

  /*
   * ================================================
   * TYPOGRAPHY
   * ================================================
   */

  root.style.setProperty(
    "--font-display",
    `"${fonts.display}", Georgia, serif`,
  );

  root.style.setProperty(
    "--font-body",
    `"${fonts.body}", ui-sans-serif, system-ui, sans-serif`,
  );

  applyGoogleFonts(fonts.display, fonts.body);

  return normalized;
}

export function applyDefaultSiteTheme() {
  return applySiteTheme(DEFAULT_THEME);
}

export { DEFAULT_THEME, hexToRgbChannels };
