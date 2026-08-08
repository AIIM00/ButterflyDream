import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// MUI Icons
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

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

function VariantColorSwatch({ label, color }) {
  if (!label) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className="
          h-5 w-5
          shrink-0
          rounded-full
          border border-black/10
        "
        style={{
          backgroundColor: color || "#E6DFDA",
        }}
        aria-hidden="true"
      />

      <span
        className="
          text-sm font-semibold
          text-[var(--color-deep-espresso)]
        "
      >
        {label}
      </span>
    </div>
  );
}

function VariantOptionBadge({ label, value }) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return (
    <div
      className="
        rounded-full
        border
        border-[var(--color-warm-light-gray)]
        bg-[var(--color-soft-ivory)]
        px-3 py-1.5
      "
    >
      <span
        className="
          text-[0.65rem]
          font-semibold
          uppercase
          tracking-[0.12em]
          text-[var(--color-warm-gray)]
        "
      >
        {label}
      </span>

      <span
        className="
          ml-2
          text-sm
          font-bold
          text-[var(--color-deep-espresso)]
        "
      >
        {value}
      </span>
    </div>
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

  function handleNameChange(event) {
    const name = event.target.value;

    setFormData((currentData) => ({
      ...currentData,

      name,

      slug: slugEdited ? currentData.slug : createAdminProductSlug(name),
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

    setVariantDialog((currentState) => ({
      ...currentState,
      open: false,
      item: null,
    }));
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

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      /*
       * Images are intentionally empty here.
       *
       * The product must exist first so that
       * R2 can store its images under:
       *
       * products/{productId}/{imageId}.jpg
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
       * After creation, immediately move
       * the administrator to the manage
       * page where R2 uploads are available.
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
    <section className="space-y-7">
      <Link
        to="/admin/products"
        className="
          inline-flex items-center
          gap-2 font-semibold
          text-gray-700
        "
      >
        <ArrowBackRoundedIcon fontSize="small" />
        Products
      </Link>

      <header>
        <p
          className="
            text-sm font-semibold
            uppercase tracking-widest
            text-gray-500
          "
        >
          Product management
        </p>

        <h2
          className="
            mt-2 text-3xl
            font-bold
          "
        >
          Create product
        </h2>

        <p
          className="
            mt-3 max-w-2xl
            text-sm leading-6
            text-gray-500
          "
        >
          Create the product and its variants first. After creation, you&apos;ll
          be taken to the product manager where you can upload its photos.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-7">
        {validationError && (
          <div
            className="
              rounded-xl border
              border-red-200
              bg-red-50
              px-4 py-3
              text-red-700
            "
          >
            {validationError}
          </div>
        )}

        {/* PRODUCT INFORMATION */}

        <section
          className="
            rounded-2xl
            border border-gray-200
            bg-white p-6
            shadow-sm
          "
        >
          <h3 className="text-xl font-bold">Product information</h3>

          <div
            className="
              mt-6 grid gap-5
              sm:grid-cols-2
            "
          >
            <label className="font-semibold">
              Product name
              <input
                value={formData.name}
                onChange={handleNameChange}
                className="
                  mt-2 w-full
                  rounded-xl
                  border
                  border-gray-300
                  px-4 py-3
                  font-normal
                "
              />
            </label>

            <label className="font-semibold">
              Slug
              <input
                value={formData.slug}
                onChange={(event) => {
                  setSlugEdited(true);

                  setFormData((currentData) => ({
                    ...currentData,

                    slug: createAdminProductSlug(event.target.value),
                  }));
                }}
                className="
                  mt-2 w-full
                  rounded-xl
                  border
                  border-gray-300
                  px-4 py-3
                  font-normal
                "
              />
            </label>

            <label className="font-semibold">
              Category
              <select
                value={formData.categoryId}
                onChange={(event) =>
                  setFormData((currentData) => ({
                    ...currentData,

                    categoryId: event.target.value,
                  }))
                }
                disabled={isLoadingCategories}
                className="
                  mt-2 w-full
                  rounded-xl
                  border
                  border-gray-300
                  bg-white
                  px-4 py-3
                  font-normal
                "
              >
                <option value="">Select category</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="font-semibold">
              Initial status
              <select
                value={formData.status}
                onChange={(event) =>
                  setFormData((currentData) => ({
                    ...currentData,

                    status: event.target.value,
                  }))
                }
                className="
                  mt-2 w-full
                  rounded-xl
                  border
                  border-gray-300
                  bg-white
                  px-4 py-3
                  font-normal
                "
              >
                {PRODUCT_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label
            className="
              mt-5 block
              font-semibold
            "
          >
            Description
            <textarea
              value={formData.description}
              onChange={(event) =>
                setFormData((currentData) => ({
                  ...currentData,

                  description: event.target.value,
                }))
              }
              rows={5}
              className="
                mt-2 w-full
                rounded-xl
                border
                border-gray-300
                px-4 py-3
                font-normal
              "
            />
          </label>

          <label
            className="
              mt-5 flex
              items-center gap-3
              font-semibold
            "
          >
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(event) =>
                setFormData((currentData) => ({
                  ...currentData,

                  isFeatured: event.target.checked,
                }))
              }
            />
            Featured product
          </label>
        </section>

        {/* VARIANTS */}

        <section
          className="
    overflow-hidden
    border
    border-[var(--color-warm-light-gray)]
    bg-white
    shadow-sm
  "
        >
          {/* HEADER */}

          <div
            className="
      flex flex-col gap-4
      border-b
      border-[var(--color-warm-light-gray)]
      px-5 py-5
      sm:flex-row
      sm:items-center
      sm:justify-between
      sm:px-6
    "
          >
            <div>
              <p
                className="
          text-[0.6875rem]
          font-semibold
          uppercase
          tracking-[0.16em]
          text-[var(--color-deep-bronze)]
        "
              >
                Product options
              </p>

              <h3
                className="
          mt-1
          font-display
          text-2xl
          font-medium
          text-[var(--color-deep-espresso)]
        "
              >
                Variants
              </h3>

              <p
                className="
          mt-2
          text-sm
          text-[var(--color-warm-gray)]
        "
              >
                Create each available combination of metal, stone and size.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setVariantDialog((currentState) => ({
                  open: true,
                  item: null,
                  key: currentState.key + 1,
                }))
              }
              className="
        inline-flex
        min-h-11
        items-center
        justify-center
        gap-2
        rounded-full
        bg-[var(--color-deep-espresso)]
        px-5
        text-sm
        font-semibold
        text-white
        transition-colors
        hover:bg-[var(--color-deep-bronze)]
      "
            >
              <AddRoundedIcon />
              Add variant
            </button>
          </div>

          <div className="p-5 sm:p-6">
            {variants.length === 0 ? (
              <div
                className="
          border
          border-dashed
          border-[var(--color-warm-light-gray)]
          bg-[var(--color-soft-ivory)]
          px-6 py-12
          text-center
        "
              >
                <p
                  className="
            font-semibold
            text-[var(--color-deep-espresso)]
          "
                >
                  No variants yet
                </p>

                <p
                  className="
            mx-auto mt-2
            max-w-md
            text-sm leading-6
            text-[var(--color-warm-gray)]
          "
                >
                  Add at least one option with its color, size, price and stock.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
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
                  border
                  border-[var(--color-warm-light-gray)]
                  bg-white
                "
                    >
                      {/* MAIN INFO */}

                      <div
                        className="
                    flex flex-col
                    gap-5
                    p-5
                    lg:flex-row
                    lg:items-start
                    lg:justify-between
                  "
                      >
                        <div className="min-w-0 flex-1">
                          <div
                            className="
                        flex flex-wrap
                        items-center
                        gap-2
                      "
                          >
                            <h4
                              className="
                          text-lg
                          font-bold
                          text-[var(--color-deep-espresso)]
                        "
                            >
                              {variant.displayName || "Product variant"}
                            </h4>

                            {variant.isDefault && (
                              <span
                                className="
                            rounded-full
                            bg-[var(--color-deep-espresso)]
                            px-3 py-1
                            text-[0.65rem]
                            font-semibold
                            uppercase
                            tracking-[0.1em]
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
                            bg-[var(--color-muted-red)]/10
                            px-3 py-1
                            text-[0.65rem]
                            font-semibold
                            uppercase
                            tracking-[0.1em]
                            text-[var(--color-muted-red)]
                          "
                              >
                                Inactive
                              </span>
                            )}
                          </div>

                          <p
                            className="
                        mt-1
                        text-xs
                        font-medium
                        uppercase
                        tracking-[0.08em]
                        text-[var(--color-warm-gray)]
                      "
                          >
                            SKU: {variant.sku}
                          </p>

                          {/* OPTIONS */}

                          <div
                            className="
                        mt-5
                        flex flex-wrap
                        items-center
                        gap-x-6 gap-y-3
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
                              text-sm
                              text-[var(--color-warm-gray)]
                            "
                              >
                                Standard product option
                              </span>
                            )}
                          </div>
                        </div>

                        {/* PRICE */}

                        <div
                          className="
                      shrink-0
                      lg:text-right
                    "
                        >
                          <p
                            className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-[0.12em]
                        text-[var(--color-warm-gray)]
                      "
                          >
                            Price
                          </p>

                          <p
                            className="
                        mt-1
                        text-2xl
                        font-bold
                        text-[var(--color-deep-espresso)]
                      "
                          >
                            ${variant.price}
                          </p>
                        </div>
                      </div>

                      {/* INVENTORY + ACTIONS */}

                      <div
                        className="
                    flex flex-col
                    gap-4
                    border-t
                    border-[var(--color-warm-light-gray)]
                    bg-[var(--color-warm-cream)]
                    px-5 py-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                      >
                        <div
                          className="
                      flex flex-wrap
                      items-center
                      gap-3
                    "
                        >
                          <VariantOptionBadge label="Stock" value={stock} />

                          <VariantOptionBadge
                            label="Low stock"
                            value={lowStockThreshold}
                          />

                          {isOutOfStock ? (
                            <span
                              className="
                          rounded-full
                          bg-[var(--color-muted-red)]/10
                          px-3 py-1.5
                          text-xs
                          font-bold
                          text-[var(--color-muted-red)]
                        "
                            >
                              Out of stock
                            </span>
                          ) : isLowStock ? (
                            <span
                              className="
                          rounded-full
                          bg-[var(--color-pale-champagne)]
                          px-3 py-1.5
                          text-xs
                          font-bold
                          text-[var(--color-deep-bronze)]
                        "
                            >
                              Low stock
                            </span>
                          ) : (
                            <span
                              className="
                          rounded-full
                          bg-[var(--color-deep-sage)]/10
                          px-3 py-1.5
                          text-xs
                          font-bold
                          text-[var(--color-deep-sage)]
                        "
                            >
                              In stock
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {/* EDIT */}

                          <button
                            type="button"
                            aria-label={`Edit ${variant.displayName}`}
                            onClick={() =>
                              setVariantDialog((currentState) => ({
                                open: true,
                                item: variant,

                                key: currentState.key + 1,
                              }))
                            }
                            className="
                        flex h-10 w-10
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[var(--color-warm-light-gray)]
                        bg-white
                        text-[var(--color-deep-espresso)]
                        transition-colors
                        hover:border-[var(--color-warm-champagne)]
                      "
                          >
                            <EditRoundedIcon fontSize="small" />
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            aria-label={`Remove ${variant.displayName}`}
                            onClick={() => removeVariant(variant.localId)}
                            className="
                        flex h-10 w-10
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[var(--color-muted-red)]/25
                        bg-white
                        text-[var(--color-muted-red)]
                        transition-colors
                        hover:bg-[var(--color-muted-red)]/5
                      "
                          >
                            <DeleteOutlineRoundedIcon fontSize="small" />
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

        {/* PRODUCT PHOTOS INFORMATION */}

        <section
          className="
            border
            border-gray-200
            bg-white
            p-6
            shadow-sm
          "
        >
          <div
            className="
              flex flex-col gap-4
              sm:flex-row
              sm:items-center
            "
          >
            <div
              className="
                flex h-12 w-12
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[var(--color-pale-champagne)]
                text-[var(--color-deep-bronze)]
              "
            >
              <ImageOutlinedIcon />
            </div>

            <div>
              <h3 className="text-lg font-bold">Product photos</h3>

              <p
                className="
                  mt-1
                  text-sm leading-6
                  text-gray-500
                "
              >
                Photos are uploaded after the product is created. You&apos;ll be
                redirected to the product manager where you can upload up to 8
                images directly to secure cloud storage.
              </p>
            </div>
          </div>
        </section>

        {/* ACTIONS */}

        <div
          className="
            flex flex-col-reverse
            gap-3
            sm:flex-row
            sm:justify-end
          "
        >
          <Link
            to="/admin/products"
            className="
              inline-flex
              min-h-12
              items-center
              justify-center
              rounded-full
              border
              border-gray-300
              px-6
              font-semibold
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
              items-center
              justify-center
              rounded-full
              bg-gray-950
              px-6
              font-semibold
              text-white
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {isSubmitting ? "Creating..." : "Create product"}
          </button>
        </div>
      </form>

      {variantDialog.open && (
        <VariantEditorDialog
          key={variantDialog.key}
          open
          variant={variantDialog.item}
          isSubmitting={false}
          onClose={() =>
            setVariantDialog((currentState) => ({
              ...currentState,
              open: false,
              item: null,
            }))
          }
          onSubmit={saveLocalVariant}
        />
      )}
    </section>
  );
}

export default AdminProductCreate;
