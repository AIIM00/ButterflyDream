import { useCallback, useEffect, useRef, useState } from "react";

import { FrameSequenceLoader } from "./frameSequenceLoader.js";

const INITIAL_STATUS = Object.freeze({
  revision: 0,
  loadedCount: 0,
  failedCount: 0,
  cacheSize: 0,
  pendingCount: 0,
  isReady: false,
});

export function useFrameSequence({
  framePaths,
  enabled = false,
  initialFrameIndex = 0,
  aheadFrames = 8,
  behindFrames = 3,
  concurrentLoads = 3,
  maxCachedFrames = 12,
  resizeWidth,
  resizeHeight,
}) {
  const loaderRef = useRef(null);
  const [status, setStatus] = useState(INITIAL_STATUS);

  useEffect(() => {
    if (!enabled || framePaths.length === 0) {
      return undefined;
    }

    const loader = new FrameSequenceLoader({
      framePaths,
      aheadFrames,
      behindFrames,
      concurrentLoads,
      maxCachedFrames,
      resizeWidth,
      resizeHeight,
      onChange: setStatus,
    });

    loaderRef.current = loader;
    loader.start(initialFrameIndex);

    return () => {
      loader.dispose();

      if (loaderRef.current === loader) {
        loaderRef.current = null;
      }
    };
  }, [
    aheadFrames,
    behindFrames,
    concurrentLoads,
    enabled,
    framePaths,
    initialFrameIndex,
    maxCachedFrames,
    resizeHeight,
    resizeWidth,
  ]);

  const requestFrame = useCallback((frameIndex) => {
    loaderRef.current?.requestFrame(frameIndex);
  }, []);

  const getFrameImage = useCallback((frameIndex) => {
    return loaderRef.current?.getFrame(frameIndex) ?? null;
  }, []);

  return {
    ...status,
    isReady: enabled && status.isReady,
    getFrameImage,
    requestFrame,
    totalFrames: framePaths.length,
  };
}
