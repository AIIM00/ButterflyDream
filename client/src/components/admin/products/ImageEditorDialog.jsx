import { useState } from "react";

// MUI
import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

// MUI Icons
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CloudDoneOutlinedIcon from "@mui/icons-material/CloudDoneOutlined";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import PhotoOutlinedIcon from "@mui/icons-material/PhotoOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

// Utils
import {
  buildImagePayload,
  createImageFormState,
} from "../../../utils/adminProductForm.js";

/* =========================================================
   FORM
========================================================= */

function ImageEditorForm({ image, variants, isSubmitting, onClose, onSubmit }) {
  const [formData, setFormData] = useState(() => createImageFormState(image));

  const [validationError, setValidationError] = useState("");

  function updateField(name, value) {
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    if (validationError) {
      setValidationError("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const payload = buildImagePayload(formData, true);

      setValidationError("");

      await onSubmit(payload);
    } catch (error) {
      setValidationError(
        error?.message || "The image details could not be saved.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* =====================================================
          HEADER
      ===================================================== */}
      <DialogTitle sx={{ padding: 0 }}>
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
              Product media
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
              Image details
            </h2>

            <p
              className="
                mt-1.5
                text-xs
                leading-5
                text-gray-500

                sm:text-sm
              "
            >
              Control how this photo appears across the product.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close image editor"
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
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </button>
        </div>
      </DialogTitle>

      {/* =====================================================
          CONTENT
      ===================================================== */}
      <DialogContent sx={{ padding: 0 }}>
        <div
          className="
            space-y-5
            px-4
            py-5

            sm:space-y-6
            sm:px-6
            sm:py-6
          "
        >
          {/* VALIDATION ERROR */}
          {validationError && (
            <div
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

          {/* =================================================
              IMAGE PREVIEW
          ================================================= */}
          <section>
            <div
              className="
                relative
                overflow-hidden
                rounded-[1.15rem]
                border
                border-gray-200
                bg-gray-100
                shadow-sm
              "
            >
              <div
                className="
                  aspect-[4/3]
                  w-full

                  sm:aspect-[16/10]
                "
              >
                {image?.imageUrl ? (
                  <img
                    src={image.imageUrl}
                    alt={image.altText || "Product image"}
                    className="
                      h-full
                      w-full
                      object-cover
                    "
                  />
                ) : (
                  <div
                    className="
                      flex
                      h-full
                      w-full
                      flex-col
                      items-center
                      justify-center
                      gap-3
                      text-gray-400
                    "
                  >
                    <span
                      className="
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-full
                        bg-white
                        shadow-sm
                        ring-1
                        ring-gray-200
                      "
                    >
                      <ImageNotSupportedOutlinedIcon sx={{ fontSize: 26 }} />
                    </span>

                    <span className="text-xs font-medium">
                      Image unavailable
                    </span>
                  </div>
                )}
              </div>

              {/* CLOUD STATUS */}
              {image?.imageUrl && (
                <span
                  className="
                    absolute
                    bottom-3
                    left-3
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    bg-gray-950/90
                    px-2.5
                    py-1.5
                    text-[0.62rem]
                    font-bold
                    text-white
                    shadow-sm
                    backdrop-blur-sm

                    sm:px-3
                    sm:text-xs
                  "
                >
                  <CloudDoneOutlinedIcon sx={{ fontSize: 14 }} />
                  Stored securely
                </span>
              )}
            </div>

            <p
              className="
                mt-2
                text-[0.68rem]
                leading-5
                text-gray-400

                sm:text-xs
              "
            >
              The image file is stored securely in cloud storage. Only its
              product settings can be changed here.
            </p>
          </section>

          {/* =================================================
              ALT TEXT
          ================================================= */}
          <div>
            <label
              htmlFor="image-alt-text"
              className="
                text-xs
                font-bold
                text-gray-800

                sm:text-sm
              "
            >
              Alternative text
            </label>

            <p
              className="
                mt-1
                text-[0.68rem]
                leading-5
                text-gray-400

                sm:text-xs
              "
            >
              Describe the image for accessibility and screen readers.
            </p>

            <input
              id="image-alt-text"
              type="text"
              maxLength={200}
              value={formData.altText}
              onChange={(event) => updateField("altText", event.target.value)}
              disabled={isSubmitting}
              placeholder="Gold necklace with green gemstone"
              className="
                mt-3
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

          {/* =================================================
              VARIANT ASSOCIATION
          ================================================= */}
          <div>
            <label
              htmlFor="image-variant"
              className="
                text-xs
                font-bold
                text-gray-800

                sm:text-sm
              "
            >
              Associated variant
            </label>

            <p
              className="
                mt-1
                text-[0.68rem]
                leading-5
                text-gray-400

                sm:text-xs
              "
            >
              Link this image to a specific product option when needed.
            </p>

            <div className="relative mt-3">
              <select
                id="image-variant"
                value={formData.variantId}
                onChange={(event) =>
                  updateField("variantId", event.target.value)
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
                  font-medium
                  text-gray-900
                  outline-none
                  transition

                  focus:border-gray-400
                  focus:ring-4
                  focus:ring-gray-950/[0.035]

                  disabled:cursor-not-allowed
                  disabled:bg-gray-100
                "
              >
                <option value="">General product image</option>

                {variants
                  .filter((variant) => !variant.archivedAt)
                  .map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.displayName}
                    </option>
                  ))}
              </select>

              <KeyboardArrowDownRoundedIcon
                sx={{ fontSize: 20 }}
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

            <p
              className="
                mt-2
                text-[0.68rem]
                leading-5
                text-gray-400

                sm:text-xs
              "
            >
              Variant images can be shown automatically when a customer selects
              that option.
            </p>
          </div>

          {/* =================================================
              POSITION
          ================================================= */}
          <div>
            <label
              htmlFor="image-position"
              className="
                text-xs
                font-bold
                text-gray-800

                sm:text-sm
              "
            >
              Gallery position
            </label>

            <p
              className="
                mt-1
                text-[0.68rem]
                leading-5
                text-gray-400

                sm:text-xs
              "
            >
              Lower numbers appear earlier in the product gallery.
            </p>

            <input
              id="image-position"
              type="number"
              min="0"
              step="1"
              value={formData.position}
              onChange={(event) => updateField("position", event.target.value)}
              disabled={isSubmitting}
              className="
                mt-3
                min-h-12
                w-full
                rounded-[0.95rem]
                border
                border-gray-200
                bg-white
                px-4
                text-sm
                font-medium
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
          </div>

          {/* =================================================
              PRIMARY IMAGE
          ================================================= */}
          <label
            className={[
              `
                flex
                items-start
                gap-3
                rounded-[1rem]
                border
                p-3.5

                sm:p-4
              `,
              image?.isPrimary
                ? "border-emerald-200 bg-emerald-50/60"
                : "cursor-pointer border-gray-200 bg-gray-50/70",
            ].join(" ")}
          >
            <Checkbox
              checked={formData.isPrimary}
              onChange={(event) =>
                updateField("isPrimary", event.target.checked)
              }
              disabled={isSubmitting || image?.isPrimary}
              sx={{
                padding: 0,
                marginTop: "2px",
              }}
            />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <PhotoOutlinedIcon
                  sx={{
                    fontSize: 17,
                  }}
                  className={
                    image?.isPrimary ? "text-emerald-600" : "text-gray-500"
                  }
                />

                <p
                  className="
                    text-sm
                    font-bold
                    text-gray-900
                  "
                >
                  {image?.isPrimary
                    ? "Current primary image"
                    : "Set as primary image"}
                </p>
              </div>

              <p
                className="
                  mt-1.5
                  text-xs
                  leading-5
                  text-gray-500
                "
              >
                The primary image is displayed first on product cards and
                product detail pages.
              </p>
            </div>
          </label>
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
            <SaveOutlinedIcon sx={{ fontSize: 17 }} />

            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
        </div>
      </DialogActions>
    </form>
  );
}

/* =========================================================
   DIALOG
========================================================= */

function ImageEditorDialog({
  open,
  image,
  variants = [],
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
        <ImageEditorForm
          key={image?.id ?? image?.imageUrl ?? "image-editor"}
          image={image}
          variants={variants}
          isSubmitting={isSubmitting}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </Dialog>
  );
}

export default ImageEditorDialog;
