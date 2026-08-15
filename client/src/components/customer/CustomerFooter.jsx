import { useState } from "react";
import { Link } from "react-router-dom";

/* =========================================================
   FOOTER DATA
========================================================= */

const footerSections = [
  {
    title: "SHOP",

    links: [
      {
        label: "All products",
        path: "/products",
      },

      {
        label: "New arrivals",
        path: "/products?sort=newest",
      },

      {
        label: "Featured pieces",
        path: "/products?featured=true",
      },
    ],
  },

  {
    title: "CUSTOMER SERVICE",

    links: [
      {
        label: "My account",
        path: "/account",
      },

      {
        label: "My orders",
        path: "/orders",
      },

      {
        label: "Wishlist",
        path: "/wishlist",
      },
    ],
  },

  {
    title: "ABOUT BUTTERFLY DREAM",

    about: true,
  },
];

const socials = [
  {
    name: "Instagram",
    symbol: "instagram",
    href: "https://www.instagram.com/butterfly.dream2",
  },
  {
    name: "TikTok",
    symbol: "♪",
    href: "https://www.tiktok.com/@butterfly.dream22",
  },
];

/* =========================================================
   SOCIAL ICONS
========================================================= */

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-[20px] w-[20px]"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />

      <circle cx="17.4" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

function SocialSymbol({ social }) {
  if (social.symbol === "instagram") {
    return <InstagramIcon />;
  }

  return (
    <span
      className={`
        leading-none

        ${
          social.name === "Facebook"
            ? `
                font-serif
                text-[1.45rem]
                font-bold
              `
            : ""
        }

        ${
          social.name === "TikTok"
            ? `
                text-[1.3rem]
                font-bold
              `
            : ""
        }
      `}
    >
      {social.symbol}
    </span>
  );
}

/* =========================================================
   SECTION CONTENT
========================================================= */

