export function ButterflyHeroLoader({ progress, isInitialBatchReady }) {
  if (isInitialBatchReady) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-[#F7F3EC]"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex w-full max-w-64 flex-col items-center gap-4 px-6 text-center">
        <div className="h-px w-full overflow-hidden bg-black/10">
          <div
            className="h-full bg-[#355E4A] transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-sm font-medium tracking-wide text-[#355E4A]">
          Preparing the transformation
        </p>

        <span className="text-xs text-black/55">{progress}%</span>
      </div>
    </div>
  );
}
