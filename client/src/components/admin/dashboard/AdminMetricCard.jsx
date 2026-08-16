const toneClasses = {
  dark: {
    icon: "bg-gray-950 text-white",
    accent: "bg-gray-950",
  },

  green: {
    icon: "bg-emerald-50 text-emerald-700",
    accent: "bg-emerald-500",
  },

  blue: {
    icon: "bg-blue-50 text-blue-700",
    accent: "bg-blue-500",
  },

  amber: {
    icon: "bg-amber-50 text-amber-700",
    accent: "bg-amber-500",
  },

  red: {
    icon: "bg-red-50 text-red-700",
    accent: "bg-red-500",
  },

  purple: {
    icon: "bg-violet-50 text-violet-700",
    accent: "bg-violet-500",
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
      className="
        group
        relative
        overflow-hidden
        rounded-[1.35rem]
        border
        border-gray-200/80
        bg-white
        p-5

        shadow-[0_8px_24px_rgba(15,23,42,0.04)]

        transition-all
        duration-300

        hover:-translate-y-0.5
        hover:border-gray-300
        hover:shadow-[0_16px_36px_rgba(15,23,42,0.07)]

        sm:p-6
      "
    >
      {/* TOP ACCENT */}
      <span
        className={[
          "absolute left-0 top-0 h-1 w-full opacity-80",
          classes.accent,
        ].join(" ")}
      />

      <div className="flex items-start justify-between gap-5">
        {/* CONTENT */}
        <div className="min-w-0 flex-1">
          <p
            className="
              text-[0.68rem]
              font-bold
              uppercase
              tracking-[0.12em]
              text-gray-400

              sm:text-xs
            "
          >
            {label}
          </p>

          <p
            className="
              mt-3
              truncate

              text-3xl
              font-bold
              tracking-[-0.045em]
              text-gray-950

              sm:text-[2rem]
            "
          >
            {value}
          </p>

          {description && (
            <p
              className="
                mt-3
                max-w-[18rem]
                text-xs
                leading-5
                text-gray-500

                sm:text-[0.8rem]
              "
            >
              {description}
            </p>
          )}
        </div>

        {/* ICON */}
        <span
          className={[
            `
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center

              rounded-[1rem]

              shadow-sm
              ring-1
              ring-black/[0.03]

              transition-transform
              duration-300

              group-hover:scale-105
            `,
            classes.icon,
          ].join(" ")}
        >
          <Icon
            sx={{
              fontSize: 21,
            }}
          />
        </span>
      </div>
    </article>
  );
}

export default AdminMetricCard;
