const FRAME_START_INDEX = 1;

const DESKTOP_FRAME_COUNT = 241;

const formatFrameNumber = (frameNumber) => String(frameNumber).padStart(4, "0");

export const butterflyHeroConfig = {
  desktop: {
    frameCount: DESKTOP_FRAME_COUNT,

    getFramePath(frameNumber) {
      return `/animations/butterfly-transformation/transparent/frame-${formatFrameNumber(
        frameNumber,
      )}.webp`;
    },
  },

  frameStartIndex: FRAME_START_INDEX,

  scroll: {
    sectionHeight: "500vh",
  },

  canvas: {
    fit: "contain",
  },

  preload: {
    initialBatchSize: 24,
    priorityStride: 8,
    concurrentLoads: 8,
  },
};

export const getButterflyDesktopFramePaths = () =>
  Array.from(
    {
      length: butterflyHeroConfig.desktop.frameCount,
    },
    (_, index) =>
      butterflyHeroConfig.desktop.getFramePath(
        butterflyHeroConfig.frameStartIndex + index,
      ),
  );
