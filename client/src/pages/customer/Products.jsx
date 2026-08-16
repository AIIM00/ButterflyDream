import { useSearchParams } from "react-router-dom";

// MUI Icons
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";

// Components
import CatalogFilters from "../../components/catalog/CatalogFilters.jsx";
import CatalogPagination from "../../components/catalog/CatalogPagination.jsx";
import CatalogToolbar from "../../components/catalog/CatalogToolbar.jsx";
import CategoryNavigation from "../../components/catalog/CategoryNavigation.jsx";
import ProductCard from "../../components/catalog/ProductCard.jsx";

// Hooks
import {
  usePublicCategories,
  usePublicProducts,
} from "../../hooks/useCatalogData.js";

// Utils
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

function ProductsLoading() {
  return (
    <div
      className="
        grid
        grid-cols-2
        gap-x-3
        gap-y-7

        sm:gap-x-5

        lg:grid-cols-3
        lg:gap-x-6
        lg:gap-y-9
      "
    >
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <article
          key={index}
          className="
            overflow-hidden
            rounded-[1.4rem]
            bg-brand-surface
          "
        >
          <div
            className="
              aspect-[4/5]
              animate-pulse
              rounded-[1.4rem]
              bg-brand-cream
            "
          />

          <div className="space-y-3 px-1 pt-4">
            <div
              className="
                h-2.5
                w-16
                animate-pulse
                rounded-full
                bg-brand-cream
              "
            />

            <div
              className="
                h-5
                w-4/5
                animate-pulse
                rounded
                bg-brand-cream
              "
            />

            <div
              className="
                h-4
                w-16
                animate-pulse
                rounded
                bg-brand-cream
              "
            />
          </div>
        </article>
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
    <main
      className="
        min-h-screen
        bg-brand-ivory
        text-brand-espresso
      "
    >
      {/* ==================================================
          OPENING
      ================================================== */}
      <section
        className="
          mx-auto
          max-w-7xl
          px-4
          pb-7
          pt-8

          sm:px-6
          sm:pb-9
          sm:pt-12

          lg:px-8
          lg:pb-12
          lg:pt-16
        "
      >
        <div
          className="
            grid
            gap-6

            lg:grid-cols-12
            lg:items-end
          "
        >
          <div className="lg:col-span-8">
            <div
              className="
                flex
                items-center
                gap-2
                text-[0.63rem]
                font-bold
                uppercase
                tracking-[0.22em]
                text-brand-bronze
              "
            >
              <AutoAwesomeOutlinedIcon
                sx={{
                  fontSize: 14,
                }}
              />
              Butterfly Dream
            </div>

            <h1
              className="
                mt-4
                max-w-xl
                font-display
                text-[3.15rem]
                font-medium
                leading-[0.9]
                tracking-[-0.055em]
                text-brand-espresso

                sm:text-6xl

                lg:text-[4.6rem]
              "
            >
              Find what
              <span
                className="
                  block
                  italic
                  text-brand-bronze
                "
              >
                speaks to you.
              </span>
            </h1>
          </div>

          <div
            className="
              lg:col-span-4
            "
          >
            <p
              className="
                max-w-md
                text-sm
                leading-7
                text-brand-muted

                sm:text-[0.95rem]
              "
            >
              Explore pieces designed to become part of your everyday story —
              from delicate jewelry to meaningful accessories.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          CATEGORY NAVIGATION
      ================================================== */}
      <section
        className="
          border-y
          border-brand-border
          bg-brand-surface/60
        "
      >
        <div
          className="
            mx-auto
            max-w-7xl
            px-4
            py-4

            sm:px-6

            lg:px-8
          "
        >
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
      </section>

      {/* ==================================================
          SHOP CONTROLS
      ================================================== */}
      <section
        className="
          mx-auto
          max-w-7xl
          px-4
          pb-20
          pt-6

          sm:px-6
          sm:pt-8

          lg:px-8
          lg:pb-28
          lg:pt-10
        "
      >
        <div
          className="
            rounded-[1.5rem]
            border
            border-brand-border
            bg-brand-surface
            p-3

            sm:p-4
          "
        >
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

        {/* ==================================================
            FILTERS + PRODUCTS
        ================================================== */}
        <div
          className="
            mt-7
            grid
            gap-8

            lg:grid-cols-[15.5rem_minmax(0,1fr)]
            lg:gap-10
          "
        >
          {/* FILTERS */}
          <aside
            className="
              min-w-0

              lg:sticky
              lg:top-24
              lg:self-start
            "
          >
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
          </aside>

          {/* PRODUCTS AREA */}
          <div className="min-w-0">
            {/* SMALL COLLECTION HEADING */}
            {!isLoading && !error && products.length > 0 && (
              <div
                className="
                    mb-5
                    flex
                    items-end
                    justify-between
                    gap-4

                    sm:mb-7
                  "
              >
                <div>
                  <p
                    className="
                        text-[0.6rem]
                        font-bold
                        uppercase
                        tracking-[0.18em]
                        text-brand-bronze
                      "
                  >
                    Our collection
                  </p>

                  <h2
                    className="
                        mt-1
                        font-display
                        text-2xl
                        font-medium
                        tracking-[-0.03em]
                        text-brand-espresso

                        sm:text-3xl
                      "
                  >
                    Pieces chosen for you
                  </h2>
                </div>

                <p
                  className="
                      shrink-0
                      text-xs
                      text-brand-muted
                    "
                >
                  {pagination.totalItems}{" "}
                  {pagination.totalItems === 1 ? "piece" : "pieces"}
                </p>
              </div>
            )}

            {/* LOADING */}
            {isLoading && <ProductsLoading />}

            {/* ERROR */}
            {!isLoading && error && (
              <div
                className="
                    rounded-[1.75rem]
                    border
                    border-red-200
                    bg-red-50
                    px-6
                    py-14
                    text-center
                  "
              >
                <span
                  className="
                      mx-auto
                      inline-flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                      bg-red-100
                      text-red-600
                    "
                >
                  <ErrorOutlineRoundedIcon
                    sx={{
                      fontSize: 28,
                    }}
                  />
                </span>

                <p
                  className="
                      mt-5
                      text-[0.62rem]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-red-600
                    "
                >
                  Something went wrong
                </p>

                <h2
                  className="
                      mt-2
                      font-display
                      text-3xl
                      font-medium
                      tracking-[-0.035em]
                      text-red-900
                    "
                >
                  Products could not be loaded.
                </h2>

                <p
                  className="
                      mx-auto
                      mt-3
                      max-w-md
                      text-sm
                      leading-6
                      text-red-700
                    "
                >
                  {getApiErrorMessage(error, "Unable to load products.")}
                </p>
              </div>
            )}

            {/* EMPTY */}
            {!isLoading && !error && products.length === 0 && (
              <div
                className="
                    rounded-[1.75rem]
                    border
                    border-brand-border
                    bg-brand-surface
                    px-6
                    py-16
                    text-center
                  "
              >
                <span
                  className="
                      mx-auto
                      inline-flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                      bg-brand-cream
                      text-brand-bronze
                    "
                >
                  <SearchOffRoundedIcon
                    sx={{
                      fontSize: 28,
                    }}
                  />
                </span>

                <p
                  className="
                      mt-5
                      text-[0.62rem]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-brand-bronze
                    "
                >
                  Nothing here yet
                </p>

                <h2
                  className="
                      mt-2
                      font-display
                      text-3xl
                      font-medium
                      tracking-[-0.035em]
                      text-brand-espresso
                    "
                >
                  No pieces match your search.
                </h2>

                <p
                  className="
                      mx-auto
                      mt-3
                      max-w-lg
                      text-sm
                      leading-6
                      text-brand-muted
                    "
                >
                  Try another category, change the price range, or clear the
                  current filters to explore more of the collection.
                </p>

                <button
                  type="button"
                  onClick={handleClearAll}
                  className="
                      mt-7
                      rounded-full
                      bg-brand-espresso
                      px-6
                      py-3
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-brand-emerald
                    "
                >
                  Explore all pieces
                </button>
              </div>
            )}

            {/* PRODUCTS */}
            {!isLoading && !error && products.length > 0 && (
              <>
                <div
                  className="
    grid
    grid-cols-2
    items-stretch

    gap-x-3
    gap-y-5

    sm:gap-x-5
    sm:gap-y-7
  "
                >
                  {products.map((product, index) => {
                    const isFeaturedLayout = (index + 1) % 5 === 0;

                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        layout={isFeaturedLayout ? "featured" : "compact"}
                      />
                    );
                  })}
                </div>

                <div className="mt-12 sm:mt-16">
                  <CatalogPagination
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    hasPreviousPage={pagination.hasPreviousPage}
                    hasNextPage={pagination.hasNextPage}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Products;
