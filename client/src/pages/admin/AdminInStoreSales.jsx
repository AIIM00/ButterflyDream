import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

// Toast
import { toast } from "react-toastify";

// MUI Icons
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";

// Services
import {
  createInStoreSale,
  fetchInStoreSaleProducts,
} from "../../services/adminInStoreSaleApi.js";

// Utils
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

/* =========================================================
   HELPERS
========================================================= */

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

function ProductImage({ product, size = "normal" }) {
  const dimensions =
    size === "small"
      ? "h-14 w-14 rounded-xl"
      : "h-[4.5rem] w-[4.5rem] rounded-[1rem] sm:h-20 sm:w-20";

  if (!product.image?.imageUrl) {
    return (
      <div
        className={[
          `
            flex
            shrink-0
            items-center
            justify-center
            bg-gray-100
            text-gray-400
            ring-1
            ring-gray-200/70
          `,
          dimensions,
        ].join(" ")}
      >
        <ImageNotSupportedOutlinedIcon
          sx={{
            fontSize: size === "small" ? 19 : 22,
          }}
        />
      </div>
    );
  }

  return (
    <img
      src={product.image.imageUrl}
      alt={product.image.altText || product.productName || "Product"}
      loading="lazy"
      className={[
        `
          shrink-0
          object-cover
          ring-1
          ring-gray-200/70
        `,
        dimensions,
      ].join(" ")}
    />
  );
}

function StockLabel({ product }) {
  const stock = Number(product.stockQuantity ?? 0);

  if (stock <= 0) {
    return (
      <span
        className="
          inline-flex
          items-center
          gap-1.5
          rounded-full
          bg-red-50
          px-2.5
          py-1
          text-[0.62rem]
          font-bold
          text-red-700

          sm:text-xs
        "
      >
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Out of stock
      </span>
    );
  }

  if (stock <= Number(product.lowStockThreshold ?? 0)) {
    return (
      <span
        className="
          inline-flex
          items-center
          gap-1.5
          rounded-full
          bg-amber-50
          px-2.5
          py-1
          text-[0.62rem]
          font-bold
          text-amber-700

          sm:text-xs
        "
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        {stock} left
      </span>
    );
  }

  return (
    <span
      className="
        inline-flex
        items-center
        gap-1.5
        rounded-full
        bg-emerald-50
        px-2.5
        py-1
        text-[0.62rem]
        font-bold
        text-emerald-700

        sm:text-xs
      "
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {stock} in stock
    </span>
  );
}

/* =========================================================
   SEARCH RESULT CARD
========================================================= */

