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
   * avoid flashing a fallback announcement.
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
      aria-label="Store announcement"
      className="
        relative
        z-50

        overflow-hidden

        border-b
        border-brand-surface/10

        bg-brand-dark-surface

        text-brand-surface
      "
    >
      {/* ==================================================
          SUBTLE ACCENT
      ================================================== */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-x-0
          top-0

          h-px

          bg-brand-accent-fill/35
        "
      />

      {/* ==================================================
          CONTENT
      ================================================== */}

      <div
        className="
          page-container

          flex
          min-h-10

          items-center
          justify-center

          gap-2

          py-2.5

          text-center

          sm:min-h-11
          sm:gap-2.5
          sm:py-3
        "
      >
        {/* SPARKLE */}

        <AutoAwesomeRoundedIcon
          aria-hidden="true"
          className="
            shrink-0
            text-brand-accent-fill
          "
          sx={{
            fontSize: 13,
          }}
        />

        {/* ANNOUNCEMENT TEXT */}

        <p
          className="
            min-w-0

            font-body

            text-[0.65rem]
            font-medium

            leading-5

            tracking-[0.045em]

            text-brand-surface/90

            sm:text-[0.72rem]
            sm:tracking-[0.055em]
          "
        >
          <span className="sm:hidden">{mobileText}</span>

          <span className="hidden sm:inline">{desktopText}</span>
        </p>

        {/* OPTIONAL LINK */}

        {showLink && (
          <Link
            to={href}
            className="
              group

              inline-flex
              shrink-0

              items-center
              justify-center

              gap-0.5

              whitespace-nowrap

              font-body

              text-[0.58rem]
              font-bold
              uppercase

              tracking-[0.1em]

              text-brand-accent-fill

              transition-colors
              duration-200

              hover:text-brand-accent-fill-hover

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-brand-accent-fill/50
              focus-visible:ring-offset-2
              focus-visible:ring-offset-brand-dark-surface

              sm:text-[0.65rem]
            "
          >
            <span
              className="
                border-b
                border-brand-accent-fill/40

                transition-colors

                group-hover:border-brand-accent-fill-hover
              "
            >
              {linkText}
            </span>

            <ArrowForwardRoundedIcon
              aria-hidden="true"
              className="
                transition-transform
                duration-200

                group-hover:translate-x-0.5
              "
              sx={{
                fontSize: 13,
              }}
            />
          </Link>
        )}
      </div>
    </aside>
  );
}

export default AnnouncementBar;
