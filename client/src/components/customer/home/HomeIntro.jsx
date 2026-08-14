import { useEffect, useState } from "react";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import { useNavigate } from "react-router-dom";

const INTRO_CARD_POSITIONS = [
  `
    z-30
    translate-x-0
    translate-y-0
    rotate-[-2deg]
    scale-100
    opacity-100
  `,

  `
    z-20
    translate-x-[22%]
    translate-y-[8%]
    rotate-[4deg]
    scale-[0.92]
    opacity-90
  `,

  `
    z-10
    translate-x-[42%]
    translate-y-[15%]
    rotate-[8deg]
    scale-[0.84]
    opacity-65
  `,
];

const DEFAULT_CONTENT = {
  eyebrow: "Butterfly Dream",

  title: "Every dream begins with transformation.",

  description:
    "Follow the journey from chrysalis to butterfly, and from butterfly to a piece created to carry your story.",

  buttonText: "Explore collection",

  buttonUrl: "/products",

  rotationIntervalMs: 3200,

  images: [],
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

function HomeIntroImageCard({ image, position, isPriority }) {
  const [failedImageUrl, setFailedImageUrl] = useState("");

  const imageUrl = image?.imageUrl ?? "";

  const hasImage = Boolean(imageUrl) && failedImageUrl !== imageUrl;

  return (
    <div
      className={`
        absolute
        left-0
        top-0

        h-[10.5rem]
        w-[7.6rem]

        overflow-hidden
        rounded-[1rem]

        border
        border-white/80

        bg-brand-pale-champagne

        shadow-[0_18px_42px_rgba(50,38,40,0.16)]

        transition-all
        duration-700
        ease-[cubic-bezier(0.22,1,0.36,1)]
        will-change-transform

        sm:h-[13.5rem]
        sm:w-[9.5rem]

        lg:h-[17rem]
        lg:w-[12rem]

        ${INTRO_CARD_POSITIONS[position] ?? INTRO_CARD_POSITIONS[0]}
      `}
    >
      {hasImage ? (
        <img
          src={imageUrl}
          alt={image?.alt || "Butterfly Dream jewelry"}
          loading={isPriority ? "eager" : "lazy"}
          fetchPriority={isPriority ? "high" : "auto"}
          onError={() => setFailedImageUrl(imageUrl)}
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-700
            hover:scale-[1.035]
          "
        />
      ) : (
        <div
          className="
            relative
            flex
            h-full
            w-full
            items-end
            overflow-hidden
            bg-gradient-to-br
            from-brand-pale-champagne
            via-brand-cream
            to-brand-champagne/40
            p-3
          "
        >
          <div
            className="
              absolute
              -right-10
              -top-8
              h-28
              w-28
              rounded-full
              border
              border-brand-champagne/60
            "
          />

          <div
            className="
              absolute
              -bottom-10
              -left-8
              h-28
              w-28
              rounded-full
              border
              border-brand-bronze/20
            "
          />

          <span
            className="
              relative
              text-[0.5rem]
              font-bold
              uppercase
              tracking-[0.2em]
              text-brand-bronze
            "
          >
            Butterfly Dream
          </span>
        </div>
      )}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-t
          from-brand-espresso/15
          via-transparent
          to-white/10
        "
        aria-hidden="true"
      />
    </div>
  );
}

function HomeIntro({ content }) {
  const navigate = useNavigate();

  const intro = {
    ...DEFAULT_CONTENT,
    ...(content ?? {}),
  };

  const images = Array.isArray(intro.images) ? intro.images.slice(0, 3) : [];

  const [activeCard, setActiveCard] = useState(0);

  const requestedInterval = Number(intro.rotationIntervalMs);

  const rotationIntervalMs = Number.isFinite(requestedInterval)
    ? Math.min(15000, Math.max(2000, requestedInterval))
    : 3200;

  const safeActiveCard = images.length > 0 ? activeCard % images.length : 0;

  useEffect(() => {
    if (images.length <= 1) {
      return undefined;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveCard((current) => (current + 1) % images.length);
    }, rotationIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [images.length, rotationIntervalMs]);

  const buttonUrl = getSafeInternalPath(intro.buttonUrl);

  /*
   * Preserve the editorial stack even before
   * images have been configured.
   */
  const cards = images.length > 0 ? images : [null, null, null];

  return (
    <section
      className="
        relative
        min-h-[100svh]
        overflow-hidden
      "
      aria-labelledby="home-intro-title"
      data-home-section="intro"
    >
      <div
        className="
          pointer-events-none
          absolute
          inset-y-0
          left-0
          w-[82%]

          bg-gradient-to-r
          from-brand-ivory/90
          via-brand-ivory/50
          to-transparent

          sm:w-[72%]
          lg:w-[58%]
        "
        aria-hidden="true"
      />

      <div className="page-container relative z-10 min-h-[100svh] py-12 sm:pb-16 sm:pt-28 lg:pb-20 lg:pt-36">
        <div
          className="
            flex
            h-full
            max-w-[17rem]
            flex-col

            sm:max-w-[24rem]
            lg:max-w-[34rem]
          "
        >
          {intro.eyebrow && (
            <p
              className="
                text-[0.58rem]
                font-bold
                uppercase
                tracking-[0.24em]
                text-brand-bronze
                sm:text-[0.65rem]
              "
            >
              {intro.eyebrow}
            </p>
          )}

          <h1
            id="home-intro-title"
            className="
              mt-3
              font-display
              text-[2rem]
              font-bold
              leading-[0.95]
              tracking-[-0.045em]
              text-brand-espresso

              sm:mt-4
              sm:text-[3rem]

              lg:text-[4.5rem]
              lg:leading-[0.9]
            "
          >
            {intro.title}
          </h1>

          {intro.description && (
            <p
              className="
                mt-4
                max-w-[16rem]
                text-[0.78rem]
                leading-[1.65]
                text-brand-muted

                sm:mt-5
                sm:max-w-sm
                sm:text-sm
                sm:leading-6

                lg:mt-6
                lg:max-w-md
                lg:text-base
                lg:leading-7
              "
            >
              {intro.description}
            </p>
          )}

          <div
            className="
              relative
              mt-8

              h-[13rem]
              w-[15rem]

              sm:mt-10
              sm:h-[16.5rem]
              sm:w-[20rem]

              lg:mt-12
              lg:h-[20rem]
              lg:w-[27rem]
            "
            aria-label="Butterfly Dream selected pieces"
          >
            {cards.map((image, index) => {
              const count = cards.length;

              const position =
                images.length > 0
                  ? (index - safeActiveCard + count) % count
                  : index;

              return (
                <HomeIntroImageCard
                  key={image?.assetId ?? `intro-placeholder-${index}`}
                  image={image}
                  position={position}
                  isPriority={index === 0}
                />
              );
            })}
          </div>

          <div
            className="
              mt-4
              flex
              items-center
              gap-6
              sm:mt-4
            "
          >
            {images.length > 1 && (
              <div className="flex items-center gap-1.5" aria-hidden="true">
                {images.map((image, index) => (
                  <span
                    key={image.assetId ?? index}
                    className={`
                        h-1
                        rounded-full
                        transition-all
                        duration-500

                        ${
                          index === safeActiveCard
                            ? "w-5 bg-brand-bronze"
                            : "w-1 bg-brand-bronze/25"
                        }
                      `}
                  />
                ))}
              </div>
            )}

            {intro.buttonText && (
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
                  py-2.5
                  text-[0.52rem]
                  uppercase
                  tracking-[0.14em]
                  sm:text-xs
                "
              >
                {intro.buttonText}

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
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-24
          bg-gradient-to-t
          from-brand-ivory/80
          to-transparent
        "
        aria-hidden="true"
      />
    </section>
  );
}

export default HomeIntro;
