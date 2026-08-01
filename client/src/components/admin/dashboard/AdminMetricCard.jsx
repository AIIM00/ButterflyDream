const toneClasses = {
  dark: {
    icon: "bg-gray-950 text-white",
    border: "border-gray-200",
  },

  green: {
    icon: "bg-green-100 text-green-700",
    border: "border-green-100",
  },

  blue: {
    icon: "bg-blue-100 text-blue-700",
    border: "border-blue-100",
  },

  amber: {
    icon: "bg-amber-100 text-amber-700",
    border: "border-amber-100",
  },

  red: {
    icon: "bg-red-100 text-red-700",
    border: "border-red-100",
  },

  purple: {
    icon: "bg-purple-100 text-purple-700",
    border: "border-purple-100",
  },
};

function AdminMetricCard({
  icon: Icon,
  label,
  value,
  description,
  tone = "dark",
}) {
  const classes = toneClasses[tone] ?? toneClasses.dark;

  return (
    <article
      className={[
        "rounded-2xl border bg-white p-5 shadow-sm",
        classes.border,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-500">{label}</p>

          <p className="mt-3 text-2xl font-bold tracking-tight text-gray-950">
            {value}
          </p>

          {description && (
            <p className="mt-2 text-xs leading-5 text-gray-500">
              {description}
            </p>
          )}
        </div>

        <span
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            classes.icon,
          ].join(" ")}
        >
          <Icon fontSize="small" />
        </span>
      </div>
    </article>
  );
}

export default AdminMetricCard;
