import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

import StockBadge from "./StockBadge.jsx";
import {
  canUseGroupedVariantSelector,
  findVariant,
  getConcreteVariantChoices,
  getVariantColorChoices,
  getVariantOptions as getOptions,
  hasVariant,
  isVariantInStock,
  selectInitialVariant,
  valuesMatch,
} from "./variantSelection.js";

function getUniqueSizes(variants) {
  const seen = new Set();
  const result = [];

  for (const variant of variants) {
    const options = getOptions(variant);

    if (!options.size) {
      continue;
    }

    const normalized = options.size.toLowerCase();

    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);

    result.push({
      value: options.size,
      sizeType: options.sizeType,
    });
  }

  return result;
}

/* =========================================================
   COLOR CHOICE
========================================================= */

function ColorChoice({ label, color, selected, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      aria-label={label}
      title={
        disabled ? `${label} is unavailable with your current selection` : label
      }
      className={`
        relative

        inline-flex
        h-10
        w-10
        shrink-0

        items-center
        justify-center

        rounded-full

        border-2

        transition-all
        duration-200

        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-brand-primary/40
        focus-visible:ring-offset-2

        ${
          selected
            ? `
                border-brand-surface

                ring-2
                ring-brand-primary
                ring-offset-2
              `
            : `
                border-black/10

                hover:border-brand-primary/60
                hover:scale-105
              `
        }

        ${
          disabled
            ? `
                cursor-not-allowed
                opacity-30
              `
            : `
                cursor-pointer
                active:scale-95
              `
        }
      `}
      style={{
        /* Variant colors are product data authored in the admin editor. */
        backgroundColor: color || "#E6DFDA",
      }}
    >
      {/* SELECTED INDICATOR */}

      {selected && (
        <span
          aria-hidden="true"
          className="
            inline-flex
            h-5
            w-5

            items-center
            justify-center

            rounded-full

            bg-black/45

            text-brand-surface

          "
        >
          <CheckRoundedIcon
            sx={{
              fontSize: 14,
            }}
          />
        </span>
      )}
    </button>
  );
}

/* =========================================================
   SIZE CHOICE
========================================================= */

function SizeChoice({ value, selected, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={`
        relative

        inline-flex
        min-h-11
        min-w-12

        items-center
        justify-center

        rounded-full

        border

        px-4

        text-sm
        font-semibold

        transition-all
        duration-200

        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-brand-accent-fill/40
        focus-visible:ring-offset-2

        ${
          selected
            ? `
                border-brand-primary
                bg-brand-primary

                text-brand-surface

                shadow-[0_4px_12px_rgba(0,0,0,0.10)]
              `
            : `
                border-brand-border
                bg-brand-surface

                text-brand-text

                hover:border-brand-accent-fill
                hover:bg-brand-surface-soft
              `
        }

        ${
          disabled
            ? `
                cursor-not-allowed

                opacity-35

                line-through

                hover:border-brand-border
                hover:bg-brand-surface
              `
            : `
                active:scale-[0.96]
              `
        }
      `}
    >
      {value}
    </button>
  );
}

/* =========================================================
   OPTION SECTION HEADER
========================================================= */

function OptionHeader({ label, value }) {
  return (
    <div
      className="
        flex
        items-end
        justify-between

        gap-3
      "
    >
      <p
        className="
          text-[0.65rem]
          font-bold
          uppercase

          tracking-[0.15em]

          text-brand-text
        "
      >
        {label}
      </p>

      {value && (
        <span
          className="
            max-w-[55%]

            truncate

            text-right
            text-xs
            font-medium

            text-brand-text-muted
          "
        >
          {value}
        </span>
      )}
    </div>
  );
}

function ColorOptionsFieldset({
  className,
  label,
  value,
  options,
  isAvailable,
  isSelected,
  onSelect,
}) {
  if (options.length === 0) {
    return null;
  }

  return (
    <fieldset
      aria-label={label}
      className={`
        ${className}

        rounded-[1.25rem]

        border
        border-brand-border

        bg-brand-surface-soft

        p-4
      `}
    >
      <OptionHeader label={label} value={value} />

      <div
        className="
          mt-4

          flex
          flex-wrap

          gap-3
        "
      >
        {options.map((option) => (
          <ColorChoice
            key={option.value}
            label={`${label}: ${option.value}`}
            color={option.color}
            disabled={!isAvailable(option.value)}
            selected={isSelected(option.value)}
            onClick={() => onSelect(option.value)}
          />
        ))}
      </div>
    </fieldset>
  );
}

