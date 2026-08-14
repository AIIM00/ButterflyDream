import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import { Link } from "react-router-dom";

const IMAGE_FOCUS_CLASSES = {
  center: "object-center",

  top: "object-top",

  bottom: "object-bottom",

  left: "object-left",

  right: "object-right",
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

function HomeImageText({ content }) {
  if (!content) {
    return null;
  }

  const imageSide = content.imageSide === "right" ? "right" : "left";

  const imageFocus =
    IMAGE_FOCUS_CLASSES[content.imageFocus] ?? IMAGE_FOCUS_CLASSES.center;

  const buttonUrl = getSafeInternalPath(content.buttonUrl);

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-brand-ivory
        py-14

        sm:py-20
        lg:py-24
      "
      data-home-section="image-text"
    >
      <div className="page-container">
        <div
          className="
            grid
            overflow-hidden

            rounded-[1.4rem]

            bg-brand-surface

            shadow-[0_22px_60px_rgba(36,29,32,0.06)]

            lg:grid-cols-2
          "
        >
          {/* IMAGE */}
          <div
            className={`
              relative
              min-h-[340px]
              overflow-hidden
              bg-brand-pale-champagne

              sm:min-h-[460px]
              lg:min-h-[560px]

              ${imageSide === "right" ? "lg:order-2" : ""}
            `}
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

                  transition-transform
                  duration-1000
                  hover:scale-[1.025]
                `}
              />
            ) : (
              <div
                className="
                  absolute
                  inset-0

                  bg-gradient-to-br
                  from-brand-pale-champagne
                  via-brand-cream
                  to-brand-champagne/30
                "
              />
            )}

            <div
              className="
                pointer-events-none
                absolute
                inset-0

                bg-gradient-to-t
                from-brand-espresso/10
                to-transparent
              "
            />
          </div>

          {/* COPY */}
          <div
            className={`
              flex
              flex-col
              justify-center

              px-6
              py-10

              sm:px-10
              sm:py-14

              lg:px-14
              lg:py-16

              ${imageSide === "right" ? "lg:order-1" : ""}
            `}
          >
            {content.eyebrow && (
              <p className="eyebrow-text">{content.eyebrow}</p>
            )}

            <h2
              className="
                mt-4

                max-w-xl

                font-display
                text-[2.35rem]
                font-medium
                leading-[0.95]
                tracking-[-0.045em]
                text-brand-espresso

                sm:text-[3.2rem]
                lg:text-[4rem]
              "
            >
              {content.title}
            </h2>

            {content.description && (
              <p
                className="
                  mt-5
                  max-w-lg

                  text-sm
                  leading-7
                  text-brand-muted

                  sm:text-base
                "
              >
                {content.description}
              </p>
            )}

            {content.buttonText && (
              <Link
                to={buttonUrl}
                className="
                  button-base
                  button-primary
                  group
                  mt-7
                  w-fit
                  rounded-full
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
    </section>
  );
}

export default HomeImageText;
