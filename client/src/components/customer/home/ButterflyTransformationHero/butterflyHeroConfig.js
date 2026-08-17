const FRAME_START_INDEX = 1;

const DESKTOP_FRAME_COUNT = 241;
const DEFAULT_FRAME_TIER = "w1920";

const FRAME_TIERS = Object.freeze([
  {
    key: "w1280",
    maxRequestedWidth: 1280,
  },
  {
    key: "w1920",
    maxRequestedWidth: Number.POSITIVE_INFINITY,
  },
]);

const formatFrameNumber = (frameNumber) => String(frameNumber).padStart(4, "0");

export const butterflyHeroConfig = {
  desktop: {
    frameCount: DESKTOP_FRAME_COUNT,

    getFramePath(frameNumber, frameTier = DEFAULT_FRAME_TIER) {
      return `/animations/butterfly-transformation/v2/${frameTier}/frame-${formatFrameNumber(
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
    aheadFrames: 8,
    behindFrames: 3,
    concurrentLoads: 3,
    maxCachedFrames: 12,
    maxDecodeWidth: 1920,
  },
};

export const getButterflyFrameTier = (requestedWidth) => {
  const safeRequestedWidth = Math.max(1, Number(requestedWidth) || 1);

  return (
    FRAME_TIERS.find(
      (tier) => safeRequestedWidth <= tier.maxRequestedWidth,
    )?.key ?? DEFAULT_FRAME_TIER
  );
};

export const getButterflyDesktopFramePaths = ({
  frameTier = DEFAULT_FRAME_TIER,
} = {}) =>
  Array.from(
    {
      length: butterflyHeroConfig.desktop.frameCount,
    },
    (_, index) =>
      butterflyHeroConfig.desktop.getFramePath(
        butterflyHeroConfig.frameStartIndex + index,
        frameTier,
      ),
  );
