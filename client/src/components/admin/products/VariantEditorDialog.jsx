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
  buildVariantPayload,
  createVariantFormState,
} from "../../../utils/adminProductForm.js";

function VariantEditorDialog({
  open,
  variant = null,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState(() =>
    createVariantFormState(variant),
  );

  const [validationError, setValidationError] = useState("");

  const isEditing = variant !== null;

  function updateField(name, value) {
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const payload = buildVariantPayload(formData);

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
              Product variant
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-950">
              {isEditing ? "Edit variant" : "Add variant"}
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

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-gray-800">
                SKU
                <input
                  value={formData.sku}
                  onChange={(event) => updateField("sku", event.target.value)}
                  disabled={isSubmitting}
                  placeholder="RING-GOLD-S"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 font-normal outline-none focus:border-gray-950"
                />
              </label>

              <label className="text-sm font-semibold text-gray-800">
                Display name
                <input
                  value={formData.displayName}
                  onChange={(event) =>
                    updateField("displayName", event.target.value)
                  }
                  disabled={isSubmitting}
                  placeholder="Gold / Small"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 font-normal outline-none focus:border-gray-950"
                />
              </label>
            </div>

            <label className="block text-sm font-semibold text-gray-800">
              Options JSON
              <textarea
                value={formData.optionsText}
                onChange={(event) =>
                  updateField("optionsText", event.target.value)
                }
                disabled={isSubmitting}
                rows={4}
                placeholder={'{\n  "color": "Gold",\n  "size": "Small"\n}'}
                className="mt-2 w-full resize-y rounded-xl border border-gray-300 px-4 py-3 font-mono text-sm font-normal outline-none focus:border-gray-950"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-sm font-semibold text-gray-800">
                Price
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(event) => updateField("price", event.target.value)}
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 font-normal outline-none focus:border-gray-950"
                />
              </label>

              <label className="text-sm font-semibold text-gray-800">
                Stock
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.stockQuantity}
                  onChange={(event) =>
                    updateField("stockQuantity", event.target.value)
                  }
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 font-normal outline-none focus:border-gray-950"
                />
              </label>

              <label className="text-sm font-semibold text-gray-800">
                Low-stock level
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.lowStockThreshold}
                  onChange={(event) =>
                    updateField("lowStockThreshold", event.target.value)
                  }
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 font-normal outline-none focus:border-gray-950"
                />
              </label>
            </div>

            <div className="grid gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
              <label className="flex items-center gap-2 font-semibold text-gray-800">
                <Checkbox
                  checked={formData.isDefault}
                  onChange={(event) =>
                    updateField("isDefault", event.target.checked)
                  }
                  disabled={isSubmitting}
                />
                Default variant
              </label>

              {!isEditing && (
                <label className="flex items-center gap-2 font-semibold text-gray-800">
                  <Checkbox
                    checked={formData.isActive}
                    onChange={(event) =>
                      updateField("isActive", event.target.checked)
                    }
                    disabled={isSubmitting}
                  />
                  Active variant
                </label>
              )}
            </div>
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
            {isSubmitting ? "Saving..." : "Save variant"}
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default VariantEditorDialog;
