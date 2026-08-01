import { useState } from "react";

//MUI Materials
import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

//MUI Icons
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

//Utils
import {
  buildImagePayload,
  createImageFormState,
} from "../../../utils/adminProductForm.js";

function ImageEditorDialog({
  open,
  image = null,
  variants = [],
  allowVariantAssociation = true,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState(() => createImageFormState(image));

  const [validationError, setValidationError] = useState("");
  const isEditing = image !== null;

  function updateField(name, value) {
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const payload = buildImagePayload(formData, allowVariantAssociation);

      setValidationError("");

      await onSubmit(payload);
    } catch (error) {
      setValidationError(error.message);
    }
  }

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Product image
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-950">
              {isEditing ? "Edit image" : "Add image"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <CloseRoundedIcon />
          </button>
        </DialogTitle>

        <DialogContent dividers>
          <div className="space-y-5 py-2">
            {validationError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {validationError}
              </div>
            )}

            <label className="block text-sm font-semibold text-gray-800">
              Image URL
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(event) =>
                  updateField("imageUrl", event.target.value)
                }
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 font-normal outline-none focus:border-gray-950"
              />
            </label>

            {formData.imageUrl && (
              <img
                src={formData.imageUrl}
                alt="Product preview"
                className="aspect-video w-full rounded-2xl border border-gray-200 object-cover"
              />
            )}

            <label className="block text-sm font-semibold text-gray-800">
              Alternative text
              <input
                value={formData.altText}
                onChange={(event) => updateField("altText", event.target.value)}
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 font-normal outline-none focus:border-gray-950"
              />
            </label>

            {allowVariantAssociation && (
              <label className="block text-sm font-semibold text-gray-800">
                Associated variant
                <select
                  value={formData.variantId}
                  onChange={(event) =>
                    updateField("variantId", event.target.value)
                  }
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-normal outline-none focus:border-gray-950"
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
              </label>
            )}

            <label className="block text-sm font-semibold text-gray-800">
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
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 font-normal outline-none focus:border-gray-950"
              />
            </label>

            <label className="flex items-center gap-2 rounded-xl bg-gray-50 p-4 font-semibold text-gray-800">
              <Checkbox
                checked={formData.isPrimary}
                onChange={(event) =>
                  updateField("isPrimary", event.target.checked)
                }
                disabled={isSubmitting || image?.isPrimary}
              />
              {image?.isPrimary
                ? "Current primary image"
                : "Set as primary image"}
            </label>
          </div>
        </DialogContent>

        <DialogActions className="px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-gray-300 px-5 py-2.5 font-semibold"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-gray-950 px-5 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save image"}
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default ImageEditorDialog;
