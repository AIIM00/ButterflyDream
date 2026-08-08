import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function useButterflyScrollAnimation({
  pageRef,
  sectionRef,
  canvasControllerRef,
  frameCount,
  enabled,
}) {
  const triggerRef = pageRef ?? sectionRef;

  useGSAP(
    () => {
      const triggerElement = triggerRef?.current;

      if (!enabled || !triggerElement || frameCount <= 1) {
        return undefined;
      }

      let lastDrawnFrame = -1;

      const drawFromProgress = (progress) => {
        const normalizedProgress = Math.min(1, Math.max(0, progress));

        const nextFrame = Math.min(
          frameCount - 1,
          Math.max(0, Math.round(normalizedProgress * (frameCount - 1))),
        );

        if (nextFrame === lastDrawnFrame) {
          return;
        }

        lastDrawnFrame = nextFrame;

        canvasControllerRef.current?.drawFrame(nextFrame);
      };

      const animationScrollTrigger = ScrollTrigger.create({
        trigger: triggerElement,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,

        onUpdate(self) {
          drawFromProgress(self.progress);
        },

        onRefresh(self) {
          drawFromProgress(self.progress);
        },
      });

      drawFromProgress(animationScrollTrigger.progress);

      const refreshFrameId = window.requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });

      return () => {
        window.cancelAnimationFrame(refreshFrameId);
        animationScrollTrigger.kill();
      };
    },
    {
      scope: triggerRef,
      dependencies: [enabled, frameCount],
      revertOnUpdate: true,
    },
  );
}
