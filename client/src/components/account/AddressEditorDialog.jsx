import { useEffect, useState } from "react";

import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
} from "@mui/material";

// MUI Icons
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";

// Services
import { fetchCustomerDeliveryGovernorates } from "../../services/customerApi.js";

// Utils
import {
  buildAddressPayload,
  createAddressFormState,
  validateAddressForm,
} from "../../utils/customerAddressForm.js";

/* =========================================================
   INPUT STYLES
========================================================= */

const inputClassName = `
  mt-2
  min-h-12
  w-full

  rounded-[1rem]

  border
  border-brand-border

  bg-brand-surface-soft

  px-4
  py-3

  text-sm

  text-brand-text

  outline-none

  transition-all
  duration-200

  placeholder:text-brand-text-muted/55

  hover:border-brand-text/20

  focus:border-brand-accent-fill
  focus:bg-brand-surface
  focus:ring-2
  focus:ring-brand-accent-fill/10

  disabled:cursor-not-allowed
  disabled:opacity-60
`;

/* =========================================================
   HELPERS
========================================================= */

function isCancelledRequest(error, signal) {
  return signal?.aborted || error?.code === "ERR_CANCELED";
}

function getGovernorateLoadError(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Unable to load available delivery governorates."
  );
}

/* =========================================================
   ADDRESS EDITOR DIALOG
========================================================= */

