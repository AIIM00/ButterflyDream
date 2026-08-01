function StockBadge({ status, compact = false }) {
  const badgeConfig = {
    IN_STOCK: {
      label: "In stock",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },

    LOW_STOCK: {
      label: "Low stock",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    },

    OUT_OF_STOCK: {
      label: "Out of stock",
      className: "border-red-200 bg-red-50 text-red-700",
    },
  };

  const normalizedStatus =
    status === true ? "IN_STOCK" : status === false ? "OUT_OF_STOCK" : status;

  const config = badgeConfig[normalizedStatus] ?? badgeConfig.OUT_OF_STOCK;

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border font-semibold",
        compact ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
        config.className,
      ].join(" ")}
    >
      {config.label}
    </span>
  );
}

export default StockBadge;
