import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";

// MUI
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Switch,
} from "@mui/material";

// MUI Icons
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArchiveRoundedIcon from "@mui/icons-material/ArchiveRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import StarOutlineRoundedIcon from "@mui/icons-material/StarOutlineRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

// React Toastify
import { toast } from "react-toastify";

// Components
import ImageEditorDialog from "../../components/admin/products/ImageEditorDialog.jsx";
import ProductStatusBadge from "../../components/admin/products/ProductStatusBadge.jsx";
import VariantEditorDialog from "../../components/admin/products/VariantEditorDialog.jsx";
import ProductImageUploader from "../../components/admin/products/ProductImageUploader.jsx";

// Services
import { fetchAdminCategories } from "../../services/adminCategoryApi.js";

import {
  archiveAdminProduct,
  archiveAdminVariant,
  createAdminVariant,
  deleteAdminProductImage,
  fetchAdminProduct,
  updateAdminProduct,
  updateAdminProductImage,
  updateAdminProductStatus,
  updateAdminVariant,
  updateAdminVariantInventory,
  updateAdminVariantStatus,
} from "../../services/adminProductApi.js";

// Utils
import {
  createAdminProductSlug,
  PRODUCT_STATUS_OPTIONS,
} from "../../utils/adminProductForm.js";

import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

/* =========================================================
   HELPERS
========================================================= */

