import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import useAppContext from "../../../context/app/useAppContext.js";

const clamp = (value, minimum, maximum) =>
  Math.min(Math.max(value, minimum), maximum);

function HomeHero() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const introContentRef = useRef(null);
  const finalContentRef = useRef(null);
  const scrollPromptRef = useRef(null);
  const progressRef = useRef(null);

  const { isAuthenticated } = useAppContext();

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    const introContent = introContentRef.current;
    const finalContent = finalContentRef.current;
    const scrollPrompt = scrollPromptRef.current;
    const progressLine = progressRef.current;

    if (
      !section ||
      !video ||
      !introContent ||
      !finalContent ||
      !scrollPrompt ||
      !progressLine
    ) {
      return undefined;
    }

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (reducedMotionQuery.matches) {
      return undefined;
    }

    let animationFrameId = 0;
    let videoDuration = 0;
    let metadataIsReady = false;

    function updateHero() {
      animationFrameId = 0;

      const sectionRect = section.getBoundingClientRect();
      const scrollableDistance = section.offsetHeight - window.innerHeight;

      if (scrollableDistance <= 0) {
        return;
      }

      const progress = clamp(-sectionRect.top / scrollableDistance, 0, 1);

      if (metadataIsReady) {
        const nextTime = progress * videoDuration;

        if (
          Number.isFinite(nextTime) &&
          Math.abs(video.currentTime - nextTime) > 0.025
        ) {
          video.currentTime = nextTime;
        }
      }

      const introOpacity = clamp(1 - progress * 4.25, 0, 1);
      const finalOpacity = clamp((progress - 0.72) * 4.2, 0, 1);
      const promptOpacity = clamp(1 - progress * 6, 0, 1);

      introContent.style.opacity = String(introOpacity);
      introContent.style.transform = `translate3d(
        0,
        ${progress * 36}px,
        0
      )`;

      introContent.style.pointerEvents = introOpacity < 0.15 ? "none" : "auto";

      finalContent.style.opacity = String(finalOpacity);
      finalContent.style.transform = `translate3d(
        0,
        ${(1 - finalOpacity) * 28}px,
        0
      )`;

      finalContent.style.pointerEvents = finalOpacity < 0.15 ? "none" : "auto";

      scrollPrompt.style.opacity = String(promptOpacity);
      progressLine.style.transform = `scaleX(${progress})`;
    }

    function requestHeroUpdate() {
      if (animationFrameId === 0) {
        animationFrameId = window.requestAnimationFrame(updateHero);
      }
    }

    function handleLoadedMetadata() {
      videoDuration = video.duration;
      metadataIsReady = Number.isFinite(videoDuration) && videoDuration > 0;

      video.pause();
      requestHeroUpdate();
    }

    if (video.readyState >= 1) {
      handleLoadedMetadata();
    } else {
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
    }

    window.addEventListener("scroll", requestHeroUpdate, {
      passive: true,
    });

    window.addEventListener("resize", requestHeroUpdate);

    requestHeroUpdate();

    return () => {
      if (animationFrameId !== 0) {
        window.cancelAnimationFrame(animationFrameId);
      }

      video.removeEventListener("loadedmetadata", handleLoadedMetadata);

      window.removeEventListener("scroll", requestHeroUpdate);
      window.removeEventListener("resize", requestHeroUpdate);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="home-hero"
      className="
        relative
        h-[210svh]
        bg-brand-emerald
        motion-reduce:!h-auto
        sm:h-[230svh]
        lg:h-[260svh]
      "
      aria-labelledby="home-hero-title"
      data-home-section="hero"
    >
      <div
        className="
          sticky
          top-0
          h-[100svh]
          min-h-[620px]
          overflow-hidden
          bg-brand-emerald
          motion-reduce:!relative
          motion-reduce:!h-auto
          motion-reduce:min-h-[760px]
        "
      >
        <video
          ref={videoRef}
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
            object-center
          "
          muted
          playsInline
          preload="auto"
          poster="/media/butterfly-dream-hero-poster.webp"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source
            src="/media/butterfly-dream-transformation.mp4"
            type="video/mp4"
          />
        </video>

        <div
          className="absolute inset-0 bg-brand-emerald/20"
          aria-hidden="true"
        />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-brand-emerald/95
            via-brand-emerald/15
            to-brand-emerald/10
            lg:bg-gradient-to-r
            lg:from-brand-emerald/95
            lg:via-brand-emerald/35
            lg:to-transparent
          "
          aria-hidden="true"
        />

        <div className="page-container relative z-10 h-full">
          <div
            ref={introContentRef}
            className="
              absolute
              inset-x-5
              bottom-24
              max-w-xl
              will-change-[opacity,transform]
              sm:inset-x-8
              sm:bottom-28
              lg:inset-x-auto
              lg:bottom-auto
              lg:left-12
              lg:top-1/2
              lg:w-[min(44vw,590px)]
              lg:-translate-y-1/2
              xl:left-0
            "
          >
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.22em]
                text-brand-champagne
                sm:text-sm
              "
            >
              The transformation collection
            </p>

            <h1
              id="home-hero-title"
              className="
                mt-4
                font-display
                text-[clamp(3rem,8vw,7rem)]
                font-medium
                leading-[0.9]
                tracking-[-0.055em]
                text-white
              "
            >
              Beauty begins in becoming.
            </h1>

            <p
              className="
                mt-6
                max-w-lg
                text-base
                leading-7
                text-white/80
                sm:text-lg
                sm:leading-8
              "
            >
              A cinematic journey from chrysalis to butterfly, transformed into
              jewelry created to celebrate confidence, freedom, and change.
            </p>

            <div
              className="
                mt-8
                flex
                flex-col
                items-start
                gap-3
                sm:flex-row
              "
            >
              <Link
                to="/products"
                className="
                  button-base
                  button-champagne
                  w-fit
                  rounded-full
                "
              >
                Shop the collection
                <ArrowForwardRoundedIcon fontSize="small" />
              </Link>

              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="
                    button-base
                    w-fit
                    rounded-full
                    border
                    border-white/60
                    bg-white/10
                    text-white
                    backdrop-blur-sm
                    hover:border-white
                    hover:bg-white
                    hover:text-brand-espresso
                  "
                >
                  Create account
                </Link>
              )}
            </div>
          </div>

          <div
            ref={finalContentRef}
            className="
              pointer-events-none
              absolute
              inset-x-5
              bottom-24
              max-w-xl
              opacity-0
              will-change-[opacity,transform]
              sm:inset-x-8
              sm:bottom-28
              lg:inset-x-auto
              lg:bottom-24
              lg:right-12
              lg:w-[min(40vw,540px)]
              lg:text-right
              xl:right-0
            "
          >
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.22em]
                text-brand-champagne
                sm:text-sm
              "
            >
              Butterfly Dream
            </p>

            <h2
              className="
                mt-4
                font-display
                text-[clamp(2.8rem,6vw,5.8rem)]
                font-medium
                leading-[0.92]
                tracking-[-0.05em]
                text-white
              "
            >
              Wear the moment you became more.
            </h2>

            <div className="mt-7 flex lg:justify-end">
              <Link
                to="/products"
                className="
                  button-base
                  button-champagne
                  w-fit
                  rounded-full
                "
              >
                Discover the collection
                <ArrowForwardRoundedIcon fontSize="small" />
              </Link>
            </div>
          </div>

          <div
            ref={scrollPromptRef}
            className="
              absolute
              bottom-6
              left-1/2
              flex
              -translate-x-1/2
              flex-col
              items-center
              gap-2
              text-white
              will-change-[opacity]
              sm:bottom-8
            "
            aria-hidden="true"
          >
            <span
              className="
                text-[0.65rem]
                font-bold
                uppercase
                tracking-[0.24em]
                text-white/75
              "
            >
              Scroll to transform
            </span>

            <ArrowDownwardRoundedIcon
              className="
                animate-bounce
                motion-reduce:animate-none
              "
              fontSize="small"
            />
          </div>
        </div>

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            z-20
            h-px
            bg-white/15
          "
          aria-hidden="true"
        >
          <div
            ref={progressRef}
            className="
              h-full
              origin-left
              scale-x-0
              bg-brand-champagne
              will-change-transform
            "
          />
        </div>
      </div>
    </section>
  );
}

export default HomeHero;
