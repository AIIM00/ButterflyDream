import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_PRIORITY_STRIDE = 4;

const createInitialStatus = () => ({
  loadedCount: 0,
  failedCount: 0,
  completedCount: 0,

  // Progress shown by the startup loader.
  // This now represents only the important startup batch.
  progress: 0,

  // Useful internally if we later want to show
  // full background-loading progress.
  overallProgress: 0,

  isInitialBatchReady: false,
  isPriorityCoverageReady: false,
  isComplete: false,
});

const loadImage = (src) =>
  new Promise((resolve) => {
    const image = new Image();

    image.decoding = "async";

    image.onload = async () => {
      /*
       * Make sure the image is actually decoded before
       * we mark it as ready.
       *
       * This reduces the chance that canvas.drawImage()
       * has to decode the WebP while the user is scrolling.
       */
      try {
        if (typeof image.decode === "function") {
          await image.decode();
        }
      } catch {
        /*
         * Some browsers may reject decode() even though
         * the image loaded successfully.
         *
         * The image can still be used in that situation.
         */
      }

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

function createInitialFrameIndexes(totalFrames, initialBatchTarget) {
  return Array.from(
    {
      length: initialBatchTarget,
    },
    (_, index) => index,
  );
}

function createPriorityFrameIndexes({
  totalFrames,
  initialBatchTarget,
  priorityStride,
}) {
  if (initialBatchTarget >= totalFrames) {
    return [];
  }

  const indexes = [];
  const seenIndexes = new Set();

  /*
   * Once the startup frames are ready, load frames
   * distributed throughout the remaining animation.
   *
   * Example with stride = 4:
   *
   * 36, 40, 44, 48, 52 ...
   *
   * This gives the canvas usable frames throughout
   * the timeline before every gap is filled.
   */
  for (
    let frameIndex = initialBatchTarget;
    frameIndex < totalFrames;
    frameIndex += priorityStride
  ) {
    indexes.push(frameIndex);
    seenIndexes.add(frameIndex);
  }

  /*
   * Always prioritize the final frame too.
   *
   * This matters when the user scrolls very quickly
   * toward the end of the transformation.
   */
  const finalFrameIndex = totalFrames - 1;

  if (
    finalFrameIndex >= initialBatchTarget &&
    !seenIndexes.has(finalFrameIndex)
  ) {
    indexes.push(finalFrameIndex);
  }

  return indexes;
}

function createRemainingFrameIndexes({
  totalFrames,
  initialFrameIndexes,
  priorityFrameIndexes,
}) {
  const alreadyScheduled = new Set([
    ...initialFrameIndexes,
    ...priorityFrameIndexes,
  ]);

  const remainingIndexes = [];

  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex += 1) {
    if (!alreadyScheduled.has(frameIndex)) {
      remainingIndexes.push(frameIndex);
    }
  }

  return remainingIndexes;
}

export function useFrameSequence({
  framePaths,
  initialBatchSize = 12,
  concurrentLoads = 6,
  priorityStride = DEFAULT_PRIORITY_STRIDE,
}) {
  const imagesRef = useRef([]);

  const [status, setStatus] = useState(createInitialStatus);

  useEffect(() => {
    let isCancelled = false;
    let statusUpdateFrameId = null;

    const totalFrames = framePaths.length;

    const safeInitialBatchSize = Math.max(1, Math.floor(initialBatchSize));

    const initialBatchTarget = Math.min(safeInitialBatchSize, totalFrames);

    const safeConcurrentLoads = Math.max(1, Math.floor(concurrentLoads));

    const safePriorityStride = Math.max(2, Math.floor(priorityStride));

    const loadedImages = new Array(totalFrames).fill(null);

    imagesRef.current = loadedImages;

    let loadedCount = 0;
    let failedCount = 0;
    let completedCount = 0;

    let initialBatchCompletedCount = 0;
    let initialBatchLoadedCount = 0;
    let priorityBatchCompletedCount = 0;
    let priorityBatchTarget = 0;
    let firstAvailableFrameIndex = null;

    const updateStatus = () => {
      statusUpdateFrameId = null;
      const priorityCoverageFinished =
        priorityBatchTarget === 0 ||
        priorityBatchCompletedCount >= priorityBatchTarget;

      if (isCancelled) {
        return;
      }

      /*
       * Startup progress:
       *
       * This is what "Preparing the transformation"
       * should display.
       *
       * It reaches 100% when the startup buffer is ready,
       * rather than waiting for all 241 frames.
       */
      const initialProgress =
        initialBatchTarget === 0
          ? 100
          : Math.round((initialBatchCompletedCount / initialBatchTarget) * 100);

      /*
       * Full animation progress.
       *
       * The remaining frames continue downloading after
       * the initial loader disappears.
       */
      const overallProgress =
        totalFrames === 0
          ? 100
          : Math.round((completedCount / totalFrames) * 100);

      const initialBatchFinished =
        initialBatchCompletedCount >= initialBatchTarget;

      const initialBatchHasUsableFrame =
        initialBatchLoadedCount > 0 || firstAvailableFrameIndex !== null;

      setStatus({
        loadedCount,
        failedCount,
        completedCount,

        progress: initialProgress,
        overallProgress,

        isInitialBatchReady:
          totalFrames === 0 ||
          (initialBatchFinished && initialBatchHasUsableFrame),
        isPriorityCoverageReady:
          totalFrames === 0 ||
          (initialBatchFinished &&
            initialBatchHasUsableFrame &&
            priorityCoverageFinished),

        isComplete: completedCount >= totalFrames,
      });
    };

    const scheduleStatusUpdate = () => {
      if (statusUpdateFrameId !== null || isCancelled) {
        return;
      }

      statusUpdateFrameId = window.requestAnimationFrame(updateStatus);
    };

    const loadFrameAtIndex = async (
      frameIndex,
      { isInitialFrame = false, isPriorityFrame = false } = {},
    ) => {
      const result = await loadImage(framePaths[frameIndex]);

      if (isCancelled) {
        return;
      }

      if (result.success) {
        loadedImages[frameIndex] = result.image;

        loadedCount += 1;

        if (isInitialFrame) {
          initialBatchLoadedCount += 1;
        }
        if (isPriorityFrame) {
          priorityBatchCompletedCount += 1;
        }
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

      if (isInitialFrame) {
        initialBatchCompletedCount += 1;
      }

      scheduleStatusUpdate();
    };

    const loadFrameBatch = async (
      frameIndexes,
      { isInitialBatch = false, isPriorityBatch = false } = {},
    ) => {
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

        await Promise.all(
          currentBatch.map((frameIndex) =>
            loadFrameAtIndex(frameIndex, {
              isInitialFrame: isInitialBatch,
              isPriorityFrame: isPriorityBatch,
            }),
          ),
        );
      }
    };

    const startLoading = async () => {
      if (totalFrames === 0) {
        updateStatus();

        return;
      }

      /*
       * PHASE 1
       * -------
       * Load the startup buffer first.
       *
       * These frames make the beginning of the
       * animation fully smooth.
       */
      const initialFrameIndexes = createInitialFrameIndexes(
        totalFrames,
        initialBatchTarget,
      );

      await loadFrameBatch(initialFrameIndexes, {
        isInitialBatch: true,
      });

      if (isCancelled) {
        return;
      }

      /*
       * Update immediately rather than waiting for
       * another browser frame.
       *
       * This allows the startup loader to disappear
       * as soon as the buffer is ready.
       */
      updateStatus();

      /*
       * PHASE 2
       * -------
       * Load distributed priority frames throughout
       * the rest of the transformation.
       *
       * This protects against fast scrolling.
       */
      const priorityFrameIndexes = createPriorityFrameIndexes({
        totalFrames,
        initialBatchTarget,
        priorityStride: safePriorityStride,
      });

      priorityBatchTarget = priorityFrameIndexes.length;

      await loadFrameBatch(priorityFrameIndexes, {
        isPriorityBatch: true,
      });

      if (isCancelled) {
        return;
      }

      updateStatus();
      if (isCancelled) {
        return;
      }

      /*
       * PHASE 3
       * -------
       * Fill every missing frame so the full
       * 241-frame animation eventually becomes available.
       */
      const remainingFrameIndexes = createRemainingFrameIndexes({
        totalFrames,
        initialFrameIndexes,
        priorityFrameIndexes,
      });

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
  }, [framePaths, initialBatchSize, concurrentLoads, priorityStride]);

  const getFrameImage = useCallback((requestedIndex) => {
    const images = imagesRef.current;

    if (images.length === 0) {
      return null;
    }

    const safeIndex = Math.min(
      Math.max(Math.round(requestedIndex), 0),
      images.length - 1,
    );

    /*
     * Best case:
     * exact requested frame is ready.
     */
    if (images[safeIndex]) {
      return images[safeIndex];
    }

    /*
     * During background loading, find the nearest
     * available frame.
     *
     * Because we now prioritize distributed frames,
     * this fallback should usually be much closer to
     * the requested animation position than before.
     */
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
