import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

// MUI Icons
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

// Components
import AdminProductTable from "../../components/admin/products/AdminProductTable.jsx";
import CatalogPagination from "../../components/catalog/CatalogPagination.jsx";

// Services
import { fetchAdminCategories } from "../../services/adminCategoryApi.js";
import { fetchAdminProducts } from "../../services/adminProductApi.js";

// Utils
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

import { PRODUCT_STATUS_OPTIONS } from "../../utils/adminProductForm.js";

/* =========================================================
   HELPERS
========================================================= */

function formatStatusLabel(status) {
  return String(status ?? "")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

/* =========================================================
   PAGE
========================================================= */

function AdminProducts() {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryString = searchParams.toString();

  const [categories, setCategories] = useState([]);

  const [requestState, setRequestState] = useState({
    requestKey: null,
    data: null,
    error: null,
  });

  /* =======================================================
     LOAD CATEGORIES
  ======================================================= */

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const response = await fetchAdminCategories({
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setCategories(
            Array.isArray(response.categories) ? response.categories : [],
          );
        }
      } catch (error) {
        if (!controller.signal.aborted && error?.code !== "ERR_CANCELED") {
          setCategories([]);
        }
      }
    }

    void loadCategories();

    return () => {
      controller.abort();
    };
  }, []);

  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetchAdminProducts(
          new URLSearchParams(queryString),
          {
            signal: controller.signal,
          },
        );

        if (controller.signal.aborted) {
          return;
        }

        setRequestState({
          requestKey: queryString,
          data: response,
          error: null,
        });
      } catch (error) {
        if (controller.signal.aborted || error?.code === "ERR_CANCELED") {
          return;
        }

        setRequestState({
          requestKey: queryString,
          data: null,
          error,
        });
      }
    }

    void loadProducts();

    return () => {
      controller.abort();
    };
  }, [queryString]);

  /* =======================================================
     REQUEST STATE
  ======================================================= */

  const currentRequest = requestState.requestKey === queryString;

  const isLoading = !currentRequest;

  const data = currentRequest ? requestState.data : null;

  const error = currentRequest ? requestState.error : null;

  const products = data?.products ?? [];

  const pagination = data?.pagination ?? {
    page: Number(searchParams.get("page") ?? 1),

    totalPages: 0,
    totalItems: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  /* =======================================================
     FILTERS
  ======================================================= */

  function updateParameter(name, value, resetPage = true) {
    const nextParameters = new URLSearchParams(searchParams);

    if (value === null || value === undefined || value === "") {
      nextParameters.delete(name);
    } else {
      nextParameters.set(name, String(value));
    }

    if (resetPage) {
      nextParameters.delete("page");
    }

    setSearchParams(nextParameters);
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams());
  }

  const hasFilters =
    Boolean(searchParams.get("search")) ||
    Boolean(searchParams.get("categoryId")) ||
    Boolean(searchParams.get("status")) ||
    searchParams.get("sort") === "oldest" ||
    searchParams.get("sort") === "name_asc" ||
    searchParams.get("sort") === "name_desc" ||
    searchParams.get("archived") === "true";

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section
      className="
        mx-auto
        w-full
        max-w-[100rem]
        space-y-5

        sm:space-y-6
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header
        className="
          flex
          flex-col
          gap-4

          sm:flex-row
          sm:items-end
          sm:justify-between
          sm:gap-6
        "
      >
        <div className="min-w-0">
          <p
            className="
              text-[0.62rem]
              font-bold
              uppercase
              tracking-[0.13em]
              text-gray-400
            "
          >
            Catalog management
          </p>

          <h1
            className="
              mt-1
              text-2xl
              font-bold
              tracking-[-0.035em]
              text-gray-950

              sm:text-3xl
            "
          >
            Products
          </h1>

          <p
            className="
              mt-1.5
              max-w-2xl
              text-xs
              leading-5
              text-gray-500

              sm:text-sm
              sm:leading-6
            "
          >
            Create products and manage their variants, inventory, images,
            visibility, and storefront status.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="
            inline-flex
            min-h-11
            w-full
            shrink-0
            items-center
            justify-center
            gap-2
            rounded-full
            bg-gray-950
            px-5
            text-sm
            font-bold
            text-white
            transition-colors

            hover:bg-gray-800

            sm:w-auto
          "
        >
          <AddRoundedIcon
            sx={{
              fontSize: 18,
            }}
          />
          Add product
        </Link>
      </header>

      {/* =====================================================
          FILTERS
      ===================================================== */}
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
        {/* FILTER HEADER */}
        <div
          className="
            flex
            items-center
            justify-between
            gap-3
            border-b
            border-gray-100
            px-4
            py-4

            sm:px-5

            lg:px-6
          "
        >
          <div>
            <p
              className="
                text-[0.62rem]
                font-bold
                uppercase
                tracking-[0.12em]
                text-gray-400
              "
            >
              Search & filter
            </p>

            <h2
              className="
                mt-1
                text-base
                font-bold
                text-gray-950

                sm:text-lg
              "
            >
              Find products
            </h2>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="
                inline-flex
                shrink-0
                items-center
                gap-1.5
                rounded-full
                px-3
                py-2
                text-[0.68rem]
                font-bold
                text-gray-500
                transition-colors

                hover:bg-gray-100
                hover:text-gray-950

                sm:text-xs
              "
            >
              <FilterAltOffOutlinedIcon
                sx={{
                  fontSize: 15,
                }}
              />
              Clear
            </button>
          )}
        </div>

        {/* FILTER FIELDS */}
        <div
          className="
            grid
            gap-3
            p-4

            sm:grid-cols-2
            sm:p-5

            lg:grid-cols-3
            lg:p-6

            xl:grid-cols-[minmax(16rem,1.5fr)_minmax(11rem,0.9fr)_minmax(10rem,0.8fr)_minmax(10rem,0.8fr)_auto]
          "
        >
          {/* SEARCH */}
          <div
            className="
              sm:col-span-2

              lg:col-span-3

              xl:col-span-1
            "
          >
            <label
              htmlFor="product-search"
              className="
                text-[0.65rem]
                font-bold
                text-gray-600

                sm:text-xs
              "
            >
              Search
            </label>

            <div className="relative mt-1.5">
              <SearchRoundedIcon
                sx={{
                  fontSize: 19,
                }}
                className="
                  pointer-events-none
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                id="product-search"
                key={searchParams.get("search") ?? "empty-search"}
                type="search"
                defaultValue={searchParams.get("search") ?? ""}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    updateParameter("search", event.currentTarget.value.trim());
                  }
                }}
                placeholder="Product name or SKU"
                className="
                  min-h-11
                  w-full
                  rounded-[0.95rem]
                  border
                  border-gray-200
                  bg-white
                  py-2
                  pl-10
                  pr-4
                  text-sm
                  text-gray-900
                  outline-none
                  transition

                  placeholder:text-gray-400

                  focus:border-gray-400
                  focus:ring-4
                  focus:ring-gray-950/[0.035]
                "
              />
            </div>
          </div>

          {/* CATEGORY */}
          <div>
            <label
              htmlFor="product-category-filter"
              className="
                text-[0.65rem]
                font-bold
                text-gray-600

                sm:text-xs
              "
            >
              Category
            </label>

            <div className="relative mt-1.5">
              <select
                id="product-category-filter"
                value={searchParams.get("categoryId") ?? ""}
                onChange={(event) =>
                  updateParameter("categoryId", event.target.value)
                }
                className="
                  min-h-11
                  w-full
                  appearance-none
                  rounded-[0.95rem]
                  border
                  border-gray-200
                  bg-white
                  px-3.5
                  pr-9
                  text-sm
                  font-semibold
                  text-gray-700
                  outline-none

                  focus:border-gray-400
                  focus:ring-4
                  focus:ring-gray-950/[0.035]
                "
              >
                <option value="">All categories</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <KeyboardArrowDownRoundedIcon
                sx={{
                  fontSize: 18,
                }}
                className="
                  pointer-events-none
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />
            </div>
          </div>

          {/* STATUS */}
          <div>
            <label
              htmlFor="product-status-filter"
              className="
                text-[0.65rem]
                font-bold
                text-gray-600

                sm:text-xs
              "
            >
              Status
            </label>

            <div className="relative mt-1.5">
              <select
                id="product-status-filter"
                value={searchParams.get("status") ?? ""}
                onChange={(event) =>
                  updateParameter("status", event.target.value)
                }
                className="
                  min-h-11
                  w-full
                  appearance-none
                  rounded-[0.95rem]
                  border
                  border-gray-200
                  bg-white
                  px-3.5
                  pr-9
                  text-sm
                  font-semibold
                  text-gray-700
                  outline-none

                  focus:border-gray-400
                  focus:ring-4
                  focus:ring-gray-950/[0.035]
                "
              >
                <option value="">All statuses</option>

                {PRODUCT_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {formatStatusLabel(status)}
                  </option>
                ))}
              </select>

              <KeyboardArrowDownRoundedIcon
                sx={{
                  fontSize: 18,
                }}
                className="
                  pointer-events-none
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />
            </div>
          </div>

          {/* SORT */}
          <div>
            <label
              htmlFor="product-sort"
              className="
                text-[0.65rem]
                font-bold
                text-gray-600

                sm:text-xs
              "
            >
              Sort
            </label>

            <div className="relative mt-1.5">
              <select
                id="product-sort"
                value={searchParams.get("sort") ?? "newest"}
                onChange={(event) =>
                  updateParameter("sort", event.target.value)
                }
                className="
                  min-h-11
                  w-full
                  appearance-none
                  rounded-[0.95rem]
                  border
                  border-gray-200
                  bg-white
                  px-3.5
                  pr-9
                  text-sm
                  font-semibold
                  text-gray-700
                  outline-none

                  focus:border-gray-400
                  focus:ring-4
                  focus:ring-gray-950/[0.035]
                "
              >
                <option value="newest">Newest</option>

                <option value="oldest">Oldest</option>

                <option value="name_asc">Name A–Z</option>

                <option value="name_desc">Name Z–A</option>
              </select>

              <KeyboardArrowDownRoundedIcon
                sx={{
                  fontSize: 18,
                }}
                className="
                  pointer-events-none
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />
            </div>
          </div>

          {/* ARCHIVED */}
          <div
            className="
              sm:col-span-2

              lg:col-span-1

              xl:col-span-1
            "
          >
            <p
              className="
                text-[0.65rem]
                font-bold
                text-gray-600

                sm:text-xs
              "
            >
              Archive
            </p>

            <label
              className={[
                `
                  mt-1.5
                  flex
                  min-h-11
                  cursor-pointer
                  items-center
                  gap-3
                  rounded-[0.95rem]
                  border
                  px-3.5
                  transition-colors
                `,
                searchParams.get("archived") === "true"
                  ? `
                    border-gray-950
                    bg-gray-950
                    text-white
                  `
                  : `
                    border-gray-200
                    bg-white
                    text-gray-700

                    hover:bg-gray-50
                  `,
              ].join(" ")}
            >
              <input
                type="checkbox"
                checked={searchParams.get("archived") === "true"}
                onChange={(event) =>
                  updateParameter(
                    "archived",
                    event.target.checked ? "true" : null,
                  )
                }
                className="
                  h-4
                  w-4
                  shrink-0
                  accent-gray-950
                "
              />

              <span
                className="
                  whitespace-nowrap
                  text-xs
                  font-bold

                  sm:text-sm
                "
              >
                Archived only
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* =====================================================
          PRODUCT COUNT
      ===================================================== */}
      {!isLoading && !error && (
        <section
          className="
              flex
              items-center
              justify-between
              gap-4
              rounded-[1.2rem]
              border
              border-gray-200/80
              bg-white
              px-4
              py-3.5
              shadow-[0_6px_20px_rgba(15,23,42,0.03)]

              sm:px-5
            "
        >
          <div>
            <p
              className="
                  text-[0.6rem]
                  font-bold
                  uppercase
                  tracking-[0.1em]
                  text-gray-400
                "
            >
              Products found
            </p>

            <p
              className="
                  mt-1
                  text-xl
                  font-bold
                  tracking-[-0.03em]
                  text-gray-950

                  sm:text-2xl
                "
            >
              {pagination.totalItems}
            </p>
          </div>

          <span
            className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-gray-950
                text-white
              "
          >
            <Inventory2OutlinedIcon
              sx={{
                fontSize: 19,
              }}
            />
          </span>
        </section>
      )}

      {/* =====================================================
          LOADING
      ===================================================== */}
      {isLoading && (
        <>
          {/* MOBILE / TABLET */}
          <div
            className="
              space-y-3

              lg:hidden
            "
          >
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <div
                key={index}
                className="
                  h-64
                  animate-pulse
                  rounded-[1.2rem]
                  bg-gray-100
                "
              />
            ))}
          </div>

          {/* DESKTOP */}
          <div
            className="
              hidden
              overflow-hidden
              rounded-[1.4rem]
              border
              border-gray-200/80
              bg-white

              lg:block
            "
          >
            <div
              className="
                h-14
                animate-pulse
                border-b
                border-gray-100
                bg-gray-50
              "
            />

            {Array.from({
              length: 6,
            }).map((_, index) => (
              <div
                key={index}
                className="
                  h-20
                  animate-pulse
                  border-b
                  border-gray-100
                  bg-white
                "
              />
            ))}
          </div>
        </>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}
      {!isLoading && error && (
        <div
          className="
              rounded-[1.4rem]
              border
              border-red-200
              bg-white
              px-5
              py-10
              text-center
              shadow-[0_8px_24px_rgba(15,23,42,0.04)]

              sm:px-8
              sm:py-12
            "
        >
          <span
            className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-red-50
                text-red-600
                ring-1
                ring-red-100
              "
          >
            <ErrorOutlineRoundedIcon
              sx={{
                fontSize: 26,
              }}
            />
          </span>

          <p
            className="
                mt-5
                text-[0.62rem]
                font-bold
                uppercase
                tracking-[0.12em]
                text-red-500
              "
          >
            Loading error
          </p>

          <h2
            className="
                mt-1.5
                text-xl
                font-bold
                tracking-[-0.025em]
                text-gray-950
              "
          >
            Products could not be loaded
          </h2>

          <p
            className="
                mx-auto
                mt-2
                max-w-md
                text-xs
                leading-5
                text-gray-500

                sm:text-sm
                sm:leading-6
              "
          >
            {getApiErrorMessage(error, "Unable to load products.")}
          </p>
        </div>
      )}

      {/* =====================================================
          EMPTY
      ===================================================== */}
      {!isLoading && !error && products.length === 0 && (
        <div
          className="
              rounded-[1.4rem]
              border
              border-gray-200/80
              bg-white
              px-5
              py-10
              text-center
              shadow-[0_8px_24px_rgba(15,23,42,0.04)]

              sm:px-8
              sm:py-14
            "
        >
          <span
            className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-gray-100
                text-gray-400
                ring-1
                ring-gray-200
              "
          >
            <Inventory2OutlinedIcon
              sx={{
                fontSize: 25,
              }}
            />
          </span>

          <p
            className="
                mt-5
                text-[0.62rem]
                font-bold
                uppercase
                tracking-[0.12em]
                text-gray-400
              "
          >
            Catalog
          </p>

          <h3
            className="
                mt-1.5
                text-xl
                font-bold
                text-gray-950

                sm:text-2xl
              "
          >
            No products found
          </h3>

          <p
            className="
                mx-auto
                mt-2
                max-w-md
                text-xs
                leading-5
                text-gray-500

                sm:text-sm
                sm:leading-6
              "
          >
            {hasFilters
              ? "No products match the selected filters."
              : "Create your first product to begin building the storefront catalog."}
          </p>

          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="
                  mt-5
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  border
                  border-gray-200
                  bg-white
                  px-5
                  text-sm
                  font-bold
                  text-gray-700
                  transition-colors

                  hover:bg-gray-100
                "
            >
              <FilterAltOffOutlinedIcon
                sx={{
                  fontSize: 17,
                }}
              />
              Clear filters
            </button>
          ) : (
            <Link
              to="/admin/products/new"
              className="
                  mt-5
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-gray-950
                  px-5
                  text-sm
                  font-bold
                  text-white
                  transition-colors

                  hover:bg-gray-800
                "
            >
              <AddRoundedIcon
                sx={{
                  fontSize: 18,
                }}
              />
              Create product
            </Link>
          )}
        </div>
      )}

      {/* =====================================================
          PRODUCTS
      ===================================================== */}
      {!isLoading && !error && products.length > 0 && (
        <>
          <AdminProductTable products={products} />

          <CatalogPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            hasPreviousPage={pagination.hasPreviousPage}
            hasNextPage={pagination.hasNextPage}
            onPageChange={(page) => updateParameter("page", page, false)}
          />
        </>
      )}
    </section>
  );
}

export default AdminProducts;
