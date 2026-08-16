const configurations = {
  ACTIVE: {
    label: "Active",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
    dot: "bg-emerald-500",
  },

  DRAFT: {
    label: "Draft",
    badge: "bg-amber-50 text-amber-700 ring-amber-200/80",
    dot: "bg-amber-500",
  },

  INACTIVE: {
    label: "Inactive",
    badge: "bg-red-50 text-red-700 ring-red-200/80",
    dot: "bg-red-500",
  },
};

const archivedConfiguration = {
  label: "Archived",
  badge: "bg-gray-100 text-gray-600 ring-gray-200",
  dot: "bg-gray-400",
};

function ProductStatusBadge({ status, archivedAt = null }) {
  const configuration = archivedAt
    ? archivedConfiguration
    : (configurations[status] ?? configurations.DRAFT);

  return (
    <span
      className={[
        `
          inline-flex
          max-w-full
          items-center
          gap-1.5

          rounded-full

          px-2.5
          py-1

          text-[0.62rem]
          font-bold
          leading-4

          ring-1
          ring-inset

          sm:px-3
          sm:py-1.5
          sm:text-[0.68rem]
        `,
        configuration.badge,
      ].join(" ")}
    >
      <span
        className={[
          `
            h-1.5
            w-1.5
            shrink-0
            rounded-full

            sm:h-2
            sm:w-2
          `,
          configuration.dot,
        ].join(" ")}
      />

      <span className="truncate">{configuration.label}</span>
    </span>
  );
}

export default ProductStatusBadge;
