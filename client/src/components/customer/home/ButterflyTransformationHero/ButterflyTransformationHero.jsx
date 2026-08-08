import { useEffect, useMemo, useRef } from "react";

import { ButterflyCanvas } from "./ButterflyCanvas.jsx";
import { ButterflyHeroLoader } from "./ButterflyHeroLoader.jsx";
import {
  butterflyHeroConfig,
  getButterflyDesktopFramePaths,
} from "./butterflyHeroConfig.js";
import { useButterflyScrollAnimation } from "./useButterflyScrollAnimation.js";
import { useFrameSequence } from "./useFrameSequence.js";

export function ButterflyTransformationHero({ pageRef }) {
  const canvasControllerRef = useRef(null);

  const framePaths = useMemo(() => getButterflyDesktopFramePaths(), []);

  const {
    progress,
    loadedCount,
    failedCount,
    isComplete,
    getFrameImage,
    totalFrames,
  } = useFrameSequence({
    framePaths,
    initialBatchSize: butterflyHeroConfig.preload.initialBatchSize,
    concurrentLoads: 6,
  });

  useButterflyScrollAnimation({
    pageRef,
    canvasControllerRef,
    frameCount: totalFrames,
    enabled: isComplete,
  });

  useEffect(() => {
    if (loadedCount === 0) {
      return;
    }

    canvasControllerRef.current?.redraw();
  }, [loadedCount]);

  return (
    <>
      {/* Fixed animation background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-brand-ivory"
        aria-hidden="true"
        data-butterfly-transformation-background
      >
        <ButterflyCanvas
          ref={canvasControllerRef}
          getFrameImage={getFrameImage}
          initialFrameIndex={0}
          className="absolute inset-0"
        />
      </div>

      {/* Full-screen loader */}
      {!isComplete && (
        <div className="fixed inset-0 z-[100]">
          <ButterflyHeroLoader
            progress={progress}
            isInitialBatchReady={isComplete}
          />
        </div>
      )}

      {failedCount > 0 && (
        <p className="sr-only" aria-live="polite">
          Some animation frames could not be loaded.
        </p>
      )}
    </>
  );
}
