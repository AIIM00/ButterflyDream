function ProductStatusBadge({ status, archivedAt = null }) {
  if (archivedAt) {
    return (
      <span className="inline-flex rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
        Archived
      </span>
    );
  }

  const configurations = {
    ACTIVE: {
      label: "Active",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    DRAFT: {
      label: "Draft",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    INACTIVE: {
      label: "Inactive",
      className: "border-red-200 bg-red-50 text-red-700",
    },
  };

  const configuration = configurations[status] ?? configurations.DRAFT;

  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
        configuration.className,
      ].join(" ")}
    >
      {configuration.label}
    </span>
  );
}

export default ProductStatusBadge;
