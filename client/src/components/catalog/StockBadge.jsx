function StockBadge({ status, compact = false }) {
  const badgeConfig = {
    IN_STOCK: {
      label: "In stock",

      containerClassName: `
        border-brand-success/20
        bg-brand-success/10
        text-brand-success
      `,

      dotClassName: `
        bg-brand-success
      `,
    },

    LOW_STOCK: {
      label: "Low stock",

      containerClassName: `
        border-amber-500/20
        bg-amber-50
        text-amber-700
      `,

      dotClassName: `
        bg-amber-500
      `,
    },

    OUT_OF_STOCK: {
      label: "Out of stock",

      containerClassName: `
        border-brand-error/20
        bg-brand-error/10
        text-brand-error
      `,

      dotClassName: `
        bg-brand-error
      `,
    },
  };

  const normalizedStatus =
    status === true ? "IN_STOCK" : status === false ? "OUT_OF_STOCK" : status;

  const config = badgeConfig[normalizedStatus] ?? badgeConfig.OUT_OF_STOCK;

  return (
    <span
      className={`
        inline-flex
        w-fit

        items-center
        justify-center

        rounded-full

        border

        font-semibold

        transition-colors

        ${config.containerClassName}

        ${
          compact
            ? `
                gap-1.5
                px-2.5
                py-1

                text-[0.65rem]
              `
            : `
                gap-2
                px-3
                py-1.5

                text-xs
              `
        }
      `}
    >
      {/* STATUS DOT */}

      <span
        aria-hidden="true"
        className={`
          shrink-0
          rounded-full

          ${config.dotClassName}

          ${compact ? "h-1.5 w-1.5" : "h-2 w-2"}
        `}
      />

      {config.label}
    </span>
  );
}

export default StockBadge;