function FooterSectionContent({ section }) {
  if (section.about) {
    return (
      <div className="max-w-sm">
        <p
          className="
            text-[0.78rem]
            leading-6

            text-brand-surface/65
          "
        >
          Thoughtful jewelry and accessories created to celebrate beauty,
          confidence, individuality and transformation.
        </p>

        <Link
          to="/popups"
          className="
            group

            mt-5

            inline-flex
            items-center
            gap-2

            border-b
            border-brand-accent-fill/35

            pb-1

            text-[0.68rem]
            font-semibold
            uppercase

            tracking-[0.12em]

            text-brand-accent-fill

            transition-colors
            duration-200

            hover:border-brand-accent-fill-hover
            hover:text-brand-accent-fill-hover
          "
        >
          Pop-ups & Events
          <span
            aria-hidden="true"
            className="
              transition-transform
              duration-300

              group-hover:translate-x-1
            "
          >
            →
          </span>
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {section.links?.map(({ label, path }) => (
        <li key={label}>
          <Link
            to={path}
            className="
              inline-block

              text-[0.78rem]
              leading-6

              text-brand-surface/65

              transition-colors
              duration-200

              hover:text-brand-surface
            "
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* =========================================================
   MOBILE ACCORDION
========================================================= */

function FooterAccordion({ section, isOpen, onToggle }) {
  return (
    <div
      className="
        border-b
        border-brand-surface/10
      "
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="
          flex
          min-h-[68px]
          w-full

          items-center
          justify-between

          gap-4

          py-4

          text-left
        "
      >
        <span
          className="
            text-[0.7rem]
            font-bold
            uppercase

            tracking-[0.16em]

            text-brand-surface
          "
        >
          {section.title}
        </span>

        {/* PLUS / MINUS */}

        <span
          aria-hidden="true"
          className="
            relative

            flex
            h-8
            w-8
            shrink-0

            items-center
            justify-center

            rounded-full

            border
            border-brand-surface/15

            text-brand-surface
          "
        >
          <span
            className="
              absolute

              h-px
              w-3.5

              bg-current
            "
          />

          <span
            className={`
              absolute

              h-3.5
              w-px

              bg-current

              transition-transform
              duration-300

              ${isOpen ? "rotate-90 scale-y-0" : "rotate-0 scale-y-100"}
            `}
          />
        </span>
      </button>

      <div
        className={`
          grid

          transition-[grid-template-rows,opacity]
          duration-300
          ease-out

          ${
            isOpen
              ? `
                  grid-rows-[1fr]
                  opacity-100
                `
              : `
                  grid-rows-[0fr]
                  opacity-0
                `
          }
        `}
      >
        <div className="overflow-hidden">
          <div className="pb-7">
            <FooterSectionContent section={section} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CUSTOMER FOOTER
========================================================= */

function CustomerFooter() {
  const currentYear = new Date().getFullYear();

  const [openSection, setOpenSection] = useState(null);

  function toggleSection(index) {
    setOpenSection((current) => (current === index ? null : index));
  }

  return (
    <footer
      className="
        relative
        z-10

        overflow-hidden

        bg-brand-dark-surface

        font-body

        text-brand-surface
      "
    >
      {/* ==================================================
          TOP ACCENT
      ================================================== */}

      <div
        aria-hidden="true"
        className="
          h-px
          w-full

          bg-brand-accent-fill/35
        "
      />

      <div
        className="
          mx-auto
          w-full
          max-w-7xl

          px-5

          sm:px-8

          lg:px-12
        "
      >
        {/* ==================================================
            MOBILE NAVIGATION
        ================================================== */}

        <div
          className="
            border-t
            border-brand-surface/10

            md:hidden
          "
        >
          {footerSections.map((section, index) => (
            <FooterAccordion
              key={section.title}
              section={section}
              isOpen={openSection === index}
              onToggle={() => toggleSection(index)}
            />
          ))}
        </div>

        {/* ==================================================
            DESKTOP NAVIGATION
        ================================================== */}

        <div
          className="
            hidden

            grid-cols-3

            gap-12

            border-b
            border-brand-surface/10

            py-14

            md:grid

            lg:gap-20
            lg:py-16
          "
        >
          {footerSections.map((section) => (
            <section key={section.title} className="min-w-0">
              <p
                className="
                  text-[0.64rem]
                  font-bold
                  uppercase

                  tracking-[0.18em]

                  text-brand-accent-fill
                "
              >
                {section.title}
              </p>

              <div className="mt-5">
                <FooterSectionContent section={section} />
              </div>
            </section>
          ))}
        </div>

        {/* ==================================================
            SOCIAL + LOCATION
        ================================================== */}

        <div
          className="
            flex
            flex-col

            gap-8

            py-9

            sm:flex-row
            sm:items-end
            sm:justify-between

            md:py-10
          "
        >
          {/* SOCIALS */}

          <div>
            <p
              className="
                text-[0.58rem]
                font-bold
                uppercase

                tracking-[0.18em]

                text-brand-surface/50
              "
            >
              Follow the dream
            </p>

            <div
              className="
                mt-3

                flex
                items-center

                gap-2.5
              "
            >
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow Butterfly Dream on ${social.name}`}
                  title={social.name}
                  className="
      inline-flex
      h-11
      w-11

      items-center
      justify-center

      rounded-full

      border
      border-brand-surface/15

      text-brand-surface

      transition-all
      duration-200

      hover:border-brand-accent-fill
      hover:bg-brand-accent-fill
      hover:text-brand-text

      active:scale-90

      focus-visible:outline-none
      focus-visible:ring-2
      focus-visible:ring-brand-accent-fill/50
    "
                >
                  <SocialSymbol social={social} />
                </a>
              ))}
            </div>
          </div>

          {/* COUNTRY + LANGUAGE */}

          <div
            className="
              flex
              items-center

              gap-3

              text-xs
            "
          >
            <button
              type="button"
              className="
                border-b
                border-brand-surface/25

                pb-1

                font-semibold
                uppercase

                tracking-[0.12em]

                text-brand-surface/80

                transition-colors

                hover:border-brand-accent-fill
                hover:text-brand-surface
              "
            >
              Lebanon
            </button>

            <span
              aria-hidden="true"
              className="
                h-1
                w-1

                rounded-full

                bg-brand-accent-fill/60
              "
            />

            <span
              className="
                text-brand-surface/60
              "
            >
              English
            </span>
          </div>
        </div>

        {/* ==================================================
            DIVIDER
        ================================================== */}

        <div
          className="
            h-px
            w-full

            bg-brand-surface/10
          "
        />

        {/* ==================================================
            COPYRIGHT
        ================================================== */}

        <div
          className="
            flex
            flex-col

            gap-3

            py-7

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p
            className="
              text-[0.65rem]
              font-medium

              tracking-[0.04em]

              text-brand-surface/50
            "
          >
            © {currentYear} Butterfly Dream. All rights reserved.
          </p>

          <p
            className="
              text-[0.58rem]
              font-semibold
              uppercase

              tracking-[0.16em]

              text-brand-accent-fill/80
            "
          >
            Jewelry made part of your story
          </p>
        </div>

        {/* ==================================================
            LARGE BRAND WORDMARK
        ================================================== */}

        <div
          className="
            overflow-hidden

            border-t
            border-brand-surface/10

            pb-7
            pt-6

            sm:pb-9
            sm:pt-8
          "
        >
          <Link
            to="/"
            aria-label="Butterfly Dream home"
            className="
              block

              text-center

              whitespace-nowrap

              font-display

              text-[clamp(2.9rem,13vw,8rem)]
              font-semibold

              leading-[0.82]

              tracking-[-0.065em]

              text-brand-surface

              transition-colors
              duration-300

              hover:text-brand-accent-soft
            "
          >
            Butterfly{" "}
            <span
              className="
                font-normal
                italic

                text-brand-accent-fill
              "
            >
              Dream
            </span>
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default CustomerFooter;
