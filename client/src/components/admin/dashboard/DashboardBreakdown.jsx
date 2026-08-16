function DashboardBreakdown({ title, description, items = [] }) {
  const total = items.reduce(
    (currentTotal, item) => currentTotal + Number(item.value ?? 0),
    0,
  );

  return (
    <section
      className="
        overflow-hidden
        rounded-[1.4rem]
        border
        border-gray-200/80
        bg-white

        shadow-[0_8px_24px_rgba(15,23,42,0.04)]
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div
        className="
          border-b
          border-gray-100
          px-4
          py-4

          sm:px-5
          sm:py-5

          lg:px-6
        "
      >
        <div
          className="
            flex
            flex-col
            gap-2

            sm:flex-row
            sm:items-start
            sm:justify-between
            sm:gap-5
          "
        >
          <div className="min-w-0">
            <p
              className="
                text-[0.65rem]
                font-bold
                uppercase
                tracking-[0.14em]
                text-gray-400
              "
            >
              Breakdown
            </p>

            <h2
              className="
                mt-1
                text-lg
                font-bold
                tracking-[-0.025em]
                text-gray-950

                sm:text-xl
              "
            >
              {title}
            </h2>

            {description && (
              <p
                className="
                  mt-1.5
                  max-w-xl
                  text-xs
                  leading-5
                  text-gray-500

                  sm:text-sm
                  sm:leading-6
                "
              >
                {description}
              </p>
            )}
          </div>

          {/* TOTAL */}
          <div
            className="
              flex
              shrink-0
              items-baseline
              gap-2

              sm:flex-col
              sm:items-end
              sm:gap-0
            "
          >
            <span
              className="
                text-[0.62rem]
                font-bold
                uppercase
                tracking-[0.12em]
                text-gray-400
              "
            >
              Total
            </span>

            <span
              className="
                text-lg
                font-bold
                tracking-[-0.03em]
                text-gray-950

                sm:mt-1
                sm:text-xl
              "
            >
              {total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          BREAKDOWN ITEMS
      ===================================================== */}
      <div
        className="
          space-y-5
          px-4
          py-5

          sm:px-5

          lg:px-6
          lg:py-6
        "
      >
        {items.length > 0 ? (
          items.map((item) => {
            const value = Number(item.value ?? 0);

            const percentage =
              total > 0 ? Math.round((value / total) * 100) : 0;

            return (
              <div key={item.key}>
                {/* ROW */}
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                  "
                >
                  {/* LABEL */}
                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-2.5
                    "
                  >
                    <span
                      className={[
                        `
                          h-2.5
                          w-2.5
                          shrink-0
                          rounded-full
                          ring-4
                          ring-gray-50
                        `,
                        item.dotClassName,
                      ].join(" ")}
                    />

                    <span
                      className="
                        truncate
                        text-xs
                        font-semibold
                        text-gray-700

                        sm:text-sm
                      "
                    >
                      {item.label}
                    </span>
                  </div>

                  {/* VALUE */}
                  <div
                    className="
                      flex
                      shrink-0
                      items-baseline
                      gap-1.5
                    "
                  >
                    <span
                      className="
                        text-sm
                        font-bold
                        tracking-[-0.02em]
                        text-gray-950

                        sm:text-base
                      "
                    >
                      {value.toLocaleString()}
                    </span>

                    <span
                      className="
                        min-w-[2.2rem]
                        text-right
                        text-[0.65rem]
                        font-medium
                        text-gray-400

                        sm:text-xs
                      "
                    >
                      {percentage}%
                    </span>
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <div
                  className="
                    mt-2.5
                    h-1.5
                    overflow-hidden
                    rounded-full
                    bg-gray-100

                    sm:h-2
                  "
                  role="progressbar"
                  aria-label={`${item.label}: ${percentage}%`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percentage}
                >
                  <div
                    className={[
                      `
                        h-full
                        rounded-full

                        transition-[width]
                        duration-500
                        ease-out
                      `,
                      item.barClassName,
                    ].join(" ")}
                    style={{
                      width: `${Math.min(100, Math.max(0, percentage))}%`,
                    }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div
            className="
              flex
              min-h-[10rem]
              items-center
              justify-center
              rounded-xl
              border
              border-dashed
              border-gray-200
              bg-gray-50/60
              px-5
              text-center
            "
          >
            <p
              className="
                text-sm
                leading-6
                text-gray-500
              "
            >
              No breakdown data available yet.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default DashboardBreakdown;
