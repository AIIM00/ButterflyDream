import { useEffect, useState } from "react";

const POSITION_CLASSES = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
  left: "object-left",
  right: "object-right",
};

function HomeOpeningSlider({ content }) {
  const slides = Array.isArray(content?.slides)
    ? content.slides.filter(
        (slide) => typeof slide?.imageUrl === "string" && slide.imageUrl,
      )
    : [];

  const requestedInterval = Number(content?.intervalMs);

  const intervalMs = Number.isFinite(requestedInterval)
    ? Math.min(15000, Math.max(2500, requestedInterval))
    : 5000;

  const [activeSlide, setActiveSlide] = useState(0);

  const safeActiveSlide =
    slides.length > 0 ? Math.min(activeSlide, slides.length - 1) : 0;

  useEffect(() => {
    if (slides.length <= 1) {
      return undefined;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [slides.length, intervalMs]);

  if (slides.length === 0) {
    return null;
  }

  return (
    <section
      className="
        relative
        w-full
        overflow-hidden
        bg-brand-ivory
      "
      aria-label="Butterfly Dream"
      data-home-section="opening-slider"
    >
      <div
        className="
          relative
          h-[72svh]
          min-h-[500px]
          sm:h-[78svh]
          lg:h-[88svh]
          lg:min-h-[650px]
        "
      >
        {slides.map((slide, index) => {
          const isActive = index === safeActiveSlide;

          const positionClass =
            POSITION_CLASSES[slide.position] ?? POSITION_CLASSES.center;

          return (
            <div
              key={slide.assetId ?? `${slide.imageUrl}-${index}`}
              className={`
                  absolute
                  inset-0
                  transition-opacity
                  duration-[1400ms]
                  ease-in-out
                  ${
                    isActive
                      ? "z-10 opacity-100"
                      : "pointer-events-none z-0 opacity-0"
                  }
                `}
              aria-hidden={!isActive}
            >
              <img
                src={slide.imageUrl}
                alt={slide.alt || "Butterfly Dream jewelry"}
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                className={`
                    h-full
                    w-full
                    object-cover
                    ${positionClass}
                    transition-transform
                    duration-[7000ms]
                    ease-out
                    ${isActive ? "scale-[1.04]" : "scale-100"}
                  `}
              />

              <div
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-black/20
                    via-transparent
                    to-black/[0.03]
                  "
                aria-hidden="true"
              />
            </div>
          );
        })}

        {slides.length > 1 && (
          <div
            className="
              absolute
              bottom-6
              left-1/2
              z-20
              flex
              -translate-x-1/2
              items-center
              gap-2
              sm:bottom-8
            "
            aria-label="Choose image"
          >
            {slides.map((slide, index) => {
              const isActive = index === safeActiveSlide;

              return (
                <button
                  key={slide.assetId ?? index}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Show image ${index + 1}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`
                      h-1.5
                      rounded-full
                      transition-all
                      duration-500
                      ${
                        isActive
                          ? "w-8 bg-white"
                          : "w-1.5 bg-white/55 hover:bg-white/80"
                      }
                    `}
                />
              );
            })}
          </div>
        )}

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            z-20
            h-20
            bg-gradient-to-t
            from-brand-ivory/55
            to-transparent
          "
          aria-hidden="true"
        />
      </div>
    </section>
  );
}

export default HomeOpeningSlider;