function formatStatusLabel(status) {
  return String(status ?? "")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatVariantSize(options) {
  const size = options?.size;

  if (size === undefined || size === null || size === "") {
    return null;
  }

  if (options?.sizeType === "RING") {
    return `Ring ${size}`;
  }

  return String(size);
}

/* =========================================================
   PRODUCT BASICS FORM
========================================================= */

function ProductBasicsForm({ product, categories, isSaving, onSave }) {
  const [formData, setFormData] = useState({
    categoryId: product.categoryId,
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    isFeatured: product.isFeatured,
  });

  function updateField(field, value) {
    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    await onSave({
      categoryId: formData.categoryId,
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      description: formData.description.trim() || null,
      isFeatured: formData.isFeatured,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="
        overflow-hidden
        rounded-[1.4rem]
        border
        border-gray-200/80
        bg-white
        shadow-[0_8px_24px_rgba(15,23,42,0.04)]
      "
    >
      {/* HEADER */}
      <div
        className="
          flex
          items-start
          gap-3
          border-b
          border-gray-100
          px-4
          py-4

          sm:px-5
          sm:py-5

          lg:px-6
        "
      >
        <span
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-gray-950
            text-white
          "
        >
          <SellOutlinedIcon
            sx={{
              fontSize: 19,
            }}
          />
        </span>

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
            Details
          </p>

          <h3
            className="
              mt-0.5
              text-lg
              font-bold
              text-gray-950

              sm:text-xl
            "
          >
            Product information
          </h3>

          <p
            className="
              mt-1
              text-xs
              leading-5
              text-gray-500

              sm:text-sm
            "
          >
            Manage the product&apos;s storefront information and featured
            placement.
          </p>
        </div>
      </div>

      {/* FIELDS */}
      <div
        className="
          p-4

          sm:p-5

          lg:p-6
        "
      >
        <div
          className="
            grid
            gap-4

            sm:grid-cols-2
          "
        >
          {/* NAME */}
          <label
            className="
              text-xs
              font-bold
              text-gray-800

              sm:text-sm
            "
          >
            Product name
            <input
              value={formData.name}
              onChange={(event) => updateField("name", event.target.value)}
              disabled={isSaving}
              className="
                mt-2
                min-h-12
                w-full
                rounded-[0.95rem]
                border
                border-gray-200
                bg-white
                px-4
                text-sm
                font-normal
                text-gray-900
                outline-none
                transition

                focus:border-gray-400
                focus:ring-4
                focus:ring-gray-950/[0.035]

                disabled:cursor-not-allowed
                disabled:bg-gray-100
              "
            />
          </label>

          {/* SLUG */}
          <label
            className="
              text-xs
              font-bold
              text-gray-800

              sm:text-sm
            "
          >
            URL slug
            <input
              value={formData.slug}
              onChange={(event) =>
                updateField("slug", createAdminProductSlug(event.target.value))
              }
              disabled={isSaving}
              className="
                mt-2
                min-h-12
                w-full
                rounded-[0.95rem]
                border
                border-gray-200
                bg-white
                px-4
                text-sm
                font-normal
                text-gray-900
                outline-none
                transition

                focus:border-gray-400
                focus:ring-4
                focus:ring-gray-950/[0.035]

                disabled:cursor-not-allowed
                disabled:bg-gray-100
              "
            />
          </label>

          {/* CATEGORY */}
          <div>
            <label
              htmlFor="manage-product-category"
              className="
                text-xs
                font-bold
                text-gray-800

                sm:text-sm
              "
            >
              Category
            </label>

            <div className="relative mt-2">
              <select
                id="manage-product-category"
                value={formData.categoryId}
                onChange={(event) =>
                  updateField("categoryId", event.target.value)
                }
                disabled={isSaving}
                className="
                  min-h-12
                  w-full
                  appearance-none
                  rounded-[0.95rem]
                  border
                  border-gray-200
                  bg-white
                  px-4
                  pr-10
                  text-sm
                  font-normal
                  text-gray-900
                  outline-none

                  focus:border-gray-400
                  focus:ring-4
                  focus:ring-gray-950/[0.035]

                  disabled:cursor-not-allowed
                  disabled:bg-gray-100
                "
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <KeyboardArrowDownRoundedIcon
                sx={{
                  fontSize: 19,
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

          {/* FEATURED */}
          <label
            className={[
              `
                flex
                cursor-pointer
                items-center
                justify-between
                gap-3
                rounded-[1rem]
                border
                p-3.5
                transition
              `,
              formData.isFeatured
                ? `
                  border-amber-200
                  bg-amber-50/60
                `
                : `
                  border-gray-200
                  bg-gray-50/70
                `,
            ].join(" ")}
          >
            <div
              className="
                flex
                min-w-0
                items-center
                gap-3
              "
            >
              <span
                className={[
                  `
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-white
                    ring-1
                  `,
                  formData.isFeatured
                    ? `
                      text-amber-600
                      ring-amber-100
                    `
                    : `
                      text-gray-400
                      ring-gray-200
                    `,
                ].join(" ")}
              >
                <StarOutlineRoundedIcon
                  sx={{
                    fontSize: 18,
                  }}
                />
              </span>

              <div>
                <p
                  className="
                    text-sm
                    font-bold
                    text-gray-900
                  "
                >
                  Featured product
                </p>

                <p
                  className="
                    mt-0.5
                    text-[0.65rem]
                    text-gray-500
                  "
                >
                  Highlight across the storefront.
                </p>
              </div>
            </div>

            <Switch
              checked={formData.isFeatured}
              onChange={(event) =>
                updateField("isFeatured", event.target.checked)
              }
              disabled={isSaving}
              size="small"
            />
          </label>
        </div>

        {/* DESCRIPTION */}
        <div className="mt-4">
          <label
            htmlFor="manage-product-description"
            className="
              text-xs
              font-bold
              text-gray-800

              sm:text-sm
            "
          >
            Description
          </label>

          <textarea
            id="manage-product-description"
            value={formData.description}
            onChange={(event) => updateField("description", event.target.value)}
            disabled={isSaving}
            rows={5}
            className="
              mt-2
              min-h-[8rem]
              w-full
              resize-y
              rounded-[0.95rem]
              border
              border-gray-200
              bg-white
              px-4
              py-3
              text-sm
              leading-6
              text-gray-900
              outline-none

              focus:border-gray-400
              focus:ring-4
              focus:ring-gray-950/[0.035]

              disabled:cursor-not-allowed
              disabled:bg-gray-100
            "
          />
        </div>

        {/* SAVE */}
        <div
          className="
            mt-5
            flex
            justify-end
          "
        >
          <button
            type="submit"
            disabled={isSaving}
            className="
              inline-flex
              min-h-11
              w-full
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

              disabled:cursor-not-allowed
              disabled:bg-gray-200
              disabled:text-gray-400

              sm:w-auto
            "
          >
            <SaveOutlinedIcon
              sx={{
                fontSize: 17,
              }}
            />

            {isSaving ? "Saving..." : "Save information"}
          </button>
        </div>
      </div>
    </form>
  );
}

/* =========================================================
   VARIANT HELPERS
========================================================= */

function VariantColorSwatch({ label, color }) {
  if (!label) {
    return null;
  }

  return (
    <span
      className="
        inline-flex
        min-h-8
        items-center
        gap-2
        rounded-full
        border
        border-gray-200
        bg-white
        px-2.5
        text-[0.65rem]
        font-semibold
        text-gray-700

        sm:text-xs
      "
    >
      <span
        className="
          h-3.5
          w-3.5
          shrink-0
          rounded-full
          border
          border-black/10
        "
        style={{
          backgroundColor: color || "#E6DFDA",
        }}
        aria-hidden="true"
      />

      {label}
    </span>
  );
}

function VariantOptionBadge({ label, value }) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return (
    <span
      className="
        inline-flex
        min-h-8
        items-center
        gap-1.5
        rounded-full
        bg-gray-100
        px-2.5
        text-[0.65rem]
        font-semibold
        text-gray-600

        sm:text-xs
      "
    >
      <span className="font-bold text-gray-400">{label}</span>

      <span className="font-bold text-gray-800">{value}</span>
    </span>
  );
}

/* =========================================================
   VARIANT CARD
========================================================= */

function ProductVariantCard({
  product,
  variant,
  isMutating,
  onToggleStatus,
  onEdit,
  onArchive,
}) {
  const options =
    variant.options && typeof variant.options === "object"
      ? variant.options
      : {};

  const metalColor = options.metalColor ?? options.color ?? null;

  const metalColorHex = options.metalColorHex ?? options.colorHex ?? null;

  const stoneColor = options.stoneColor ?? null;

  const stoneColorHex = options.stoneColorHex ?? null;

  const size = formatVariantSize(options);

  const stock = Number(variant.inventory?.stockQuantity ?? 0);

  const lowStockThreshold = Number(variant.inventory?.lowStockThreshold ?? 0);

  const isOutOfStock = stock <= 0;

  const isLowStock = stock > 0 && stock <= lowStockThreshold;

  return (
    <article
      className="
        overflow-hidden
        rounded-[1.1rem]
        border
        border-gray-200
        bg-white
      "
    >
      {/* MAIN */}
      <div
        className="
          p-4

          sm:p-5
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
          <div className="min-w-0 flex-1">
            <div
              className="
                flex
                flex-wrap
                items-center
                gap-1.5
              "
            >
              <h4
                className="
                  min-w-0
                  text-sm
                  font-bold
                  leading-5
                  text-gray-950

                  sm:text-base
                "
              >
                {variant.displayName || "Product variant"}
              </h4>

              {variant.isDefault && (
                <span
                  className="
                    rounded-full
                    bg-gray-950
                    px-2
                    py-1
                    text-[0.52rem]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    text-white
                  "
                >
                  Default
                </span>
              )}

              {variant.archivedAt && (
                <span
                  className="
                    rounded-full
                    bg-gray-100
                    px-2
                    py-1
                    text-[0.52rem]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    text-gray-500
                  "
                >
                  Archived
                </span>
              )}

              {!variant.archivedAt && !variant.isActive && (
                <span
                  className="
                      rounded-full
                      bg-red-50
                      px-2
                      py-1
                      text-[0.52rem]
                      font-bold
                      uppercase
                      tracking-[0.08em]
                      text-red-600
                    "
                >
                  Inactive
                </span>
              )}
            </div>

            <p
              className="
                mt-1
                truncate
                text-[0.62rem]
                font-medium
                text-gray-400

                sm:text-xs
              "
            >
              SKU: {variant.sku}
            </p>
          </div>

          {/* PRICE */}
          <div className="shrink-0 text-right">
            <p
              className="
                text-[0.55rem]
                font-bold
                uppercase
                tracking-[0.08em]
                text-gray-400
              "
            >
              Price
            </p>

            <p
              className="
                mt-0.5
                text-base
                font-bold
                tracking-[-0.025em]
                text-gray-950

                sm:text-lg
              "
            >
              ${variant.price}
            </p>
          </div>
        </div>

        {/* OPTIONS */}
        <div
          className="
            mt-4
            flex
            flex-wrap
            gap-2
          "
        >
          <VariantColorSwatch label={metalColor} color={metalColorHex} />

          <VariantColorSwatch
            label={stoneColor ? `${stoneColor} stone` : null}
            color={stoneColorHex}
          />

          <VariantOptionBadge label="Size" value={size} />

          {!metalColor && !stoneColor && !size && (
            <span
              className="
                  text-xs
                  text-gray-400
                "
            >
              Standard product option
            </span>
          )}
        </div>

        {/* INVENTORY */}
        <div
          className="
            mt-4
            grid
            grid-cols-2
            divide-x
            divide-gray-200
            rounded-xl
            bg-gray-50
            py-3
          "
        >
          <div className="px-3">
            <p
              className="
                text-[0.55rem]
                font-bold
                uppercase
                tracking-[0.08em]
                text-gray-400
              "
            >
              Stock
            </p>

            <p
              className="
                mt-1
                text-sm
                font-bold
                text-gray-900
              "
            >
              {stock}
            </p>
          </div>

          <div className="px-3">
            <p
              className="
                text-[0.55rem]
                font-bold
                uppercase
                tracking-[0.08em]
                text-gray-400
              "
            >
              Low stock at
            </p>

            <p
              className="
                mt-1
                text-sm
                font-bold
                text-gray-900
              "
            >
              {lowStockThreshold}
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div
        className="
          flex
          flex-col
          gap-3
          border-t
          border-gray-100
          bg-gray-50/60
          px-4
          py-3

          sm:flex-row
          sm:items-center
          sm:justify-between

          sm:px-5
        "
      >
        {/* INVENTORY STATUS */}
        <span
          className={[
            `
              inline-flex
              w-fit
              items-center
              gap-1.5
              rounded-full
              px-2.5
              py-1
              text-[0.62rem]
              font-bold

              sm:text-xs
            `,
            isOutOfStock
              ? `
                bg-red-50
                text-red-700
              `
              : isLowStock
                ? `
                  bg-amber-50
                  text-amber-700
                `
                : `
                  bg-emerald-50
                  text-emerald-700
                `,
          ].join(" ")}
        >
          <span
            className={[
              "h-1.5 w-1.5 rounded-full",

              isOutOfStock
                ? "bg-red-500"
                : isLowStock
                  ? "bg-amber-500"
                  : "bg-emerald-500",
            ].join(" ")}
          />

          {isOutOfStock
            ? "Out of stock"
            : isLowStock
              ? "Low stock"
              : "In stock"}
        </span>

        {!product.archivedAt && !variant.archivedAt && (
          <div
            className="
                flex
                items-center
                gap-1.5

                sm:justify-end
              "
          >
            {/* STATUS */}
            <button
              type="button"
              disabled={isMutating}
              onClick={onToggleStatus}
              className="
                  min-h-9
                  flex-1
                  rounded-full
                  border
                  border-gray-200
                  bg-white
                  px-3.5
                  text-[0.68rem]
                  font-bold
                  text-gray-700
                  transition-all

                  hover:border-gray-950
                  hover:text-gray-950

                  disabled:cursor-not-allowed
                  disabled:opacity-40

                  sm:flex-none
                  sm:text-xs
                "
            >
              {variant.isActive ? "Deactivate" : "Activate"}
            </button>

            {/* EDIT */}
            <button
              type="button"
              aria-label={`Edit ${variant.displayName || "variant"}`}
              onClick={onEdit}
              disabled={isMutating}
              className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-gray-200
                  bg-white
                  text-gray-500
                  transition-all

                  hover:border-gray-950
                  hover:bg-gray-950
                  hover:text-white

                  disabled:opacity-40
                "
            >
              <EditRoundedIcon
                sx={{
                  fontSize: 16,
                }}
              />
            </button>

            {/* ARCHIVE */}
            <button
              type="button"
              aria-label={`Archive ${variant.displayName || "variant"}`}
              onClick={onArchive}
              disabled={isMutating}
              className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-red-100
                  bg-white
                  text-red-500
                  transition-colors

                  hover:bg-red-50
                  hover:text-red-700

                  disabled:opacity-40
                "
            >
              <ArchiveRoundedIcon
                sx={{
                  fontSize: 16,
                }}
              />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

/* =========================================================
   PAGE
========================================================= */

function AdminProductManage() {
  const { productId } = useParams();

  const navigate = useNavigate();

  const [product, setProduct] = useState(null);

  const [categories, setCategories] = useState([]);

  const [loadState, setLoadState] = useState({
    loading: true,
    error: null,
    status: null,
  });

  const [variantDialog, setVariantDialog] = useState({
    open: false,
    item: null,
    key: 0,
  });

  const [imageDialog, setImageDialog] = useState({
    open: false,
    item: null,
    key: 0,
  });

  const [isMutating, setIsMutating] = useState(false);

  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);

  /* =======================================================
     LOAD PRODUCT
  ======================================================= */

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          fetchAdminProduct(productId, {
            signal: controller.signal,
          }),

          fetchAdminCategories({
            signal: controller.signal,
          }),
        ]);

        if (controller.signal.aborted) {
          return;
        }

        setProduct(productResponse.product);

        setCategories(
          Array.isArray(categoryResponse.categories)
            ? categoryResponse.categories
            : [],
        );

        setLoadState({
          loading: false,
          error: null,
          status: null,
        });
      } catch (error) {
        if (controller.signal.aborted || error?.code === "ERR_CANCELED") {
          return;
        }

        setLoadState({
          loading: false,
          error,
          status: error.response?.status ?? null,
        });
      }
    }

    void loadProduct();

    return () => {
      controller.abort();
    };
  }, [productId]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loadState.loading) {
    return (
      <section
        className="
          mx-auto
          w-full
          max-w-6xl
        "
      >
        <div className="h-7 w-28 animate-pulse rounded bg-gray-100" />

        <div
          className="
            mt-4
            h-36
            animate-pulse
            rounded-[1.4rem]
            bg-gray-100
          "
        />

        <div
          className="
            mt-5
            h-36
            animate-pulse
            rounded-[1.4rem]
            bg-gray-100
          "
        />

        <div
          className="
            mt-5
            h-96
            animate-pulse
            rounded-[1.4rem]
            bg-gray-100
          "
        />

        <div
          className="
            mt-5
            h-[32rem]
            animate-pulse
            rounded-[1.4rem]
            bg-gray-100
          "
        />
      </section>
    );
  }

  if (loadState.status === 404) {
    return <Navigate to="/admin/products" replace />;
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (loadState.error || !product) {
    return (
      <section
        className="
          mx-auto
          flex
          min-h-[55vh]
          w-full
          max-w-xl
          items-center
          justify-center
        "
      >
        <div
          className="
            w-full
            rounded-[1.4rem]
            border
            border-red-200
            bg-white
            p-5
            text-center
            shadow-[0_8px_24px_rgba(15,23,42,0.04)]

            sm:p-8
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

          <h1
            className="
              mt-1.5
              text-xl
              font-bold
              text-gray-950
            "
          >
            Product could not be loaded
          </h1>

          <p
            className="
              mx-auto
              mt-2
              max-w-md
              text-xs
              leading-5
              text-gray-500

              sm:text-sm
            "
          >
            {getApiErrorMessage(loadState.error, "Unable to load product.")}
          </p>

          <Link
            to="/admin/products"
            className="
              mt-5
              inline-flex
              min-h-11
              items-center
              justify-center
              rounded-full
              bg-gray-950
              px-5
              text-sm
              font-bold
              text-white
            "
          >
            Back to products
          </Link>
        </div>
      </section>
    );
  }

  /* =======================================================
     MUTATION
  ======================================================= */

  async function runMutation(operation, fallbackMessage) {
    setIsMutating(true);

    try {
      const response = await operation();

      if (response.product) {
        setProduct(response.product);
      }

      toast.success(response.message);

      return response;
    } catch (error) {
      toast.error(getApiErrorMessage(error, fallbackMessage));

      return null;
    } finally {
      setIsMutating(false);
    }
  }

  /* =======================================================
     VARIANTS
  ======================================================= */

  function openNewVariantDialog() {
    setVariantDialog((currentState) => ({
      open: true,
      item: null,
      key: currentState.key + 1,
    }));
  }

  function openVariantDialog(variant) {
    setVariantDialog((currentState) => ({
      open: true,
      item: variant,
      key: currentState.key + 1,
    }));
  }

  async function handleVariantSubmit(payload) {
    let response;

    if (variantDialog.item) {
      const variantData = {
        sku: payload.sku,

        displayName: payload.displayName,

        options: payload.options,

        price: payload.price,

        ...(payload.isDefault
          ? {
              isDefault: true,
            }
          : {}),
      };

      response = await runMutation(
        () =>
          updateAdminVariant(product.id, variantDialog.item.id, variantData),

        "Unable to update variant.",
      );

      if (response) {
        response = await runMutation(
          () =>
            updateAdminVariantInventory(product.id, variantDialog.item.id, {
              stockQuantity: payload.stockQuantity,

              lowStockThreshold: payload.lowStockThreshold,
            }),

          "Unable to update inventory.",
        );
      }
    } else {
      response = await runMutation(
        () => createAdminVariant(product.id, payload),

        "Unable to create variant.",
      );
    }

    if (response) {
      setVariantDialog((currentState) => ({
        ...currentState,
        open: false,
        item: null,
      }));
    }
  }

  /* =======================================================
     IMAGES
  ======================================================= */

  async function handleImageSubmit(payload) {
    if (!imageDialog.item) {
      return;
    }

    const requestPayload = {
      ...payload,
    };

    /*
     * The current primary image cannot simply unset itself.
     * Another image must first become primary.
     */
    if (imageDialog.item.isPrimary || payload.isPrimary === false) {
      delete requestPayload.isPrimary;
    }

    const response = await runMutation(
      () =>
        updateAdminProductImage(
          product.id,
          imageDialog.item.id,
          requestPayload,
        ),

      "Unable to update image.",
    );

    if (response) {
      setImageDialog((currentState) => ({
        ...currentState,
        open: false,
        item: null,
      }));
    }
  }

  function handleUploadedImage(image) {
    setProduct((currentProduct) => {
      if (!currentProduct) {
        return currentProduct;
      }

      const currentImages = Array.isArray(currentProduct.images)
        ? currentProduct.images
        : [];

      /*
       * Protect against accidentally adding
       * the same finalized image twice.
       */
      if (currentImages.some((currentImage) => currentImage.id === image.id)) {
        return currentProduct;
      }

      let nextImages = [...currentImages, image];

      if (image.isPrimary) {
        nextImages = nextImages.map((currentImage) => ({
          ...currentImage,

          isPrimary: currentImage.id === image.id,
        }));
      }

      nextImages.sort((first, second) => {
        if (first.isPrimary !== second.isPrimary) {
          return first.isPrimary ? -1 : 1;
        }

        return Number(first.position ?? 0) - Number(second.position ?? 0);
      });

      return {
        ...currentProduct,
        images: nextImages,
      };
    });
  }

  const variants = Array.isArray(product.variants) ? product.variants : [];

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <section
      className="
        mx-auto
        w-full
        max-w-6xl
        space-y-5

        sm:space-y-6
      "
    >
      {/* BACK */}
      <Link
        to="/admin/products"
        className="
          inline-flex
          min-h-8
          items-center
          gap-1.5
          text-xs
          font-bold
          text-gray-500
          transition-colors

          hover:text-gray-950

          sm:text-sm
        "
      >
        <ArrowBackRoundedIcon
          sx={{
            fontSize: 17,
          }}
        />
        Products
      </Link>

      {/* =====================================================
          PRODUCT HEADER
      ===================================================== */}
      <header
        className="
          overflow-hidden
          rounded-[1.4rem]
          border
          border-gray-200/80
          bg-white
          shadow-[0_8px_24px_rgba(15,23,42,0.04)]
        "
      >
        <div
          className="
            flex
            flex-col
            gap-5
            p-4

            sm:flex-row
            sm:items-start
            sm:justify-between
            sm:p-5

            lg:p-6
          "
        >
          <div className="min-w-0">
            {/* BADGES */}
            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
              "
            >
              <ProductStatusBadge
                status={product.status}
                archivedAt={product.archivedAt}
              />

              {product.isFeatured && (
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
                    ring-1
                    ring-inset
                    ring-amber-200/80
                  "
                >
                  <StarOutlineRoundedIcon
                    sx={{
                      fontSize: 13,
                    }}
                  />
                  Featured
                </span>
              )}
            </div>

            <p
              className="
                mt-4
                text-[0.62rem]
                font-bold
                uppercase
                tracking-[0.12em]
                text-gray-400
              "
            >
              Product
            </p>

            <h1
              className="
                mt-1
                break-words
                text-2xl
                font-bold
                tracking-[-0.04em]
                text-gray-950

                sm:text-3xl
              "
            >
              {product.name}
            </h1>

            <p
              className="
                mt-1.5
                break-all
                text-xs
                text-gray-400

                sm:text-sm
              "
            >
              /{product.slug}
            </p>
          </div>

          {!product.archivedAt && (
            <button
              type="button"
              onClick={() => setArchiveDialogOpen(true)}
              disabled={isMutating}
              className="
                inline-flex
                min-h-11
                w-full
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-full
                border
                border-red-200
                bg-white
                px-4
                text-sm
                font-bold
                text-red-600
                transition-colors

                hover:bg-red-50
                hover:text-red-700

                disabled:cursor-not-allowed
                disabled:opacity-40

                sm:w-auto
              "
            >
              <ArchiveRoundedIcon
                sx={{
                  fontSize: 18,
                }}
              />
              Archive product
            </button>
          )}
        </div>

        {product.archivedAt && (
          <div
            className="
              flex
              items-start
              gap-3
              border-t
              border-amber-100
              bg-amber-50/60
              px-4
              py-3.5

              sm:px-5

              lg:px-6
            "
          >
            <WarningAmberRoundedIcon
              sx={{
                fontSize: 18,
              }}
              className="
                mt-0.5
                shrink-0
                text-amber-600
              "
            />

            <p
              className="
                text-xs
                leading-5
                text-amber-800

                sm:text-sm
              "
            >
              This product is archived. Its information remains available for
              historical records, but storefront editing and uploads are
              disabled.
            </p>
          </div>
        )}
      </header>

      {/* =====================================================
          PRODUCT STATUS
      ===================================================== */}
      {!product.archivedAt && (
        <section
          className="
            overflow-hidden
            rounded-[1.3rem]
            border
            border-gray-200/80
            bg-white
            shadow-[0_6px_20px_rgba(15,23,42,0.035)]
          "
        >
          <div
            className="
              border-b
              border-gray-100
              px-4
              py-4

              sm:px-5
            "
          >
            <p
              className="
                text-[0.58rem]
                font-bold
                uppercase
                tracking-[0.1em]
                text-gray-400
              "
            >
              Visibility
            </p>

            <h2
              className="
                mt-0.5
                text-base
                font-bold
                text-gray-950
              "
            >
              Product status
            </h2>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-gray-500
              "
            >
              Control whether the product is active, inactive, or remains a
              draft.
            </p>
          </div>

          <div
            className="
              grid
              grid-cols-3
              gap-2
              p-4

              sm:flex
              sm:flex-wrap
              sm:p-5
            "
          >
            {PRODUCT_STATUS_OPTIONS.map((status) => {
              const selected = product.status === status;

              return (
                <button
                  key={status}
                  type="button"
                  disabled={isMutating || selected}
                  onClick={() =>
                    void runMutation(
                      () => updateAdminProductStatus(product.id, status),

                      "Unable to update product status.",
                    )
                  }
                  className={[
                    `
                        min-h-10
                        rounded-full
                        border
                        px-3
                        text-[0.68rem]
                        font-bold
                        transition-all

                        disabled:cursor-not-allowed

                        sm:px-4
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
                          text-gray-600

                          hover:border-gray-400
                          hover:text-gray-950
                        `,
                  ].join(" ")}
                >
                  {formatStatusLabel(status)}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* =====================================================
          PRODUCT INFORMATION
      ===================================================== */}
      {!product.archivedAt && (
        <ProductBasicsForm
          key={product.updatedAt}
          product={product}
          categories={categories}
          isSaving={isMutating}
          onSave={(data) =>
            runMutation(
              () => updateAdminProduct(product.id, data),

              "Unable to update product.",
            )
          }
        />
      )}

      {/* =====================================================
          VARIANTS
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
        {/* HEADER */}
        <div
          className="
            flex
            flex-col
            gap-4
            border-b
            border-gray-100
            px-4
            py-4

            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:px-5
            sm:py-5

            lg:px-6
          "
        >
          <div
            className="
              flex
              items-start
              gap-3
            "
          >
            <span
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-gray-100
                text-gray-600
              "
            >
              <Inventory2OutlinedIcon
                sx={{
                  fontSize: 19,
                }}
              />
            </span>

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
                Product options
              </p>

              <h3
                className="
                  mt-0.5
                  text-lg
                  font-bold
                  text-gray-950

                  sm:text-xl
                "
              >
                Variants
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-gray-500

                  sm:text-sm
                "
              >
                Manage finish, stone, size, price, availability, and inventory.
              </p>
            </div>
          </div>

          {!product.archivedAt && (
            <button
              type="button"
              onClick={openNewVariantDialog}
              disabled={isMutating}
              className="
                inline-flex
                min-h-11
                w-full
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

                disabled:cursor-not-allowed
                disabled:bg-gray-200
                disabled:text-gray-400

                sm:w-auto
              "
            >
              <AddRoundedIcon
                sx={{
                  fontSize: 18,
                }}
              />
              Add variant
            </button>
          )}
        </div>

        {/* CONTENT */}
        <div
          className="
            p-4

            sm:p-5

            lg:p-6
          "
        >
          {variants.length === 0 ? (
            <div
              className="
                flex
                min-h-[12rem]
                flex-col
                items-center
                justify-center
                rounded-[1.15rem]
                border-2
                border-dashed
                border-gray-200
                bg-gray-50/60
                px-5
                py-8
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
                  bg-white
                  text-gray-400
                  shadow-sm
                  ring-1
                  ring-gray-200
                "
              >
                <Inventory2OutlinedIcon
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
                No variants yet
              </p>

              <p
                className="
                  mt-1
                  max-w-sm
                  text-xs
                  leading-5
                  text-gray-500

                  sm:text-sm
                "
              >
                Add a purchasable color, stone, size, price, and stock
                combination.
              </p>

              {!product.archivedAt && (
                <button
                  type="button"
                  onClick={openNewVariantDialog}
                  className="
                    mt-5
                    inline-flex
                    min-h-10
                    items-center
                    justify-center
                    gap-1.5
                    rounded-full
                    border
                    border-gray-200
                    bg-white
                    px-4
                    text-xs
                    font-bold
                    text-gray-700
                    transition-all

                    hover:border-gray-950
                    hover:bg-gray-950
                    hover:text-white
                  "
                >
                  <AddRoundedIcon
                    sx={{
                      fontSize: 16,
                    }}
                  />
                  Add first variant
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {variants.map((variant) => (
                <ProductVariantCard
                  key={variant.id}
                  product={product}
                  variant={variant}
                  isMutating={isMutating}
                  onToggleStatus={() =>
                    void runMutation(
                      () =>
                        updateAdminVariantStatus(
                          product.id,
                          variant.id,
                          !variant.isActive,
                        ),

                      "Unable to change variant status.",
                    )
                  }
                  onEdit={() => openVariantDialog(variant)}
                  onArchive={() => {
                    const confirmed = window.confirm(
                      `Archive ${variant.displayName || "this variant"}?`,
                    );

                    if (!confirmed) {
                      return;
                    }

                    void runMutation(
                      () => archiveAdminVariant(product.id, variant.id),

                      "Unable to archive variant.",
                    );
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          IMAGES
      ===================================================== */}
      <ProductImageUploader
        productId={product.id}
        productName={product.name}
        existingImages={Array.isArray(product.images) ? product.images : []}
        disabled={Boolean(product.archivedAt) || isMutating}
        onImageAdded={handleUploadedImage}
        onEditImage={(image) =>
          setImageDialog((currentState) => ({
            open: true,
            item: image,

            key: currentState.key + 1,
          }))
        }
        onDeleteImage={(image) => {
          const confirmed = window.confirm("Delete this product image?");

          if (!confirmed) {
            return;
          }

          void runMutation(
            () => deleteAdminProductImage(product.id, image.id),

            "Unable to delete image.",
          );
        }}
      />

      {/* =====================================================
          VARIANT DIALOG
      ===================================================== */}
      {variantDialog.open && (
        <VariantEditorDialog
          key={variantDialog.key}
          open
          variant={variantDialog.item}
          isSubmitting={isMutating}
          onClose={() =>
            setVariantDialog((currentState) => ({
              ...currentState,
              open: false,
              item: null,
            }))
          }
          onSubmit={handleVariantSubmit}
        />
      )}

      {/* =====================================================
          IMAGE DIALOG
      ===================================================== */}
      {imageDialog.open && (
        <ImageEditorDialog
          key={imageDialog.key}
          open
          image={imageDialog.item}
          variants={variants}
          isSubmitting={isMutating}
          onClose={() =>
            setImageDialog((currentState) => ({
              ...currentState,
              open: false,
              item: null,
            }))
          }
          onSubmit={handleImageSubmit}
        />
      )}

      {/* =====================================================
          PRODUCT ARCHIVE DIALOG
      ===================================================== */}
      <Dialog
        open={archiveDialogOpen}
        onClose={isMutating ? undefined : () => setArchiveDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        aria-labelledby="archive-product-title"
        sx={{
          "& .MuiDialog-paper": {
            width: "calc(100% - 24px)",
            maxHeight: "calc(100% - 24px)",
            margin: "12px",
            borderRadius: "22px",
            overflow: "hidden",
          },

          "@media (min-width: 640px)": {
            "& .MuiDialog-paper": {
              width: "100%",
              margin: "32px",
              borderRadius: "24px",
            },
          },
        }}
      >
        <DialogTitle
          id="archive-product-title"
          sx={{
            padding: 0,
          }}
        >
          <div
            className="
              flex
              items-start
              gap-3
              border-b
              border-gray-100
              px-4
              py-4

              sm:px-5
              sm:py-5
            "
          >
            <span
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-red-50
                text-red-600
                ring-1
                ring-red-100
              "
            >
              <ArchiveRoundedIcon
                sx={{
                  fontSize: 20,
                }}
              />
            </span>

            <div>
              <p
                className="
                  text-[0.6rem]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-red-500
                "
              >
                Destructive action
              </p>

              <h2
                className="
                  mt-1
                  text-lg
                  font-bold
                  tracking-[-0.025em]
                  text-gray-950

                  sm:text-xl
                "
              >
                Archive product?
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  font-medium
                  text-gray-500
                "
              >
                {product.name}
              </p>
            </div>
          </div>
        </DialogTitle>

        <DialogContent
          sx={{
            padding: 0,
          }}
        >
          <div
            className="
              px-4
              py-5

              sm:px-5
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
                rounded-[1rem]
                border
                border-red-200
                bg-red-50/70
                p-4
              "
            >
              <WarningAmberRoundedIcon
                sx={{
                  fontSize: 19,
                }}
                className="
                  mt-0.5
                  shrink-0
                  text-red-600
                "
              />

              <div>
                <p
                  className="
                    text-sm
                    font-bold
                    text-red-900
                  "
                >
                  This product will leave the public catalog
                </p>

                <p
                  className="
                    mt-1.5
                    text-xs
                    leading-5
                    text-red-700

                    sm:text-sm
                    sm:leading-6
                  "
                >
                  The product and its variants will be archived. Historical
                  information remains stored for existing orders and records.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>

        <DialogActions
          sx={{
            padding: 0,
          }}
        >
          <div
            className="
              flex
              w-full
              flex-col-reverse
              gap-2.5
              border-t
              border-gray-100
              bg-gray-50/60
              px-4
              py-4

              sm:flex-row
              sm:justify-end
              sm:px-5
            "
          >
            <button
              type="button"
              onClick={() => setArchiveDialogOpen(false)}
              disabled={isMutating}
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

                hover:bg-gray-100

                disabled:cursor-not-allowed
                disabled:opacity-40

                sm:w-auto
              "
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isMutating}
              onClick={async () => {
                const response = await runMutation(
                  () => archiveAdminProduct(product.id),

                  "Unable to archive product.",
                );

                if (response) {
                  setArchiveDialogOpen(false);

                  navigate("/admin/products", {
                    replace: true,
                  });
                }
              }}
              className="
                inline-flex
                min-h-11
                w-full
                items-center
                justify-center
                gap-2
                rounded-full
                bg-red-700
                px-5
                text-sm
                font-bold
                text-white
                transition-colors

                hover:bg-red-800

                disabled:cursor-not-allowed
                disabled:bg-gray-200
                disabled:text-gray-400

                sm:w-auto
              "
            >
              <ArchiveRoundedIcon
                sx={{
                  fontSize: 17,
                }}
              />

              {isMutating ? "Archiving..." : "Archive product"}
            </button>
          </div>
        </DialogActions>
      </Dialog>
    </section>
  );
}

export default AdminProductManage;