function AddressEditorDialog({
  open,
  address,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(() => createAddressFormState(address));

  const [validationError, setValidationError] = useState("");

  const [deliveryGovernorates, setDeliveryGovernorates] = useState([]);

  const [governoratesLoading, setGovernoratesLoading] = useState(false);

  const [governoratesError, setGovernoratesError] = useState("");

  const [deliveryCurrency, setDeliveryCurrency] = useState("USD");

  const isEditing = Boolean(address);

  /* =======================================================
     LOAD ACTIVE DELIVERY GOVERNORATES
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const controller = new AbortController();

    async function loadGovernorates() {
      setGovernoratesLoading(true);

      setGovernoratesError("");

      try {
        const response = await fetchCustomerDeliveryGovernorates({
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        const governorates = Array.isArray(response.governorates)
          ? response.governorates
          : [];

        setDeliveryGovernorates(governorates);

        setDeliveryCurrency(response.currency ?? "USD");
      } catch (error) {
        if (isCancelledRequest(error, controller.signal)) {
          return;
        }

        setDeliveryGovernorates([]);

        setGovernoratesError(getGovernorateLoadError(error));
      } finally {
        if (!controller.signal.aborted) {
          setGovernoratesLoading(false);
        }
      }
    }

    void loadGovernorates();

    return () => {
      controller.abort();
    };
  }, [open]);

  /* =======================================================
     UPDATE FIELD
  ======================================================= */

  function updateField(field, value) {
    setForm((currentForm) => ({
      ...currentForm,

      [field]: value,
    }));

    setValidationError("");
  }

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting || governoratesLoading) {
      return;
    }

    if (governoratesError) {
      setValidationError(
        "Delivery options could not be loaded. Please try again before saving this address.",
      );

      return;
    }

    const errorMessage = validateAddressForm(form);

    if (errorMessage) {
      setValidationError(errorMessage);

      return;
    }

    /*
     * Governorate must be one of the active
     * admin-configured delivery governorates.
     */
    const selectedGovernorate = deliveryGovernorates.find(
      (governorate) => governorate.name === form.governorate,
    );

    if (!selectedGovernorate) {
      setValidationError("Please choose an available delivery governorate.");

      return;
    }

    await onSubmit(
      buildAddressPayload(
        {
          ...form,

          /*
           * Always send the canonical name
           * returned by the backend.
           */
          governorate: selectedGovernorate.name,
        },

        !isEditing,
      ),
    );
  }

  /* =======================================================
     CURRENT GOVERNORATE AVAILABILITY

     Important for old saved addresses.
  ======================================================= */

  const currentGovernorateIsAvailable = deliveryGovernorates.some(
    (governorate) => governorate.name === form.governorate,
  );

  const hasUnavailableExistingGovernorate =
    Boolean(form.governorate) &&
    !governoratesLoading &&
    !currentGovernorateIsAvailable;

  const submitDisabled =
    isSubmitting ||
    governoratesLoading ||
    Boolean(governoratesError) ||
    deliveryGovernorates.length === 0;

  /* =========================================================
     DIALOG
  ========================================================= */

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="md"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "1.75rem",
          overflow: "hidden",
          border: "1px solid rgb(var(--theme-border))",
          backgroundColor: "rgb(var(--theme-surface))",
          color: "rgb(var(--theme-text))",
          boxShadow: "0 24px 70px rgba(0, 0, 0, 0.16)",
        },
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <DialogTitle
          className="
            border-b
            border-brand-border

            px-5
            py-5

            sm:px-6
          "
        >
          <div
            className="
              flex
              items-start

              gap-3
            "
          >
            <span
              className="
                inline-flex
                h-11
                w-11
                shrink-0

                items-center
                justify-center

                rounded-full

                bg-brand-accent-soft

                text-brand-accent-text
              "
            >
              <LocalShippingOutlinedIcon
                sx={{
                  fontSize: 20,
                }}
              />
            </span>

            <div>
              <p
                className="
                  text-[0.56rem]
                  font-bold
                  uppercase

                  tracking-[0.17em]

                  text-brand-accent-text
                "
              >
                Delivery address
              </p>

              <h2
                className="
                  mt-1

                  font-display

                  text-2xl
                  font-medium

                  tracking-[-0.03em]

                  text-brand-text
                "
              >
                {isEditing ? "Edit your address" : "Add a new address"}
              </h2>
            </div>
          </div>
        </DialogTitle>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <DialogContent
          dividers
          sx={{
            borderColor: "rgb(var(--theme-border))",
            padding: 0,
          }}
        >
          <div
            className="
              px-5
              py-6

              sm:px-6
            "
          >
            <div
              className="
                grid

                gap-5

                sm:grid-cols-2
              "
            >
              {/* ============================================
                  ADDRESS LABEL
              ============================================ */}

              <label className="block">
                <span
                  className="
                    text-xs
                    font-semibold

                    text-brand-text
                  "
                >
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

              {/* ============================================
                  RECIPIENT
              ============================================ */}

              <label className="block">
                <span
                  className="
                    text-xs
                    font-semibold

                    text-brand-text
                  "
                >
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
                  placeholder="Full name"
                  className={inputClassName}
                />
              </label>

              {/* ============================================
                  PHONE
              ============================================ */}

              <label className="block">
                <span
                  className="
                    text-xs
                    font-semibold

                    text-brand-text
                  "
                >
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

              {/* ============================================
                  GOVERNORATE
              ============================================ */}

              <label className="block">
                <span
                  className="
                    text-xs
                    font-semibold

                    text-brand-text
                  "
                >
                  Governorate
                </span>

                <select
                  value={form.governorate}
                  onChange={(event) =>
                    updateField("governorate", event.target.value)
                  }
                  disabled={
                    isSubmitting ||
                    governoratesLoading ||
                    Boolean(governoratesError)
                  }
                  className={inputClassName}
                >
                  <option value="">
                    {governoratesLoading
                      ? "Loading governorates..."
                      : "Select governorate"}
                  </option>

                  {/*
                   * An old address may contain
                   * a governorate that is no longer
                   * active or uses an old spelling.
                   */}
                  {hasUnavailableExistingGovernorate && (
                    <option value={form.governorate} disabled>
                      {form.governorate} — unavailable
                    </option>
                  )}

                  {deliveryGovernorates.map((governorate) => (
                    <option key={governorate.id} value={governorate.name}>
                      {governorate.name} — {deliveryCurrency}{" "}
                      {governorate.deliveryFee}
                    </option>
                  ))}
                </select>

                {!governoratesLoading &&
                  !governoratesError &&
                  deliveryGovernorates.length > 0 && (
                    <p
                      className="
                        mt-2

                        text-[0.68rem]
                        leading-5

                        text-brand-text-muted
                      "
                    >
                      Delivery price is based on governorate and confirmed again
                      during checkout.
                    </p>
                  )}
              </label>

              {/* ============================================
                  CITY
              ============================================ */}

              <label className="block">
                <span
                  className="
                    text-xs
                    font-semibold

                    text-brand-text
                  "
                >
                  City
                </span>

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

              {/* ============================================
                  STREET
              ============================================ */}

              <label className="block">
                <span
                  className="
                    text-xs
                    font-semibold

                    text-brand-text
                  "
                >
                  Street
                </span>

                <input
                  type="text"
                  value={form.street}
                  onChange={(event) =>
                    updateField("street", event.target.value)
                  }
                  maxLength={255}
                  disabled={isSubmitting}
                  placeholder="Street name"
                  className={inputClassName}
                />
              </label>

              {/* ============================================
                  BUILDING
              ============================================ */}

              <label className="block">
                <span
                  className="
                    text-xs
                    font-semibold

                    text-brand-text
                  "
                >
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
                  placeholder="Building name or number"
                  className={inputClassName}
                />
              </label>

              {/* ============================================
                  FLOOR
              ============================================ */}

              <label className="block">
                <span
                  className="
                    text-xs
                    font-semibold

                    text-brand-text
                  "
                >
                  Floor
                </span>

                <input
                  type="text"
                  value={form.floor}
                  onChange={(event) => updateField("floor", event.target.value)}
                  maxLength={50}
                  disabled={isSubmitting}
                  placeholder="3rd floor"
                  className={inputClassName}
                />
              </label>

              {/* ============================================
                  LANDMARK
              ============================================ */}

              <label
                className="
                  block

                  sm:col-span-2
                "
              >
                <span
                  className="
                    text-xs
                    font-semibold

                    text-brand-text
                  "
                >
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

              {/* ============================================
                  DELIVERY NOTES
              ============================================ */}

              <label
                className="
                  block

                  sm:col-span-2
                "
              >
                <span
                  className="
                    text-xs
                    font-semibold

                    text-brand-text
                  "
                >
                  Delivery notes
                </span>

                <textarea
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  maxLength={1000}
                  rows={4}
                  disabled={isSubmitting}
                  placeholder="Call before arriving..."
                  className={`
                    ${inputClassName}

                    resize-none
                  `}
                />

                <p
                  className="
                    mt-2
                    text-right

                    text-[0.65rem]

                    text-brand-text-muted
                  "
                >
                  {form.notes.length}/1000
                </p>
              </label>
            </div>

            {/* ==============================================
                DEFAULT ADDRESS
            ============================================== */}

            {!isEditing && (
              <div
                className="
                  mt-5

                  rounded-[1rem]

                  border
                  border-brand-border

                  bg-brand-surface-soft

                  px-3
                  py-1
                "
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.isDefault}
                      onChange={(event) =>
                        updateField("isDefault", event.target.checked)
                      }
                      disabled={isSubmitting}
                      sx={{
                        color: "rgb(var(--theme-text-muted))",

                        "&.Mui-checked": {
                          color: "rgb(var(--theme-primary))",
                        },
                      }}
                    />
                  }
                  label={
                    <span
                      className="
                        text-sm
                        font-medium

                        text-brand-text
                      "
                    >
                      Use as my default address
                    </span>
                  }
                />
              </div>
            )}

            {/* ==============================================
                GOVERNORATE API ERROR
            ============================================== */}

            {governoratesError && (
              <div
                className="
                  mt-5

                  flex
                  items-start

                  gap-3

                  rounded-[1rem]

                  border
                  border-brand-error/20

                  bg-brand-error/5

                  px-4
                  py-3

                  text-sm
                  leading-6

                  text-brand-error
                "
              >
                <ErrorOutlineRoundedIcon
                  sx={{
                    fontSize: 19,
                    marginTop: "2px",
                  }}
                  className="shrink-0"
                />

                <div>
                  <p className="font-semibold">
                    Delivery options could not be loaded.
                  </p>

                  <p className="mt-0.5 text-xs leading-5">
                    {governoratesError}
                  </p>
                </div>
              </div>
            )}

            {/* ==============================================
                NO ACTIVE GOVERNORATES
            ============================================== */}

            {!governoratesLoading &&
              !governoratesError &&
              deliveryGovernorates.length === 0 && (
                <div
                  className="
                    mt-5

                    flex
                    items-start

                    gap-3

                    rounded-[1rem]

                    border
                    border-brand-error/20

                    bg-brand-error/5

                    px-4
                    py-3

                    text-sm
                    leading-6

                    text-brand-error
                  "
                >
                  <ErrorOutlineRoundedIcon
                    sx={{
                      fontSize: 19,
                      marginTop: "2px",
                    }}
                    className="shrink-0"
                  />

                  <span>
                    Delivery is currently unavailable. No delivery governorates
                    have been enabled yet.
                  </span>
                </div>
              )}

            {/* ==============================================
                OLD / UNAVAILABLE GOVERNORATE
            ============================================== */}

            {hasUnavailableExistingGovernorate && !governoratesError && (
              <div
                className="
                    mt-5

                    rounded-[1rem]

                    border
                    border-brand-accent-fill/30

                    bg-brand-accent-soft

                    px-4
                    py-3

                    text-sm
                    leading-6

                    text-brand-accent-text
                  "
              >
                <p className="font-semibold">Please update the governorate.</p>

                <p className="mt-1 text-xs leading-5">
                  “{form.governorate}” is not currently available for delivery.
                  Choose one of the available governorates above before saving.
                </p>
              </div>
            )}

            {/* ==============================================
                FORM VALIDATION ERROR
            ============================================== */}

            {validationError && (
              <div
                className="
                  mt-5

                  flex
                  items-start

                  gap-3

                  rounded-[1rem]

                  border
                  border-brand-error/20

                  bg-brand-error/5

                  px-4
                  py-3

                  text-sm
                  font-medium
                  leading-6

                  text-brand-error
                "
              >
                <ErrorOutlineRoundedIcon
                  sx={{
                    fontSize: 19,
                    marginTop: "2px",
                  }}
                  className="shrink-0"
                />

                <span>{validationError}</span>
              </div>
            )}
          </div>
        </DialogContent>

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <DialogActions
          sx={{
            padding: 0,
          }}
        >
          <div
            className="
              flex
              w-full
              flex-col-reverse

              gap-3

              border-t
              border-brand-border

              bg-brand-surface

              px-5
              py-4

              sm:flex-row
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
                min-h-12

                items-center
                justify-center

                rounded-full

                border
                border-brand-border

                bg-brand-surface

                px-6

                text-sm
                font-semibold

                text-brand-text

                transition-all

                hover:border-brand-accent-fill/50
                hover:bg-brand-surface-soft

                active:scale-[0.98]

                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitDisabled}
              className="
                inline-flex
                min-h-12

                items-center
                justify-center

                rounded-full

                bg-brand-primary

                px-6

                text-sm
                font-semibold

                text-brand-surface

                transition-all

                hover:bg-brand-primary-hover

                active:scale-[0.98]

                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {isSubmitting
                ? "Saving..."
                : governoratesLoading
                  ? "Loading delivery options..."
                  : isEditing
                    ? "Save changes"
                    : "Add address"}
            </button>
          </div>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default AddressEditorDialog;
