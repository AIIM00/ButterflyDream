import { useEffect, useRef, useState } from "react";

import { applySiteTheme } from "../../config/siteThemeRuntime.js";

import { fetchPublicSiteHome } from "../../services/siteApi.js";
import { fetchSiteDraftPreview } from "../../services/sitePreviewApi.js";

import SiteThemeContext from "./SiteThemeContext.js";

function getSitePreviewToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;

  const parameters = new URLSearchParams(hash);

  const token = parameters.get("site-preview");

  return token?.trim() || null;
}

function SiteThemeProvider({ children }) {
  const siteRootRef = useRef(null);

  const previewToken = getSitePreviewToken();

  const isDraftPreview = Boolean(previewToken);

  const [theme, setTheme] = useState(null);

  const [sections, setSections] = useState([]);

  /*
   * Start as true.
   *
   * We therefore do NOT need to call
   * setIsLoadingTheme(true) inside useEffect.
   */
  const [isLoadingTheme, setIsLoadingTheme] = useState(true);

  const [themeError, setThemeError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTheme() {
      try {
        /*
         * IMPORTANT:
         *
         * Do not synchronously call:
         *
         * setIsLoadingTheme(true)
         * setThemeError(null)
         *
         * here.
         */

        const response = isDraftPreview
          ? await fetchSiteDraftPreview(previewToken, {
              signal: controller.signal,
            })
          : await fetchPublicSiteHome({
              signal: controller.signal,
            });

        if (controller.signal.aborted) {
          return;
        }

        if (!siteRootRef.current) {
          return;
        }

        const siteTheme = response.theme;

        const siteSections = Array.isArray(response.sections)
          ? response.sections
          : [];

        /*
         * These are safe because they happen
         * after the asynchronous API request.
         */
        setTheme(siteTheme);

        setSections(siteSections);

        setThemeError(null);

        applySiteTheme(siteRootRef.current, siteTheme);
      } catch (error) {
        if (
          controller.signal.aborted ||
          error?.name === "AbortError" ||
          error?.name === "CanceledError" ||
          error?.code === "ERR_CANCELED"
        ) {
          return;
        }

        console.error("Unable to load website theme.", error);

        setThemeError(error);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingTheme(false);
        }
      }
    }

    void loadTheme();

    return () => {
      controller.abort();
    };
  }, [isDraftPreview, previewToken]);

  const value = {
    theme,
    sections,
    isLoadingTheme,
    themeError,
    isDraftPreview,
  };

  return (
    <SiteThemeContext.Provider value={value}>
      <div
        ref={siteRootRef}
        className="
          customer-site
          flex
          min-h-screen
          flex-col
          bg-brand-surface
          font-body
          text-brand-espresso
        "
      >
        {children}
      </div>
    </SiteThemeContext.Provider>
  );
}

export default SiteThemeProvider;
