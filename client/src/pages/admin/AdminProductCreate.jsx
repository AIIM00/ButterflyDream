import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// MUI Icons
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import StarOutlineRoundedIcon from "@mui/icons-material/StarOutlineRounded";

// Toast
import { toast } from "react-toastify";

// Components
import VariantEditorDialog from "../../components/admin/products/VariantEditorDialog.jsx";

// Services
import { fetchAdminCategories } from "../../services/adminCategoryApi.js";
import { createAdminProduct } from "../../services/adminProductApi.js";

// Utils
import {
  buildProductCreatePayload,
  createAdminProductSlug,
  createLocalId,
  PRODUCT_STATUS_OPTIONS,
} from "../../utils/adminProductForm.js";

import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

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
      <span
        className="
          font-bold
          text-gray-400
        "
      >
        {label}
      </span>

      <span className="font-bold text-gray-800">{value}</span>
    </span>
  );
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

function formatStatusLabel(status) {
  return String(status ?? "")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

/* =========================================================
   PAGE
========================================================= */

function AdminProductCreate() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    slug: "",
    description: "",
    status: "DRAFT",
    isFeatured: false,
  });

  const [slugEdited, setSlugEdited] = useState(false);

  const [variants, setVariants] = useState([]);

  const [variantDialog, setVariantDialog] = useState({
    open: false,
    item: null,
    key: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [validationError, setValidationError] = useState("");

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
      } catch {
        if (!controller.signal.aborted) {
          setCategories([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingCategories(false);
        }
      }
    }

    void loadCategories();

    return () => {
      controller.abort();
    };
  }, []);

  /* =======================================================
     PRODUCT FORM
  ======================================================= */

  function updateProductField(field, value) {
    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }));

    if (validationError) {
      setValidationError("");
    }
  }

  function handleNameChange(event) {
    const name = event.target.value;

    setFormData((currentData) => ({
      ...currentData,

      name,

      slug: slugEdited ? currentData.slug : createAdminProductSlug(name),
    }));

    if (validationError) {
      setValidationError("");
    }
  }

  function handleSlugChange(event) {
    setSlugEdited(true);

    updateProductField("slug", createAdminProductSlug(event.target.value));
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

  function openEditVariantDialog(variant) {
    setVariantDialog((currentState) => ({
      open: true,
      item: variant,
      key: currentState.key + 1,
    }));
  }

  function closeVariantDialog() {
    setVariantDialog((currentState) => ({
      ...currentState,
      open: false,
      item: null,
    }));
  }

  function saveLocalVariant(payload) {
    setVariants((currentVariants) => {
      const localId = variantDialog.item?.localId ?? createLocalId();

      let nextVariants = variantDialog.item
        ? currentVariants.map((variant) =>
            variant.localId === localId
              ? {
                  ...payload,
                  localId,
                }
              : variant,
          )
        : [
            ...currentVariants,

            {
              ...payload,
              localId,
            },
          ];

      if (payload.isDefault) {
        nextVariants = nextVariants.map((variant) => ({
          ...variant,

          isDefault: variant.localId === localId,
        }));
      }

      if (!nextVariants.some((variant) => variant.isDefault)) {
        nextVariants[0] = {
          ...nextVariants[0],
          isDefault: true,
        };
      }

      return nextVariants;
    });

    closeVariantDialog();

    if (validationError) {
      setValidationError("");
    }
  }

  function removeVariant(localId) {
    setVariants((currentVariants) => {
      const nextVariants = currentVariants.filter(
        (variant) => variant.localId !== localId,
      );

      if (
        nextVariants.length > 0 &&
        !nextVariants.some((variant) => variant.isDefault)
      ) {
        nextVariants[0] = {
          ...nextVariants[0],
          isDefault: true,
        };
      }

      return nextVariants;
    });
  }

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      /*
       * Images intentionally remain empty here.
       *
       * The product must exist first so R2 can
       * store its images under its product ID.
       */
      const payload = buildProductCreatePayload({
        formData,
        variants,
        images: [],
      });

      setValidationError("");
      setIsSubmitting(true);

      const response = await createAdminProduct(payload);

      toast.success(response.message);

      /*
       * Continue directly to the product manager
       * where image uploads become available.
       */
      navigate(`/admin/products/${response.product.id}`, {
        replace: true,
      });
    } catch (error) {
      if (!error.response) {
        setValidationError(error.message);
      } else {
        toast.error(getApiErrorMessage(error, "Unable to create product."));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

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
      {/* =====================================================
          PAGE INTRO
      ===================================================== */}
      <div>
        <Link
          to="/admin/products"
          className="
            inline-flex
            min-h-9
            items-center
            gap-1.5
            rounded-full
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

        <div className="mt-3">
          <p
            className="
              text-[0.62rem]
              font-bold
              uppercase
              tracking-[0.13em]
              text-gray-400
            "
          >
            Product management
          </p>

          <h2
            className="
              mt-1
              text-2xl
              font-bold
              tracking-[-0.035em]
              text-gray-950

              sm:text-3xl
            "
          >
            Create product
          </h2>

          <p
            className="
              mt-2
              max-w-2xl
              text-xs
              leading-5
              text-gray-500

              sm:text-sm
              sm:leading-6
            "
          >
            Add the product information and at least one purchasable variant.
            Photos can be uploaded immediately after the product is created.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="
          space-y-5

          sm:space-y-6
        "
      >
        {/* ===================================================
            VALIDATION
        =================================================== */}
        {validationError && (
          <div
            role="alert"
            className="
              rounded-[1rem]
              border
              border-red-200
              bg-red-50
              px-3.5
              py-3
              text-xs
              font-medium
              leading-5
              text-red-700

              sm:px-4
              sm:text-sm
            "
          >
            {validationError}
          </div>
        )}

        {/* ===================================================
            PRODUCT INFORMATION
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
          {/* HEADER */}
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
                  Define the core storefront information for this product.
                </p>
              </div>
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
              {/* PRODUCT NAME */}
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
                  onChange={handleNameChange}
                  disabled={isSubmitting}
                  placeholder="Example: Butterfly Dream Necklace"
                  className="
                    mt-2
                    min-h-12
                    w-full
                    rounded-[0.95rem]
                    border
                    border-gray-200
                    bg-white
                    px-4
                    font-normal
                    text-gray-900
                    outline-none
                    transition

                    placeholder:text-gray-400

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
                  onChange={handleSlugChange}
                  disabled={isSubmitting}
                  placeholder="butterfly-dream-necklace"
                  className="
                    mt-2
                    min-h-12
                    w-full
                    rounded-[0.95rem]
                    border
                    border-gray-200
                    bg-white
                    px-4
                    font-normal
                    text-gray-900
                    outline-none
                    transition

                    placeholder:text-gray-400

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
                  htmlFor="product-category"
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
                    id="product-category"
                    value={formData.categoryId}
                    onChange={(event) =>
                      updateProductField("categoryId", event.target.value)
                    }
                    disabled={isLoadingCategories || isSubmitting}
                    className="
                      min-h-12
                      w-full
                      appearance-none
                      rounded-[0.95rem]
                      border
                      border-gray-200
                      bg-white
                      px-4
                      pr-11
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
                    <option value="">
                      {isLoadingCategories
                        ? "Loading categories..."
                        : "Select category"}
                    </option>

                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <KeyboardArrowDownRoundedIcon
                    sx={{
                      fontSize: 20,
                    }}
                    className="
                      pointer-events-none
                      absolute
                      right-3.5
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
                  htmlFor="product-status"
                  className="
                    text-xs
                    font-bold
                    text-gray-800

                    sm:text-sm
                  "
                >
                  Initial status
                </label>

                <div className="relative mt-2">
                  <select
                    id="product-status"
                    value={formData.status}
                    onChange={(event) =>
                      updateProductField("status", event.target.value)
                    }
                    disabled={isSubmitting}
                    className="
                      min-h-12
                      w-full
                      appearance-none
                      rounded-[0.95rem]
                      border
                      border-gray-200
                      bg-white
                      px-4
                      pr-11
                      text-sm
                      font-normal
                      text-gray-900
                      outline-none

                      focus:border-gray-400
                      focus:ring-4
                      focus:ring-gray-950/[0.035]

                      disabled:bg-gray-100
                    "
                  >
                    {PRODUCT_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {formatStatusLabel(status)}
                      </option>
                    ))}
                  </select>

                  <KeyboardArrowDownRoundedIcon
                    sx={{
                      fontSize: 20,
                    }}
                    className="
                      pointer-events-none
                      absolute
                      right-3.5
                      top-1/2
                      -translate-y-1/2
                      text-gray-400
                    "
                  />
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="mt-4">
              <label
                htmlFor="product-description"
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
                id="product-description"
                value={formData.description}
                onChange={(event) =>
                  updateProductField("description", event.target.value)
                }
                disabled={isSubmitting}
                rows={5}
                placeholder="Describe the product, materials, style and important details."
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
                  transition

                  placeholder:text-gray-400

                  focus:border-gray-400
                  focus:ring-4
                  focus:ring-gray-950/[0.035]

                  disabled:cursor-not-allowed
                  disabled:bg-gray-100
                "
              />
            </div>

            {/* FEATURED */}
            <label
              className={[
                `
                  mt-4
                  flex
                  cursor-pointer
                  items-start
                  gap-3
                  rounded-[1rem]
                  border
                  p-3.5
                  transition

                  sm:p-4
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
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(event) =>
                  updateProductField("isFeatured", event.target.checked)
                }
                disabled={isSubmitting}
                className="
                  mt-1
                  h-4
                  w-4
                  shrink-0
                  accent-gray-950
                "
              />

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
                  `,
                  formData.isFeatured
                    ? `
                      bg-white
                      text-amber-600
                      ring-1
                      ring-amber-100
                    `
                    : `
                      bg-white
                      text-gray-400
                      ring-1
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

              <span>
                <span
                  className="
                    block
                    text-sm
                    font-bold
                    text-gray-900
                  "
                >
                  Featured product
                </span>

                <span
                  className="
                    mt-1
                    block
                    text-xs
                    leading-5
                    text-gray-500
                  "
                >
                  Mark this product for featured storefront placements.
                </span>
              </span>
            </label>
          </div>
        </section>

        {/* ===================================================
            VARIANTS
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
                    max-w-xl
                    text-xs
                    leading-5
                    text-gray-500

                    sm:text-sm
                  "
                >
                  Create each purchasable combination of finish, stone, size,
                  price and stock.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openNewVariantDialog}
              disabled={isSubmitting}
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
          </div>

          <div
            className="
              p-4

              sm:p-5

              lg:p-6
            "
          >
            {/* EMPTY */}
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
                  Add at least one product option with its price and inventory.
                </p>

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
                    transition

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
              </div>
            ) : (
              <div className="space-y-3">
                {variants.map((variant) => {
                  const options =
                    variant.options && typeof variant.options === "object"
                      ? variant.options
                      : {};

                  const metalColor =
                    options.metalColor ?? options.color ?? null;

                  const metalColorHex =
                    options.metalColorHex ?? options.colorHex ?? null;

                  const stoneColor = options.stoneColor ?? null;

                  const stoneColorHex = options.stoneColorHex ?? null;

                  const size = formatVariantSize(options);

                  const stock = Number(variant.stockQuantity ?? 0);

                  const lowStockThreshold = Number(
                    variant.lowStockThreshold ?? 0,
                  );

                  const isOutOfStock = stock <= 0;

                  const isLowStock = stock > 0 && stock <= lowStockThreshold;

                  return (
                    <article
                      key={variant.localId}
                      className="
                          overflow-hidden
                          rounded-[1.1rem]
                          border
                          border-gray-200
                          bg-white
                        "
                    >
                      {/* ===================================
                            MAIN
                        =================================== */}
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

                              {variant.isActive === false && (
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
                          <VariantColorSwatch
                            label={metalColor}
                            color={metalColorHex}
                          />

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

                        {/* MOBILE METRICS */}
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

                      {/* ===================================
                            FOOTER
                        =================================== */}
                      <div
                        className="
                            flex
                            items-center
                            justify-between
                            gap-3
                            border-t
                            border-gray-100
                            bg-gray-50/60
                            px-4
                            py-3

                            sm:px-5
                          "
                      >
                        {/* STOCK STATUS */}
                        <span
                          className={[
                            `
                                inline-flex
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
                              `
                                  h-1.5
                                  w-1.5
                                  rounded-full
                                `,
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

                        {/* ACTIONS */}
                        <div
                          className="
                              flex
                              items-center
                              gap-1.5
                            "
                        >
                          <button
                            type="button"
                            aria-label={`Edit ${
                              variant.displayName || "variant"
                            }`}
                            onClick={() => openEditVariantDialog(variant)}
                            disabled={isSubmitting}
                            className="
                                flex
                                h-9
                                w-9
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

                          <button
                            type="button"
                            aria-label={`Remove ${
                              variant.displayName || "variant"
                            }`}
                            onClick={() => removeVariant(variant.localId)}
                            disabled={isSubmitting}
                            className="
                                flex
                                h-9
                                w-9
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
                            <DeleteOutlineRoundedIcon
                              sx={{
                                fontSize: 17,
                              }}
                            />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ===================================================
            PHOTOS
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
          <div
            className="
              flex
              items-start
              gap-3
              p-4

              sm:p-5

              lg:p-6
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
                text-gray-500
              "
            >
              <ImageOutlinedIcon
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
                Next step
              </p>

              <h3
                className="
                  mt-0.5
                  text-base
                  font-bold
                  text-gray-950

                  sm:text-lg
                "
              >
                Product photos
              </h3>

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
                Images are added after creation because the product needs its
                permanent ID first. After saving, you&apos;ll be redirected to
                the product manager where you can upload up to 8 photos.
              </p>
            </div>
          </div>
        </section>

        {/* ===================================================
            ACTIONS
        =================================================== */}
        <div
          className="
            flex
            flex-col-reverse
            gap-2.5
            pb-2

            sm:flex-row
            sm:items-center
            sm:justify-end
          "
        >
          <Link
            to="/admin/products"
            className="
              inline-flex
              min-h-12
              w-full
              items-center
              justify-center
              rounded-full
              border
              border-gray-200
              bg-white
              px-6
              text-sm
              font-bold
              text-gray-700
              transition-all

              hover:border-gray-300
              hover:bg-gray-100
              hover:text-gray-950

              sm:w-auto
            "
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="
              inline-flex
              min-h-12
              w-full
              items-center
              justify-center
              gap-2
              rounded-full
              bg-gray-950
              px-6
              text-sm
              font-bold
              text-white
              transition-colors

              hover:bg-gray-800

              disabled:cursor-not-allowed
              disabled:bg-gray-200
              disabled:text-gray-400

              sm:min-w-[11rem]
              sm:w-auto
            "
          >
            <SaveOutlinedIcon
              sx={{
                fontSize: 17,
              }}
            />

            {isSubmitting ? "Creating..." : "Create product"}
          </button>
        </div>
      </form>

      {/* =====================================================
          VARIANT DIALOG
      ===================================================== */}
      {variantDialog.open && (
        <VariantEditorDialog
          key={variantDialog.key}
          open
          variant={variantDialog.item}
          isSubmitting={false}
          onClose={closeVariantDialog}
          onSubmit={saveLocalVariant}
        />
      )}
    </section>
  );
}

export default AdminProductCreate;
