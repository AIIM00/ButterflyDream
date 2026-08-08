import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

const MAX_DEVICE_PIXEL_RATIO = 2;

const drawContainedImage = ({ context, image, canvasWidth, canvasHeight }) => {
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;

  if (!imageWidth || !imageHeight) {
    return;
  }

  const scale = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight);

  const renderedWidth = imageWidth * scale;
  const renderedHeight = imageHeight * scale;

  const offsetX = (canvasWidth - renderedWidth) / 2;
  const offsetY = (canvasHeight - renderedHeight) / 2;

  context.drawImage(image, offsetX, offsetY, renderedWidth, renderedHeight);
};

export const ButterflyCanvas = forwardRef(function ButterflyCanvas(
  { getFrameImage, initialFrameIndex = 0, className = "" },
  ref,
) {
  const canvasRef = useRef(null);
  const currentFrameIndexRef = useRef(initialFrameIndex);
  const scheduledFrameIdRef = useRef(null);

  const drawFrame = useCallback(
    (requestedFrameIndex = currentFrameIndexRef.current) => {
      currentFrameIndexRef.current = requestedFrameIndex;

      if (scheduledFrameIdRef.current !== null) {
        window.cancelAnimationFrame(scheduledFrameIdRef.current);
      }

      scheduledFrameIdRef.current = window.requestAnimationFrame(() => {
        scheduledFrameIdRef.current = null;

        const canvas = canvasRef.current;

        if (!canvas) {
          return;
        }

        const context = canvas.getContext("2d");

        if (!context) {
          return;
        }

        const canvasBounds = canvas.getBoundingClientRect();
        const canvasWidth = Math.round(canvasBounds.width);
        const canvasHeight = Math.round(canvasBounds.height);

        if (canvasWidth <= 0 || canvasHeight <= 0) {
          return;
        }

        const devicePixelRatio = Math.min(
          window.devicePixelRatio || 1,
          MAX_DEVICE_PIXEL_RATIO,
        );

        const pixelWidth = Math.round(canvasWidth * devicePixelRatio);

        const pixelHeight = Math.round(canvasHeight * devicePixelRatio);

        if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
          canvas.width = pixelWidth;
          canvas.height = pixelHeight;
        }

        context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

        context.clearRect(0, 0, canvasWidth, canvasHeight);

        const frameImage = getFrameImage(Math.round(requestedFrameIndex));

        if (!frameImage) {
          return;
        }

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";

        drawContainedImage({
          context,
          image: frameImage,
          canvasWidth,
          canvasHeight,
        });
      });
    },
    [getFrameImage],
  );

  useImperativeHandle(
    ref,
    () => ({
      drawFrame,

      redraw() {
        drawFrame(currentFrameIndexRef.current);
      },

      getCanvasElement() {
        return canvasRef.current;
      },
    }),
    [drawFrame],
  );

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    drawFrame(initialFrameIndex);

    const resizeObserver = new ResizeObserver(() => {
      drawFrame(currentFrameIndexRef.current);
    });

    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();

      if (scheduledFrameIdRef.current !== null) {
        window.cancelAnimationFrame(scheduledFrameIdRef.current);

        scheduledFrameIdRef.current = null;
      }
    };
  }, [drawFrame, initialFrameIndex]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`block h-full w-full ${className}`}
      data-butterfly-animation-canvas
    />
  );
});
