import StockBadge from "./StockBadge.jsx";

function formatVariantOptions(options) {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    return [];
  }

  return Object.entries(options);
}

function VariantSelector({ variants, selectedVariantId, onVariantSelect }) {
  if (variants.length === 0) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
        This product currently has no available variants.
      </p>
    );
  }

  return (
    <fieldset>
      <legend className="text-sm font-bold uppercase tracking-wider text-gray-700">
        Select an option
      </legend>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {variants.map((variant) => {
          const options = formatVariantOptions(variant.options);

          const selected = variant.id === selectedVariantId;

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onVariantSelect(variant.id)}
              className={[
                "rounded-2xl border-2 p-4 text-left transition",
                selected
                  ? "border-gray-950 bg-gray-50"
                  : "border-gray-200 bg-white hover:border-gray-400",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-950">
                    {variant.displayName}
                  </p>

                  {options.length > 0 && (
                    <div className="mt-2 space-y-1 text-sm text-gray-500">
                      {options.map(([name, value]) => (
                        <p key={name}>
                          <span className="capitalize">{name}</span>:{" "}
                          {String(value)}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <p className="font-bold text-gray-950">${variant.price}</p>
              </div>

              <div className="mt-4">
                <StockBadge status={variant.stockStatus} compact />
              </div>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default VariantSelector;
