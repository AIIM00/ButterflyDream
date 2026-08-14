import { useContext } from "react";

import SiteThemeContext from "./SiteThemeContext.js";

function useSiteTheme() {
  const context = useContext(SiteThemeContext);

  if (!context) {
    throw new Error("useSiteTheme must be used within a SiteThemeProvider.");
  }

  return context;
}

export default useSiteTheme;
