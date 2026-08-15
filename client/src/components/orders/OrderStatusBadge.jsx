const statusConfig = {
  PENDING: {
    label: "Pending",

    badgeClassName: `
      border-amber-500/20
      bg-amber-50
      text-amber-800
    `,

    dotClassName: `
      bg-amber-500
    `,
  },

  CONFIRMED: {
    label: "Confirmed",

    badgeClassName: `
      border-brand-accent-fill/25
      bg-brand-accent-soft
      text-brand-accent-text
    `,

    dotClassName: `
      bg-brand-accent-fill
    `,
  },

  PROCESSING: {
    label: "Processing",

    badgeClassName: `
      border-brand-primary/15
      bg-brand-primary/5
      text-brand-primary
    `,

    dotClassName: `
      bg-brand-primary
    `,
  },

  READY_FOR_DELIVERY: {
    label: "Ready for delivery",

    badgeClassName: `
      border-brand-accent-fill/30
      bg-brand-accent-fill/10
      text-brand-accent-text
    `,

    dotClassName: `
      bg-brand-accent-fill
    `,
  },

  OUT_FOR_DELIVERY: {
    label: "Out for delivery",

    badgeClassName: `
      border-brand-primary/20
      bg-brand-primary/5
      text-brand-primary
    `,

    dotClassName: `
      bg-brand-primary
    `,
  },

  DELIVERED: {
    label: "Delivered",

    badgeClassName: `
      border-brand-success/20
      bg-brand-success/10
      text-brand-success
    `,

    dotClassName: `
      bg-brand-success
    `,
  },

  CANCELLED: {
    label: "Cancelled",

    badgeClassName: `
      border-brand-error/20
      bg-brand-error/5
      text-brand-error
    `,

    dotClassName: `
      bg-brand-error
    `,
  },

  RETURNED: {
    label: "Returned",

    badgeClassName: `
      border-brand-border
      bg-brand-surface-soft
      text-brand-text-muted
    `,

    dotClassName: `
      bg-brand-text-muted
    `,
  },
};

function formatStatus(status) {
  if (!status) {
    return "Unknown";
  }

  return String(status)
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function OrderStatusBadge({ status }) {
  const config = statusConfig[status];

  const label = config?.label ?? formatStatus(status);

  const badgeClassName =
    config?.badgeClassName ??
    `
      border-brand-border
      bg-brand-surface-soft
      text-brand-text-muted
    `;

  const dotClassName = config?.dotClassName ?? "bg-brand-text-muted";

  return (
    <span
      className={`
        inline-flex
        w-fit

        items-center
        justify-center

        gap-1.5

        rounded-full

        border

        px-2.5
        py-1.5

        text-[0.65rem]
        font-semibold

        leading-none

        ${badgeClassName}
      `}
    >
      <span
        aria-hidden="true"
        className={`
          h-1.5
          w-1.5
          shrink-0

          rounded-full

          ${dotClassName}
        `}
      />

      {label}
    </span>
  );
}

export default OrderStatusBadge;
