import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { Link } from "react-router-dom";

function AnnouncementBar() {
  return (
    <aside
      className="
        relative z-50
        border-b border-white/10
        bg-[var(--color-dark-bronze)]
        text-[var(--color-warm-cream)]
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
            color: "var(--color-warm-champagne)",
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
          <span className="sm:hidden">Jewelry made for your story</span>

          <span className="hidden sm:inline">
            Discover elegant jewelry and accessories made for your story
          </span>
        </p>

        <Link
          to="/products"
          className="
            group
            inline-flex items-center
            whitespace-nowrap
            font-body
            text-[0.625rem]
            font-semibold
            uppercase
            tracking-[0.1em]
            text-[var(--color-warm-champagne)]
            transition-colors
            duration-200
            hover:text-[var(--color-champagne-hover)]
            hover:underline
            sm:text-[0.6875rem]
          "
        >
          Shop now
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
      </div>
    </aside>
  );
}

export default AnnouncementBar;
