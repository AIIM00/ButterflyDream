import { useState } from "react";

import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const METAL_COLORS = [
  {
    name: "Gold",
    hex: "#D4AF37",
  },
  {
    name: "Silver",
    hex: "#C0C0C0",
  },
  {
    name: "Rose Gold",
    hex: "#B76E79",
  },
  {
    name: "Black",
    hex: "#242424",
  },
];

const STONE_COLORS = [
  {
    name: "Clear",
    hex: "#F3F3F1",
  },
  {
    name: "White",
    hex: "#FFFFFF",
  },
  {
    name: "Black",
    hex: "#202020",
  },
  {
    name: "Red",
    hex: "#B64242",
  },
  {
    name: "Pink",
    hex: "#E7A8B6",
  },
  {
    name: "Blue",
    hex: "#4A78A8",
  },
  {
    name: "Green",
    hex: "#4C705E",
  },
  {
    name: "Purple",
    hex: "#75598F",
  },
  {
    name: "Amber",
    hex: "#C88A33",
  },
];

const LETTER_SIZES = ["XS", "S", "M", "L", "XL"];

const RING_SIZES = ["4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];

const SIZE_TYPES = [
  {
    value: "NONE",
    label: "No size",
  },
  {
    value: "LETTER",
    label: "XS / S / M / L / XL",
  },
  {
    value: "RING",
    label: "Ring size",
  },
  {
    value: "LENGTH",
    label: "Length",
  },
  {
    value: "CUSTOM",
    label: "Custom",
  },
];

function getVariantOptions(variant) {
  if (!variant?.options || typeof variant.options !== "object") {
    return {};
  }

  return variant.options;
}

function inferSizeType(options) {
  if (options.sizeType) {
    return options.sizeType;
  }

  if (!options.size) {
    return "NONE";
  }

  const normalizedSize = String(options.size).trim().toUpperCase();

  if (LETTER_SIZES.includes(normalizedSize)) {
    return "LETTER";
  }

  if (RING_SIZES.includes(normalizedSize)) {
    return "RING";
  }

  return "CUSTOM";
}

function createFormState(variant) {
  const options = getVariantOptions(variant);

  return {
    sku: variant?.sku ?? "",

    metalColor: options.metalColor ?? options.color ?? "",

    metalColorHex: options.metalColorHex ?? options.colorHex ?? "#D4AF37",

    stoneColor: options.stoneColor ?? "",

    stoneColorHex: options.stoneColorHex ?? "#F3F3F1",

    sizeType: inferSizeType(options),

    size: options.size ?? "",

    price: variant?.price ?? "",

    stockQuantity:
      variant?.inventory?.stockQuantity ?? variant?.stockQuantity ?? 0,

    lowStockThreshold:
      variant?.inventory?.lowStockThreshold ?? variant?.lowStockThreshold ?? 5,

    isDefault: Boolean(variant?.isDefault),

    isActive: variant ? Boolean(variant.isActive) : true,
  };
}

function buildDisplayName(formData) {
  const parts = [];

  if (formData.metalColor.trim()) {
    parts.push(formData.metalColor.trim());
  }

  if (formData.stoneColor.trim()) {
    parts.push(`${formData.stoneColor.trim()} Stone`);
  }

  if (formData.sizeType !== "NONE" && String(formData.size).trim()) {
    if (formData.sizeType === "RING") {
      parts.push(`Ring ${String(formData.size).trim()}`);
    } else {
      parts.push(`Size ${String(formData.size).trim()}`);
    }
  }

  if (parts.length === 0) {
    return "Default";
  }

  return parts.join(" / ");
}

function buildOptions(formData) {
  const options = {};

  const metalColor = formData.metalColor.trim();

  const stoneColor = formData.stoneColor.trim();

  const size = String(formData.size).trim();

  if (metalColor) {
    options.metalColor = metalColor;

    options.metalColorHex = formData.metalColorHex;
  }

  if (stoneColor) {
    options.stoneColor = stoneColor;

    options.stoneColorHex = formData.stoneColorHex;
  }

  if (formData.sizeType !== "NONE") {
    options.sizeType = formData.sizeType;

    options.size = size;
  }

  return options;
}

function buildPayload(formData) {
  const sku = formData.sku.trim();

  if (!sku) {
    throw new Error("SKU is required.");
  }

  const price = Number(formData.price);

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Enter a valid price.");
  }

  const stockQuantity = Number(formData.stockQuantity);

  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    throw new Error("Stock must be a whole number of 0 or more.");
  }

  const lowStockThreshold = Number(formData.lowStockThreshold);

  if (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0) {
    throw new Error("Low-stock level must be a whole number of 0 or more.");
  }

  if (formData.sizeType !== "NONE" && !String(formData.size).trim()) {
    throw new Error("Select or enter a size.");
  }

  return {
    sku,

    displayName: buildDisplayName(formData),

    options: buildOptions(formData),

    price,

    stockQuantity,

    lowStockThreshold,

    isDefault: formData.isDefault,

    isActive: formData.isActive,
  };
}

