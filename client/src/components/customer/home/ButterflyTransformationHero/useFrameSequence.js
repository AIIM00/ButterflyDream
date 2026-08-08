import { useCallback, useEffect, useRef, useState } from "react";

const createInitialStatus = () => ({
  loadedCount: 0,
  failedCount: 0,
  completedCount: 0,
  progress: 0,
  isInitialBatchReady: false,
  isComplete: false,
});

const loadImage = (src) =>
  new Promise((resolve) => {
    const image = new Image();

    image.decoding = "async";

    image.onload = () => {
      resolve({
        success: true,
        image,
      });
    };

    image.onerror = () => {
      resolve({
        success: false,
        image: null,
      });
    };

    image.src = src;
  });

export function useFrameSequence({
  framePaths,
  initialBatchSize = 12,
  concurrentLoads = 6,
}) {
  const imagesRef = useRef([]);
  const [status, setStatus] = useState(createInitialStatus);

  useEffect(() => {
    let isCancelled = false;
    let statusUpdateFrameId = null;

    const totalFrames = framePaths.length;
    const initialBatchTarget = Math.min(initialBatchSize, totalFrames);
    const safeConcurrentLoads = Math.max(1, concurrentLoads);

    const loadedImages = new Array(totalFrames).fill(null);

    imagesRef.current = loadedImages;

    let loadedCount = 0;
    let failedCount = 0;
    let completedCount = 0;
    let initialBatchCompletedCount = 0;
    let firstAvailableFrameIndex = null;

    const updateStatus = () => {
      statusUpdateFrameId = null;

      if (isCancelled) {
        return;
      }

      const progress =
        totalFrames === 0
          ? 100
          : Math.round((completedCount / totalFrames) * 100);

      setStatus({
        loadedCount,
        failedCount,
        completedCount,
        progress,
        isInitialBatchReady:
          initialBatchCompletedCount >= initialBatchTarget &&
          firstAvailableFrameIndex !== null,
        isComplete: completedCount >= totalFrames,
      });
    };

    const scheduleStatusUpdate = () => {
      if (statusUpdateFrameId !== null || isCancelled) {
        return;
      }

      statusUpdateFrameId = window.requestAnimationFrame(updateStatus);
    };

    const loadFrameAtIndex = async (frameIndex) => {
      const result = await loadImage(framePaths[frameIndex]);

      if (isCancelled) {
        return;
      }

      if (result.success) {
        loadedImages[frameIndex] = result.image;
        loadedCount += 1;

        if (firstAvailableFrameIndex === null) {
          firstAvailableFrameIndex = frameIndex;
        }
      } else {
        failedCount += 1;
        console.warn(
          `Failed to load animation frame: ${framePaths[frameIndex]}`,
        );
      }

      completedCount += 1;

      if (frameIndex < initialBatchTarget) {
        initialBatchCompletedCount += 1;
      }

      scheduleStatusUpdate();
    };

    const loadFrameBatch = async (frameIndexes) => {
      for (
        let startIndex = 0;
        startIndex < frameIndexes.length;
        startIndex += safeConcurrentLoads
      ) {
        if (isCancelled) {
          return;
        }

        const currentBatch = frameIndexes.slice(
          startIndex,
          startIndex + safeConcurrentLoads,
        );

        await Promise.all(currentBatch.map(loadFrameAtIndex));
      }
    };

    const startLoading = async () => {
      if (totalFrames === 0) {
        scheduleStatusUpdate();
        return;
      }

      const initialFrameIndexes = Array.from(
        { length: initialBatchTarget },
        (_, index) => index,
      );

      await loadFrameBatch(initialFrameIndexes);

      if (isCancelled) {
        return;
      }

      const remainingFrameIndexes = Array.from(
        { length: totalFrames - initialBatchTarget },
        (_, index) => initialBatchTarget + index,
      );

      await loadFrameBatch(remainingFrameIndexes);

      if (!isCancelled) {
        updateStatus();
      }
    };

    void startLoading();

    return () => {
      isCancelled = true;

      if (statusUpdateFrameId !== null) {
        window.cancelAnimationFrame(statusUpdateFrameId);
      }

      imagesRef.current = [];
    };
  }, [framePaths, initialBatchSize, concurrentLoads]);

  const getFrameImage = useCallback((requestedIndex) => {
    const images = imagesRef.current;

    if (images.length === 0) {
      return null;
    }

    const safeIndex = Math.min(
      Math.max(Math.round(requestedIndex), 0),
      images.length - 1,
    );

    if (images[safeIndex]) {
      return images[safeIndex];
    }

    // Return the nearest successfully loaded frame if the requested frame
    // has not loaded yet or failed.
    for (let offset = 1; offset < images.length; offset += 1) {
      const previousIndex = safeIndex - offset;
      const nextIndex = safeIndex + offset;

      if (previousIndex >= 0 && images[previousIndex]) {
        return images[previousIndex];
      }

      if (nextIndex < images.length && images[nextIndex]) {
        return images[nextIndex];
      }
    }

    return null;
  }, []);

  return {
    ...status,
    imagesRef,
    getFrameImage,
    totalFrames: framePaths.length,
  };
}
