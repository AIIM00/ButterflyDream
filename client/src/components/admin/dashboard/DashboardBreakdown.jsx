function DashboardBreakdown({ title, description, items }) {
  const total = items.reduce(
    (currentTotal, item) => currentTotal + item.value,
    0,
  );

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-gray-950">{title}</h2>

        {description && (
          <p className="mt-2 text-sm text-gray-500">{description}</p>
        )}
      </div>

      <div className="mt-6 space-y-5">
        {items.map((item) => {
          const percentage =
            total > 0 ? Math.round((item.value / total) * 100) : 0;

          return (
            <div key={item.key}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className={[
                      "h-2.5 w-2.5 rounded-full",
                      item.dotClassName,
                    ].join(" ")}
                  />

                  <span className="text-sm font-semibold text-gray-700">
                    {item.label}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-bold text-gray-950">{item.value}</span>

                  <span className="ml-2 text-xs text-gray-500">
                    {percentage}%
                  </span>
                </div>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={[
                    "h-full rounded-full transition-all",
                    item.barClassName,
                  ].join(" ")}
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 border-t border-gray-100 pt-4">
        <p className="text-sm text-gray-500">
          Total: <span className="font-bold text-gray-950">{total}</span>
        </p>
      </div>
    </section>
  );
}

export default DashboardBreakdown;
