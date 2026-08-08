import { useEffect, useMemo, useState } from "react";

import { toast } from "react-toastify";
import { Link } from "react-router-dom";
// MUI Icons
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
// Services
import {
  createInStoreSale,
  fetchInStoreSaleProducts,
} from "../../services/adminInStoreSaleApi.js";
// Utils
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

function formatMoney(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numericValue);
}

function ProductImage({ product }) {
  if (!product.image?.imageUrl) {
    return (
      <div
        className="
          flex h-16 w-16 shrink-0
          items-center justify-center
          rounded-xl
          bg-[var(--color-soft-ivory)]
          text-[var(--color-warm-gray)]
        "
      >
        <ImageNotSupportedOutlinedIcon />
      </div>
    );
  }

  return (
    <img
      src={product.image.imageUrl}
      alt={product.image.altText || product.productName || "Product"}
      className="
        h-16 w-16 shrink-0
        rounded-xl object-cover
      "
    />
  );
}

function StockLabel({ product }) {
  const stock = Number(product.stockQuantity ?? 0);

  if (stock <= 0) {
    return (
      <span className="text-xs font-semibold text-red-600">Out of stock</span>
    );
  }

  if (stock <= Number(product.lowStockThreshold ?? 0)) {
    return (
      <span className="text-xs font-semibold text-amber-700">
        {stock} left · Low stock
      </span>
    );
  }

  return (
    <span className="text-xs font-semibold text-emerald-700">
      {stock} in stock
    </span>
  );
}

