import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import { Link } from "react-router-dom";

const IMAGE_FOCUS_CLASSES = {
  center: "object-center",

  top: "object-top",

  bottom: "object-bottom",

  left: "object-left",

  right: "object-right",
};

const OVERLAY_CLASSES = {
  light: "bg-brand-espresso/25",

  medium: "bg-brand-espresso/45",

  strong: "bg-brand-espresso/65",
};

const ALIGNMENT_CLASSES = {
  left: "items-start text-left",

  center: "items-center text-center",

  right: "items-end text-right",
};

function getSafeInternalPath(value) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return "/products";
  }

  return value;
}

function HomeImageBanner({ content }) {
  if (!content) {
    return null;
  }

  const imageFocus =
    IMAGE_FOCUS_CLASSES[content.imageFocus] ?? IMAGE_FOCUS_CLASSES.center;

  const overlay =
    OVERLAY_CLASSES[content.overlayStrength] ?? OVERLAY_CLASSES.medium;

  const alignment =
    ALIGNMENT_CLASSES[content.textAlign] ?? ALIGNMENT_CLASSES.left;

  const buttonUrl = getSafeInternalPath(content.buttonUrl);

  return (
    <section
      className="
        bg-brand-ivory
        py-6

        sm:py-8
        lg:py-10
      "
      data-home-section="image-banner"
    >
      <div className="page-container">
        <div
          className="
            relative
            min-h-[430px]
            overflow-hidden
            rounded-[1.5rem]

            sm:min-h-[500px]
            sm:rounded-[1.8rem]

            lg:min-h-[580px]
          "
        >
          {content.imageUrl ? (
            <img
              src={content.imageUrl}
              alt={content.imageAlt || content.title || "Butterfly Dream"}
              loading="lazy"
              className={`
                absolute
                inset-0

                h-full
                w-full

                object-cover
                ${imageFocus}
              `}
            />
          ) : (
            <div
              className="
                absolute
                inset-0

                bg-gradient-to-br
                from-brand-bronze
                via-brand-champagne
                to-brand-espresso
              "
            />
          )}

          <div
            className={`
              absolute
              inset-0
              ${overlay}
            `}
            aria-hidden="true"
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-black/25
              via-transparent
              to-black/10
            "
            aria-hidden="true"
          />

          <div
            className={`
              relative
              z-10

              flex
              min-h-[430px]
              flex-col
              justify-end

              px-6
              py-8

              text-white

              sm:min-h-[500px]
              sm:px-10
              sm:py-10

              lg:min-h-[580px]
              lg:px-14
              lg:py-14

              ${alignment}
            `}
          >
            <div
              className={`
                flex
                max-w-2xl
                flex-col

                ${
                  content.textAlign === "center"
                    ? "items-center"
                    : content.textAlign === "right"
                      ? "items-end"
                      : "items-start"
                }
              `}
            >
              {content.eyebrow && (
                <p
                  className="
                    text-[0.58rem]
                    font-bold
                    uppercase
                    tracking-[0.22em]
                    text-white/75

                    sm:text-xs
                  "
                >
                  {content.eyebrow}
                </p>
              )}

              <h2
                className="
                  mt-3

                  font-display
                  text-[2.5rem]
                  font-medium
                  leading-[0.92]
                  tracking-[-0.045em]

                  sm:text-[3.5rem]
                  lg:text-[4.6rem]
                "
              >
                {content.title}
              </h2>

              {content.description && (
                <p
                  className="
                    mt-5
                    max-w-xl

                    text-sm
                    leading-6
                    text-white/80

                    sm:text-base
                    sm:leading-7
                  "
                >
                  {content.description}
                </p>
              )}

              {content.buttonText && (
                <Link
                  to={buttonUrl}
                  className="
                    group
                    mt-7

                    inline-flex
                    w-fit
                    items-center
                    justify-center
                    gap-2

                    rounded-full

                    bg-white

                    px-5
                    py-3

                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.12em]
                    text-brand-espresso

                    transition
                    duration-200

                    hover:bg-brand-cream
                  "
                >
                  {content.buttonText}

                  <ArrowForwardRoundedIcon
                    fontSize="small"
                    className="
                      transition-transform
                      duration-200
                      group-hover:translate-x-0.5
                    "
                  />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeImageBanner;
