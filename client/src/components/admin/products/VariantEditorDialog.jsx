import { useState } from "react";

import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import StraightenOutlinedIcon from "@mui/icons-material/StraightenOutlined";

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

/* =========================================================
   HELPERS
========================================================= */

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

/* =========================================================
   COLOR OPTION
========================================================= */

function ColorOption({ name, hex, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        `
          inline-flex
          min-h-10
          items-center
          gap-2

          rounded-full

          border

          px-3

          text-xs
          font-bold

          transition-all

          sm:min-h-11
          sm:px-4
          sm:text-sm
        `,
        selected
          ? `
            border-gray-950
            bg-gray-950
            text-white
          `
          : `
            border-gray-200
            bg-white
            text-gray-700

            hover:border-gray-400
            hover:bg-gray-50
          `,
      ].join(" ")}
    >
      <span
        className="
          h-4
          w-4
          shrink-0

          rounded-full

          border
          border-black/10

          sm:h-5
          sm:w-5
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

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
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
        <Icon sx={{ fontSize: 18 }} />
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
          {title}
        </h3>

        {description && (
          <p
            className="
              mt-1
              text-[0.68rem]
              leading-5
              text-gray-500

              sm:text-xs
            "
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   FORM
========================================================= */

function VariantEditorForm({ variant, isSubmitting, onClose, onSubmit }) {
  const [formData, setFormData] = useState(() => createFormState(variant));

  const [validationError, setValidationError] = useState("");

  const isEditing = variant !== null;

  const displayName = buildDisplayName(formData);

  function updateField(name, value) {
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    if (validationError) {
      setValidationError("");
    }
  }

  function selectMetalColor(color) {
    setFormData((currentData) => ({
      ...currentData,

      metalColor: color.name,
      metalColorHex: color.hex,
    }));

    if (validationError) {
      setValidationError("");
    }
  }

  function selectStoneColor(color) {
    setFormData((currentData) => ({
      ...currentData,

      stoneColor: color.name,
      stoneColorHex: color.hex,
    }));

    if (validationError) {
      setValidationError("");
    }
  }

  function clearStone() {
    setFormData((currentData) => ({
      ...currentData,
      stoneColor: "",
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const payload = buildPayload(formData);

      setValidationError("");

      await onSubmit(payload);
    } catch (error) {
      setValidationError(error?.message || "The variant could not be saved.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
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
              Product option
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
              {isEditing ? "Edit variant" : "Add variant"}
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
              Create one purchasable combination of color, stone, size, price
              and inventory.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close variant editor"
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
            space-y-7

            px-4
            py-5

            sm:space-y-8
            sm:px-6
            sm:py-6
          "
        >
          {/* VALIDATION */}
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
              PREVIEW
          ================================================= */}
          <section
            className="
              rounded-[1rem]

              border
              border-gray-200

              bg-gray-50/70

              p-4

              sm:p-5
            "
          >
            <p
              className="
                text-[0.6rem]
                font-bold
                uppercase
                tracking-[0.12em]
                text-gray-400
              "
            >
              Variant preview
            </p>

            <p
              className="
                mt-2

                text-base
                font-bold
                leading-6
                tracking-[-0.02em]
                text-gray-950

                sm:text-lg
              "
            >
              {displayName}
            </p>
          </section>

          {/* =================================================
              IDENTIFICATION
          ================================================= */}
          <section>
            <SectionHeading
              icon={SellOutlinedIcon}
              title="Identification"
              description="Use a unique SKU for this specific purchasable variant."
            />

            <label
              htmlFor="variant-sku"
              className="
                mt-4
                block

                text-xs
                font-bold
                text-gray-800

                sm:text-sm
              "
            >
              SKU
              <input
                id="variant-sku"
                value={formData.sku}
                onChange={(event) => updateField("sku", event.target.value)}
                disabled={isSubmitting}
                placeholder="RING-GOLD-EMERALD-8"
                className="
                  mt-2
                  min-h-12
                  w-full

                  rounded-[0.95rem]

                  border
                  border-gray-200

                  bg-white

                  px-4

                  font-normal
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
            </label>
          </section>

          {/* =================================================
              METAL
          ================================================= */}
          <section>
            <SectionHeading
              icon={PaletteOutlinedIcon}
              title="Metal / finish"
              description="Choose the finish customers will see for this variant."
            />

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
                grid
                gap-3

                sm:grid-cols-[minmax(0,1fr)_7rem]
                sm:gap-4
              "
            >
              <label
                className="
                  text-xs
                  font-bold
                  text-gray-800

                  sm:text-sm
                "
              >
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
                    min-h-12
                    w-full

                    rounded-[0.95rem]

                    border
                    border-gray-200

                    px-4

                    font-normal
                    text-gray-900

                    outline-none

                    focus:border-gray-400
                    focus:ring-4
                    focus:ring-gray-950/[0.035]
                  "
                />
              </label>

              <label
                className="
                  text-xs
                  font-bold
                  text-gray-800

                  sm:text-sm
                "
              >
                Swatch
                <input
                  type="color"
                  value={formData.metalColorHex}
                  onChange={(event) =>
                    updateField("metalColorHex", event.target.value)
                  }
                  disabled={isSubmitting}
                  className="
                    mt-2
                    h-12
                    w-full

                    cursor-pointer

                    rounded-[0.95rem]

                    border
                    border-gray-200

                    bg-white
                    p-1
                  "
                />
              </label>
            </div>
          </section>

          {/* =================================================
              STONE
          ================================================= */}
          <section>
            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >
              <SectionHeading
                icon={PaletteOutlinedIcon}
                title="Stone color"
                description="Optional for products that include a stone or crystal."
              />

              {formData.stoneColor && (
                <button
                  type="button"
                  onClick={clearStone}
                  disabled={isSubmitting}
                  className="
                    shrink-0

                    rounded-full

                    px-2.5
                    py-1.5

                    text-[0.65rem]
                    font-bold
                    text-red-600

                    transition

                    hover:bg-red-50

                    sm:px-3
                    sm:text-xs
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
                grid
                gap-3

                sm:grid-cols-[minmax(0,1fr)_7rem]
                sm:gap-4
              "
            >
              <label
                className="
                  text-xs
                  font-bold
                  text-gray-800

                  sm:text-sm
                "
              >
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
                    min-h-12
                    w-full

                    rounded-[0.95rem]

                    border
                    border-gray-200

                    px-4

                    font-normal
                    text-gray-900

                    outline-none

                    focus:border-gray-400
                    focus:ring-4
                    focus:ring-gray-950/[0.035]
                  "
                />
              </label>

              <label
                className="
                  text-xs
                  font-bold
                  text-gray-800

                  sm:text-sm
                "
              >
                Swatch
                <input
                  type="color"
                  value={formData.stoneColorHex}
                  onChange={(event) =>
                    updateField("stoneColorHex", event.target.value)
                  }
                  disabled={isSubmitting}
                  className="
                    mt-2
                    h-12
                    w-full

                    cursor-pointer

                    rounded-[0.95rem]

                    border
                    border-gray-200

                    bg-white
                    p-1
                  "
                />
              </label>
            </div>
          </section>

          {/* =================================================
              SIZE
          ================================================= */}
          <section>
            <SectionHeading
              icon={StraightenOutlinedIcon}
              title="Size"
              description="Choose the sizing system appropriate for this product."
            />

            <label
              htmlFor="variant-size-type"
              className="
                mt-4
                block

                text-xs
                font-bold
                text-gray-800

                sm:text-sm
              "
            >
              Size format
            </label>

            <div className="relative mt-2">
              <select
                id="variant-size-type"
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

                  focus:border-gray-400
                  focus:ring-4
                  focus:ring-gray-950/[0.035]

                  disabled:bg-gray-100
                "
              >
                {SIZE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
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

            {formData.sizeType === "LETTER" && (
              <div
                className="
                  mt-4
                  grid
                  grid-cols-5
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
                        min-h-11
                        items-center
                        justify-center

                        rounded-full

                        border

                        text-xs
                        font-bold

                        transition

                        sm:text-sm
                      `,
                      formData.size === size
                        ? `
                          border-gray-950
                          bg-gray-950
                          text-white
                        `
                        : `
                          border-gray-200
                          bg-white
                          text-gray-700

                          hover:border-gray-400
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
                  grid
                  grid-cols-5
                  gap-2

                  sm:grid-cols-10
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
                        min-h-11
                        items-center
                        justify-center

                        rounded-full

                        border

                        px-2

                        text-xs
                        font-bold

                        transition

                        sm:text-sm
                      `,
                      String(formData.size) === size
                        ? `
                          border-gray-950
                          bg-gray-950
                          text-white
                        `
                        : `
                          border-gray-200
                          bg-white
                          text-gray-700

                          hover:border-gray-400
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
              <label
                className="
                  mt-4
                  block

                  text-xs
                  font-bold
                  text-gray-800

                  sm:text-sm
                "
              >
                {formData.sizeType === "LENGTH" ? "Length" : "Custom size"}

                <input
                  value={formData.size}
                  onChange={(event) => updateField("size", event.target.value)}
                  disabled={isSubmitting}
                  placeholder={
                    formData.sizeType === "LENGTH" ? "45 cm" : "One Size"
                  }
                  className="
                    mt-2
                    min-h-12
                    w-full

                    rounded-[0.95rem]

                    border
                    border-gray-200

                    px-4

                    font-normal
                    text-gray-900

                    outline-none

                    focus:border-gray-400
                    focus:ring-4
                    focus:ring-gray-950/[0.035]
                  "
                />
              </label>
            )}
          </section>

          {/* =================================================
              PRICE & INVENTORY
          ================================================= */}
          <section>
            <SectionHeading
              icon={Inventory2OutlinedIcon}
              title="Price & inventory"
              description="Set the selling price and stock controls for this variant."
            />

            <div
              className="
                mt-4
                grid
                gap-3

                sm:grid-cols-3
                sm:gap-4
              "
            >
              <label
                className="
                  text-xs
                  font-bold
                  text-gray-800

                  sm:text-sm
                "
              >
                Price
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(event) => updateField("price", event.target.value)}
                  disabled={isSubmitting}
                  className="
                    mt-2
                    min-h-12
                    w-full

                    rounded-[0.95rem]

                    border
                    border-gray-200

                    px-4

                    font-normal

                    outline-none

                    focus:border-gray-400
                    focus:ring-4
                    focus:ring-gray-950/[0.035]

                    disabled:bg-gray-100
                  "
                />
              </label>

              <label
                className="
                  text-xs
                  font-bold
                  text-gray-800

                  sm:text-sm
                "
              >
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
                    min-h-12
                    w-full

                    rounded-[0.95rem]

                    border
                    border-gray-200

                    px-4

                    font-normal

                    outline-none

                    focus:border-gray-400
                    focus:ring-4
                    focus:ring-gray-950/[0.035]

                    disabled:bg-gray-100
                  "
                />
              </label>

              <label
                className="
                  text-xs
                  font-bold
                  text-gray-800

                  sm:text-sm
                "
              >
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
                    min-h-12
                    w-full

                    rounded-[0.95rem]

                    border
                    border-gray-200

                    px-4

                    font-normal

                    outline-none

                    focus:border-gray-400
                    focus:ring-4
                    focus:ring-gray-950/[0.035]

                    disabled:bg-gray-100
                  "
                />
              </label>
            </div>
          </section>

          {/* =================================================
              FLAGS
          ================================================= */}
          <section
            className="
              grid
              gap-3

              rounded-[1rem]

              border
              border-gray-200

              bg-gray-50/70

              p-3.5

              sm:grid-cols-2
              sm:p-4
            "
          >
            <label
              className="
                flex
                cursor-pointer
                items-start
                gap-3
              "
            >
              <Checkbox
                checked={formData.isDefault}
                onChange={(event) =>
                  updateField("isDefault", event.target.checked)
                }
                disabled={isSubmitting}
                sx={{
                  padding: 0,
                  marginTop: "2px",
                }}
              />

              <div>
                <p
                  className="
                    text-sm
                    font-bold
                    text-gray-900
                  "
                >
                  Default variant
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-gray-500
                  "
                >
                  Selected first when customers open the product.
                </p>
              </div>
            </label>

            {!isEditing && (
              <label
                className="
                  flex
                  cursor-pointer
                  items-start
                  gap-3
                "
              >
                <Checkbox
                  checked={formData.isActive}
                  onChange={(event) =>
                    updateField("isActive", event.target.checked)
                  }
                  disabled={isSubmitting}
                  sx={{
                    padding: 0,
                    marginTop: "2px",
                  }}
                />

                <div>
                  <p
                    className="
                      text-sm
                      font-bold
                      text-gray-900
                    "
                  >
                    Active variant
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-gray-500
                    "
                  >
                    Allow customers to purchase this option.
                  </p>
                </div>
              </label>
            )}
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
            <SaveOutlinedIcon sx={{ fontSize: 17 }} />

            {isSubmitting
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Add variant"}
          </button>
        </div>
      </DialogActions>
    </form>
  );
}

/* =========================================================
   DIALOG
========================================================= */

function VariantEditorDialog({
  open,
  variant = null,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="md"
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
        <VariantEditorForm
          key={variant?.id ?? "new-variant"}
          variant={variant}
          isSubmitting={isSubmitting}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </Dialog>
  );
}

export default VariantEditorDialog;
