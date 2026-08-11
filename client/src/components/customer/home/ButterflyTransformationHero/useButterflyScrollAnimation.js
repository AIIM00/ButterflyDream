import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function useButterflyScrollAnimation({
  sectionRef,
  canvasControllerRef,
  frameCount,
  enabled,
  onVisibilityChange,
}) {
  useGSAP(
    () => {
      const triggerElement = sectionRef?.current;

      if (!enabled || !triggerElement || frameCount <= 1) {
        return undefined;
      }

      let lastDrawnFrame = -1;

      const drawFromProgress = (progress) => {
        const normalizedProgress = Math.min(1, Math.max(0, progress));

        const nextFrame =
          normalizedProgress >= 0.999
            ? frameCount - 1
            : Math.min(
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

        // HomeIntro starts here
        start: "top 90%",

        // HomeCustomized ends here
        end: "bottom 75%",

        invalidateOnRefresh: true,

        onEnter(self) {
          onVisibilityChange?.(true);
          drawFromProgress(self.progress);
        },

        onEnterBack(self) {
          onVisibilityChange?.(true);
          drawFromProgress(self.progress);
        },

        onUpdate(self) {
          drawFromProgress(self.progress);
        },

        onRefresh(self) {
          drawFromProgress(self.progress);

          // Visible only while we are inside the timeline.
          onVisibilityChange?.(
            self.scroll() >= self.start && self.scroll() <= self.end,
          );
        },

        // User scrolls past HomeCustomized
        onLeave() {
          canvasControllerRef.current?.drawFrame(frameCount - 1);

          onVisibilityChange?.(false);
        },

        // User scrolls upward past HomeIntro
        onLeaveBack() {
          canvasControllerRef.current?.drawFrame(0);

          onVisibilityChange?.(false);
        },
      });

      const scrollPosition = animationScrollTrigger.scroll();

      onVisibilityChange?.(
        scrollPosition >= animationScrollTrigger.start &&
          scrollPosition <= animationScrollTrigger.end,
      );

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
      scope: sectionRef,
      dependencies: [enabled, frameCount],
      revertOnUpdate: true,
    },
  );
}
