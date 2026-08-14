import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

const DEFAULT_CONTENT = {
  imageUrl: null,

  imageAlt: "Customized Butterfly Dream accessories",

  imagePosition: "center",

  badge: "Made for you",

  eyebrow: "Made personal",

  title: "Accessories shaped around your story.",

  description:
    "Create something more personal — an accessory designed to hold meaning, celebrate a moment, or become part of someone's story.",

  details: [
    {
      label: "Personal",
      text: "Made meaningful",
    },
    {
      label: "Thoughtful",
      text: "Made for moments",
    },
    {
      label: "Yours",
      text: "Made to keep",
    },
  ],

  buttonText: "Explore customization",

  buttonUrl: "/products",
};

const IMAGE_POSITION_CLASSES = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
  left: "object-left",
  right: "object-right",
};

function getSafeInternalPath(value, fallback = "/products") {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return fallback;
  }

  return value;
}

function HomeCustomized({ content }) {
  const navigate = useNavigate();

  const customized = {
    ...DEFAULT_CONTENT,
    ...(content ?? {}),
  };

  const details = Array.isArray(customized.details)
    ? customized.details
    : DEFAULT_CONTENT.details;

  const [failedImageUrl, setFailedImageUrl] = useState("");

  const imageUrl = customized.imageUrl ?? "";

  const hasImage = Boolean(imageUrl) && failedImageUrl !== imageUrl;

  const imagePositionClass =
    IMAGE_POSITION_CLASSES[customized.imagePosition] ??
    IMAGE_POSITION_CLASSES.center;

  const buttonUrl = getSafeInternalPath(customized.buttonUrl);

  return (
    <section
      id="home-customized"
      className="
        relative
        overflow-hidden
        py-14
        sm:py-16
        lg:py-20
      "
      aria-labelledby="home-customized-title"
      data-home-section="customized"
    >
      <div
        className="
          pointer-events-none
          absolute
          -right-24
          top-10
          -z-10
          h-72
          w-72
          rounded-full
          bg-gradient-to-br
          from-brand-pale-champagne/90
          via-brand-cream/90
          to-brand-ivory
        "
        aria-hidden="true"
      />

      <div className="page-container">
        <div
          className="
            overflow-hidden
            rounded-[1.6rem]

            lg:grid
            lg:grid-cols-[0.95fr_1.05fr]
          "
        >
          {/* IMAGE */}
          <div
            className="
              relative
              h-[330px]
              overflow-hidden
              bg-brand-pale-champagne

              sm:h-[430px]
              lg:h-[560px]
            "
          >
            {hasImage ? (
              <img
                src={imageUrl}
                alt={
                  customized.imageAlt ||
                  "Customized Butterfly Dream accessories"
                }
                loading="lazy"
                onError={() => setFailedImageUrl(imageUrl)}
                className={`
                  h-full
                  w-full
                  object-cover
                  transition-transform
                  duration-1000
                  hover:scale-[1.025]
                  ${imagePositionClass}
                `}
              />
            ) : (
              <div
                className="
                  relative
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  overflow-hidden

                  bg-gradient-to-br
                  from-brand-pale-champagne
                  via-brand-cream
                  to-brand-champagne/40
                "
              >
                <div
                  className="
                    absolute
                    -left-20
                    -top-20
                    h-56
                    w-56
                    rounded-full
                    border
                    border-white/60
                  "
                />

                <div
                  className="
                    absolute
                    -bottom-20
                    -right-16
                    h-64
                    w-64
                    rounded-full
                    border
                    border-brand-bronze/15
                  "
                />

                <div className="relative text-center text-brand-bronze">
                  <AutoAwesomeRoundedIcon
                    sx={{
                      fontSize: 26,
                    }}
                  />

                  <p
                    className="
                      mt-3
                      text-[0.58rem]
                      font-bold
                      uppercase
                      tracking-[0.2em]
                    "
                  >
                    Butterfly Dream
                  </p>
                </div>
              </div>
            )}

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-t
                from-brand-espresso/25
                via-transparent
                to-transparent
              "
              aria-hidden="true"
            />

            {customized.badge && (
              <div
                className="
                  absolute
                  bottom-4
                  left-4

                  rounded-full
                  border
                  border-white/50
                  bg-white/75

                  px-3
                  py-1.5

                  text-[0.55rem]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-brand-bronze

                  backdrop-blur-md

                  sm:bottom-5
                  sm:left-5
                "
              >
                {customized.badge}
              </div>
            )}
          </div>

          {/* CONTENT */}
          <div
            className="
              flex
              max-w-[24rem]
              flex-col
              justify-center

              px-5
              py-8

              sm:px-8
              sm:py-10

              lg:px-12
              lg:py-14
            "
          >
            {customized.eyebrow && (
              <p
                className="
                  text-[0.58rem]
                  font-bold
                  uppercase
                  tracking-[0.22em]
                  text-brand-bronze

                  sm:text-xs
                "
              >
                {customized.eyebrow}
              </p>
            )}

            <h2
              id="home-customized-title"
              className="
                mt-3
                font-display
                text-[2rem]
                font-bold
                leading-[1]
                tracking-[-0.045em]
                text-brand-espresso

                sm:text-[3rem]
                lg:text-[3.8rem]
              "
            >
              {customized.title}
            </h2>

            {customized.description && (
              <p
                className="
                  mt-5
                  text-xs
                  text-brand-muted

                  sm:text-base
                  sm:leading-7
                "
              >
                {customized.description}
              </p>
            )}

            {details.length > 0 && (
              <div
                className="
                  mt-7
                  flex
                  max-w-[12rem]
                  flex-col
                  border-y
                  border-brand-bronze/15
                "
              >
                {details.map((detail, index) => (
                  <div
                    key={`${detail.label}-${index}`}
                    className={
                      index === 0
                        ? "py-4"
                        : "border-t border-brand-bronze/15 py-4"
                    }
                  >
                    {detail.label && (
                      <p
                        className="
                            text-[0.54rem]
                            font-bold
                            uppercase
                            tracking-[0.14em]
                            text-brand-bronze
                          "
                      >
                        {detail.label}
                      </p>
                    )}

                    {detail.text && (
                      <p className="mt-1 text-xs text-brand-muted">
                        {detail.text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {customized.buttonText && (
              <div className="mt-7 max-w-[12rem]">
                <button
                  type="button"
                  onClick={() => navigate(buttonUrl)}
                  className="
                    button-base
                    button-primary
                    group
                    w-fit
                    rounded-full
                    px-5

                    text-[0.68rem]
                    uppercase
                    tracking-[0.13em]

                    sm:text-xs
                  "
                >
                  {customized.buttonText}

                  <ArrowForwardRoundedIcon
                    aria-hidden="true"
                    className="
                      transition-transform
                      duration-200
                      group-hover:translate-x-1
                    "
                    sx={{
                      fontSize: 17,
                    }}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeCustomized;
