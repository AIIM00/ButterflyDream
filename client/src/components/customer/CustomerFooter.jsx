import { useState } from "react";
import { Link } from "react-router-dom";

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
    customContent: (
      <div className="max-w-sm space-y-4">
        <p className="text-[0.78rem] leading-6 text-[#211914]/65">
          Thoughtful jewelry and accessories created to celebrate beauty,
          confidence, individuality and transformation.
        </p>

        <Link
          to="/popups"
          className="
          group
          inline-flex
          items-center
          gap-2
          text-[0.72rem]
          font-medium
          uppercase
          tracking-[0.12em]
          text-[#211914]
        "
        >
          Pop-ups & Events
          <span
            className="
            transition-transform
            duration-300
            group-hover:translate-x-1
          "
            aria-hidden="true"
          >
            →
          </span>
        </Link>
      </div>
    ),
  },
];

const socials = [
  {
    name: "Facebook",
    symbol: "f",
  },
  {
    name: "Instagram",
    symbol: "instagram",
  },
  {
    name: "TikTok",
    symbol: "♪",
  },
];

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-[22px] w-[22px]"
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

function YouTubeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-[23px] w-[23px]"
      aria-hidden="true"
    >
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="currentColor" />

      <path d="M10 9L16 12L10 15V9Z" fill="white" />
    </svg>
  );
}

function SocialSymbol({ social }) {
  if (social.symbol === "instagram") {
    return <InstagramIcon />;
  }

  if (social.symbol === "youtube") {
    return <YouTubeIcon />;
  }

  return (
    <span
      className={`
        leading-none
        ${
          social.name === "Facebook" || social.name === "Pinterest"
            ? "font-serif text-[1.6rem] font-bold"
            : ""
        }
        ${social.name === "TikTok" ? "text-[1.45rem] font-bold" : ""}
        ${social.name === "X" ? "text-[1.35rem]" : ""}
      `}
    >
      {social.symbol}
    </span>
  );
}

function FooterAccordion({ section, isOpen, onToggle }) {
  return (
    <div className="border-b border-[#211914]/15">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="
          flex
          min-h-[74px]
          w-full
          items-center
          justify-between
          py-5
          text-left
        "
      >
        <span
          className="
            text-[0.86rem]
            font-medium
            uppercase
            tracking-[0.12em]
            text-[#211914]
          "
        >
          {section.title}
        </span>

        <span
          className="
            relative
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
          "
          aria-hidden="true"
        >
          <span
            className="
              absolute
              h-px
              w-[17px]
              bg-[#211914]
            "
          />

          <span
            className={`
              absolute
              h-[17px]
              w-px
              bg-[#211914]
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
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }
        `}
      >
        <div className="overflow-hidden">
          <div className="pb-7">
            {section.links && (
              <ul className="space-y-3">
                {section.links.map(({ label, path }) => (
                  <li key={label}>
                    <Link
                      to={path}
                      className="
                        inline-block
                        text-[0.8rem]
                        leading-6
                        text-[#211914]/65
                        transition-colors
                        duration-200
                        hover:text-[#211914]
                      "
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {section.customContent}
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomerFooter() {
  const currentYear = new Date().getFullYear();
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (index) => {
    setOpenSection((current) => (current === index ? null : index));
  };

  return (
    <footer
      className="
        relative
        z-10
        overflow-hidden
        bg-[#FCFBF9]
        font-[Manrope]
        text-[#211914]
      "
    >
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
        {/* =========================
            ACCORDION NAVIGATION
        ========================== */}
        <div className="border-t border-[#211914]/15">
          {footerSections.map((section, index) => (
            <FooterAccordion
              key={section.title}
              section={section}
              isOpen={openSection === index}
              onToggle={() => toggleSection(index)}
            />
          ))}
        </div>

        {/* =========================
            SOCIALS
        ========================== */}
        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2.5
            pb-12
            pt-16
            sm:gap-3
          "
        >
          {socials.map((social) => (
            <button
              key={social.name}
              type="button"
              aria-label={social.name}
              title={social.name}
              className="
                flex
                h-[42px]
                w-[42px]
                items-center
                justify-center
                rounded-full
                border
                border-[#211914]/15
                text-[#211914]
                transition-all
                duration-300
                hover:border-[#211914]
                hover:bg-[#211914]
                hover:text-white
                sm:h-[46px]
                sm:w-[46px]
              "
            >
              <SocialSymbol social={social} />
            </button>
          ))}
        </div>

        {/* =========================
            COUNTRY + LANGUAGE
        ========================== */}
        <div
          className="
            flex
            flex-wrap
            items-center
            gap-x-4
            gap-y-2
            pb-6
          "
        >
          <button
            type="button"
            className="
              border-b
              border-[#211914]/25
              pb-1
              text-[0.8rem]
              font-medium
              uppercase
              tracking-[0.12em]
              transition-colors
              hover:border-[#211914]
            "
          >
            Lebanon
          </button>

          <span className="text-[0.9rem] text-[#211914]">English</span>
        </div>

        {/* =========================
            COPYRIGHT
        ========================== */}
        <div className="pb-12">
          <p
            className="
              text-[0.78rem]
              font-medium
              uppercase
              tracking-[0.06em]
              text-[#211914]
            "
          >
            © All rights reserved. {currentYear} Butterfly Dream
          </p>
        </div>

        {/* =========================
            LARGE BRAND WORDMARK
        ========================== */}
        <div
          className="
          flex
          items-center
          justify-center
            overflow-hidden
            pb-8
            pt-1
            sm:pb-10
          "
        >
          <Link
            to="/"
            aria-label="Butterfly Dream home"
            className="
              block
              whitespace-nowrap
              font-['Bodoni_Moda']
              text-[3.5rem]
              leading-[0.85]
              tracking-[-0.065em]
              text-[#211914]
              font-semibold
              leading-[0.85]
              tracking-[-0.065em]
              text-[#211914]
            "
          >
            Butterfly <span className="italic font-normal">Dream</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default CustomerFooter;
