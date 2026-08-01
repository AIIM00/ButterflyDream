import { useState } from "react";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";

function CatalogFilters({ initialFilters, onApply, onClear }) {
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice ?? "");

  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice ?? "");

  const [inStock, setInStock] = useState(initialFilters.inStock ?? "all");

  const [featuredOnly, setFeaturedOnly] = useState(
    initialFilters.featured === "true",
  );

  function handleSubmit(event) {
    event.preventDefault();

    onApply({
      minPrice: minPrice.trim(),

      maxPrice: maxPrice.trim(),

      inStock: inStock === "all" ? null : inStock,

      featured: featuredOnly ? "true" : null,
    });
  }

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-800">
          <TuneRoundedIcon />
        </span>

        <div>
          <h2 className="font-bold text-gray-950">Filters</h2>

          <p className="text-sm text-gray-500">Refine your results</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <fieldset>
          <legend className="text-sm font-bold text-gray-800">
            Price range
          </legend>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="minimum-price"
                className="mb-1 block text-xs font-medium text-gray-500"
              >
                Minimum
              </label>

              <input
                id="minimum-price"
                type="number"
                min="0"
                step="0.01"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
                placeholder="$0"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-950"
              />
            </div>

            <div>
              <label
                htmlFor="maximum-price"
                className="mb-1 block text-xs font-medium text-gray-500"
              >
                Maximum
              </label>

              <input
                id="maximum-price"
                type="number"
                min="0"
                step="0.01"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                placeholder="$100"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-950"
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-bold text-gray-800">
            Availability
          </legend>

          <select
            value={inStock}
            onChange={(event) => setInStock(event.target.value)}
            className="mt-3 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-950"
          >
            <option value="all">All products</option>

            <option value="true">In stock</option>

            <option value="false">Out of stock</option>
          </select>
        </fieldset>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
          <input
            type="checkbox"
            checked={featuredOnly}
            onChange={(event) => setFeaturedOnly(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />

          <span className="text-sm font-semibold text-gray-700">
            Featured products only
          </span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:border-gray-950"
          >
            Clear
          </button>

          <button
            type="submit"
            className="rounded-xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Apply
          </button>
        </div>
      </form>
    </aside>
  );
}

export default CatalogFilters;
