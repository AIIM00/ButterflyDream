import { useState } from "react";
import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
} from "@mui/material";
import {
  buildAddressPayload,
  createAddressFormState,
  validateAddressForm,
} from "../../utils/customerAddressForm.js";

const inputClassName =
  "mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10 disabled:bg-gray-100";

function AddressEditorDialog({
  open,
  address,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(() => createAddressFormState(address));

  const [validationError, setValidationError] = useState("");

  const isEditing = Boolean(address);

  function updateField(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    setValidationError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const errorMessage = validateAddressForm(form);

    if (errorMessage) {
      setValidationError(errorMessage);
      return;
    }

    await onSubmit(buildAddressPayload(form, !isEditing));
  }

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {isEditing ? "Edit delivery address" : "Add delivery address"}
        </DialogTitle>

        <DialogContent dividers>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">
                Address label
              </span>

              <input
                type="text"
                value={form.label}
                onChange={(event) => updateField("label", event.target.value)}
                maxLength={50}
                disabled={isSubmitting}
                placeholder="Home, Work..."
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-700">
                Recipient name
              </span>

              <input
                type="text"
                value={form.recipientName}
                onChange={(event) =>
                  updateField("recipientName", event.target.value)
                }
                maxLength={120}
                disabled={isSubmitting}
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-700">
                Phone number
              </span>

              <input
                type="tel"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                maxLength={30}
                disabled={isSubmitting}
                placeholder="+961..."
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-700">
                Governorate
              </span>

              <input
                type="text"
                value={form.governorate}
                onChange={(event) =>
                  updateField("governorate", event.target.value)
                }
                maxLength={100}
                disabled={isSubmitting}
                placeholder="North Lebanon"
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-700">City</span>

              <input
                type="text"
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
                maxLength={120}
                disabled={isSubmitting}
                placeholder="Tripoli"
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-700">
                Street
              </span>

              <input
                type="text"
                value={form.street}
                onChange={(event) => updateField("street", event.target.value)}
                maxLength={255}
                disabled={isSubmitting}
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-700">
                Building
              </span>

              <input
                type="text"
                value={form.building}
                onChange={(event) =>
                  updateField("building", event.target.value)
                }
                maxLength={120}
                disabled={isSubmitting}
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Floor</span>

              <input
                type="text"
                value={form.floor}
                onChange={(event) => updateField("floor", event.target.value)}
                maxLength={50}
                disabled={isSubmitting}
                className={inputClassName}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-gray-700">
                Landmark
              </span>

              <input
                type="text"
                value={form.landmark}
                onChange={(event) =>
                  updateField("landmark", event.target.value)
                }
                maxLength={255}
                disabled={isSubmitting}
                placeholder="Near the university"
                className={inputClassName}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-gray-700">
                Delivery notes
              </span>

              <textarea
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                maxLength={1000}
                rows={4}
                disabled={isSubmitting}
                placeholder="Call before arriving..."
                className={inputClassName}
              />
            </label>
          </div>

          {!isEditing && (
            <FormControlLabel
              className="mt-4"
              control={
                <Checkbox
                  checked={form.isDefault}
                  onChange={(event) =>
                    updateField("isDefault", event.target.checked)
                  }
                  disabled={isSubmitting}
                />
              }
              label="Use as my default address"
            />
          )}

          {validationError && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {validationError}
            </p>
          )}
        </DialogContent>

        <DialogActions className="px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-gray-950 px-5 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Add address"}
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default AddressEditorDialog;