function ConcreteVariantChoices({
  variants,
  selectedVariantId,
  onVariantSelect,
  className = "mt-6",
}) {
  const choices = getConcreteVariantChoices(variants);
  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) ?? null;

  return (
    <fieldset
      aria-label="Exact product option"
      className={`
        ${className}

        rounded-[1.25rem]

        border
        border-brand-border

        bg-brand-surface-soft

        p-4
      `}
    >
      <OptionHeader label="Option" value={selectedVariant?.displayName} />

      <div
        className="
          mt-4

          grid

          gap-2.5

          sm:grid-cols-2
        "
      >
        {choices.map((choice, index) => {
          const variant = variants[index];
          const selected = choice.variantId === selectedVariantId;
          const disabled = !isVariantInStock(variant);

          return (
            <button
              key={choice.variantId}
              type="button"
              disabled={disabled}
              aria-label={choice.accessibleLabel}
              aria-pressed={selected}
              title={
                disabled
                  ? `${choice.displayName} is currently out of stock`
                  : choice.accessibleLabel
              }
              onClick={() => onVariantSelect(choice.variantId)}
              className={`
                relative

                flex
                min-h-20

                items-center
                justify-between

                gap-3

                rounded-[1rem]

                border

                px-4
                py-3

                text-left

                transition-all
                duration-200

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-brand-accent-fill/40
                focus-visible:ring-offset-2

                ${
                  selected
                    ? `
                        border-brand-primary
                        bg-brand-surface

                        shadow-[0_4px_12px_rgba(0,0,0,0.08)]
                      `
                    : `
                        border-brand-border
                        bg-brand-surface

                        hover:border-brand-accent-fill
                        hover:bg-brand-accent-soft
                      `
                }

                ${
                  disabled
                    ? `
                        cursor-not-allowed
                        opacity-45

                        hover:border-brand-border
                        hover:bg-brand-surface
                      `
                    : `
                        cursor-pointer
                        active:scale-[0.98]
                      `
                }
              `}
            >
              <span className="min-w-0">
                <span
                  className="
                    block

                    truncate

                    text-sm
                    font-semibold

                    text-brand-text
                  "
                >
                  {choice.displayName}
                </span>

                {choice.identifier && (
                  <span
                    className="
                      mt-1
                      block

                      truncate

                      text-[0.65rem]
                      font-medium
                      uppercase

                      tracking-[0.08em]

                      text-brand-text-muted
                    "
                  >
                    SKU {choice.identifier}
                  </span>
                )}

                <span className="mt-2 block">
                  <StockBadge status={variant.stockStatus} compact />
                </span>
              </span>

              <span
                className="
                  shrink-0

                  font-display

                  text-lg
                  font-semibold

                  text-brand-text
                "
              >
                ${variant.price}
              </span>

              {selected && (
                <span
                  aria-hidden="true"
                  className="
                    absolute
                    right-2
                    top-2

                    inline-flex
                    h-4
                    w-4

                    items-center
                    justify-center

                    rounded-full

                    bg-brand-primary

                    text-brand-surface
                  "
                >
                  <CheckRoundedIcon sx={{ fontSize: 10 }} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/* =========================================================
   VARIANT SELECTOR
========================================================= */

function VariantSelector({ variants, selectedVariantId, onVariantSelect }) {
  if (!Array.isArray(variants) || variants.length === 0) {
    return (
      <div
        className="
          rounded-[1.2rem]

          border
          border-brand-error/20

          bg-brand-error/5

          px-4
          py-4
        "
      >
        <p
          className="
            text-sm
            font-semibold

            text-brand-error
          "
        >
          This product currently has no available options.
        </p>
      </div>
    );
  }

  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) ??
    selectInitialVariant(variants);

  const selectedOptions = getOptions(selectedVariant);
  const useGroupedSelector = canUseGroupedVariantSelector(variants);

  const metalColors = getVariantColorChoices(variants, "metalColor");

  const stoneColors = getVariantColorChoices(variants, "stoneColor");

  const sizes = getUniqueSizes(variants);

  /* =======================================================
     AVAILABILITY
  ======================================================= */

  function isMetalAvailable(metalColor) {
    return hasVariant(
      variants,
      {
        metalColor,
      },
      { inStockOnly: true },
    );
  }

  function isStoneAvailable(stoneColor) {
    return hasVariant(
      variants,
      {
        metalColor: selectedOptions.metalColor,

        stoneColor,
      },
      { inStockOnly: true },
    );
  }

  function isSizeAvailable(size) {
    return hasVariant(
      variants,
      {
        metalColor: selectedOptions.metalColor,

        stoneColor: selectedOptions.stoneColor,

        size,
      },
      { inStockOnly: true },
    );
  }

  /* =======================================================
     SELECT METAL
  ======================================================= */

  function selectMetal(metalColor) {
    /*
     * First attempt:
     * preserve stone + size.
     */
    const exactMatch = findVariant(variants, {
      metalColor,

      stoneColor: selectedOptions.stoneColor,

      size: selectedOptions.size,
    }, { inStockOnly: true });

    if (exactMatch) {
      onVariantSelect(exactMatch.id);

      return;
    }

    /*
     * Second:
     * preserve stone.
     */
    const stoneMatch = findVariant(variants, {
      metalColor,

      stoneColor: selectedOptions.stoneColor,
    }, { inStockOnly: true });

    if (stoneMatch) {
      onVariantSelect(stoneMatch.id);

      return;
    }

    /*
     * Otherwise choose first
     * available variant of metal.
     */
    const metalMatch = findVariant(variants, {
      metalColor,
    }, { inStockOnly: true });

    if (metalMatch) {
      onVariantSelect(metalMatch.id);
    }
  }

  /* =======================================================
     SELECT STONE
  ======================================================= */

  function selectStone(stoneColor) {
    const exactMatch = findVariant(variants, {
      metalColor: selectedOptions.metalColor,

      stoneColor,

      size: selectedOptions.size,
    }, { inStockOnly: true });

    if (exactMatch) {
      onVariantSelect(exactMatch.id);

      return;
    }

    const stoneMatch = findVariant(variants, {
      metalColor: selectedOptions.metalColor,

      stoneColor,
    }, { inStockOnly: true });

    if (stoneMatch) {
      onVariantSelect(stoneMatch.id);
    }
  }

  /* =======================================================
     SELECT SIZE
  ======================================================= */

  function selectSize(size) {
    const match = findVariant(variants, {
      metalColor: selectedOptions.metalColor,

      stoneColor: selectedOptions.stoneColor,

      size,
    }, { inStockOnly: true });

    if (match) {
      onVariantSelect(match.id);
    }
  }

  return (
    <section
      className="
        border-t
        border-brand-border

        pt-6
      "
    >
      {/* ==================================================
          SECTION INTRO
      ================================================== */}

      <div>
        <p
          className="
            text-[0.6rem]
            font-bold
            uppercase

            tracking-[0.18em]

            text-brand-accent-text
          "
        >
          Make it yours
        </p>

        <h2
          className="
            mt-1

            font-display

            text-[1.45rem]
            font-medium

            tracking-[-0.035em]

            text-brand-text
          "
        >
          Choose your piece
        </h2>

        <p
          className="
            mt-1.5

            max-w-md

            text-xs
            leading-5

            text-brand-text-muted
          "
        >
          Select the details that make this piece yours.
        </p>
      </div>

      <ColorOptionsFieldset
        className="mt-6"
        label="Color"
        value={selectedOptions.metalColor}
        options={metalColors}
        isAvailable={isMetalAvailable}
        isSelected={(value) =>
          valuesMatch(selectedOptions.metalColor, value)
        }
        onSelect={selectMetal}
      />

      <ColorOptionsFieldset
        className={metalColors.length > 0 ? "mt-3" : "mt-6"}
        label="Stone color"
        value={selectedOptions.stoneColor}
        options={stoneColors}
        isAvailable={isStoneAvailable}
        isSelected={(value) =>
          valuesMatch(selectedOptions.stoneColor, value)
        }
        onSelect={selectStone}
      />

      {useGroupedSelector && sizes.length > 0 && (
        <fieldset
          aria-label="Size"
          className={`
            ${metalColors.length > 0 || stoneColors.length > 0 ? "mt-3" : "mt-6"}

            rounded-[1.25rem]

            border
            border-brand-border

            bg-brand-surface-soft

            p-4
          `}
        >
          <OptionHeader
            label="Size"
            value={
              selectedOptions.sizeType === "RING"
                ? `Ring ${selectedOptions.size}`
                : selectedOptions.size
            }
          />

          <div
            className="
              mt-4

              flex
              flex-wrap

              gap-2
            "
          >
            {sizes.map((option) => {
              const disabled = !isSizeAvailable(option.value);

              return (
                <SizeChoice
                  key={option.value}
                  value={option.value}
                  disabled={disabled}
                  selected={valuesMatch(selectedOptions.size, option.value)}
                  onClick={() => selectSize(option.value)}
                />
              );
            })}
          </div>
        </fieldset>
      )}

      {!useGroupedSelector && (
        <ConcreteVariantChoices
          variants={variants}
          selectedVariantId={selectedVariant.id}
          onVariantSelect={onVariantSelect}
          className={
            metalColors.length > 0 || stoneColors.length > 0 ? "mt-3" : "mt-6"
          }
        />
      )}

      {/* ==================================================
          SELECTED RESULT
      ================================================== */}

      <div
        className="
          mt-5

          overflow-hidden

          rounded-[1.4rem]

          border
          border-brand-accent-fill/25

          bg-brand-accent-soft
        "
      >
        <div
          className="
            flex
            items-start
            justify-between

            gap-4

            p-4
          "
        >
          <div className="min-w-0">
            <p
              className="
                text-[0.56rem]
                font-bold
                uppercase

                tracking-[0.16em]

                text-brand-accent-text
              "
            >
              Your selection
            </p>

            <p
              className="
                mt-1.5

                line-clamp-2

                font-display

                text-[1.1rem]
                font-medium

                leading-tight

                text-brand-text
              "
            >
              {selectedVariant.displayName}
            </p>

            <div className="mt-2.5">
              <StockBadge status={selectedVariant.stockStatus} compact />
            </div>
          </div>

          <div
            className="
              shrink-0
              text-right
            "
          >
            <p
              className="
                text-[0.52rem]
                font-semibold
                uppercase

                tracking-[0.12em]

                text-brand-text-muted
              "
            >
              Price
            </p>

            <p
              className="
                mt-1

                font-display

                text-[1.65rem]
                font-semibold

                leading-none

                tracking-[-0.04em]

                text-brand-text
              "
            >
              ${selectedVariant.price}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VariantSelector;