function ColorOption({ name, hex, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        `
          inline-flex
          min-h-11
          items-center
          gap-2.5
          rounded-full
          border
          px-4
          text-sm
          font-semibold
          transition-colors
        `,
        selected
          ? `
            border-[var(--color-deep-espresso)]
            bg-[var(--color-soft-ivory)]
            text-[var(--color-deep-espresso)]
          `
          : `
            border-[var(--color-warm-light-gray)]
            bg-white
            text-[var(--color-warm-gray)]
            hover:border-[var(--color-antique-champagne)]
          `,
      ].join(" ")}
    >
      <span
        className="
          h-5 w-5
          shrink-0
          rounded-full
          border border-black/10
        "
        style={{
          backgroundColor: hex,
        }}
        aria-hidden="true"
      />

      {name}
    </button>
  );
}

function VariantEditorDialog({
  open,
  variant = null,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState(() => createFormState(variant));

  const [validationError, setValidationError] = useState("");

  const isEditing = variant !== null;

  const displayName = buildDisplayName(formData);

  function updateField(name, value) {
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function selectMetalColor(color) {
    setFormData((currentData) => ({
      ...currentData,

      metalColor: color.name,

      metalColorHex: color.hex,
    }));
  }

  function selectStoneColor(color) {
    setFormData((currentData) => ({
      ...currentData,

      stoneColor: color.name,

      stoneColorHex: color.hex,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const payload = buildPayload(formData);

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
      maxWidth="md"
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
                  tracking-[0.18em]
                  text-[var(--color-warm-gray)]
                "
              >
                Product option
              </p>

              <h2
                className="
                  mt-1
                  font-display
                  text-3xl
                  font-medium
                  text-[var(--color-deep-espresso)]
                "
              >
                {isEditing ? "Edit variant" : "Add variant"}
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  text-[var(--color-warm-gray)]
                "
              >
                One variant is one purchasable combination of color, stone and
                size.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close"
              className="
                flex h-11 w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                transition-colors
                hover:bg-[var(--color-soft-ivory)]
              "
            >
              <CloseRoundedIcon />
            </button>
          </div>
        </DialogTitle>

        <DialogContent dividers>
          <div className="space-y-8 py-2">
            {validationError && (
              <div
                className="
                  border
                  border-[var(--color-error)]/25
                  bg-[var(--color-error)]/5
                  px-4 py-3
                  text-sm
                  text-[var(--color-error)]
                "
              >
                {validationError}
              </div>
            )}

            {/* VARIANT PREVIEW */}

            <section
              className="
                border
                border-[var(--color-warm-light-gray)]
                bg-[var(--color-soft-ivory)]
                p-5
              "
            >
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-[var(--color-warm-gray)]
                "
              >
                Variant preview
              </p>

              <p
                className="
                  mt-2
                  text-lg
                  font-bold
                  text-[var(--color-deep-espresso)]
                "
              >
                {displayName}
              </p>
            </section>

            {/* SKU */}

            <section>
              <h3 className="font-bold">Identification</h3>

              <label className="mt-4 block text-sm font-semibold">
                SKU
                <input
                  value={formData.sku}
                  onChange={(event) => updateField("sku", event.target.value)}
                  disabled={isSubmitting}
                  placeholder="RING-GOLD-EMERALD-8"
                  className="
                    mt-2
                    w-full
                    rounded-xl
                    border
                    border-[var(--color-warm-light-gray)]
                    px-4 py-3
                    font-normal
                    outline-none
                    focus:border-[var(--color-antique-champagne)]
                  "
                />
              </label>
            </section>

            {/* METAL COLOR */}

            <section>
              <div>
                <h3 className="font-bold">Metal / finish color</h3>

                <p
                  className="
                    mt-1
                    text-sm
                    text-[var(--color-warm-gray)]
                  "
                >
                  Used for gold, silver, rose gold and other finishes.
                </p>
              </div>

              <div
                className="
                  mt-4
                  flex
                  flex-wrap
                  gap-2
                "
              >
                {METAL_COLORS.map((color) => (
                  <ColorOption
                    key={color.name}
                    {...color}
                    selected={formData.metalColor === color.name}
                    onClick={() => selectMetalColor(color)}
                  />
                ))}
              </div>

              <div
                className="
                  mt-4
                  grid gap-4
                  sm:grid-cols-[minmax(0,1fr)_8rem]
                "
              >
                <label className="text-sm font-semibold">
                  Custom color name
                  <input
                    value={formData.metalColor}
                    onChange={(event) =>
                      updateField("metalColor", event.target.value)
                    }
                    disabled={isSubmitting}
                    placeholder="Champagne Gold"
                    className="
                      mt-2
                      w-full
                      rounded-xl
                      border
                      border-[var(--color-warm-light-gray)]
                      px-4 py-3
                      font-normal
                    "
                  />
                </label>

                <label className="text-sm font-semibold">
                  Swatch
                  <input
                    type="color"
                    value={formData.metalColorHex}
                    onChange={(event) =>
                      updateField("metalColorHex", event.target.value)
                    }
                    className="
                      mt-2
                      h-12
                      w-full
                      cursor-pointer
                      rounded-xl
                      border
                      border-[var(--color-warm-light-gray)]
                      bg-white
                      p-1
                    "
                  />
                </label>
              </div>
            </section>

            {/* STONE COLOR */}

            <section>
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >
                <div>
                  <h3 className="font-bold">Stone color</h3>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-[var(--color-warm-gray)]
                    "
                  >
                    Optional. Leave empty for products without stones.
                  </p>
                </div>

                {formData.stoneColor && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((currentData) => ({
                        ...currentData,
                        stoneColor: "",
                      }))
                    }
                    className="
                      min-h-10
                      rounded-full
                      px-4
                      text-sm
                      font-semibold
                      text-[var(--color-error)]
                    "
                  >
                    No stone
                  </button>
                )}
              </div>

              <div
                className="
                  mt-4
                  flex
                  flex-wrap
                  gap-2
                "
              >
                {STONE_COLORS.map((color) => (
                  <ColorOption
                    key={color.name}
                    {...color}
                    selected={formData.stoneColor === color.name}
                    onClick={() => selectStoneColor(color)}
                  />
                ))}
              </div>

              <div
                className="
                  mt-4
                  grid gap-4
                  sm:grid-cols-[minmax(0,1fr)_8rem]
                "
              >
                <label className="text-sm font-semibold">
                  Custom stone color
                  <input
                    value={formData.stoneColor}
                    onChange={(event) =>
                      updateField("stoneColor", event.target.value)
                    }
                    disabled={isSubmitting}
                    placeholder="Emerald"
                    className="
                      mt-2
                      w-full
                      rounded-xl
                      border
                      border-[var(--color-warm-light-gray)]
                      px-4 py-3
                      font-normal
                    "
                  />
                </label>

                <label className="text-sm font-semibold">
                  Swatch
                  <input
                    type="color"
                    value={formData.stoneColorHex}
                    onChange={(event) =>
                      updateField("stoneColorHex", event.target.value)
                    }
                    className="
                      mt-2
                      h-12
                      w-full
                      cursor-pointer
                      rounded-xl
                      border
                      border-[var(--color-warm-light-gray)]
                      bg-white
                      p-1
                    "
                  />
                </label>
              </div>
            </section>

            {/* SIZE */}

            <section>
              <h3 className="font-bold">Size</h3>

              <p
                className="
                  mt-1
                  text-sm
                  text-[var(--color-warm-gray)]
                "
              >
                Select the sizing system appropriate for this accessory.
              </p>

              <label className="mt-4 block text-sm font-semibold">
                Size format
                <select
                  value={formData.sizeType}
                  onChange={(event) => {
                    const nextType = event.target.value;

                    setFormData((currentData) => ({
                      ...currentData,
                      sizeType: nextType,

                      size: nextType === "NONE" ? "" : currentData.size,
                    }));
                  }}
                  disabled={isSubmitting}
                  className="
                    mt-2
                    w-full
                    rounded-xl
                    border
                    border-[var(--color-warm-light-gray)]
                    bg-white
                    px-4 py-3
                    font-normal
                  "
                >
                  {SIZE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>

              {formData.sizeType === "LETTER" && (
                <div
                  className="
                    mt-4
                    flex flex-wrap
                    gap-2
                  "
                >
                  {LETTER_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updateField("size", size)}
                      className={[
                        `
                            flex
                            h-11
                            min-w-12
                            items-center
                            justify-center
                            rounded-full
                            border
                            px-4
                            text-sm
                            font-bold
                          `,
                        formData.size === size
                          ? `
                              border-[var(--color-deep-espresso)]
                              bg-[var(--color-deep-espresso)]
                              text-white
                            `
                          : `
                              border-[var(--color-warm-light-gray)]
                              bg-white
                              text-[var(--color-deep-espresso)]
                            `,
                      ].join(" ")}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}

              {formData.sizeType === "RING" && (
                <div
                  className="
                    mt-4
                    flex flex-wrap
                    gap-2
                  "
                >
                  {RING_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updateField("size", size)}
                      className={[
                        `
                            flex
                            h-11
                            min-w-11
                            items-center
                            justify-center
                            rounded-full
                            border
                            px-3
                            text-sm
                            font-bold
                          `,
                        String(formData.size) === size
                          ? `
                              border-[var(--color-deep-espresso)]
                              bg-[var(--color-deep-espresso)]
                              text-white
                            `
                          : `
                              border-[var(--color-warm-light-gray)]
                              bg-white
                              text-[var(--color-deep-espresso)]
                            `,
                      ].join(" ")}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}

              {(formData.sizeType === "LENGTH" ||
                formData.sizeType === "CUSTOM") && (
                <label className="mt-4 block text-sm font-semibold">
                  {formData.sizeType === "LENGTH" ? "Length" : "Custom size"}

                  <input
                    value={formData.size}
                    onChange={(event) =>
                      updateField("size", event.target.value)
                    }
                    placeholder={
                      formData.sizeType === "LENGTH" ? "45 cm" : "One Size"
                    }
                    className="
                      mt-2
                      w-full
                      rounded-xl
                      border
                      border-[var(--color-warm-light-gray)]
                      px-4 py-3
                      font-normal
                    "
                  />
                </label>
              )}
            </section>

            {/* PRICE & STOCK */}

            <section>
              <h3 className="font-bold">Price & inventory</h3>

              <div
                className="
                  mt-4
                  grid gap-4
                  sm:grid-cols-3
                "
              >
                <label className="text-sm font-semibold">
                  Price
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(event) =>
                      updateField("price", event.target.value)
                    }
                    disabled={isSubmitting}
                    className="
                      mt-2
                      w-full
                      rounded-xl
                      border
                      border-[var(--color-warm-light-gray)]
                      px-4 py-3
                      font-normal
                    "
                  />
                </label>

                <label className="text-sm font-semibold">
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
                    className="
                      mt-2
                      w-full
                      rounded-xl
                      border
                      border-[var(--color-warm-light-gray)]
                      px-4 py-3
                      font-normal
                    "
                  />
                </label>

                <label className="text-sm font-semibold">
                  Low stock at
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.lowStockThreshold}
                    onChange={(event) =>
                      updateField("lowStockThreshold", event.target.value)
                    }
                    disabled={isSubmitting}
                    className="
                      mt-2
                      w-full
                      rounded-xl
                      border
                      border-[var(--color-warm-light-gray)]
                      px-4 py-3
                      font-normal
                    "
                  />
                </label>
              </div>
            </section>

            <section
              className="
                grid gap-3
                bg-[var(--color-soft-ivory)]
                p-4
                sm:grid-cols-2
              "
            >
              <label
                className="
                  flex
                  items-center
                  gap-2
                  font-semibold
                "
              >
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
                <label
                  className="
                    flex
                    items-center
                    gap-2
                    font-semibold
                  "
                >
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
            </section>
          </div>
        </DialogContent>

        <DialogActions className="px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="
              min-h-11
              rounded-full
              border
              border-[var(--color-warm-light-gray)]
              px-5
              font-semibold
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
              bg-[var(--color-deep-espresso)]
              px-6
              font-semibold
              text-white
              disabled:opacity-50
            "
          >
            {isSubmitting ? "Saving..." : "Save variant"}
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default VariantEditorDialog;
