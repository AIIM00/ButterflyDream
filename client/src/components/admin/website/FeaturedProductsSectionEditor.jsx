import { useEffect, useState } from "react";

import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

import { toast } from "react-toastify";

import { fetchAdminProducts } from "../../../services/adminProductApi.js";

import { updateAdminHomeSection } from "../../../services/adminSiteContent.js";

const MAX_PRODUCTS = 4;

const DEFAULT_CONTENT = {
  eyebrow: "Selected for you",

  title: "Pieces chosen to carry your story.",

  description:
    "Discover signature Butterfly Dream accessories selected for their elegance, meaning, and ability to make an everyday moment feel personal.",

  buttonText: "View featured pieces",

  buttonUrl: "/products?featured=true",

  selectionMode: "automatic",

  productLimit: 4,

  productIds: [],
};

function formatProductPrice(product) {
  if (!product?.minimumPrice) {
    return "Price unavailable";
  }

  return `$${Number(product.minimumPrice).toFixed(2)}`;
}

function FeaturedProductsSectionEditor({ section, onClose, onSaved }) {
  const content = {
    ...DEFAULT_CONTENT,
    ...(section.content ?? {}),
  };

  const [name, setName] = useState(section.name ?? "Featured Products");

  const [eyebrow, setEyebrow] = useState(content.eyebrow);

  const [title, setTitle] = useState(content.title);

  const [description, setDescription] = useState(content.description);

  const [buttonText, setButtonText] = useState(content.buttonText);

  const [buttonUrl, setButtonUrl] = useState(content.buttonUrl);

  const [selectionMode, setSelectionMode] = useState(
    content.selectionMode === "manual" ? "manual" : "automatic",
  );

  const [productLimit, setProductLimit] = useState(
    Number(content.productLimit) || 4,
  );

  const [selectedProductIds, setSelectedProductIds] = useState(
    Array.isArray(content.productIds) ? content.productIds.slice(0, 4) : [],
  );

  const [products, setProducts] = useState([]);

  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const [productError, setProductError] = useState(null);

  const [searchInput, setSearchInput] = useState("");

  const [search, setSearch] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setIsLoadingProducts(true);

      try {
        const response = await fetchAdminProducts(
          {
            page: 1,

            limit: 100,

            status: "ACTIVE",

            archived: false,

            sort: "newest",

            ...(search
              ? {
                  search,
                }
              : {}),
          },

          {
            signal: controller.signal,
          },
        );

        if (controller.signal.aborted) {
          return;
        }

        setProducts(Array.isArray(response.products) ? response.products : []);

        setProductError(null);
      } catch (error) {
        if (controller.signal.aborted || error?.code === "ERR_CANCELED") {
          return;
        }

        setProductError(error);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingProducts(false);
        }
      }
    }

    void loadProducts();

    return () => {
      controller.abort();
    };
  }, [search]);

  const productById = new Map(products.map((product) => [product.id, product]));

  const selectedProducts = selectedProductIds
    .map((productId) => productById.get(productId))
    .filter(Boolean);

  function handleSearch(event) {
    event.preventDefault();

    setSearch(searchInput.trim());
  }

  function toggleProduct(product) {
    const isSelected = selectedProductIds.includes(product.id);

    if (isSelected) {
      setSelectedProductIds((current) =>
        current.filter((productId) => productId !== product.id),
      );

      return;
    }

    if (selectedProductIds.length >= MAX_PRODUCTS) {
      toast.error("You can display up to 4 featured products.");

      return;
    }

    setSelectedProductIds((current) => [...current, product.id]);
  }

  function moveProduct(index, direction) {
    const destination = index + direction;

    if (destination < 0 || destination >= selectedProductIds.length) {
      return;
    }

    setSelectedProductIds((current) => {
      const next = [...current];

      [next[index], next[destination]] = [next[destination], next[index]];

      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Section name is required.");

      return;
    }

    if (!title.trim()) {
      toast.error("Section title is required.");

      return;
    }

    if (selectionMode === "manual" && selectedProductIds.length === 0) {
      toast.error("Select at least one product or switch to Automatic mode.");

      return;
    }

    const safeProductLimit = Math.min(
      4,
      Math.max(1, Number(productLimit) || 4),
    );

    setIsSaving(true);

    try {
      const updatedSection = await updateAdminHomeSection(section.id, {
        name: name.trim(),

        content: {
          eyebrow: eyebrow.trim(),

          title: title.trim(),

          description: description.trim(),

          buttonText: buttonText.trim(),

          buttonUrl: buttonUrl.trim(),

          selectionMode,

          productLimit: safeProductLimit,

          productIds: selectedProductIds,
        },
      });

      toast.success("Featured Products updated successfully.");

      onSaved?.(updatedSection);

      onClose();
    } catch (error) {
      toast.error(error?.message || "Unable to update Featured Products.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        disabled={isSaving}
        aria-label="Close Featured Products editor"
        className="absolute inset-0 bg-gray-950/60"
      />

      <form
        onSubmit={handleSubmit}
        className="
          relative z-10
          flex
          max-h-[94vh]
          w-full
          max-w-5xl
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >
        <header className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gray-950 text-white">
              <StarRoundedIcon />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Homepage section
              </p>

              <h3 className="mt-1 text-xl font-bold text-gray-950">
                Edit Featured Products
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close"
            className="
              inline-flex
              h-10 w-10
              items-center
              justify-center
              rounded-xl
              text-gray-500
              transition
              hover:bg-gray-100
              hover:text-gray-950
              disabled:opacity-50
            "
          >
            <CloseRoundedIcon />
          </button>
        </header>

        <div className="flex-1 space-y-7 overflow-y-auto p-6">
          {/* CONTENT */}
          <section className="rounded-2xl border border-gray-200 p-5">
            <h4 className="font-bold text-gray-950">Section content</h4>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label>
                <span className="text-sm font-semibold text-gray-800">
                  Admin section name
                </span>

                <input
                  value={name}
                  maxLength={120}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
                />
              </label>

              <label>
                <span className="text-sm font-semibold text-gray-800">
                  Eyebrow
                </span>

                <input
                  value={eyebrow}
                  onChange={(event) => setEyebrow(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
                />
              </label>
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-gray-800">Title</span>

              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
              />
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-gray-800">
                Description
              </span>

              <textarea
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="mt-2 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm leading-6 outline-none focus:border-gray-950"
              />
            </label>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label>
                <span className="text-sm font-semibold text-gray-800">
                  Button text
                </span>

                <input
                  value={buttonText}
                  onChange={(event) => setButtonText(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
                />
              </label>

              <label>
                <span className="text-sm font-semibold text-gray-800">
                  Button URL
                </span>

                <input
                  value={buttonUrl}
                  onChange={(event) => setButtonUrl(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
                />
              </label>
            </div>
          </section>

          {/* SELECTION MODE */}
          <section className="rounded-2xl border border-gray-200 p-5">
            <h4 className="font-bold text-gray-950">Product selection</h4>

            <p className="mt-1 text-sm text-gray-500">
              Choose how products are selected for this section.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setSelectionMode("automatic")}
                className={[
                  "rounded-2xl border p-5 text-left transition",
                  selectionMode === "automatic"
                    ? "border-gray-950 bg-gray-950 text-white"
                    : "border-gray-200 bg-white text-gray-950 hover:border-gray-400",
                ].join(" ")}
              >
                <p className="font-bold">Automatic</p>

                <p
                  className={[
                    "mt-2 text-xs leading-5",
                    selectionMode === "automatic"
                      ? "text-gray-300"
                      : "text-gray-500",
                  ].join(" ")}
                >
                  Automatically show the newest products marked as Featured in
                  Product Management.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectionMode("manual")}
                className={[
                  "rounded-2xl border p-5 text-left transition",
                  selectionMode === "manual"
                    ? "border-gray-950 bg-gray-950 text-white"
                    : "border-gray-200 bg-white text-gray-950 hover:border-gray-400",
                ].join(" ")}
              >
                <p className="font-bold">Manual</p>

                <p
                  className={[
                    "mt-2 text-xs leading-5",
                    selectionMode === "manual"
                      ? "text-gray-300"
                      : "text-gray-500",
                  ].join(" ")}
                >
                  Choose the exact products and display order yourself.
                </p>
              </button>
            </div>

            {selectionMode === "automatic" && (
              <label className="mt-5 block max-w-xs">
                <span className="text-sm font-semibold text-gray-800">
                  Number of products
                </span>

                <select
                  value={productLimit}
                  onChange={(event) =>
                    setProductLimit(Number(event.target.value))
                  }
                  className="
                    mt-2
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-gray-950
                  "
                >
                  <option value={1}>1 product</option>

                  <option value={2}>2 products</option>

                  <option value={3}>3 products</option>

                  <option value={4}>4 products</option>
                </select>
              </label>
            )}

            {selectionMode === "manual" && (
              <>
                {/* Selected order */}
                {selectedProducts.length > 0 && (
                  <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        Display order
                      </p>

                      <span className="text-xs text-gray-500">
                        {selectedProductIds.length}
                        /4 selected
                      </span>
                    </div>

                    <div className="space-y-2">
                      {selectedProducts.map((product, index) => (
                        <div
                          key={product.id}
                          className="
                              flex
                              items-center
                              gap-3
                              rounded-xl
                              border
                              border-gray-200
                              bg-gray-50
                              p-3
                            "
                        >
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-200">
                            {product.image?.imageUrl && (
                              <img
                                src={product.image.imageUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-gray-950">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {formatProductPrice(product)}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveProduct(index, -1)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-500 disabled:opacity-30"
                          >
                            <ArrowUpwardRoundedIcon fontSize="small" />
                          </button>

                          <button
                            type="button"
                            disabled={index === selectedProducts.length - 1}
                            onClick={() => moveProduct(index, 1)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-500 disabled:opacity-30"
                          >
                            <ArrowDownwardRoundedIcon fontSize="small" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product search */}
                <div className="mt-6 border-t border-gray-200 pt-5">
                  <form onSubmit={handleSearch} className="relative">
                    <SearchRoundedIcon
                      fontSize="small"
                      className="
                        pointer-events-none
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        text-gray-400
                      "
                    />

                    <input
                      type="search"
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      placeholder="Search active products..."
                      className="
                        w-full
                        rounded-xl
                        border
                        border-gray-300
                        py-3
                        pl-10
                        pr-4
                        text-sm
                        outline-none
                        focus:border-gray-950
                      "
                    />
                  </form>

                  {isLoadingProducts ? (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {Array.from({
                        length: 6,
                      }).map((_, index) => (
                        <div
                          key={index}
                          className="h-24 animate-pulse rounded-xl bg-gray-100"
                        />
                      ))}
                    </div>
                  ) : productError ? (
                    <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                      {productError.message || "Unable to load products."}
                    </p>
                  ) : (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {products.map((product) => {
                        const isSelected = selectedProductIds.includes(
                          product.id,
                        );

                        return (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => toggleProduct(product)}
                            className={[
                              "flex items-center gap-3 rounded-xl border p-3 text-left transition",
                              isSelected
                                ? "border-gray-950 bg-gray-950 text-white"
                                : "border-gray-200 bg-white text-gray-950 hover:border-gray-400",
                            ].join(" ")}
                          >
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                              {product.image?.imageUrl && (
                                <img
                                  src={product.image.imageUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold">
                                {product.name}
                              </p>

                              <p
                                className={[
                                  "mt-1 text-xs",
                                  isSelected
                                    ? "text-gray-300"
                                    : "text-gray-500",
                                ].join(" ")}
                              >
                                {formatProductPrice(product)}
                              </p>

                              {product.isFeatured && (
                                <p
                                  className={[
                                    "mt-1 text-[0.65rem] font-bold uppercase tracking-wide",
                                    isSelected
                                      ? "text-amber-300"
                                      : "text-amber-600",
                                  ].join(" ")}
                                >
                                  Featured
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>

        <footer className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="
              rounded-xl
              border border-gray-300
              bg-white
              px-5 py-2.5
              text-sm font-semibold
              text-gray-700
              hover:bg-gray-100
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="
              inline-flex
              items-center gap-2
              rounded-xl
              bg-gray-950
              px-5 py-2.5
              text-sm font-semibold
              text-white
              hover:bg-gray-800
              disabled:opacity-50
            "
          >
            <CheckRoundedIcon fontSize="small" />

            {isSaving ? "Saving..." : "Save featured products"}
          </button>
        </footer>
      </form>
    </div>
  );
}

export default FeaturedProductsSectionEditor;
