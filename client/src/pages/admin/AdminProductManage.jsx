import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Switch,
} from "@mui/material";

//MUI Icons
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArchiveRoundedIcon from "@mui/icons-material/ArchiveRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
//React Toastify
import { toast } from "react-toastify";
//Components
import ImageEditorDialog from "../../components/admin/products/ImageEditorDialog.jsx";
import ProductStatusBadge from "../../components/admin/products/ProductStatusBadge.jsx";
import VariantEditorDialog from "../../components/admin/products/VariantEditorDialog.jsx";
import ProductImageUploader from "../../components/admin/products/ProductImageUploader.jsx";

//Services
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

//Utils
import {
  createAdminProductSlug,
  PRODUCT_STATUS_OPTIONS,
} from "../../utils/adminProductForm.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

function ProductBasicsForm({ product, categories, isSaving, onSave }) {
  const [formData, setFormData] = useState({
    categoryId: product.categoryId,
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    isFeatured: product.isFeatured,
  });

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
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h3 className="text-xl font-bold">Product information</h3>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="font-semibold">
          Product name
          <input
            value={formData.name}
            onChange={(event) =>
              setFormData((currentData) => ({
                ...currentData,
                name: event.target.value,
              }))
            }
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 font-normal"
          />
        </label>

        <label className="font-semibold">
          Slug
          <input
            value={formData.slug}
            onChange={(event) =>
              setFormData((currentData) => ({
                ...currentData,
                slug: createAdminProductSlug(event.target.value),
              }))
            }
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 font-normal"
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
            className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-normal"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-3 self-end rounded-xl bg-gray-50 p-4 font-semibold">
          <Switch
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
      </div>

      <label className="mt-5 block font-semibold">
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
          className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 font-normal"
        />
      </label>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save information"}
        </button>
      </div>
    </form>
  );
}

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

      <span className="text-sm font-semibold text-gray-800">{label}</span>
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

  if (options?.sizeType === "LENGTH") {
    return String(size);
  }

  return String(size);
}

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

  if (loadState.loading) {
    return <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />;
  }

  if (loadState.status === 404) {
    return <Navigate to="/admin/products" replace />;
  }

  if (loadState.error || !product) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
        {getApiErrorMessage(loadState.error, "Unable to load product.")}
      </div>
    );
  }

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

  async function handleVariantSubmit(payload) {
    let response;

    if (variantDialog.item) {
      const variantData = {
        sku: payload.sku,
        displayName: payload.displayName,
        options: payload.options,
        price: payload.price,
        ...(payload.isDefault ? { isDefault: true } : {}),
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

  async function handleImageSubmit(payload) {
    if (!imageDialog.item) {
      return;
    }

    const requestPayload = {
      ...payload,
    };

    /*
     * The current primary image cannot simply
     * unset itself. Another image must first
     * become primary.
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
       * Protect against accidentally adding the
       * same finalized image twice.
       */
      if (currentImages.some((currentImage) => currentImage.id === image.id)) {
        return currentProduct;
      }

      let nextImages = [...currentImages, image];

      /*
       * If the backend marks the new image as
       * primary, reflect that immediately in UI.
       */
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

  return (
    <section className="space-y-7">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-2 font-semibold text-gray-700"
      >
        <ArrowBackRoundedIcon fontSize="small" />
        Products
      </Link>

      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <ProductStatusBadge
              status={product.status}
              archivedAt={product.archivedAt}
            />

            {product.isFeatured && (
              <span className="rounded-full bg-gray-950 px-3 py-1 text-xs font-bold text-white">
                Featured
              </span>
            )}
          </div>

          <h2 className="mt-4 text-3xl font-bold">{product.name}</h2>

          <p className="mt-2 text-gray-500">{product.slug}</p>
        </div>

        {!product.archivedAt && (
          <button
            type="button"
            onClick={() => setArchiveDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-700 hover:bg-red-50"
          >
            <ArchiveRoundedIcon />
            Archive product
          </button>
        )}
      </header>

      {!product.archivedAt && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="font-bold">Product status</h3>

          <div className="mt-4 flex flex-wrap gap-3">
            {PRODUCT_STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                type="button"
                disabled={isMutating || product.status === status}
                onClick={() =>
                  void runMutation(
                    () => updateAdminProductStatus(product.id, status),
                    "Unable to update product status.",
                  )
                }
                className={[
                  "rounded-xl border px-5 py-2.5 font-semibold disabled:cursor-not-allowed",
                  product.status === status
                    ? "border-gray-950 bg-gray-950 text-white"
                    : "border-gray-300 bg-white text-gray-700",
                ].join(" ")}
              >
                {status}
              </button>
            ))}
          </div>
        </section>
      )}

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

      <section
        className="
    overflow-hidden
    border
    border-[var(--color-warm-light-gray)]
    bg-white
    shadow-sm
  "
      >
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
              Manage metal color, stone, size, price and inventory.
            </p>
          </div>

          {!product.archivedAt && (
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
          )}
        </div>

        <div className="p-5 sm:p-6">
          {product.variants.length === 0 && (
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
            mt-2
            text-sm
            text-[var(--color-warm-gray)]
          "
              >
                Add a color, stone or size combination for this product.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {product.variants.map((variant) => {
              const options =
                variant.options && typeof variant.options === "object"
                  ? variant.options
                  : {};

              const metalColor = options.metalColor ?? options.color ?? null;

              const metalColorHex =
                options.metalColorHex ?? options.colorHex ?? null;

              const stoneColor = options.stoneColor ?? null;

              const stoneColorHex = options.stoneColorHex ?? null;

              const size = formatVariantSize(options);

              const stock = variant.inventory?.stockQuantity ?? 0;

              const lowStockThreshold =
                variant.inventory?.lowStockThreshold ?? 0;

              const isLowStock = stock > 0 && stock <= lowStockThreshold;

              const isOutOfStock = stock <= 0;

              return (
                <article
                  key={variant.id}
                  className="
                border
                border-[var(--color-warm-light-gray)]
                bg-white
              "
                >
                  {/* TOP */}

                  <div
                    className="
                  flex flex-col
                  gap-5 p-5
                  lg:flex-row
                  lg:items-start
                  lg:justify-between
                "
                  >
                    <div className="min-w-0 flex-1">
                      <div
                        className="
                      flex
                      flex-wrap
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

                        {variant.archivedAt && (
                          <span
                            className="
                          rounded-full
                          bg-gray-100
                          px-3 py-1
                          text-[0.65rem]
                          font-semibold
                          uppercase
                          tracking-[0.1em]
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
                      flex
                      flex-wrap
                      items-center
                      gap-x-6
                      gap-y-3
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
                  md:flex-row
                  md:items-center
                  md:justify-between
                "
                  >
                    <div
                      className="
                    flex
                    flex-wrap
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

                    {!product.archivedAt && !variant.archivedAt && (
                      <div
                        className="
                        flex
                        flex-wrap
                        gap-2
                      "
                      >
                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={() =>
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
                          className="
                          min-h-10
                          rounded-full
                          border
                          border-[var(--color-warm-light-gray)]
                          bg-white
                          px-4
                          text-sm
                          font-semibold
                          text-[var(--color-deep-espresso)]
                          transition-colors
                          hover:border-[var(--color-warm-champagne)]
                          disabled:opacity-50
                        "
                        >
                          {variant.isActive ? "Deactivate" : "Activate"}
                        </button>

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

                        <button
                          type="button"
                          aria-label={`Archive ${variant.displayName}`}
                          onClick={() => {
                            const confirmed = window.confirm(
                              `Archive ${variant.displayName}?`,
                            );

                            if (confirmed) {
                              void runMutation(
                                () =>
                                  archiveAdminVariant(product.id, variant.id),
                                "Unable to archive variant.",
                              );
                            }
                          }}
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
                          <ArchiveRoundedIcon fontSize="small" />
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

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

      {imageDialog.open && (
        <ImageEditorDialog
          key={imageDialog.key}
          open
          image={imageDialog.item}
          variants={product.variants}
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

      <Dialog
        open={archiveDialogOpen}
        onClose={isMutating ? undefined : () => setArchiveDialogOpen(false)}
      >
        <DialogTitle>Archive product?</DialogTitle>

        <DialogContent dividers>
          This removes the product from the public catalog and archives its
          variants. Historical information will remain stored.
        </DialogContent>

        <DialogActions>
          <button
            type="button"
            onClick={() => setArchiveDialogOpen(false)}
            disabled={isMutating}
            className="rounded-xl border border-gray-300 px-5 py-2.5 font-semibold"
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
            className="rounded-xl bg-red-700 px-5 py-2.5 font-semibold text-white"
          >
            Archive
          </button>
        </DialogActions>
      </Dialog>
    </section>
  );
}

export default AdminProductManage;
