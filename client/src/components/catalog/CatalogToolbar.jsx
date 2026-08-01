import { useState } from "react";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

function CatalogToolbar({
  initialSearch,
  sort,
  totalItems,
  onSearch,
  onSortChange,
}) {
  const [search, setSearch] = useState(initialSearch ?? "");

  function handleSubmit(event) {
    event.preventDefault();

    onSearch(search.trim());
  }

  return (
    <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-xl"
        role="search"
      >
        <label htmlFor="catalog-search" className="sr-only">
          Search products
        </label>

        <SearchRoundedIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

        <input
          id="catalog-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products, categories, or variants"
          className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-28 text-gray-950 outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
        />

        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Search
        </button>
      </form>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-gray-500">
          {totalItems} {totalItems === 1 ? "product" : "products"}
        </p>

        <label className="flex items-center gap-3 text-sm font-semibold text-gray-700">
          Sort by
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-800 outline-none focus:border-gray-950"
          >
            <option value="newest">Newest</option>

            <option value="oldest">Oldest</option>

            <option value="name_asc">Name: A–Z</option>

            <option value="name_desc">Name: Z–A</option>

            <option value="price_asc">Price: Low to high</option>

            <option value="price_desc">Price: High to low</option>
          </select>
        </label>
      </div>
    </div>
  );
}

export default CatalogToolbar;
