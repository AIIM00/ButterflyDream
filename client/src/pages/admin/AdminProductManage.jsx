import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Switch,
} from "@mui/material";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArchiveRoundedIcon from "@mui/icons-material/ArchiveRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { toast } from "react-toastify";
import ImageEditorDialog from "../../components/admin/products/ImageEditorDialog.jsx";
import ProductStatusBadge from "../../components/admin/products/ProductStatusBadge.jsx";
import VariantEditorDialog from "../../components/admin/products/VariantEditorDialog.jsx";
import { fetchAdminCategories } from "../../services/adminCategoryApi.js";
import {
  archiveAdminProduct,
  archiveAdminVariant,
  createAdminProductImage,
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
    const requestPayload = {
      ...payload,
    };

    if (imageDialog.item?.isPrimary || payload.isPrimary === false) {
      delete requestPayload.isPrimary;
    }

    const response = await runMutation(
      () =>
        imageDialog.item
          ? updateAdminProductImage(
              product.id,
              imageDialog.item.id,
              requestPayload,
            )
          : createAdminProductImage(product.id, requestPayload),
      imageDialog.item ? "Unable to update image." : "Unable to create image.",
    );

    if (response) {
      setImageDialog((currentState) => ({
        ...currentState,
        open: false,
        item: null,
      }));
    }
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

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Variants</h3>

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
              className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 font-semibold text-white"
            >
              <AddRoundedIcon />
              Add variant
            </button>
          )}
        </div>

        <div className="mt-6 space-y-4">
          {product.variants.map((variant) => (
            <article
              key={variant.id}
              className="rounded-xl border border-gray-200 p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold">{variant.displayName}</h4>

                    {variant.isDefault && (
                      <span className="text-xs font-bold text-emerald-700">
                        Default
                      </span>
                    )}

                    {variant.archivedAt && (
                      <span className="text-xs font-bold text-gray-500">
                        Archived
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    {variant.sku} · ${variant.price} · Stock{" "}
                    {variant.inventory?.stockQuantity ?? 0}
                  </p>
                </div>

                {!product.archivedAt && !variant.archivedAt && (
                  <div className="flex flex-wrap gap-2">
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
                      className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold"
                    >
                      {variant.isActive ? "Deactivate" : "Activate"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setVariantDialog((currentState) => ({
                          open: true,
                          item: variant,
                          key: currentState.key + 1,
                        }))
                      }
                      className="rounded-xl border border-gray-300 p-2"
                    >
                      <EditRoundedIcon />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const confirmed = window.confirm(
                          `Archive ${variant.displayName}?`,
                        );

                        if (confirmed) {
                          void runMutation(
                            () => archiveAdminVariant(product.id, variant.id),
                            "Unable to archive variant.",
                          );
                        }
                      }}
                      className="rounded-xl border border-red-200 p-2 text-red-700"
                    >
                      <ArchiveRoundedIcon />
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Images</h3>

          {!product.archivedAt && (
            <button
              type="button"
              onClick={() =>
                setImageDialog((currentState) => ({
                  open: true,
                  item: null,
                  key: currentState.key + 1,
                }))
              }
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 font-semibold"
            >
              <AddPhotoAlternateRoundedIcon />
              Add image
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {product.images.map((image) => (
            <article
              key={image.id}
              className="overflow-hidden rounded-xl border border-gray-200"
            >
              <img
                src={image.imageUrl}
                alt={image.altText || product.name}
                className="aspect-square w-full object-cover"
              />

              <div className="flex items-center justify-between p-3">
                <span className="text-xs font-bold">
                  {image.isPrimary ? "Primary" : `Position ${image.position}`}
                </span>

                {!product.archivedAt && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setImageDialog((currentState) => ({
                          open: true,
                          item: image,
                          key: currentState.key + 1,
                        }))
                      }
                    >
                      <EditRoundedIcon fontSize="small" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const confirmed = window.confirm(
                          "Delete this product image?",
                        );

                        if (confirmed) {
                          void runMutation(
                            () => deleteAdminProductImage(product.id, image.id),
                            "Unable to delete image.",
                          );
                        }
                      }}
                      className="text-red-700"
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

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
