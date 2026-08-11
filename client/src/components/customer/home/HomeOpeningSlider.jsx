import { useEffect, useState } from "react";

const slides = [
  {
    id: 1,
    src: "/media/home/image0.jpg",
    alt: "Butterfly Dream jewelry store display",
    position: "object-center",
  },
  {
    id: 2,
    src: "/media/home/image1.jpeg",
    alt: "Butterfly Dream celebration",
    position: "object-center",
  },
  {
    id: 3,
    src: "/media/home/image2.jpeg",
    alt: "Butterfly Dream lifestyle editorial",
    position: "object-center",
  },
];

function HomeOpeningSlider() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

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
          const isActive = index === activeSlide;

          return (
            <div
              key={slide.id}
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
                src={slide.src}
                alt={slide.alt}
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                className={`
                  h-full
                  w-full
                  object-cover
                  ${slide.position}

                  transition-transform
                  duration-[7000ms]
                  ease-out

                  ${isActive ? "scale-[1.04]" : "scale-100"}
                `}
              />

              {/* Soft luxury image treatment */}
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

        {/* Slide indicators */}
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
            const isActive = index === activeSlide;

            return (
              <button
                key={slide.id}
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

        {/* Very soft transition into transformation hero */}
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
