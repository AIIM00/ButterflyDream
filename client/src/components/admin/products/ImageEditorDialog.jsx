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

// Utils
import {
  buildImagePayload,
  createImageFormState,
} from "../../../utils/adminProductForm.js";

function ImageEditorDialog({
  open,
  image,
  variants = [],
  isSubmitting,
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState(() => createImageFormState(image));

  const [validationError, setValidationError] = useState("");

  function updateField(name, value) {
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      /*
       * Keep using the existing builder
       * so the payload remains compatible
       * with the current backend.
       */
      const payload = buildImagePayload(formData, true);

      setValidationError("");

      await onSubmit(payload);
    } catch (error) {
      setValidationError(error.message);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <div
            className="
              flex items-start
              justify-between
              gap-4
            "
          >
            <div>
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-brand-bronze
                "
              >
                Product media
              </p>

              <h2
                className="
                  mt-1
                  font-display
                  text-3xl
                  font-medium
                  text-brand-espresso
                "
              >
                Image details
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  text-brand-muted
                "
              >
                Edit how this photo is used across the product.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close image editor"
              className="
                flex h-11 w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                text-brand-muted
                transition-colors
                hover:bg-brand-ivory
                hover:text-brand-espresso
                disabled:opacity-50
              "
            >
              <CloseRoundedIcon />
            </button>
          </div>
        </DialogTitle>

        <DialogContent dividers>
          <div className="space-y-6 py-2">
            {validationError && (
              <div
                className="
                  border
                  border-brand-error/25
                  bg-brand-error/5
                  px-4 py-3
                  text-sm
                  text-brand-error
                "
              >
                {validationError}
              </div>
            )}

            {/* IMAGE PREVIEW */}

            <section>
              <div
                className="
                  relative
                  aspect-[4/3]
                  overflow-hidden
                  bg-brand-ivory
                "
              >
                {image?.imageUrl ? (
                  <img
                    src={image.imageUrl}
                    alt={image.altText || "Product image"}
                    className="
                      h-full w-full
                      object-cover
                    "
                  />
                ) : (
                  <div
                    className="
                      flex h-full
                      flex-col
                      items-center
                      justify-center
                      gap-3
                      text-brand-muted
                    "
                  >
                    <ImageNotSupportedOutlinedIcon
                      sx={{
                        fontSize: 48,
                      }}
                    />

                    <span className="text-sm">Image unavailable</span>
                  </div>
                )}

                <span
                  className="
                    absolute
                    bottom-3 left-3
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    bg-brand-emerald
                    px-3 py-1.5
                    text-xs
                    font-semibold
                    text-white
                  "
                >
                  <CloudDoneOutlinedIcon
                    sx={{
                      fontSize: 16,
                    }}
                  />
                  Stored securely
                </span>
              </div>

              <p
                className="
                  mt-2
                  text-xs
                  leading-5
                  text-brand-muted
                "
              >
                The image file is managed through secure cloud storage. Its
                storage URL cannot be changed here.
              </p>
            </section>

            {/* ALT TEXT */}

            <label
              className="
                block
                text-sm
                font-semibold
                text-brand-espresso
              "
            >
              Alternative text
              <span
                className="
                  ml-2
                  font-normal
                  text-brand-muted
                "
              >
                for accessibility
              </span>
              <input
                type="text"
                maxLength={200}
                value={formData.altText}
                onChange={(event) => updateField("altText", event.target.value)}
                disabled={isSubmitting}
                placeholder="Gold necklace with green gemstone"
                className="
                  mt-2
                  min-h-12
                  w-full
                  rounded-xl
                  border
                  border-brand-border
                  bg-brand-surface
                  px-4
                  font-normal
                  text-brand-espresso
                  outline-none
                  transition-colors
                  focus:border-brand-champagne
                  disabled:bg-brand-ivory
                "
              />
            </label>

            {/* VARIANT ASSOCIATION */}

            <label
              className="
                block
                text-sm
                font-semibold
                text-brand-espresso
              "
            >
              Associated variant
              <select
                value={formData.variantId}
                onChange={(event) =>
                  updateField("variantId", event.target.value)
                }
                disabled={isSubmitting}
                className="
                  mt-2
                  min-h-12
                  w-full
                  rounded-xl
                  border
                  border-brand-border
                  bg-brand-surface
                  px-4
                  font-normal
                  text-brand-espresso
                  outline-none
                  transition-colors
                  focus:border-brand-champagne
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
              <span
                className="
                  mt-2 block
                  text-xs
                  font-normal
                  leading-5
                  text-brand-muted
                "
              >
                Associating a photo with a variant lets the gallery switch
                automatically when a customer selects that option.
              </span>
            </label>

            {/* POSITION */}

            <label
              className="
                block
                text-sm
                font-semibold
                text-brand-espresso
              "
            >
              Position
              <input
                type="number"
                min="0"
                step="1"
                value={formData.position}
                onChange={(event) =>
                  updateField("position", event.target.value)
                }
                disabled={isSubmitting}
                className="
                  mt-2
                  min-h-12
                  w-full
                  rounded-xl
                  border
                  border-brand-border
                  bg-brand-surface
                  px-4
                  font-normal
                  text-brand-espresso
                  outline-none
                  transition-colors
                  focus:border-brand-champagne
                "
              />
            </label>

            {/* PRIMARY */}

            <label
              className="
                flex
                cursor-pointer
                items-center
                gap-3
                bg-brand-ivory
                p-4
                text-sm
                font-semibold
                text-brand-espresso
              "
            >
              <Checkbox
                checked={formData.isPrimary}
                onChange={(event) =>
                  updateField("isPrimary", event.target.checked)
                }
                disabled={isSubmitting || image?.isPrimary}
              />

              <div>
                <p>
                  {image?.isPrimary
                    ? "Current primary image"
                    : "Set as primary image"}
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    font-normal
                    text-brand-muted
                  "
                >
                  The primary image is used first on product cards and product
                  pages.
                </p>
              </div>
            </label>
          </div>
        </DialogContent>

        <DialogActions
          className="
            gap-2
            px-6 py-4
          "
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="
              min-h-11
              rounded-full
              border
              border-brand-border
              px-5
              font-semibold
              text-brand-espresso
              transition-colors
              hover:border-brand-champagne
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="
              min-h-11
              rounded-full
              bg-brand-espresso
              px-6
              font-semibold
              text-white
              transition-colors
              hover:bg-brand-bronze
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default ImageEditorDialog;
