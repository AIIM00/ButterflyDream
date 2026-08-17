import { useEffect, useMemo, useRef, useState } from "react";

import { ButterflyCanvas } from "./ButterflyCanvas.jsx";
import {
  butterflyHeroConfig,
  getButterflyDesktopFramePaths,
  getButterflyFrameTier,
} from "./butterflyHeroConfig.js";
import { useButterflyScrollAnimation } from "./useButterflyScrollAnimation.js";
import { useFrameSequence } from "./useFrameSequence.js";

const FRAME_ASPECT_RATIO = 3326 / 2494;

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (event) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

function useDeferredFrameActivation({ sectionRef, disabled }) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (disabled || isActive) {
      return undefined;
    }

    const target = sectionRef?.current;

    if (!target) {
      return undefined;
    }

    let isNearViewport = false;
    let hasScrollIntent = window.scrollY > 0;

    const activateIfReady = () => {
      if (isNearViewport && hasScrollIntent) {
        setIsActive(true);
      }
    };

    const handleScrollIntent = () => {
      hasScrollIntent = true;
      activateIfReady();
    };

    const updateNearViewport = (isNear) => {
      isNearViewport = isNear;
      activateIfReady();
    };

    const initialBounds = target.getBoundingClientRect();

    updateNearViewport(
      initialBounds.bottom >= -window.innerHeight &&
        initialBounds.top <= window.innerHeight * 2,
    );

    let observer = null;

    if (typeof IntersectionObserver === "function") {
      observer = new IntersectionObserver(
        ([entry]) => {
          updateNearViewport(entry.isIntersecting);
        },
        {
          rootMargin: "100% 0px",
          threshold: 0,
        },
      );

      observer.observe(target);
    } else {
      updateNearViewport(true);
    }

    window.addEventListener("scroll", handleScrollIntent, {
      passive: true,
    });

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", handleScrollIntent);
    };
  }, [disabled, isActive, sectionRef]);

  return isActive && !disabled;
}

function getDecodeDimensions(maxDecodeWidth) {
  if (typeof window === "undefined") {
    return {
      resizeWidth: maxDecodeWidth,
      resizeHeight: Math.round(maxDecodeWidth / FRAME_ASPECT_RATIO),
    };
  }

  const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const requestedWidth = Math.ceil(window.innerWidth * devicePixelRatio);
  const resizeWidth = Math.min(
    maxDecodeWidth,
    Math.max(480, requestedWidth),
  );

  return {
    resizeWidth,
    resizeHeight: Math.round(resizeWidth / FRAME_ASPECT_RATIO),
  };
}

export function ButterflyTransformationHero({ sectionRef }) {
  const canvasControllerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const shouldLoadFrames = useDeferredFrameActivation({
    sectionRef,
    disabled: prefersReducedMotion,
  });

  const decodeDimensions = useMemo(
    () => getDecodeDimensions(butterflyHeroConfig.preload.maxDecodeWidth),
    [],
  );
  const frameTier = getButterflyFrameTier(decodeDimensions.resizeWidth);
  const framePaths = useMemo(
    () => getButterflyDesktopFramePaths({ frameTier }),
    [frameTier],
  );

  const {
    revision,
    loadedCount,
    failedCount,
    cacheSize,
    pendingCount,
    isReady,
    getFrameImage,
    requestFrame,
    totalFrames,
  } = useFrameSequence({
    framePaths,
    enabled: shouldLoadFrames,
    aheadFrames: butterflyHeroConfig.preload.aheadFrames,
    behindFrames: butterflyHeroConfig.preload.behindFrames,
    concurrentLoads: butterflyHeroConfig.preload.concurrentLoads,
    maxCachedFrames: butterflyHeroConfig.preload.maxCachedFrames,
    resizeWidth: decodeDimensions.resizeWidth,
    resizeHeight: decodeDimensions.resizeHeight,
  });

  useButterflyScrollAnimation({
    sectionRef,
    canvasControllerRef,
    frameCount: totalFrames,
    enabled: isReady,
    onVisibilityChange: setIsVisible,
  });

  useEffect(() => {
    if (revision === 0) {
      return;
    }

    canvasControllerRef.current?.redraw();
  }, [revision]);

  const showCanvas = isVisible && isReady;

  return (
    <>
      <div
        className={`
          pointer-events-none
          fixed
          inset-0
          z-0
          overflow-hidden

          transition-opacity
          duration-300
          ease-out
          ${showCanvas ? "visible opacity-100" : "invisible opacity-0"}
        `}
        aria-hidden="true"
        data-butterfly-transformation-background
        data-frame-loading-active={shouldLoadFrames ? "true" : "false"}
        data-frame-tier={frameTier}
        data-frame-loaded-count={loadedCount}
        data-frame-cache-size={cacheSize}
        data-frame-pending-count={pendingCount}
      >
        <ButterflyCanvas
          ref={canvasControllerRef}
          getFrameImage={getFrameImage}
          requestFrame={requestFrame}
          initialFrameIndex={0}
          className="
            absolute inset-0
            translate-x-[22%]
            sm:translate-x-[20%]
            lg:translate-x-[18%]
          "
        />
      </div>

      {failedCount > 0 && (
        <p className="sr-only" aria-live="polite">
          Some animation frames could not be loaded.
        </p>
      )}
    </>
  );
}
