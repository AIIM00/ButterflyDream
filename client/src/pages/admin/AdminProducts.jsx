import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AdminProductTable from "../../components/admin/products/AdminProductTable.jsx";
import CatalogPagination from "../../components/catalog/CatalogPagination.jsx";
import { fetchAdminCategories } from "../../services/adminCategoryApi.js";
import { fetchAdminProducts } from "../../services/adminProductApi.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";
import { PRODUCT_STATUS_OPTIONS } from "../../utils/adminProductForm.js";

function AdminProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryString = searchParams.toString();

  const [categories, setCategories] = useState([]);

  const [requestState, setRequestState] = useState({
    requestKey: null,
    data: null,
    error: null,
  });

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

  return (
    <section className="space-y-7">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Catalog management
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
            Products
          </h2>

          <p className="mt-3 text-gray-600">
            Create products and manage variants, inventory, images, and status.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white hover:bg-gray-800"
        >
          <AddRoundedIcon />
          Add product
        </Link>
      </header>

      <div className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:grid-cols-[minmax(0,1fr)_repeat(4,auto)]">
        <label className="relative">
          <SearchRoundedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            defaultValue={searchParams.get("search") ?? ""}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                updateParameter("search", event.currentTarget.value.trim());
              }
            }}
            placeholder="Search products or SKUs"
            className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-gray-950"
          />
        </label>

        <select
          value={searchParams.get("categoryId") ?? ""}
          onChange={(event) =>
            updateParameter("categoryId", event.target.value)
          }
          className="rounded-xl border border-gray-300 bg-white px-4 py-3"
        >
          <option value="">All categories</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={searchParams.get("status") ?? ""}
          onChange={(event) => updateParameter("status", event.target.value)}
          className="rounded-xl border border-gray-300 bg-white px-4 py-3"
        >
          <option value="">All statuses</option>

          {PRODUCT_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={searchParams.get("sort") ?? "newest"}
          onChange={(event) => updateParameter("sort", event.target.value)}
          className="rounded-xl border border-gray-300 bg-white px-4 py-3"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name_asc">Name A–Z</option>
          <option value="name_desc">Name Z–A</option>
        </select>

        <label className="flex items-center gap-2 rounded-xl border border-gray-300 px-4">
          <input
            type="checkbox"
            checked={searchParams.get("archived") === "true"}
            onChange={(event) =>
              updateParameter("archived", event.target.checked ? "true" : null)
            }
          />

          <span className="text-sm font-semibold">Archived</span>
        </label>
      </div>

      {!isLoading && !error && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">Products found</p>

          <p className="mt-2 text-3xl font-bold text-gray-950">
            {pagination.totalItems}
          </p>
        </div>
      )}

      {isLoading && (
        <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
      )}

      {!isLoading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-14 text-center">
          <ErrorOutlineRoundedIcon
            className="text-red-500"
            sx={{ fontSize: 56 }}
          />

          <p className="mt-4 font-bold text-red-800">
            {getApiErrorMessage(error, "Unable to load products.")}
          </p>
        </div>
      )}

      {!isLoading && !error && products.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
          <Inventory2OutlinedIcon
            className="text-gray-300"
            sx={{ fontSize: 64 }}
          />

          <h3 className="mt-4 text-2xl font-bold">No products found</h3>
        </div>
      )}

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