function ProductResultCard({ product, selectedQuantity, onAdd }) {
  const stockQuantity = Number(product.stockQuantity ?? 0);

  const remainingQuantity = stockQuantity - selectedQuantity;

  const canAdd = remainingQuantity > 0;

  return (
    <article
      className="
        overflow-hidden
        rounded-[1.15rem]
        border
        border-gray-200
        bg-white
        transition-all

        hover:border-gray-300
        hover:shadow-sm
      "
    >
      <div className="p-4">
        <div className="flex items-start gap-3.5">
          <ProductImage product={product} />

          <div className="min-w-0 flex-1">
            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >
              <div className="min-w-0">
                <p
                  className="
                    line-clamp-2
                    text-sm
                    font-bold
                    leading-5
                    text-gray-950

                    sm:text-base
                  "
                >
                  {product.productName}
                </p>

                <p
                  className="
                    mt-1
                    truncate
                    text-[0.68rem]
                    font-medium
                    text-gray-500

                    sm:text-xs
                  "
                >
                  {product.displayName}
                </p>

                <p
                  className="
                    mt-1
                    truncate
                    text-[0.58rem]
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    text-gray-400

                    sm:text-[0.65rem]
                  "
                >
                  SKU: {product.sku}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p
                  className="
                    text-sm
                    font-bold
                    tracking-[-0.025em]
                    text-gray-950

                    sm:text-base
                  "
                >
                  {formatMoney(product.price)}
                </p>

                <div className="mt-1.5">
                  <StockLabel product={product} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="
            mt-4
            flex
            items-center
            justify-between
            gap-3
          "
        >
          <div className="min-w-0">
            <p
              className="
                truncate
                text-[0.65rem]
                font-medium
                text-gray-400

                sm:text-xs
              "
            >
              {product.category?.name || "Uncategorized"}
            </p>

            {selectedQuantity > 0 && (
              <p
                className="
                  mt-1
                  text-[0.62rem]
                  font-bold
                  text-blue-600

                  sm:text-xs
                "
              >
                {selectedQuantity} already in basket
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onAdd(product)}
            disabled={!canAdd}
            className="
              inline-flex
              min-h-10
              shrink-0
              items-center
              justify-center
              gap-1.5
              rounded-full
              bg-gray-950
              px-3.5
              text-xs
              font-bold
              text-white
              transition-colors

              hover:bg-gray-800

              disabled:cursor-not-allowed
              disabled:bg-gray-200
              disabled:text-gray-400

              sm:px-4
            "
          >
            <AddRoundedIcon
              sx={{
                fontSize: 16,
              }}
            />

            {stockQuantity <= 0
              ? "Out of stock"
              : !canAdd
                ? "Max added"
                : "Add"}
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   BASKET ITEM
========================================================= */

function SaleItem({ item, onIncrease, onDecrease, onRemove }) {
  const lineTotal = Number(item.price) * Number(item.quantity);

  return (
    <article
      className="
        border-b
        border-gray-100
        py-4

        first:pt-0
        last:border-b-0
        last:pb-0
      "
    >
      <div className="flex items-start gap-3">
        <ProductImage product={item} size="small" />

        <div className="min-w-0 flex-1">
          <div
            className="
              flex
              items-start
              justify-between
              gap-2
            "
          >
            <div className="min-w-0">
              <p
                className="
                  truncate
                  text-sm
                  font-bold
                  text-gray-950
                "
              >
                {item.productName}
              </p>

              <p
                className="
                  mt-1
                  truncate
                  text-[0.65rem]
                  text-gray-500

                  sm:text-xs
                "
              >
                {item.displayName}
              </p>

              <p
                className="
                  mt-1
                  truncate
                  text-[0.58rem]
                  font-medium
                  uppercase
                  tracking-[0.08em]
                  text-gray-400
                "
              >
                {item.sku}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onRemove(item.id)}
              aria-label={`Remove ${item.productName}`}
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-full
                text-gray-400
                transition-colors

                hover:bg-red-50
                hover:text-red-600
              "
            >
              <DeleteOutlineRoundedIcon
                sx={{
                  fontSize: 17,
                }}
              />
            </button>
          </div>

          <div
            className="
              mt-3
              flex
              items-center
              justify-between
              gap-3
            "
          >
            {/* QUANTITY */}
            <div
              className="
                inline-flex
                items-center
                rounded-full
                border
                border-gray-200
                bg-white
              "
            >
              <button
                type="button"
                onClick={() => onDecrease(item.id)}
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  text-gray-600
                  transition-colors

                  hover:bg-gray-100
                "
                aria-label="Decrease quantity"
              >
                <RemoveRoundedIcon
                  sx={{
                    fontSize: 16,
                  }}
                />
              </button>

              <span
                className="
                  min-w-8
                  text-center
                  text-xs
                  font-bold
                  text-gray-900
                "
              >
                {item.quantity}
              </span>

              <button
                type="button"
                onClick={() => onIncrease(item.id)}
                disabled={item.quantity >= item.stockQuantity}
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  text-gray-600
                  transition-colors

                  hover:bg-gray-100

                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
                aria-label="Increase quantity"
              >
                <AddRoundedIcon
                  sx={{
                    fontSize: 16,
                  }}
                />
              </button>
            </div>

            {/* PRICE */}
            <div className="text-right">
              <p
                className="
                  text-[0.6rem]
                  text-gray-400
                "
              >
                {formatMoney(item.price)} each
              </p>

              <p
                className="
                  mt-0.5
                  text-sm
                  font-bold
                  text-gray-950
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

/* =========================================================
   PAGE
========================================================= */

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

  /* =======================================================
     SEARCH DEBOUNCE
  ======================================================= */

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

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

  /* =======================================================
     TOTALS
  ======================================================= */

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

  const totalUnits = saleItems.reduce(
    (total, item) => total + Number(item.quantity),
    0,
  );

  /* =======================================================
     BASKET
  ======================================================= */

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

  /* =======================================================
     CHECKOUT FORM
  ======================================================= */

  function updateCheckoutField(name, value) {
    setCheckoutForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  /* =======================================================
     RECORD SALE
  ======================================================= */

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

      setProductRefreshKey((currentKey) => currentKey + 1);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to record the in-store sale."),
      );
    } finally {
      setIsSubmittingSale(false);
    }
  }

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
            Physical store
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
            New in-store sale
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
            Record physical-store purchases while keeping your shared inventory
            synchronized.
          </p>
        </div>

        <div
          className="
            grid
            grid-cols-2
            gap-2

            sm:flex
            sm:shrink-0
          "
        >
          <Link
            to="/admin/in-store-sales/history"
            className="
              inline-flex
              min-h-11
              items-center
              justify-center
              gap-2
              rounded-full
              border
              border-gray-200
              bg-white
              px-4
              text-xs
              font-bold
              text-gray-700
              transition-all

              hover:border-gray-300
              hover:bg-gray-100
              hover:text-gray-950

              sm:text-sm
            "
          >
            <HistoryRoundedIcon
              sx={{
                fontSize: 17,
              }}
            />
            History
          </Link>

          <div
            className="
              inline-flex
              min-h-11
              items-center
              justify-center
              gap-2
              rounded-full
              bg-gray-100
              px-4
              text-xs
              font-bold
              text-gray-700

              sm:text-sm
            "
          >
            <StorefrontRoundedIcon
              sx={{
                fontSize: 17,
              }}
            />
            Physical POS
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}
      <div
        className="
          grid
          gap-4

          sm:gap-5

          xl:grid-cols-[minmax(0,1fr)_23rem]

          2xl:grid-cols-[minmax(0,1fr)_25rem]
        "
      >
        {/* ===================================================
            PRODUCT SEARCH
        =================================================== */}
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
          {/* SEARCH HEADER */}
          <div
            className="
              border-b
              border-gray-100
              px-4
              py-4

              sm:px-5
              sm:py-5

              lg:px-6
            "
          >
            <p
              className="
                text-[0.62rem]
                font-bold
                uppercase
                tracking-[0.12em]
                text-gray-400
              "
            >
              Catalog
            </p>

            <h2
              className="
                mt-1
                text-lg
                font-bold
                text-gray-950

                sm:text-xl
              "
            >
              Find products
            </h2>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-gray-500

                sm:text-sm
              "
            >
              Search by product name, variant, or SKU.
            </p>

            <label className="relative mt-4 block">
              <SearchRoundedIcon
                sx={{
                  fontSize: 20,
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
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                maxLength={100}
                placeholder="Search products or SKU..."
                className="
                  min-h-12
                  w-full
                  rounded-full
                  border
                  border-gray-200
                  bg-white
                  py-2
                  pl-11
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
            </label>
          </div>

          {/* RESULTS */}
          <div
            className="
              p-4

              sm:p-5

              lg:p-6
            "
          >
            {/* LOADING */}
            {isLoading && (
              <div className="space-y-3">
                {Array.from({
                  length: 4,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="
                      h-40
                      animate-pulse
                      rounded-[1.15rem]
                      bg-gray-100

                      sm:h-36
                    "
                  />
                ))}
              </div>
            )}

            {/* ERROR */}
            {!isLoading && error && (
              <div
                className="
                  rounded-[1rem]
                  border
                  border-red-200
                  bg-red-50
                  p-4
                  text-xs
                  font-medium
                  leading-5
                  text-red-700

                  sm:text-sm
                "
              >
                {getApiErrorMessage(error, "Unable to load products.")}
              </div>
            )}

            {/* EMPTY */}
            {!isLoading && !error && products.length === 0 && (
              <div
                className="
                    flex
                    min-h-[16rem]
                    flex-col
                    items-center
                    justify-center
                    px-5
                    text-center
                  "
              >
                <span
                  className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-full
                      bg-gray-100
                      text-gray-400
                      ring-1
                      ring-gray-200
                    "
                >
                  <SearchRoundedIcon
                    sx={{
                      fontSize: 22,
                    }}
                  />
                </span>

                <p
                  className="
                      mt-4
                      text-sm
                      font-bold
                      text-gray-900
                    "
                >
                  No products found
                </p>

                <p
                  className="
                      mt-1
                      text-xs
                      text-gray-500

                      sm:text-sm
                    "
                >
                  Try another product name, variant, or SKU.
                </p>
              </div>
            )}

            {/* PRODUCTS */}
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

        {/* ===================================================
            CURRENT SALE
        =================================================== */}
        <aside
          className="
            h-fit
            overflow-hidden
            rounded-[1.4rem]
            border
            border-gray-200/80
            bg-white
            shadow-[0_8px_24px_rgba(15,23,42,0.04)]

            xl:sticky
            xl:top-24
          "
        >
          {/* BASKET HEADER */}
          <div
            className="
              border-b
              border-gray-100
              px-4
              py-4

              sm:px-5
            "
          >
            <div
              className="
                flex
                items-start
                justify-between
                gap-3
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
                  Current sale
                </p>

                <h2
                  className="
                    mt-1
                    text-lg
                    font-bold
                    text-gray-950
                  "
                >
                  Sale basket
                </h2>
              </div>

              <span
                className="
                  inline-flex
                  min-h-8
                  items-center
                  gap-1.5
                  rounded-full
                  bg-gray-100
                  px-2.5
                  text-xs
                  font-bold
                  text-gray-700
                "
              >
                <ShoppingBagOutlinedIcon
                  sx={{
                    fontSize: 15,
                  }}
                />

                {totalUnits}
              </span>
            </div>

            <p
              className="
                mt-1.5
                text-xs
                text-gray-500
              "
            >
              {saleItems.length === 0
                ? "No products added yet."
                : `${saleItems.length} ${
                    saleItems.length === 1 ? "variant" : "variants"
                  } selected.`}
            </p>
          </div>

          {/* ITEMS */}
          <div className="px-4 py-4 sm:px-5">
            {saleItems.length === 0 ? (
              <div
                className="
                  flex
                  min-h-[10rem]
                  flex-col
                  items-center
                  justify-center
                  text-center
                "
              >
                <span
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    bg-gray-100
                    text-gray-400
                  "
                >
                  <StorefrontRoundedIcon
                    sx={{
                      fontSize: 20,
                    }}
                  />
                </span>

                <p
                  className="
                    mt-3
                    text-xs
                    font-semibold
                    text-gray-500
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

          {/* =================================================
              TOTALS / CHECKOUT
          ================================================= */}
          <div
            className="
              border-t
              border-gray-100
              bg-gray-50/60
              p-4

              sm:p-5
            "
          >
            {/* SUMMARY */}
            <div className="space-y-2.5">
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >
                <span
                  className="
                    text-xs
                    font-medium
                    text-gray-500

                    sm:text-sm
                  "
                >
                  Subtotal
                </span>

                <span
                  className="
                    text-sm
                    font-bold
                    text-gray-900
                  "
                >
                  {formatMoney(subtotal)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                  "
                >
                  <span
                    className="
                      text-xs
                      font-medium
                      text-gray-500

                      sm:text-sm
                    "
                  >
                    Discount
                  </span>

                  <span
                    className="
                      text-sm
                      font-bold
                      text-emerald-700
                    "
                  >
                    -{formatMoney(discountAmount)}
                  </span>
                </div>
              )}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  border-t
                  border-gray-200
                  pt-3
                "
              >
                <span
                  className="
                    text-sm
                    font-bold
                    text-gray-900
                  "
                >
                  Total
                </span>

                <span
                  className="
                    text-xl
                    font-bold
                    tracking-[-0.035em]
                    text-gray-950
                  "
                >
                  {formatMoney(totalAmount)}
                </span>
              </div>
            </div>

            {/* =================================================
                CONTINUE
            ================================================= */}
            {!isCheckoutOpen ? (
              <button
                type="button"
                disabled={saleItems.length === 0}
                onClick={() => setIsCheckoutOpen(true)}
                className="
                  mt-5
                  inline-flex
                  min-h-12
                  w-full
                  items-center
                  justify-center
                  rounded-full
                  bg-gray-950
                  px-5
                  text-sm
                  font-bold
                  text-white
                  transition-colors

                  hover:bg-gray-800

                  disabled:cursor-not-allowed
                  disabled:bg-gray-200
                  disabled:text-gray-400
                "
              >
                Continue sale
              </button>
            ) : (
              /* ===============================================
                 CHECKOUT
              =============================================== */
              <form
                onSubmit={handleRecordSale}
                className="
                  mt-5
                  space-y-5
                  border-t
                  border-gray-200
                  pt-5
                "
              >
                {/* PAYMENT */}
                <fieldset>
                  <legend
                    className="
                      text-xs
                      font-bold
                      text-gray-800

                      sm:text-sm
                    "
                  >
                    Payment method
                  </legend>

                  <div
                    className="
                      mt-3
                      grid
                      grid-cols-3
                      gap-2
                    "
                  >
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
                          disabled={isSubmittingSale}
                          className={[
                            `
                                min-h-10
                                rounded-full
                                border
                                px-2
                                text-xs
                                font-bold
                                transition-all

                                sm:text-sm
                              `,
                            selected
                              ? `
                                  border-gray-950
                                  bg-gray-950
                                  text-white
                                `
                              : `
                                  border-gray-200
                                  bg-white
                                  text-gray-700

                                  hover:border-gray-400
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
                <div>
                  <label
                    htmlFor="sale-discount"
                    className="
                      text-xs
                      font-bold
                      text-gray-800

                      sm:text-sm
                    "
                  >
                    Discount
                  </label>

                  <div
                    className="
                      mt-2
                      flex
                      min-h-11
                      overflow-hidden
                      rounded-full
                      border
                      border-gray-200
                      bg-white
                      transition

                      focus-within:border-gray-400
                      focus-within:ring-4
                      focus-within:ring-gray-950/[0.035]
                    "
                  >
                    <span
                      className="
                        flex
                        items-center
                        border-r
                        border-gray-200
                        bg-gray-50
                        px-3
                        text-xs
                        font-bold
                        text-gray-500
                      "
                    >
                      $
                    </span>

                    <input
                      id="sale-discount"
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
                      disabled={isSubmittingSale}
                      placeholder="0.00"
                      className="
                        min-w-0
                        flex-1
                        bg-white
                        px-3
                        text-sm
                        text-gray-900
                        outline-none

                        disabled:bg-gray-100
                      "
                    />
                  </div>

                  {discountAmount > subtotal && (
                    <p
                      className="
                        mt-2
                        text-[0.65rem]
                        font-bold
                        text-red-600

                        sm:text-xs
                      "
                    >
                      Discount cannot exceed the subtotal.
                    </p>
                  )}
                </div>

                {/* CUSTOMER */}
                <div
                  className="
                    border-t
                    border-gray-200
                    pt-5
                  "
                >
                  <p
                    className="
                      text-sm
                      font-bold
                      text-gray-900
                    "
                  >
                    Customer details
                  </p>

                  <p
                    className="
                      mt-1
                      text-[0.65rem]
                      text-gray-500

                      sm:text-xs
                    "
                  >
                    Optional for walk-in customers.
                  </p>

                  <div className="mt-3 space-y-3">
                    <input
                      type="text"
                      maxLength={120}
                      value={checkoutForm.customerName}
                      onChange={(event) =>
                        updateCheckoutField("customerName", event.target.value)
                      }
                      disabled={isSubmittingSale}
                      placeholder="Customer name"
                      className="
                        min-h-11
                        w-full
                        rounded-[0.9rem]
                        border
                        border-gray-200
                        bg-white
                        px-4
                        text-sm
                        text-gray-900
                        outline-none

                        focus:border-gray-400
                        focus:ring-4
                        focus:ring-gray-950/[0.035]

                        disabled:bg-gray-100
                      "
                    />

                    <input
                      type="tel"
                      maxLength={30}
                      value={checkoutForm.customerPhone}
                      onChange={(event) =>
                        updateCheckoutField("customerPhone", event.target.value)
                      }
                      disabled={isSubmittingSale}
                      placeholder="Phone number"
                      className="
                        min-h-11
                        w-full
                        rounded-[0.9rem]
                        border
                        border-gray-200
                        bg-white
                        px-4
                        text-sm
                        text-gray-900
                        outline-none

                        focus:border-gray-400
                        focus:ring-4
                        focus:ring-gray-950/[0.035]

                        disabled:bg-gray-100
                      "
                    />

                    <textarea
                      rows={3}
                      maxLength={1000}
                      value={checkoutForm.note}
                      onChange={(event) =>
                        updateCheckoutField("note", event.target.value)
                      }
                      disabled={isSubmittingSale}
                      placeholder="Optional sale note..."
                      className="
                        min-h-[6rem]
                        w-full
                        resize-y
                        rounded-[0.9rem]
                        border
                        border-gray-200
                        bg-white
                        px-4
                        py-3
                        text-sm
                        leading-5
                        text-gray-900
                        outline-none

                        focus:border-gray-400
                        focus:ring-4
                        focus:ring-gray-950/[0.035]

                        disabled:bg-gray-100
                      "
                    />
                  </div>
                </div>

                {/* FINAL TOTAL */}
                <div
                  className="
                    rounded-[1rem]
                    border
                    border-gray-200
                    bg-white
                    p-3.5
                  "
                >
                  <div
                    className="
                      flex
                      items-end
                      justify-between
                      gap-3
                    "
                  >
                    <div>
                      <p
                        className="
                          text-[0.58rem]
                          font-bold
                          uppercase
                          tracking-[0.1em]
                          text-gray-400
                        "
                      >
                        Amount to collect
                      </p>

                      <p
                        className="
                          mt-1
                          text-xl
                          font-bold
                          tracking-[-0.035em]
                          text-gray-950
                        "
                      >
                        {formatMoney(totalAmount)}
                      </p>
                    </div>

                    <div className="relative">
                      <select
                        value={checkoutForm.paymentMethod}
                        onChange={(event) =>
                          updateCheckoutField(
                            "paymentMethod",
                            event.target.value,
                          )
                        }
                        disabled={isSubmittingSale}
                        className="
                          appearance-none
                          rounded-full
                          border
                          border-gray-200
                          bg-gray-50
                          py-1.5
                          pl-3
                          pr-8
                          text-[0.65rem]
                          font-bold
                          text-gray-700
                          outline-none
                        "
                      >
                        <option value="CASH">CASH</option>

                        <option value="CARD">CARD</option>

                        <option value="OTHER">OTHER</option>
                      </select>

                      <KeyboardArrowDownRoundedIcon
                        sx={{
                          fontSize: 16,
                        }}
                        className="
                          pointer-events-none
                          absolute
                          right-2
                          top-1/2
                          -translate-y-1/2
                          text-gray-400
                        "
                      />
                    </div>
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
                      inline-flex
                      min-h-12
                      w-full
                      items-center
                      justify-center
                      rounded-full
                      bg-gray-950
                      px-5
                      text-sm
                      font-bold
                      text-white
                      transition-colors

                      hover:bg-gray-800

                      disabled:cursor-not-allowed
                      disabled:bg-gray-200
                      disabled:text-gray-400
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
                      inline-flex
                      min-h-11
                      w-full
                      items-center
                      justify-center
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
