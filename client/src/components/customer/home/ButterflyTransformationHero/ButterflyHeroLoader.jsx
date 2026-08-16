export function ButterflyHeroLoader({ progress, isInitialBatchReady }) {
  if (isInitialBatchReady) {
    return null;
  }

  return (
    <div
      className="
    absolute
    inset-0
    flex
    items-center
    justify-center
  "
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="
          mr-[8vw]
          flex
          w-full
          max-w-44
          flex-col
          items-center
          gap-3
          text-center

          sm:max-w-52
          lg:max-w-56
        "
      >
        <div className="h-px w-full overflow-hidden bg-black/10">
          <div
            className="
              h-full
              bg-[#355E4A]
              transition-[width]
              duration-300
            "
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <p
          className="
            text-[0.65rem]
            font-medium
            uppercase
            tracking-[0.16em]
            text-[#355E4A]
          "
        >
          Preparing the transformation
        </p>

        <span className="text-[0.65rem] text-black/45">{progress}%</span>
      </div>
    </div>
  );
}
