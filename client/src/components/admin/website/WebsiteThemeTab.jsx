import { useEffect, useMemo, useState } from "react";

import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ColorLensRoundedIcon from "@mui/icons-material/ColorLensRounded";
import FontDownloadRoundedIcon from "@mui/icons-material/FontDownloadRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";

import { toast } from "react-toastify";

import {
  fetchAdminSiteTheme,
  updateAdminSiteTheme,
} from "../../../services/adminSiteTheme.js";
import { emitSiteDraftChanged } from "../../../utils/siteDraftEvents.js";

const HEX_PATTERN = /^#[0-9A-F]{6}$/i;

const FALLBACK_THEME = {
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

const DISPLAY_FONT_OPTIONS = [
  "Bodoni Moda",
  "Cormorant Garamond",
  "Playfair Display",
  "DM Serif Display",
];

const BODY_FONT_OPTIONS = ["Manrope", "Inter", "Montserrat", "Poppins"];

const COLOR_GROUPS = [
  {
    title: "Website foundations",

    description:
      "Main backgrounds, text colors, and borders used across the customer website.",

    colors: [
      {
        key: "ivory",
        label: "Page background",
        description:
          "Main background behind customer pages such as the homepage, shop, wishlist, cart, and account pages.",
      },

      {
        key: "surface",
        label: "Cards & panels",
        description:
          "Main surface used for cards, panels, dialogs, forms, and other content placed above the page background.",
      },

      {
        key: "cream",
        label: "Soft background",
        description:
          "Secondary background used to gently separate sections and create softer cards or content areas.",
      },

      {
        key: "espresso",
        label: "Main text & primary action",
        description:
          "Main headings, important text, and the default color of primary action buttons.",
      },

      {
        key: "muted",
        label: "Secondary text",
        description:
          "Descriptions, helper text, metadata, captions, and other lower-emphasis text.",
      },

      {
        key: "border",
        label: "Borders & dividers",
        description:
          "Subtle outlines around cards, inputs, sections, and separators throughout the storefront.",
      },
    ],
  },

  {
    title: "Actions & dark sections",

    description:
      "Colors used for strong actions, dark editorial sections, and their interactive states.",

    colors: [
      {
        key: "forest",
        label: "Dark section background",
        description:
          "Background used for dark editorial sections, storytelling areas, and strong visual sections.",
      },

      {
        key: "emerald",
        label: "Primary action hover",
        description:
          "Hover and emphasis color used for primary buttons and dark interactive elements.",
      },
    ],
  },

  {
    title: "Featured & accent colors",

    description:
      "Premium accent colors used for featured products, highlights, labels, decorative details, and secondary actions.",

    colors: [
      {
        key: "champagne",
        label: "Accent fill",
        description:
          "Main premium accent used for featured buttons, decorative elements, highlights, and colored emphasis.",
      },

      {
        key: "champagneHover",
        label: "Accent fill hover",
        description:
          "Interactive hover state for buttons and elements that use the Accent Fill color.",
      },

      {
        key: "paleChampagne",
        label: "Soft accent background",
        description:
          "Light accent surface used for featured product cards, premium labels, highlights, and subtle decorative areas.",
      },

      {
        key: "bronze",
        label: "Accent text & icons",
        description:
          "Readable accent used for labels, eyebrow text, icons, links, and premium details.",
      },

      {
        key: "bronzeHover",
        label: "Accent text hover",
        description:
          "Stronger accent used when accent text, links, or highlighted controls are hovered.",
      },
    ],
  },

  {
    title: "Status colors",

    description:
      "Functional colors used to communicate successful actions, errors, and important system states.",

    colors: [
      {
        key: "success",
        label: "Success",
        description:
          "Used for successful payments, confirmations, availability, and completed actions.",
      },

      {
        key: "error",
        label: "Error & destructive action",
        description:
          "Used for errors, failed actions, warnings that require attention, and destructive actions.",
      },
    ],
  },
];

function normalizeTheme(theme) {
  return {
    colors: {
      ...FALLBACK_THEME.colors,
      ...(theme?.colors ?? {}),
    },

    fonts: {
      ...FALLBACK_THEME.fonts,
      ...(theme?.fonts ?? {}),
    },
  };
}

function buildGoogleFontsHref(displayFont, bodyFont) {
  const families = [displayFont, bodyFont]
    .filter(Boolean)
    .map(
      (font) =>
        `family=${font.trim().replace(/\s+/g, "+")}:wght@400;500;600;700`,
    );

  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}

function ColorField({
  colorKey,
  label,
  description,
  value,
  disabled,
  onChange,
}) {
  const isValid = HEX_PATTERN.test(value);

  function updateValue(nextValue) {
    onChange(colorKey, nextValue.toUpperCase());
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-4">
        <label
          className="
            relative
            h-14
            w-14
            shrink-0
            cursor-pointer
            overflow-hidden
            rounded-xl
            border
            border-gray-200
            shadow-sm
          "
          title={`Choose ${label}`}
        >
          <span
            className="absolute inset-0"
            style={{
              backgroundColor: isValid ? value : "#FFFFFF",
            }}
          />

          <input
            type="color"
            value={isValid ? value : "#FFFFFF"}
            disabled={disabled}
            onChange={(event) => updateValue(event.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>

        <div className="min-w-0 flex-1">
          <label className="block">
            <span className="text-sm font-bold text-gray-950">{label}</span>

            <input
              type="text"
              value={value}
              maxLength={7}
              disabled={disabled}
              spellCheck={false}
              onChange={(event) => updateValue(event.target.value)}
              className={[
                "mt-2 w-full rounded-xl border bg-white px-3 py-2 font-mono text-xs uppercase outline-none transition",
                isValid
                  ? "border-gray-300 focus:border-gray-950"
                  : "border-red-400 text-red-700 focus:border-red-600",
              ].join(" ")}
            />
          </label>

          <p className="mt-2 text-xs leading-5 text-gray-500">{description}</p>

          {!isValid && (
            <p className="mt-1 text-xs font-semibold text-red-600">
              Enter a six-digit HEX color such as #C9A66B.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function WebsiteThemeTab() {
  const [savedTheme, setSavedTheme] = useState(null);

  const [draftTheme, setDraftTheme] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] = useState(null);

  const [isSaving, setIsSaving] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);

  const displayFont = draftTheme?.fonts?.display ?? null;

  const bodyFont = draftTheme?.fonts?.body ?? null;

  useEffect(() => {
    const controller = new AbortController();

    fetchAdminSiteTheme({
      signal: controller.signal,
    })
      .then((response) => {
        if (controller.signal.aborted) {
          return;
        }

        const normalized = normalizeTheme(response);

        setSavedTheme(normalized);
        setDraftTheme(normalized);
        setLoadError(null);
      })
      .catch((error) => {
        if (
          controller.signal.aborted ||
          error?.name === "AbortError" ||
          error?.name === "CanceledError" ||
          error?.code === "ERR_CANCELED"
        ) {
          return;
        }

        setLoadError(error);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [reloadKey]);

  /*
   * The admin interface itself keeps its
   * fixed design. This link is only used so
   * the preview can render the chosen fonts.
   */
  useEffect(() => {
    if (!displayFont || !bodyFont) {
      return;
    }

    const linkId = "butterfly-dream-admin-theme-preview-fonts";

    let link = document.getElementById(linkId);

    if (!link) {
      link = document.createElement("link");

      link.id = linkId;

      link.rel = "stylesheet";

      document.head.appendChild(link);
    }

    link.href = buildGoogleFontsHref(displayFont, bodyFont);
  }, [displayFont, bodyFont]);

  const hasChanges = useMemo(() => {
    if (!savedTheme || !draftTheme) {
      return false;
    }

    return JSON.stringify(savedTheme) !== JSON.stringify(draftTheme);
  }, [savedTheme, draftTheme]);

  const hasInvalidColors = useMemo(() => {
    if (!draftTheme) {
      return true;
    }

    return Object.values(draftTheme.colors).some(
      (value) => !HEX_PATTERN.test(value),
    );
  }, [draftTheme]);

  function reloadTheme() {
    if (
      hasChanges &&
      !window.confirm(
        "Reload the saved theme and discard your unsaved changes?",
      )
    ) {
      return;
    }

    setIsLoading(true);

    setLoadError(null);

    setReloadKey((current) => current + 1);
  }

  function resetUnsavedChanges() {
    if (!savedTheme || !hasChanges) {
      return;
    }

    setDraftTheme(normalizeTheme(savedTheme));
  }

  function updateColor(key, value) {
    setDraftTheme((current) => ({
      ...current,

      colors: {
        ...current.colors,

        [key]: value,
      },
    }));
  }

  function updateFont(key, value) {
    setDraftTheme((current) => ({
      ...current,

      fonts: {
        ...current.fonts,

        [key]: value,
      },
    }));
  }

  async function handleSave() {
    if (!draftTheme || isSaving) {
      return;
    }

    if (hasInvalidColors) {
      toast.error("Fix the invalid color values before saving.");

      return;
    }

    setIsSaving(true);

    try {
      const response = await updateAdminSiteTheme({
        colors: draftTheme.colors,

        fonts: draftTheme.fonts,
      });

      const normalized = normalizeTheme(response);

      setSavedTheme(normalized);

      setDraftTheme(normalized);

      emitSiteDraftChanged();

      toast.success("Website theme updated successfully.");
    } catch (error) {
      toast.error(error?.message || "Unable to update the website theme.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-48 animate-pulse rounded-2xl border border-gray-200 bg-white" />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({
            length: 9,
          }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl border border-gray-200 bg-white"
            />
          ))}
        </div>
      </div>
    );
  }

  if (loadError || !draftTheme) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="font-semibold text-red-900">
          Unable to load the website theme.
        </p>

        <p className="mt-2 text-sm text-red-700">
          {loadError?.message || "An unexpected error occurred."}
        </p>

        <button
          type="button"
          onClick={() => {
            setIsLoading(true);

            setLoadError(null);

            setReloadKey((current) => current + 1);
          }}
          className="mt-5 rounded-xl bg-red-900 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  const colors = draftTheme.colors;

  const fonts = draftTheme.fonts;

  return (
    <div className="space-y-7">
      {/* TOP CONTROLS */}
      <section className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
            <ColorLensRoundedIcon fontSize="small" />
            Storefront appearance
          </div>

          <h3 className="mt-2 text-xl font-bold text-gray-950">
            Website theme
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Customize the colors and typography of the customer website. Each
            color is named after where it is used, so you can change the
            storefront without needing to understand the underlying design
            system.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={reloadTheme}
            disabled={isSaving}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-gray-300
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-gray-700
              transition
              hover:border-gray-950
              hover:text-gray-950
              disabled:opacity-40
            "
          >
            <RefreshRoundedIcon fontSize="small" />
            Reload
          </button>

          <button
            type="button"
            onClick={resetUnsavedChanges}
            disabled={!hasChanges || isSaving}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-gray-300
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-gray-700
              transition
              hover:border-gray-950
              hover:text-gray-950
              disabled:opacity-40
            "
          >
            <RestartAltRoundedIcon fontSize="small" />
            Undo changes
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || hasInvalidColors || isSaving}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-gray-950
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-gray-800
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <CheckRoundedIcon fontSize="small" />

            {isSaving ? "Saving..." : "Save theme"}
          </button>
        </div>
      </section>

      {/* LIVE PREVIEW */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <header className="border-b border-gray-200 px-6 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Live preview
          </p>
        </header>

        <div
          className="p-5 sm:p-8"
          style={{
            backgroundColor: colors.ivory,

            color: colors.espresso,

            fontFamily: `"${fonts.body}", sans-serif`,
          }}
        >
          <div
            className="
              mx-auto
              max-w-4xl
              overflow-hidden
              rounded-[1.5rem]
              shadow-lg
            "
            style={{
              backgroundColor: colors.surface,

              border: `1px solid ${colors.border}`,
            }}
          >
            {/* Announcement */}
            <div
              className="
                flex
                min-h-10
                items-center
                justify-center
                px-4
                py-2
                text-center
                text-[0.65rem]
                font-semibold
                uppercase
                tracking-[0.12em]
              "
              style={{
                backgroundColor: colors.bronzeHover,

                color: colors.cream,
              }}
            >
              Jewelry made for your story
              <span
                className="ml-2"
                style={{
                  color: colors.champagne,
                }}
              >
                Shop now →
              </span>
            </div>

            {/* Header */}
            <div
              className="
                flex
                items-center
                justify-between
                px-5
                py-4
              "
              style={{
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <p
                className="text-xl"
                style={{
                  fontFamily: `"${fonts.display}", serif`,
                }}
              >
                Butterfly Dream
              </p>

              <div
                className="
                  flex
                  items-center
                  gap-3
                  text-xs
                "
                style={{
                  color: colors.muted,
                }}
              >
                <span>Account</span>

                <span>Wishlist</span>

                <span>Bag</span>
              </div>
            </div>

            {/* Hero */}
            <div className="grid gap-6 p-6 sm:grid-cols-[1.1fr_0.9fr] sm:p-8">
              <div className="flex flex-col justify-center">
                <p
                  className="
                    text-[0.62rem]
                    font-bold
                    uppercase
                    tracking-[0.2em]
                  "
                  style={{
                    color: colors.bronze,
                  }}
                >
                  Butterfly Dream
                </p>

                <h4
                  className="
                    mt-3
                    max-w-lg
                    text-4xl
                    font-semibold
                    leading-[0.95]
                    tracking-[-0.04em]
                    sm:text-5xl
                  "
                  style={{
                    fontFamily: `"${fonts.display}", serif`,

                    color: colors.espresso,
                  }}
                >
                  Every dream begins with transformation.
                </h4>

                <p
                  className="
                    mt-5
                    max-w-md
                    text-sm
                    leading-6
                  "
                  style={{
                    color: colors.muted,
                  }}
                >
                  Jewelry that becomes part of your story, designed around
                  elegance, transformation, and individuality.
                </p>

                <button
                  type="button"
                  className="
                    mt-6
                    w-fit
                    rounded-full
                    px-5
                    py-2.5
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.12em]
                  "
                  style={{
                    backgroundColor: colors.espresso,

                    color: colors.surface,
                  }}
                >
                  Explore collection
                </button>
              </div>

              <div
                className="
                  relative
                  min-h-64
                  overflow-hidden
                  rounded-[1.25rem]
                "
                style={{
                  background: `linear-gradient(145deg, ${colors.paleChampagne}, ${colors.cream})`,
                }}
              >
                <div
                  className="
                    absolute
                    -right-10
                    -top-10
                    h-36
                    w-36
                    rounded-full
                  "
                  style={{
                    border: `1px solid ${colors.champagne}`,
                  }}
                />

                <div
                  className="
                    absolute
                    bottom-5
                    left-5
                    right-5
                    rounded-xl
                    p-4
                  "
                  style={{
                    backgroundColor: colors.surface,

                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <p
                    className="
                      text-[0.55rem]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                    "
                    style={{
                      color: colors.bronze,
                    }}
                  >
                    Modern elegance
                  </p>

                  <p
                    className="mt-1 text-sm font-semibold"
                    style={{
                      color: colors.espresso,
                    }}
                  >
                    A piece designed to feel like you.
                  </p>
                </div>
              </div>
            </div>

            {/* Mini status example */}
            <div
              className="
                flex
                flex-wrap
                gap-3
                px-6
                pb-6
              "
            >
              <span
                className="
                  rounded-full
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                "
                style={{
                  backgroundColor: `${colors.success}18`,

                  color: colors.success,
                }}
              >
                ✓ Order confirmed
              </span>

              <span
                className="
                  rounded-full
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                "
                style={{
                  backgroundColor: `${colors.error}18`,

                  color: colors.error,
                }}
              >
                Error example
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* TYPOGRAPHY */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-white">
            <FontDownloadRoundedIcon />
          </span>

          <div>
            <h3 className="text-lg font-bold text-gray-950">Typography</h3>

            <p className="mt-1 text-sm leading-6 text-gray-600">
              Display typography is used for luxury headings. Body typography is
              used for navigation, descriptions, buttons, and general interface
              text.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <label className="rounded-2xl border border-gray-200 p-5">
            <span className="text-sm font-bold text-gray-950">
              Display font
            </span>

            <select
              value={fonts.display}
              disabled={isSaving}
              onChange={(event) => updateFont("display", event.target.value)}
              className="
                mt-3
                w-full
                rounded-xl
                border
                border-gray-300
                bg-white
                px-4
                py-3
                text-sm
                outline-none
                focus:border-gray-950
              "
            >
              {DISPLAY_FONT_OPTIONS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>

            <p
              className="
                mt-5
                text-4xl
                leading-none
                tracking-[-0.04em]
                text-gray-950
              "
              style={{
                fontFamily: `"${fonts.display}", serif`,
              }}
            >
              Every dream begins with transformation.
            </p>
          </label>

          <label className="rounded-2xl border border-gray-200 p-5">
            <span className="text-sm font-bold text-gray-950">Body font</span>

            <select
              value={fonts.body}
              disabled={isSaving}
              onChange={(event) => updateFont("body", event.target.value)}
              className="
                mt-3
                w-full
                rounded-xl
                border
                border-gray-300
                bg-white
                px-4
                py-3
                text-sm
                outline-none
                focus:border-gray-950
              "
            >
              {BODY_FONT_OPTIONS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>

            <p
              className="
                mt-5
                text-base
                leading-7
                text-gray-700
              "
              style={{
                fontFamily: `"${fonts.body}", sans-serif`,
              }}
            >
              Discover elegant jewelry and accessories made to become part of
              your story.
            </p>

            <button
              type="button"
              className="
                mt-5
                rounded-full
                bg-gray-950
                px-5
                py-2.5
                text-xs
                font-bold
                uppercase
                tracking-[0.12em]
                text-white
              "
              style={{
                fontFamily: `"${fonts.body}", sans-serif`,
              }}
            >
              Explore collection
            </button>
          </label>
        </div>
      </section>

      {/* COLORS */}
      {COLOR_GROUPS.map((group) => (
        <section
          key={group.title}
          className="rounded-2xl border border-gray-200 bg-gray-50 p-6"
        >
          <div>
            <h3 className="text-lg font-bold text-gray-950">{group.title}</h3>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
              {group.description}
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {group.colors.map((color) => (
              <ColorField
                key={color.key}
                colorKey={color.key}
                label={color.label}
                description={color.description}
                value={colors[color.key]}
                disabled={isSaving}
                onChange={updateColor}
              />
            ))}
          </div>
        </section>
      ))}

      {/* STICKY SAVE */}
      {hasChanges && (
        <div
          className="
            sticky
            bottom-4
            z-30

            flex
            flex-col
            gap-3

            rounded-2xl
            border
            border-gray-800

            bg-gray-950
            p-4

            text-white

            shadow-2xl

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <p className="text-sm font-bold">You have unsaved theme changes</p>

            <p className="mt-1 text-xs text-gray-400">
              Save these changes to the website draft. They will remain private
              until you publish the website.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetUnsavedChanges}
              disabled={isSaving}
              className="
                rounded-xl
                border
                border-white/20
                px-4
                py-2.5
                text-xs
                font-semibold
                text-white
                transition
                hover:bg-white/10
              "
            >
              Discard
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={hasInvalidColors || isSaving}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-white
                px-5
                py-2.5
                text-xs
                font-bold
                text-gray-950
                transition
                hover:bg-gray-100
                disabled:opacity-40
              "
            >
              <CheckRoundedIcon fontSize="small" />

              {isSaving ? "Saving..." : "Save theme"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WebsiteThemeTab;
