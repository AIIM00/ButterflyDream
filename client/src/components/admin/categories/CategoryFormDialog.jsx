import { useEffect, useState } from "react";

//MUI Materials
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Switch,
} from "@mui/material";

//MUI Icons
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
//Components
import CategoryImagePreview from "./CategoryImagePreview.jsx";
import { validateCategoryImageFile } from "../../../services/adminCategoryImageUploadApi.js";
//Utils
import validateCategoryForm, {
  createCategorySlug,
} from "../../../utils/validateCategoryForm.js";

function createInitialState(category) {
  if (category) {
    return {
      name: category.name ?? "",
      slug: category.slug ?? "",
      description: category.description ?? "",
      imageUrl: category.imageUrl ?? "",
      isActive: category.isActive ?? true,
    };
  }

  return {
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    isActive: true,
  };
}

function CategoryFormDialog({
  open,
  category = null,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  const [selectedImage, setSelectedImage] = useState(null);

  const [selectedImagePreviewUrl, setSelectedImagePreviewUrl] = useState("");

  const [formData, setFormData] = useState(() => createInitialState(category));

  const [slugEdited, setSlugEdited] = useState(Boolean(category));

  const [validationMessage, setValidationMessage] = useState("");

  const isEditing = category !== null;

  function handleNameChange(event) {
    const nextName = event.target.value;

    setFormData((currentData) => ({
      ...currentData,
      name: nextName,

      slug: slugEdited ? currentData.slug : createCategorySlug(nextName),
    }));
  }

  function handleSlugChange(event) {
    const nextSlug = createCategorySlug(event.target.value);

    setSlugEdited(true);

    setFormData((currentData) => ({
      ...currentData,
      slug: nextSlug,
    }));
  }

  function handleFieldChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }
  function handleImageChange(event) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    try {
      validateCategoryImageFile(file);

      const previewUrl = URL.createObjectURL(file);

      setSelectedImage(file);
      setSelectedImagePreviewUrl(previewUrl);
      setValidationMessage("");
    } catch (error) {
      setSelectedImage(null);
      setSelectedImagePreviewUrl("");

      setValidationMessage(
        error?.message || "The selected category image is not valid.",
      );

      event.target.value = "";
    }
  }
  function removeSelectedImage() {
    setSelectedImage(null);
    setSelectedImagePreviewUrl("");
    setValidationMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateCategoryForm(formData);

    if (validationError) {
      setValidationMessage(validationError);

      return;
    }

    setValidationMessage("");

    await onSubmit({
      name: formData.name.trim(),
      slug: formData.slug.trim(),

      description: formData.description.trim() || null,

      isActive: formData.isActive,

      imageFile: selectedImage,
    });
  }
  useEffect(() => {
    return () => {
      if (selectedImagePreviewUrl) {
        URL.revokeObjectURL(selectedImagePreviewUrl);
      }
    };
  }, [selectedImagePreviewUrl]);

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="category-form-title"
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle
          id="category-form-title"
          className="flex items-center justify-between gap-4"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Category management
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-950">
              {isEditing ? "Edit category" : "Create category"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close category form"
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          >
            <CloseRoundedIcon />
          </button>
        </DialogTitle>

        <DialogContent dividers>
          <div className="space-y-5 py-2">
            {validationMessage && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {validationMessage}
              </div>
            )}

            <div>
              <label
                htmlFor="category-name"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Category name
              </label>

              <input
                id="category-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                disabled={isSubmitting}
                autoFocus
                placeholder="Example: Necklaces"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="category-slug"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                URL slug
              </label>

              <input
                id="category-slug"
                name="slug"
                type="text"
                value={formData.slug}
                onChange={handleSlugChange}
                disabled={isSubmitting}
                placeholder="necklaces"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10 disabled:bg-gray-100"
              />

              <p className="mt-2 text-xs text-gray-500">
                Public URL: /products?category=
                {formData.slug || "category-slug"}
              </p>
            </div>

            <div>
              <label
                htmlFor="category-description"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Description
              </label>

              <textarea
                id="category-description"
                name="description"
                value={formData.description}
                onChange={handleFieldChange}
                disabled={isSubmitting}
                rows={4}
                maxLength={1000}
                placeholder="Describe the products in this category."
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10 disabled:bg-gray-100"
              />

              <p className="mt-1 text-right text-xs text-gray-500">
                {formData.description.length}
                /1000
              </p>
            </div>
            <div>
              <p className="mb-2 block text-sm font-semibold text-gray-800">
                Category image
              </p>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <label
                  className={`
        flex min-h-32 cursor-pointer flex-col
        items-center justify-center
        rounded-xl border-2 border-dashed
        border-gray-300 bg-white
        px-5 py-6 text-center
        transition
        hover:border-gray-950
        ${
          isSubmitting
            ? "pointer-events-none cursor-not-allowed opacity-50"
            : ""
        }
      `}
                >
                  <AddPhotoAlternateRoundedIcon
                    className="text-gray-400"
                    sx={{ fontSize: 36 }}
                  />

                  <span className="mt-3 text-sm font-semibold text-gray-900">
                    {selectedImage
                      ? "Choose another photo"
                      : "Choose category photo"}
                  </span>

                  <span className="mt-1 text-xs text-gray-500">
                    JPG, PNG or WebP · Maximum 10 MB
                  </span>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                    className="sr-only"
                  />
                </label>

                {selectedImage && (
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {selectedImage.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {(selectedImage.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={removeSelectedImage}
                      disabled={isSubmitting}
                      className="
            shrink-0 rounded-full
            border border-gray-300
            px-4 py-2
            text-xs font-semibold
            text-gray-700
            transition
            hover:border-red-300
            hover:text-red-600
            disabled:opacity-50
          "
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <CategoryImagePreview
              key={selectedImagePreviewUrl || formData.imageUrl}
              imageUrl={selectedImagePreviewUrl || formData.imageUrl}
              categoryName={formData.name}
            />

            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <p className="font-semibold text-gray-900">Active category</p>

                <p className="mt-1 text-sm text-gray-500">
                  Active categories can appear in the public storefront.
                </p>
              </div>

              <Switch
                checked={formData.isActive}
                onChange={(event) =>
                  setFormData((currentData) => ({
                    ...currentData,

                    isActive: event.target.checked,
                  }))
                }
                disabled={isSubmitting}
                inputProps={{
                  "aria-label": "Active category",
                }}
              />
            </div>
          </div>
        </DialogContent>

        <DialogActions className="px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-gray-950 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Create category"}
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default CategoryFormDialog;
