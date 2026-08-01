import { useSearchParams } from "react-router-dom";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import CatalogFilters from "../../components/catalog/CatalogFilters.jsx";
import CatalogPagination from "../../components/catalog/CatalogPagination.jsx";
import CatalogToolbar from "../../components/catalog/CatalogToolbar.jsx";
import CategoryNavigation from "../../components/catalog/CategoryNavigation.jsx";
import ProductCard from "../../components/catalog/ProductCard.jsx";
import {
  usePublicCategories,
  usePublicProducts,
} from "../../hooks/useCatalogData.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

function ProductsLoading() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
        >
          <div className="aspect-square animate-pulse bg-gray-100" />

          <div className="space-y-4 p-5">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
            <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryString = searchParams.toString();

  const { categories, isLoading: categoriesLoading } = usePublicCategories();

  const { data, error, isLoading } = usePublicProducts(queryString);

  const currentSearch = searchParams.get("search") ?? "";

  const currentCategory = searchParams.get("category");

  const currentSort = searchParams.get("sort") ?? "newest";

  const currentPage = Number(searchParams.get("page") ?? "1");

  function updateParameters(updates, { resetPage = true } = {}) {
    const nextParameters = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        nextParameters.delete(key);
      } else {
        nextParameters.set(key, String(value));
      }
    });

    if (resetPage) {
      nextParameters.delete("page");
    }

    setSearchParams(nextParameters);
  }

  function handleClearFilters() {
    const nextParameters = new URLSearchParams(searchParams);

    ["minPrice", "maxPrice", "inStock", "featured"].forEach((key) => {
      nextParameters.delete(key);
    });

    nextParameters.delete("page");

    setSearchParams(nextParameters);
  }

  function handleClearAll() {
    setSearchParams(new URLSearchParams());
  }

  function handlePageChange(page) {
    updateParameters(
      {
        page,
      },
      {
        resetPage: false,
      },
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const products = data?.products ?? [];

  const pagination = data?.pagination ?? {
    page: currentPage,
    limit: 12,
    totalItems: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  const filterKey = [
    searchParams.get("minPrice") ?? "",
    searchParams.get("maxPrice") ?? "",
    searchParams.get("inStock") ?? "",
    searchParams.get("featured") ?? "",
  ].join("-");

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-500">
          Butterfly Dream
        </p>

        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
          Shop our collection
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
          Explore our accessories, browse categories, and find the option that
          matches your style.
        </p>
      </header>

      <div className="mt-10">
        <CategoryNavigation
          categories={categoriesLoading ? [] : categories}
          selectedCategory={currentCategory}
          onCategoryChange={(category) =>
            updateParameters({
              category,
            })
          }
        />
      </div>

      <div className="mt-8">
        <CatalogToolbar
          key={`search-${currentSearch}`}
          initialSearch={currentSearch}
          sort={currentSort}
          totalItems={pagination.totalItems}
          onSearch={(search) =>
            updateParameters({
              search,
            })
          }
          onSortChange={(sort) =>
            updateParameters({
              sort,
            })
          }
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <CatalogFilters
          key={filterKey}
          initialFilters={{
            minPrice: searchParams.get("minPrice"),

            maxPrice: searchParams.get("maxPrice"),

            inStock: searchParams.get("inStock"),

            featured: searchParams.get("featured"),
          }}
          onApply={(filters) => updateParameters(filters)}
          onClear={handleClearFilters}
        />

        <div className="min-w-0">
          {isLoading && <ProductsLoading />}

          {!isLoading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
              <ErrorOutlineRoundedIcon
                className="text-red-500"
                sx={{
                  fontSize: 52,
                }}
              />

              <h2 className="mt-4 text-xl font-bold text-red-800">
                Products could not be loaded
              </h2>

              <p className="mt-2 text-red-700">
                {getApiErrorMessage(error, "Unable to load products.")}
              </p>
            </div>
          )}

          {!isLoading && !error && products.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-16 text-center">
              <SearchOffRoundedIcon
                className="text-gray-400"
                sx={{
                  fontSize: 58,
                }}
              />

              <h2 className="mt-4 text-2xl font-bold text-gray-950">
                No products found
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-gray-600">
                Try changing the search term, category, price, or availability
                filters.
              </p>

              <button
                type="button"
                onClick={handleClearAll}
                className="mt-7 rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white hover:bg-gray-800"
              >
                Clear all filters
              </button>
            </div>
          )}

          {!isLoading && !error && products.length > 0 && (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <CatalogPagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                hasPreviousPage={pagination.hasPreviousPage}
                hasNextPage={pagination.hasNextPage}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default Products;
