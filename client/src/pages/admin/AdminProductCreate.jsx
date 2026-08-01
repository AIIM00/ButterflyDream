import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { toast } from "react-toastify";
import ImageEditorDialog from "../../components/admin/products/ImageEditorDialog.jsx";
import VariantEditorDialog from "../../components/admin/products/VariantEditorDialog.jsx";
import { fetchAdminCategories } from "../../services/adminCategoryApi.js";
import { createAdminProduct } from "../../services/adminProductApi.js";
import {
  buildProductCreatePayload,
  createAdminProductSlug,
  createLocalId,
  PRODUCT_STATUS_OPTIONS,
} from "../../utils/adminProductForm.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

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
  const [images, setImages] = useState([]);

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

  function saveLocalImage(payload) {
    setImages((currentImages) => {
      const localId = imageDialog.item?.localId ?? createLocalId();

      let nextImages = imageDialog.item
        ? currentImages.map((image) =>
            image.localId === localId
              ? {
                  ...payload,
                  localId,
                }
              : image,
          )
        : [
            ...currentImages,
            {
              ...payload,
              localId,
            },
          ];

      if (payload.isPrimary) {
        nextImages = nextImages.map((image) => ({
          ...image,
          isPrimary: image.localId === localId,
        }));
      }

      if (
        nextImages.length > 0 &&
        !nextImages.some((image) => image.isPrimary)
      ) {
        nextImages[0] = {
          ...nextImages[0],
          isPrimary: true,
        };
      }

      return nextImages;
    });

    setImageDialog((currentState) => ({
      ...currentState,
      open: false,
      item: null,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const payload = buildProductCreatePayload({
        formData,
        variants,
        images,
      });

      setValidationError("");
      setIsSubmitting(true);

      const response = await createAdminProduct(payload);

      toast.success(response.message);

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
        className="inline-flex items-center gap-2 font-semibold text-gray-700"
      >
        <ArrowBackRoundedIcon fontSize="small" />
        Products
      </Link>

      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
          Product management
        </p>

        <h2 className="mt-2 text-3xl font-bold">Create product</h2>
      </header>

      <form onSubmit={handleSubmit} className="space-y-7">
        {validationError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {validationError}
          </div>
        )}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold">Product information</h3>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="font-semibold">
              Product name
              <input
                value={formData.name}
                onChange={handleNameChange}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 font-normal"
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
                disabled={isLoadingCategories}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-normal"
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
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-normal"
              >
                {PRODUCT_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
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

          <label className="mt-5 flex items-center gap-3 font-semibold">
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

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Variants</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add prices, options, and stock.
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
              className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 font-semibold text-white"
            >
              <AddRoundedIcon />
              Add variant
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {variants.map((variant) => (
              <article
                key={variant.localId}
                className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-bold">
                    {variant.displayName}
                    {variant.isDefault && (
                      <span className="ml-2 text-xs text-emerald-700">
                        Default
                      </span>
                    )}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {variant.sku} · ${variant.price} · Stock{" "}
                    {variant.stockQuantity}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setVariantDialog((currentState) => ({
                        open: true,
                        item: variant,
                        key: currentState.key + 1,
                      }))
                    }
                    className="rounded-lg border border-gray-300 p-2"
                  >
                    <EditRoundedIcon />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeVariant(variant.localId)}
                    className="rounded-lg border border-red-200 p-2 text-red-700"
                  >
                    <DeleteOutlineRoundedIcon />
                  </button>
                </div>
              </article>
            ))}

            {variants.length === 0 && (
              <p className="rounded-xl bg-gray-50 px-4 py-8 text-center text-gray-500">
                Add at least one variant.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Images</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add public product image URLs.
              </p>
            </div>

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
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {images.map((image) => (
              <article
                key={image.localId}
                className="overflow-hidden rounded-xl border border-gray-200"
              >
                <img
                  src={image.imageUrl}
                  alt={image.altText || formData.name}
                  className="aspect-square w-full object-cover"
                />

                <div className="flex items-center justify-between p-3">
                  <span className="text-xs font-bold">
                    {image.isPrimary ? "Primary" : `Position ${image.position}`}
                  </span>

                  <div className="flex gap-1">
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
                      onClick={() =>
                        setImages((currentImages) =>
                          currentImages.filter(
                            (currentImage) =>
                              currentImage.localId !== image.localId,
                          ),
                        )
                      }
                      className="text-red-700"
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Link
            to="/admin/products"
            className="rounded-xl border border-gray-300 px-6 py-3 font-semibold"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white disabled:opacity-50"
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

      {imageDialog.open && (
        <ImageEditorDialog
          key={imageDialog.key}
          open
          image={imageDialog.item}
          variants={[]}
          allowVariantAssociation={false}
          isSubmitting={false}
          onClose={() =>
            setImageDialog((currentState) => ({
              ...currentState,
              open: false,
              item: null,
            }))
          }
          onSubmit={saveLocalImage}
        />
      )}
    </section>
  );
}

export default AdminProductCreate;
