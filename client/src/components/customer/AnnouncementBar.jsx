import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

import { Link } from "react-router-dom";

import useSiteTheme from "../../context/site-theme/useSiteTheme.js";

function AnnouncementBar() {
  const { sections, isLoadingTheme } = useSiteTheme();

  const section = sections.find(
    (currentSection) => currentSection.type === "ANNOUNCEMENT_BAR",
  );

  /*
   * While the site configuration loads,
   * avoid flashing the old hard-coded bar.
   */
  if (isLoadingTheme) {
    return null;
  }

  /*
   * Public /api/site/home only returns enabled
   * sections, so no section means the admin has
   * hidden or removed the announcement bar.
   */
  if (!section) {
    return null;
  }

  const content = section.content ?? {};

  const mobileText = content.mobileText ?? "";

  const desktopText = content.desktopText ?? mobileText;

  const linkText = content.linkText ?? "";

  const href = content.href ?? "";

  const showLink = Boolean(linkText.trim() && href.trim());

  return (
    <aside
      className="
        relative z-50
        border-b border-white/10
        bg-brand-bronze-hover
        text-brand-cream
      "
      aria-label="Store announcement"
    >
      <div
        className="
          page-container
          flex min-h-10
          items-center justify-center
          gap-2
          py-3
          text-center
        "
      >
        <AutoAwesomeRoundedIcon
          aria-hidden="true"
          sx={{
            color: "rgb(var(--brand-champagne))",

            fontSize: 14,
          }}
        />

        <p
          className="
            font-body
            text-[0.6875rem]
            font-medium
            leading-5
            tracking-[0.055em]
            sm:text-xs
          "
        >
          <span className="sm:hidden">{mobileText}</span>

          <span className="hidden sm:inline">{desktopText}</span>
        </p>

        {showLink && (
          <Link
            to={href}
            className="
              group
              inline-flex
              items-center
              whitespace-nowrap
              font-body
              text-[0.625rem]
              font-semibold
              uppercase
              tracking-[0.1em]
              text-brand-champagne
              transition-colors
              duration-200
              hover:text-brand-champagne-hover
              hover:underline
              sm:text-[0.6875rem]
            "
          >
            {linkText}

            <ArrowForwardRoundedIcon
              aria-hidden="true"
              className="
                transition-transform
                duration-200
                group-hover:translate-x-0.5
              "
              sx={{
                fontSize: 14,
              }}
            />
          </Link>
        )}
      </div>
    </aside>
  );
}

export default AnnouncementBar;
