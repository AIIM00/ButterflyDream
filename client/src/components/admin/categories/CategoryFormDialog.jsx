import { useEffect, useState } from "react";

// MUI Materials
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Switch,
} from "@mui/material";

// MUI Icons
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

// Components
import CategoryImagePreview from "./CategoryImagePreview.jsx";

// Services
import { validateCategoryImageFile } from "../../../services/adminCategoryImageUploadApi.js";

// Utils
import validateCategoryForm, {
  createCategorySlug,
} from "../../../utils/validateCategoryForm.js";

/* =========================================================
   INITIAL STATE
========================================================= */

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

/* =========================================================
   FORM
========================================================= */

function CategoryForm({ category, isSubmitting, onClose, onSubmit }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const [selectedImagePreviewUrl, setSelectedImagePreviewUrl] = useState("");

  const [formData, setFormData] = useState(() => createInitialState(category));

  const [slugEdited, setSlugEdited] = useState(() => Boolean(category));

  const [validationMessage, setValidationMessage] = useState("");

  const isEditing = category !== null;

  /* =======================================================
     IMAGE PREVIEW CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      if (selectedImagePreviewUrl) {
        URL.revokeObjectURL(selectedImagePreviewUrl);
      }
    };
  }, [selectedImagePreviewUrl]);

  /* =======================================================
     FIELD UPDATES
  ======================================================= */

  function clearValidationMessage() {
    if (validationMessage) {
      setValidationMessage("");
    }
  }

  function handleNameChange(event) {
    const nextName = event.target.value;

    setFormData((currentData) => ({
      ...currentData,

      name: nextName,

      slug: slugEdited ? currentData.slug : createCategorySlug(nextName),
    }));

    clearValidationMessage();
  }

  function handleSlugChange(event) {
    const nextSlug = createCategorySlug(event.target.value);

    setSlugEdited(true);

    setFormData((currentData) => ({
      ...currentData,
      slug: nextSlug,
    }));

    clearValidationMessage();
  }

  function handleFieldChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    clearValidationMessage();
  }

  /* =======================================================
     IMAGE
  ======================================================= */

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

  /* =======================================================
     SUBMIT
  ======================================================= */

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

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* =====================================================
          HEADER
      ===================================================== */}
      <DialogTitle
        id="category-form-title"
        sx={{
          padding: 0,
        }}
      >
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
            border-b
            border-gray-100
            px-4
            py-4

            sm:px-6
            sm:py-5
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
              Category management
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
              {isEditing ? "Edit category" : "Create category"}
            </h2>

            <p
              className="
                mt-1.5
                max-w-lg
                text-xs
                leading-5
                text-gray-500

                sm:text-sm
              "
            >
              Control how this category appears and behaves across the
              storefront.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close category form"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              text-gray-400
              transition-colors

              hover:bg-gray-100
              hover:text-gray-950

              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <CloseRoundedIcon
              sx={{
                fontSize: 20,
              }}
            />
          </button>
        </div>
      </DialogTitle>

      {/* =====================================================
          CONTENT
      ===================================================== */}
      <DialogContent sx={{ padding: 0 }}>
        <div
          className="
            space-y-6
            px-4
            py-5

            sm:px-6
            sm:py-6
          "
        >
          {/* VALIDATION */}
          {validationMessage && (
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
              {validationMessage}
            </div>
          )}

          {/* =================================================
              CATEGORY INFORMATION
          ================================================= */}
          <section>
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
                  mt-1
                  text-sm
                  font-bold
                  text-gray-950

                  sm:text-base
                "
              >
                Category information
              </h3>
            </div>

            <div className="mt-4 space-y-4">
              {/* NAME */}
              <div>
                <label
                  htmlFor="category-name"
                  className="
                    text-xs
                    font-bold
                    text-gray-800

                    sm:text-sm
                  "
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

              {/* SLUG */}
              <div>
                <label
                  htmlFor="category-slug"
                  className="
                    text-xs
                    font-bold
                    text-gray-800

                    sm:text-sm
                  "
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

                <div
                  className="
                    mt-2
                    overflow-hidden
                    rounded-lg
                    bg-gray-50
                    px-3
                    py-2
                  "
                >
                  <p
                    className="
                      truncate
                      text-[0.65rem]
                      text-gray-500

                      sm:text-xs
                    "
                  >
                    /products?category=
                    <span className="font-semibold text-gray-700">
                      {formData.slug || "category-slug"}
                    </span>
                  </p>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label
                  htmlFor="category-description"
                  className="
                    text-xs
                    font-bold
                    text-gray-800

                    sm:text-sm
                  "
                >
                  Description
                </label>

                <div
                  className="
                    mt-2
                    overflow-hidden
                    rounded-[0.95rem]
                    border
                    border-gray-200
                    bg-white
                    transition

                    focus-within:border-gray-400
                    focus-within:ring-4
                    focus-within:ring-gray-950/[0.035]
                  "
                >
                  <textarea
                    id="category-description"
                    name="description"
                    value={formData.description}
                    onChange={handleFieldChange}
                    disabled={isSubmitting}
                    rows={4}
                    maxLength={1000}
                    placeholder="Describe the products in this category."
                    className="
                      min-h-[7rem]
                      w-full
                      resize-y
                      border-0
                      bg-transparent
                      px-4
                      py-3
                      text-sm
                      leading-6
                      text-gray-900
                      outline-none

                      placeholder:text-gray-400

                      disabled:cursor-not-allowed
                      disabled:bg-gray-100
                    "
                  />

                  <div
                    className="
                      flex
                      justify-end
                      border-t
                      border-gray-100
                      px-3
                      py-2
                    "
                  >
                    <span
                      className={[
                        `
                          text-[0.65rem]
                          font-medium

                          sm:text-xs
                        `,
                        formData.description.length >= 900
                          ? "text-red-600"
                          : "text-gray-400",
                      ].join(" ")}
                    >
                      {formData.description.length.toLocaleString()} / 1,000
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              CATEGORY IMAGE
          ================================================= */}
          <section>
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
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-gray-100
                  text-gray-600
                "
              >
                <ImageOutlinedIcon
                  sx={{
                    fontSize: 18,
                  }}
                />
              </span>

              <div>
                <h3
                  className="
                    text-sm
                    font-bold
                    text-gray-950

                    sm:text-base
                  "
                >
                  Category image
                </h3>

                <p
                  className="
                    mt-1
                    text-[0.68rem]
                    leading-5
                    text-gray-500

                    sm:text-xs
                  "
                >
                  Used when visually presenting this category across the
                  storefront.
                </p>
              </div>
            </div>

            <div
              className="
                mt-4
                rounded-[1rem]
                border
                border-gray-200
                bg-gray-50/60
                p-3

                sm:p-4
              "
            >
              <label
                className={[
                  `
                    flex
                    min-h-[9rem]
                    cursor-pointer
                    flex-col
                    items-center
                    justify-center

                    rounded-[0.9rem]

                    border-2
                    border-dashed
                    border-gray-200

                    bg-white

                    px-4
                    py-6

                    text-center

                    transition-all

                    hover:border-gray-400
                    hover:bg-gray-50
                  `,
                  isSubmitting
                    ? `
                      pointer-events-none
                      cursor-not-allowed
                      opacity-50
                    `
                    : "",
                ].join(" ")}
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
                    text-gray-600

                    sm:h-12
                    sm:w-12
                  "
                >
                  <AddPhotoAlternateRoundedIcon
                    sx={{
                      fontSize: 22,
                    }}
                  />
                </span>

                <span
                  className="
                    mt-3
                    text-sm
                    font-bold
                    text-gray-900
                  "
                >
                  {selectedImage
                    ? "Choose another photo"
                    : "Choose category photo"}
                </span>

                <span
                  className="
                    mt-1
                    text-[0.65rem]
                    text-gray-400

                    sm:text-xs
                  "
                >
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

              {/* SELECTED FILE */}
              {selectedImage && (
                <div
                  className="
                    mt-3
                    flex
                    items-center
                    justify-between
                    gap-3
                    rounded-xl
                    bg-white
                    px-3
                    py-3
                    ring-1
                    ring-gray-200
                  "
                >
                  <div className="min-w-0">
                    <p
                      className="
                        truncate
                        text-xs
                        font-bold
                        text-gray-900

                        sm:text-sm
                      "
                    >
                      {selectedImage.name}
                    </p>

                    <p
                      className="
                        mt-1
                        text-[0.65rem]
                        text-gray-400

                        sm:text-xs
                      "
                    >
                      {(selectedImage.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={removeSelectedImage}
                    disabled={isSubmitting}
                    className="
                      shrink-0
                      rounded-full
                      border
                      border-gray-200
                      bg-white
                      px-3
                      py-2
                      text-[0.68rem]
                      font-bold
                      text-red-600
                      transition-colors

                      hover:border-red-200
                      hover:bg-red-50

                      disabled:opacity-50

                      sm:px-4
                      sm:text-xs
                    "
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* PREVIEW */}
            {(selectedImagePreviewUrl || formData.imageUrl) && (
              <div className="mt-4">
                <p
                  className="
                    mb-2
                    text-[0.62rem]
                    font-bold
                    uppercase
                    tracking-[0.1em]
                    text-gray-400
                  "
                >
                  Preview
                </p>

                <CategoryImagePreview
                  key={selectedImagePreviewUrl || formData.imageUrl}
                  imageUrl={selectedImagePreviewUrl || formData.imageUrl}
                  categoryName={formData.name}
                />
              </div>
            )}
          </section>

          {/* =================================================
              ACTIVE STATUS
          ================================================= */}
          <section
            className={[
              `
                flex
                items-center
                justify-between
                gap-4
                rounded-[1rem]
                border
                p-3.5

                transition-colors

                sm:p-4
              `,
              formData.isActive
                ? "border-emerald-200 bg-emerald-50/60"
                : "border-gray-200 bg-gray-50/70",
            ].join(" ")}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={[
                    `
                      h-2
                      w-2
                      shrink-0
                      rounded-full
                    `,
                    formData.isActive ? "bg-emerald-500" : "bg-gray-300",
                  ].join(" ")}
                />

                <p
                  className="
                    text-sm
                    font-bold
                    text-gray-900
                  "
                >
                  Active category
                </p>
              </div>

              <p
                className="
                  mt-1
                  max-w-md
                  text-xs
                  leading-5
                  text-gray-500
                "
              >
                Active categories can appear in customer-facing storefront
                navigation and filtering.
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
          </section>
        </div>
      </DialogContent>

      {/* =====================================================
          ACTIONS
      ===================================================== */}
      <DialogActions sx={{ padding: 0 }}>
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
            sm:items-center
            sm:justify-end
            sm:px-6
          "
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
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
              transition-all

              hover:border-gray-300
              hover:bg-gray-100
              hover:text-gray-950

              disabled:cursor-not-allowed
              disabled:opacity-50

              sm:w-auto
            "
          >
            Cancel
          </button>

          <button
            type="submit"
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

              sm:min-w-[10rem]
              sm:w-auto
            "
          >
            <SaveOutlinedIcon
              sx={{
                fontSize: 17,
              }}
            />

            {isSubmitting
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Create category"}
          </button>
        </div>
      </DialogActions>
    </form>
  );
}

/* =========================================================
   DIALOG
========================================================= */

function CategoryFormDialog({
  open,
  category = null,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="category-form-title"
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
            maxHeight: "calc(100% - 64px)",
            margin: "32px",
            borderRadius: "24px",
          },
        },
      }}
    >
      {open && (
        <CategoryForm
          key={category?.id ?? "new-category"}
          category={category}
          isSubmitting={isSubmitting}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </Dialog>
  );
}

export default CategoryFormDialog;