function ProductResultCard({ product, selectedQuantity, onAdd }) {
  const stockQuantity = Number(product.stockQuantity ?? 0);

  const remainingQuantity = stockQuantity - selectedQuantity;

  const canAdd = remainingQuantity > 0;

  return (
    <article
      className="
        border
        border-[var(--color-warm-light-gray)]
        bg-white
        p-4
      "
    >
      <div className="flex gap-4">
        <ProductImage product={product} />

        <div className="min-w-0 flex-1">
          <div
            className="
              flex flex-col gap-3
              sm:flex-row sm:items-start
              sm:justify-between
            "
          >
            <div className="min-w-0">
              <p
                className="
                  truncate text-base font-bold
                  text-[var(--color-deep-espresso)]
                "
              >
                {product.productName}
              </p>

              <p
                className="
                  mt-1 text-sm font-medium
                  text-[var(--color-warm-gray)]
                "
              >
                {product.displayName}
              </p>

              <p
                className="
                  mt-1 text-xs
                  uppercase
                  tracking-[0.08em]
                  text-[var(--color-warm-gray)]
                "
              >
                SKU: {product.sku}
              </p>
            </div>

            <div className="shrink-0 sm:text-right">
              <p
                className="
                  text-lg font-bold
                  text-[var(--color-deep-espresso)]
                "
              >
                {formatMoney(product.price)}
              </p>

              <div className="mt-1">
                <StockLabel product={product} />
              </div>
            </div>
          </div>

          <div
            className="
              mt-4 flex flex-wrap
              items-center justify-between
              gap-3
            "
          >
            <div className="text-xs text-[var(--color-warm-gray)]">
              {product.category?.name || "Uncategorized"}

              {selectedQuantity > 0 && (
                <span className="ml-2 font-semibold">
                  · {selectedQuantity} already added
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => onAdd(product)}
              disabled={!canAdd}
              className="
                inline-flex min-h-10
                items-center justify-center
                gap-2 rounded-full
                bg-[var(--color-deep-espresso)]
                px-5
                text-sm font-semibold
                text-white
                transition
                hover:opacity-90
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <AddRoundedIcon fontSize="small" />

              {stockQuantity <= 0
                ? "Out of stock"
                : !canAdd
                  ? "Max added"
                  : "Add to sale"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function SaleItem({ item, onIncrease, onDecrease, onRemove }) {
  const lineTotal = Number(item.price) * Number(item.quantity);

  return (
    <article
      className="
        border-b
        border-[var(--color-warm-light-gray)]
        py-4
        last:border-b-0
      "
    >
      <div className="flex gap-3">
        <ProductImage product={item} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p
                className="
                  truncate text-sm font-bold
                  text-[var(--color-deep-espresso)]
                "
              >
                {item.productName}
              </p>

              <p
                className="
                  mt-1 text-xs
                  text-[var(--color-warm-gray)]
                "
              >
                {item.displayName}
              </p>

              <p
                className="
                  mt-1 text-[0.6875rem]
                  uppercase tracking-[0.08em]
                  text-[var(--color-warm-gray)]
                "
              >
                {item.sku}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="
                flex h-9 w-9 shrink-0
                items-center justify-center
                rounded-full
                text-red-600
                transition
                hover:bg-red-50
              "
              aria-label={`Remove ${item.productName}`}
            >
              <DeleteOutlineRoundedIcon fontSize="small" />
            </button>
          </div>

          <div
            className="
              mt-4 flex flex-wrap
              items-center justify-between
              gap-3
            "
          >
            <div
              className="
                inline-flex items-center
                rounded-full
                border
                border-[var(--color-warm-light-gray)]
              "
            >
              <button
                type="button"
                onClick={() => onDecrease(item.id)}
                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-full
                  transition
                  hover:bg-[var(--color-soft-ivory)]
                "
                aria-label="Decrease quantity"
              >
                <RemoveRoundedIcon fontSize="small" />
              </button>

              <span
                className="
                  min-w-10 text-center
                  text-sm font-bold
                  text-[var(--color-deep-espresso)]
                "
              >
                {item.quantity}
              </span>

              <button
                type="button"
                onClick={() => onIncrease(item.id)}
                disabled={item.quantity >= item.stockQuantity}
                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-full
                  transition
                  hover:bg-[var(--color-soft-ivory)]
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
                aria-label="Increase quantity"
              >
                <AddRoundedIcon fontSize="small" />
              </button>
            </div>

            <div className="text-right">
              <p
                className="
                  text-xs
                  text-[var(--color-warm-gray)]
                "
              >
                {formatMoney(item.price)} each
              </p>

              <p
                className="
                  mt-1 font-bold
                  text-[var(--color-deep-espresso)]
                "
              >
                {formatMoney(lineTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function AdminInStoreSales() {
  const [searchInput, setSearchInput] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [requestState, setRequestState] = useState({
    key: null,
    products: [],
    error: null,
  });

  const [saleItems, setSaleItems] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [isSubmittingSale, setIsSubmittingSale] = useState(false);

  const [productRefreshKey, setProductRefreshKey] = useState(0);

  const [checkoutForm, setCheckoutForm] = useState({
    paymentMethod: "CASH",
    discountAmount: "",
    customerName: "",
    customerPhone: "",
    note: "",
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetchInStoreSaleProducts({
          search: searchTerm,
          limit: 30,
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setRequestState({
          key: searchTerm,
          products: Array.isArray(response.data?.products)
            ? response.data.products
            : [],
          error: null,
        });
      } catch (error) {
        if (controller.signal.aborted || error?.code === "ERR_CANCELED") {
          return;
        }

        setRequestState({
          key: searchTerm,
          products: [],
          error,
        });
      }
    }

    void loadProducts();

    return () => {
      controller.abort();
    };
  }, [searchTerm, productRefreshKey]);

  const currentRequest = requestState.key === searchTerm;

  const isLoading = !currentRequest;

  const products = currentRequest ? requestState.products : [];

  const error = currentRequest ? requestState.error : null;

  const subtotal = useMemo(
    () =>
      saleItems.reduce(
        (total, item) => total + Number(item.price) * Number(item.quantity),
        0,
      ),
    [saleItems],
  );

  const discountAmount = useMemo(() => {
    const value = Number(checkoutForm.discountAmount);

    if (!Number.isFinite(value) || value <= 0) {
      return 0;
    }

    return value;
  }, [checkoutForm.discountAmount]);

  const totalAmount = Math.max(subtotal - discountAmount, 0);
  function getSelectedQuantity(variantId) {
    return saleItems.find((item) => item.id === variantId)?.quantity ?? 0;
  }

  function addProduct(product) {
    setSaleItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);

      if (existingItem) {
        if (existingItem.quantity >= product.stockQuantity) {
          return currentItems;
        }

        return currentItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      if (Number(product.stockQuantity) <= 0) {
        return currentItems;
      }

      return [
        ...currentItems,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  }

  function increaseQuantity(variantId) {
    setSaleItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== variantId) {
          return item;
        }

        if (item.quantity >= item.stockQuantity) {
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      }),
    );
  }

  function decreaseQuantity(variantId) {
    setSaleItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === variantId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeItem(variantId) {
    setSaleItems((currentItems) =>
      currentItems.filter((item) => item.id !== variantId),
    );
  }

  function updateCheckoutField(name, value) {
    setCheckoutForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleRecordSale(event) {
    event.preventDefault();

    if (saleItems.length === 0) {
      toast.error("Add at least one product to the sale.");
      return;
    }

    if (discountAmount > subtotal) {
      toast.error("Discount cannot be greater than the subtotal.");
      return;
    }

    try {
      setIsSubmittingSale(true);

      const response = await createInStoreSale({
        paymentMethod: checkoutForm.paymentMethod,

        discountAmount,

        customerName: checkoutForm.customerName.trim() || null,

        customerPhone: checkoutForm.customerPhone.trim() || null,

        note: checkoutForm.note.trim() || null,

        items: saleItems.map((item) => ({
          variantId: item.id,
          quantity: item.quantity,
        })),
      });

      toast.success(response.message || "In-store sale recorded successfully.");

      setSaleItems([]);

      setCheckoutForm({
        paymentMethod: "CASH",
        discountAmount: "",
        customerName: "",
        customerPhone: "",
        note: "",
      });

      setIsCheckoutOpen(false);

      // Reload products so the displayed stock
      // immediately reflects the physical sale.
      setProductRefreshKey((currentKey) => currentKey + 1);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to record the in-store sale."),
      );
    } finally {
      setIsSubmittingSale(false);
    }
  }

  return (
    <section className="space-y-7">
      {/* HEADER */}

      {/* HEADER */}

      <header>
        <p
          className="
      text-sm font-semibold
      uppercase tracking-widest
      text-[var(--color-warm-gray)]
    "
        >
          Physical store
        </p>

        <div
          className="
      mt-2 flex flex-col gap-4
      sm:flex-row sm:items-end
      sm:justify-between
    "
        >
          <div>
            <h1
              className="
          font-display text-3xl
          font-medium
          text-[var(--color-deep-espresso)]
        "
            >
              New in-store sale
            </h1>

            <p
              className="
          mt-3 max-w-2xl
          text-sm leading-6
          text-[var(--color-warm-gray)]
        "
            >
              Record products sold in the physical store and keep online and
              store inventory synchronized.
            </p>
          </div>

          <div
            className="
        flex flex-wrap
        items-center gap-3
      "
          >
            {/* SALES HISTORY */}

            <Link
              to="/admin/in-store-sales/history"
              className="
          inline-flex min-h-11
          items-center justify-center
          gap-2 rounded-full
          border
          border-[var(--color-warm-light-gray)]
          bg-white
          px-5
          text-sm font-semibold
          text-[var(--color-deep-espresso)]
          transition
          hover:border-[var(--color-deep-bronze)]
          hover:text-[var(--color-deep-bronze)]
        "
            >
              <HistoryRoundedIcon fontSize="small" />
              Sales History
            </Link>

            {/* POS BADGE */}

            <div
              className="
          flex w-fit items-center gap-2
          rounded-full
          bg-[var(--color-soft-ivory)]
          px-4 py-2
          text-sm font-semibold
          text-[var(--color-deep-bronze)]
        "
            >
              <StorefrontRoundedIcon fontSize="small" />
              Physical POS
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}

      <div
        className="
          grid gap-6
          xl:grid-cols-[minmax(0,1fr)_380px]
        "
      >
        {/* PRODUCT SEARCH */}

        <section
          className="
            border
            border-[var(--color-warm-light-gray)]
            bg-white
          "
        >
          <div
            className="
              border-b
              border-[var(--color-warm-light-gray)]
              p-5 sm:p-6
            "
          >
            <h2
              className="
                text-lg font-bold
                text-[var(--color-deep-espresso)]
              "
            >
              Find products
            </h2>

            <p
              className="
                mt-1 text-sm
                text-[var(--color-warm-gray)]
              "
            >
              Search by product name, variant, or SKU.
            </p>

            <label className="relative mt-5 block">
              <SearchRoundedIcon
                className="
                  absolute left-4 top-1/2
                  -translate-y-1/2
                  text-[var(--color-warm-gray)]
                "
              />

              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                maxLength={100}
                placeholder="Search products or SKU..."
                className="
                  min-h-12 w-full
                  rounded-full
                  border
                  border-[var(--color-warm-light-gray)]
                  bg-white
                  py-3 pl-12 pr-5
                  text-sm
                  text-[var(--color-deep-espresso)]
                  outline-none
                  transition
                  focus:border-[var(--color-deep-bronze)]
                "
              />
            </label>
          </div>

          <div className="p-5 sm:p-6">
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="
                        h-28 animate-pulse
                        bg-[var(--color-soft-ivory)]
                      "
                  />
                ))}
              </div>
            )}

            {!isLoading && error && (
              <div
                className="
                  border border-red-200
                  bg-red-50
                  p-5 text-sm
                  text-red-700
                "
              >
                {getApiErrorMessage(error, "Unable to load products.")}
              </div>
            )}

            {!isLoading && !error && products.length === 0 && (
              <div
                className="
                    py-16 text-center
                    text-[var(--color-warm-gray)]
                  "
              >
                <SearchRoundedIcon sx={{ fontSize: 42 }} />

                <p
                  className="
                      mt-4 font-semibold
                      text-[var(--color-deep-espresso)]
                    "
                >
                  No products found
                </p>

                <p className="mt-2 text-sm">Try another product name or SKU.</p>
              </div>
            )}

            {!isLoading && !error && products.length > 0 && (
              <div className="space-y-3">
                {products.map((product) => (
                  <ProductResultCard
                    key={product.id}
                    product={product}
                    selectedQuantity={getSelectedQuantity(product.id)}
                    onAdd={addProduct}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CURRENT SALE */}

        <aside
          className="
            h-fit
            border
            border-[var(--color-warm-light-gray)]
            bg-white
            xl:sticky xl:top-6
          "
        >
          <div
            className="
              border-b
              border-[var(--color-warm-light-gray)]
              p-5
            "
          >
            <p
              className="
                text-xs font-semibold
                uppercase tracking-[0.14em]
                text-[var(--color-deep-bronze)]
              "
            >
              Current sale
            </p>

            <h2
              className="
                mt-2 text-xl font-bold
                text-[var(--color-deep-espresso)]
              "
            >
              Sale basket
            </h2>

            <p
              className="
                mt-1 text-sm
                text-[var(--color-warm-gray)]
              "
            >
              {saleItems.length === 0
                ? "No products added yet."
                : `${saleItems.length} ${
                    saleItems.length === 1 ? "product" : "products"
                  } added.`}
            </p>
          </div>

          <div className="px-5">
            {saleItems.length === 0 ? (
              <div
                className="
                  py-14 text-center
                  text-[var(--color-warm-gray)]
                "
              >
                <StorefrontRoundedIcon sx={{ fontSize: 40 }} />

                <p
                  className="
                    mt-3 text-sm font-semibold
                  "
                >
                  Add products to begin the sale.
                </p>
              </div>
            ) : (
              saleItems.map((item) => (
                <SaleItem
                  key={item.id}
                  item={item}
                  onIncrease={increaseQuantity}
                  onDecrease={decreaseQuantity}
                  onRemove={removeItem}
                />
              ))
            )}
          </div>

          <div
            className="
    border-t
    border-[var(--color-warm-light-gray)]
    bg-[var(--color-soft-ivory)]
    p-5
  "
          >
            {/* SUMMARY */}

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span
                  className="
          text-sm font-semibold
          text-[var(--color-warm-gray)]
        "
                >
                  Subtotal
                </span>

                <span
                  className="
          font-bold
          text-[var(--color-deep-espresso)]
        "
                >
                  {formatMoney(subtotal)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between gap-4">
                  <span
                    className="
            text-sm font-semibold
            text-[var(--color-warm-gray)]
          "
                  >
                    Discount
                  </span>

                  <span className="font-bold text-emerald-700">
                    -{formatMoney(discountAmount)}
                  </span>
                </div>
              )}

              <div
                className="
        flex items-center justify-between
        gap-4 border-t
        border-[var(--color-warm-light-gray)]
        pt-3
      "
              >
                <span
                  className="
          font-bold
          text-[var(--color-deep-espresso)]
        "
                >
                  Total
                </span>

                <span
                  className="
          text-xl font-bold
          text-[var(--color-deep-espresso)]
        "
                >
                  {formatMoney(totalAmount)}
                </span>
              </div>
            </div>

            {!isCheckoutOpen ? (
              <button
                type="button"
                disabled={saleItems.length === 0}
                onClick={() => setIsCheckoutOpen(true)}
                className="
        mt-5 inline-flex
        min-h-12 w-full
        items-center justify-center
        rounded-full
        bg-[var(--color-deep-espresso)]
        px-6
        font-semibold text-white
        transition
        hover:opacity-90
        disabled:cursor-not-allowed
        disabled:opacity-40
      "
              >
                Continue sale
              </button>
            ) : (
              <form
                onSubmit={handleRecordSale}
                className="
        mt-6 space-y-5
        border-t
        border-[var(--color-warm-light-gray)]
        pt-5
      "
              >
                {/* PAYMENT */}

                <fieldset>
                  <legend
                    className="
            text-sm font-bold
            text-[var(--color-deep-espresso)]
          "
                  >
                    Payment method
                  </legend>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      ["CASH", "Cash"],
                      ["CARD", "Card"],
                      ["OTHER", "Other"],
                    ].map(([value, label]) => {
                      const selected = checkoutForm.paymentMethod === value;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            updateCheckoutField("paymentMethod", value)
                          }
                          className={[
                            `
                    min-h-10 rounded-full
                    border px-3
                    text-sm font-semibold
                    transition
                  `,
                            selected
                              ? `
                      border-[var(--color-deep-espresso)]
                      bg-[var(--color-deep-espresso)]
                      text-white
                    `
                              : `
                      border-[var(--color-warm-light-gray)]
                      bg-white
                      text-[var(--color-deep-espresso)]
                    `,
                          ].join(" ")}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                {/* DISCOUNT */}

                <label className="block">
                  <span
                    className="
            text-sm font-bold
            text-[var(--color-deep-espresso)]
          "
                  >
                    Discount
                  </span>

                  <div className="relative mt-2">
                    <span
                      className="
              absolute left-4 top-1/2
              -translate-y-1/2
              text-sm font-semibold
              text-[var(--color-warm-gray)]
            "
                    >
                      $
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={checkoutForm.discountAmount}
                      onChange={(event) =>
                        updateCheckoutField(
                          "discountAmount",
                          event.target.value,
                        )
                      }
                      placeholder="0.00"
                      className="
              min-h-11 w-full
              rounded-full
              border
              border-[var(--color-warm-light-gray)]
              bg-white
              py-2 pl-8 pr-4
              text-sm
              outline-none
              focus:border-[var(--color-deep-bronze)]
            "
                    />
                  </div>

                  {discountAmount > subtotal && (
                    <p className="mt-2 text-xs font-semibold text-red-600">
                      Discount cannot exceed the subtotal.
                    </p>
                  )}
                </label>

                {/* CUSTOMER */}

                <div
                  className="
          border-t
          border-[var(--color-warm-light-gray)]
          pt-5
        "
                >
                  <p
                    className="
            text-sm font-bold
            text-[var(--color-deep-espresso)]
          "
                  >
                    Customer details
                  </p>

                  <p
                    className="
            mt-1 text-xs
            text-[var(--color-warm-gray)]
          "
                  >
                    Optional for walk-in customers.
                  </p>

                  <div className="mt-4 space-y-3">
                    <input
                      type="text"
                      maxLength={120}
                      value={checkoutForm.customerName}
                      onChange={(event) =>
                        updateCheckoutField("customerName", event.target.value)
                      }
                      placeholder="Customer name"
                      className="
              min-h-11 w-full
              rounded-full
              border
              border-[var(--color-warm-light-gray)]
              bg-white
              px-4
              text-sm
              outline-none
              focus:border-[var(--color-deep-bronze)]
            "
                    />

                    <input
                      type="tel"
                      maxLength={30}
                      value={checkoutForm.customerPhone}
                      onChange={(event) =>
                        updateCheckoutField("customerPhone", event.target.value)
                      }
                      placeholder="Phone number"
                      className="
              min-h-11 w-full
              rounded-full
              border
              border-[var(--color-warm-light-gray)]
              bg-white
              px-4
              text-sm
              outline-none
              focus:border-[var(--color-deep-bronze)]
            "
                    />

                    <textarea
                      rows={3}
                      value={checkoutForm.note}
                      onChange={(event) =>
                        updateCheckoutField("note", event.target.value)
                      }
                      placeholder="Optional sale note..."
                      className="
              w-full resize-none
              rounded-2xl
              border
              border-[var(--color-warm-light-gray)]
              bg-white
              px-4 py-3
              text-sm
              outline-none
              focus:border-[var(--color-deep-bronze)]
            "
                    />
                  </div>
                </div>

                {/* FINAL TOTAL */}

                <div
                  className="
          border-t
          border-[var(--color-warm-light-gray)]
          pt-5
        "
                >
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p
                        className="
                text-xs font-semibold
                uppercase tracking-[0.12em]
                text-[var(--color-warm-gray)]
              "
                      >
                        Amount to collect
                      </p>

                      <p
                        className="
                mt-1 text-2xl font-bold
                text-[var(--color-deep-espresso)]
              "
                      >
                        {formatMoney(totalAmount)}
                      </p>
                    </div>

                    <span
                      className="
              rounded-full
              bg-white
              px-3 py-1.5
              text-xs font-bold
              text-[var(--color-deep-bronze)]
            "
                    >
                      {checkoutForm.paymentMethod}
                    </span>
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="space-y-2">
                  <button
                    type="submit"
                    disabled={
                      isSubmittingSale ||
                      saleItems.length === 0 ||
                      discountAmount > subtotal
                    }
                    className="
            inline-flex min-h-12
            w-full items-center
            justify-center
            rounded-full
            bg-[var(--color-deep-espresso)]
            px-6
            font-semibold text-white
            transition
            hover:opacity-90
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
                  >
                    {isSubmittingSale
                      ? "Recording sale..."
                      : "Record physical sale"}
                  </button>

                  <button
                    type="button"
                    disabled={isSubmittingSale}
                    onClick={() => setIsCheckoutOpen(false)}
                    className="
            inline-flex min-h-11
            w-full items-center
            justify-center
            rounded-full
            border
            border-[var(--color-warm-light-gray)]
            bg-white
            px-6
            text-sm font-semibold
            text-[var(--color-deep-espresso)]
            transition
            disabled:opacity-40
          "
                  >
                    Back to basket
                  </button>
                </div>
              </form>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

export default AdminInStoreSales;
