import StockBadge from "./StockBadge.jsx";

function getOptions(variant) {
  const rawOptions =
    variant?.options &&
    typeof variant.options === "object" &&
    !Array.isArray(variant.options)
      ? variant.options
      : {};

  return {
    metalColor: String(rawOptions.metalColor ?? rawOptions.color ?? "").trim(),

    metalColorHex: rawOptions.metalColorHex ?? rawOptions.colorHex ?? null,

    stoneColor: String(rawOptions.stoneColor ?? "").trim(),

    stoneColorHex: rawOptions.stoneColorHex ?? null,

    size: String(rawOptions.size ?? "").trim(),

    sizeType: rawOptions.sizeType ?? null,
  };
}

function getUniqueColorOptions(variants, valueKey, hexKey) {
  const seen = new Set();
  const result = [];

  for (const variant of variants) {
    const options = getOptions(variant);

    const value = options[valueKey];

    if (!value) {
      continue;
    }

    const normalized = value.toLowerCase();

    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);

    result.push({
      value,
      color: options[hexKey] ?? null,
    });
  }

  return result;
}

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

function valuesMatch(first, second) {
  return (
    String(first ?? "")
      .trim()
      .toLowerCase() ===
    String(second ?? "")
      .trim()
      .toLowerCase()
  );
}

function findVariant(
  variants,
  { metalColor = "", stoneColor = "", size = "" },
) {
  return (
    variants.find((variant) => {
      const options = getOptions(variant);

      if (metalColor && !valuesMatch(options.metalColor, metalColor)) {
        return false;
      }

      if (stoneColor && !valuesMatch(options.stoneColor, stoneColor)) {
        return false;
      }

      if (size && !valuesMatch(options.size, size)) {
        return false;
      }

      return true;
    }) ?? null
  );
}

function hasVariant(variants, filters) {
  return Boolean(findVariant(variants, filters));
}

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
      className={[
        `
          relative
          flex h-11 w-11
          items-center
          justify-center
          rounded-full
          border-2
          bg-brand-surface
          transition
        `,
        selected
          ? "border-brand-espresso"
          : "border-transparent hover:border-brand-border",
        disabled ? "cursor-not-allowed opacity-25" : "cursor-pointer",
      ].join(" ")}
    >
      <span
        className="
          h-7 w-7
          rounded-full
          border border-black/10
        "
        style={{
          backgroundColor: color || "#E6DFDA",
        }}
        aria-hidden="true"
      />

      {selected && (
        <span
          className="
            pointer-events-none
            absolute -bottom-1
            h-1.5 w-1.5
            rounded-full
            bg-brand-espresso
          "
        />
      )}
    </button>
  );
}

function SizeChoice({ value, selected, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={[
        `
          relative
          inline-flex
          min-h-10
          min-w-11
          items-center
          justify-center
          rounded-full
          border
          px-3
          text-sm
          font-semibold
          transition
        `,
        selected
          ? `
            border-brand-espresso
            bg-brand-espresso
            text-white
          `
          : `
            border-brand-border
            bg-brand-surface
            text-brand-espresso
            hover:border-brand-champagne
          `,
        disabled
          ? `
            cursor-not-allowed
            text-brand-muted
            opacity-35
            line-through
          `
          : "",
      ].join(" ")}
    >
      {value}
    </button>
  );
}

function VariantSelector({ variants, selectedVariantId, onVariantSelect }) {
  if (!Array.isArray(variants) || variants.length === 0) {
    return (
      <p
        className="
          rounded-xl
          border
          border-brand-error/25
          bg-brand-error/5
          px-4 py-3
          text-sm
          font-semibold
          text-brand-error
        "
      >
        This product currently has no available options.
      </p>
    );
  }

  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) ??
    variants.find((variant) => variant.isDefault) ??
    variants[0];

  const selectedOptions = getOptions(selectedVariant);

  const metalColors = getUniqueColorOptions(
    variants,
    "metalColor",
    "metalColorHex",
  );

  const stoneColors = getUniqueColorOptions(
    variants,
    "stoneColor",
    "stoneColorHex",
  );

  const sizes = getUniqueSizes(variants);

  /*
   * METAL
   *
   * Metal is the first-level selection.
   * Any metal that has at least one valid
   * variant remains selectable.
   */
  function isMetalAvailable(metalColor) {
    return hasVariant(variants, {
      metalColor,
    });
  }

  /*
   * STONE
   *
   * Stone availability depends on the
   * currently selected metal.
   */
  function isStoneAvailable(stoneColor) {
    return hasVariant(variants, {
      metalColor: selectedOptions.metalColor,

      stoneColor,
    });
  }

  /*
   * SIZE
   *
   * Size availability depends on both
   * the selected metal and stone.
   *
   * Gold + Green may have 7/8/9,
   * while Gold + Clear may have 7/8/9/10.
   */
  function isSizeAvailable(size) {
    return hasVariant(variants, {
      metalColor: selectedOptions.metalColor,

      stoneColor: selectedOptions.stoneColor,

      size,
    });
  }

  function selectMetal(metalColor) {
    /*
     * Best case:
     * preserve stone AND size.
     */
    const exactMatch = findVariant(variants, {
      metalColor,

      stoneColor: selectedOptions.stoneColor,

      size: selectedOptions.size,
    });

    if (exactMatch) {
      onVariantSelect(exactMatch.id);

      return;
    }

    /*
     * Second choice:
     * preserve the stone.
     */
    const stoneMatch = findVariant(variants, {
      metalColor,

      stoneColor: selectedOptions.stoneColor,
    });

    if (stoneMatch) {
      onVariantSelect(stoneMatch.id);

      return;
    }

    /*
     * Otherwise select the first valid
     * variant of the newly chosen metal.
     */
    const metalMatch = findVariant(variants, {
      metalColor,
    });

    if (metalMatch) {
      onVariantSelect(metalMatch.id);
    }
  }

  function selectStone(stoneColor) {
    /*
     * Try to keep the current size.
     */
    const exactMatch = findVariant(variants, {
      metalColor: selectedOptions.metalColor,

      stoneColor,

      size: selectedOptions.size,
    });

    if (exactMatch) {
      onVariantSelect(exactMatch.id);

      return;
    }

    /*
     * Otherwise move to the first
     * available size for this
     * metal + stone combination.
     */
    const stoneMatch = findVariant(variants, {
      metalColor: selectedOptions.metalColor,

      stoneColor,
    });

    if (stoneMatch) {
      onVariantSelect(stoneMatch.id);
    }
  }

  function selectSize(size) {
    const match = findVariant(variants, {
      metalColor: selectedOptions.metalColor,

      stoneColor: selectedOptions.stoneColor,

      size,
    });

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
      <p
        className="
          text-xs
          font-semibold
          uppercase
          tracking-[0.16em]
          text-brand-muted
        "
      >
        Product options
      </p>

      {/* METAL */}

      {metalColors.length > 0 && (
        <fieldset className="mt-5">
          <div
            className="
              flex items-center
              justify-between
              gap-3
            "
          >
            <legend
              className="
                text-sm
                font-semibold
                uppercase
                tracking-[0.12em]
                text-brand-espresso
              "
            >
              Metal
            </legend>

            <span
              className="
                text-sm
                font-medium
                text-brand-muted
              "
            >
              {selectedOptions.metalColor}
            </span>
          </div>

          <div
            className="
              mt-3
              flex flex-wrap
              gap-2
            "
          >
            {metalColors.map((option) => {
              const disabled = !isMetalAvailable(option.value);

              return (
                <ColorChoice
                  key={option.value}
                  label={option.value}
                  color={option.color}
                  disabled={disabled}
                  selected={valuesMatch(
                    selectedOptions.metalColor,
                    option.value,
                  )}
                  onClick={() => selectMetal(option.value)}
                />
              );
            })}
          </div>
        </fieldset>
      )}

      {/* STONE */}

      {stoneColors.length > 0 && (
        <fieldset className="mt-7">
          <div
            className="
              flex items-center
              justify-between
              gap-3
            "
          >
            <legend
              className="
                text-sm
                font-semibold
                uppercase
                tracking-[0.12em]
                text-brand-espresso
              "
            >
              Stone
            </legend>

            <span
              className="
                text-sm
                font-medium
                text-brand-muted
              "
            >
              {selectedOptions.stoneColor}
            </span>
          </div>

          <div
            className="
              mt-3
              flex flex-wrap
              gap-2
            "
          >
            {stoneColors.map((option) => {
              const disabled = !isStoneAvailable(option.value);

              return (
                <ColorChoice
                  key={option.value}
                  label={option.value}
                  color={option.color}
                  disabled={disabled}
                  selected={valuesMatch(
                    selectedOptions.stoneColor,
                    option.value,
                  )}
                  onClick={() => selectStone(option.value)}
                />
              );
            })}
          </div>
        </fieldset>
      )}

      {/* SIZE */}

      {sizes.length > 0 && (
        <fieldset className="mt-7">
          <div
            className="
              flex items-center
              justify-between
              gap-3
            "
          >
            <legend
              className="
                text-sm
                font-semibold
                uppercase
                tracking-[0.12em]
                text-brand-espresso
              "
            >
              Size
            </legend>

            <span
              className="
                text-sm
                font-medium
                text-brand-muted
              "
            >
              {selectedOptions.sizeType === "RING"
                ? `Ring ${selectedOptions.size}`
                : selectedOptions.size}
            </span>
          </div>

          <div
            className="
              mt-3
              flex flex-wrap
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

      {/* SELECTED RESULT */}

      <div
        className="
          mt-8
          flex flex-col
          gap-4
          border-t
          border-brand-border
          pt-5
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div>
          <p
            className="
              text-[0.68rem]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-brand-muted
            "
          >
            Your selection
          </p>

          <p
            className="
              mt-1
              text-sm
              font-semibold
              text-brand-espresso
            "
          >
            {selectedVariant.displayName}
          </p>

          <div className="mt-2">
            <StockBadge status={selectedVariant.stockStatus} compact />
          </div>
        </div>

        <p
          className="
            text-2xl
            font-bold
            text-brand-espresso
          "
        >
          ${selectedVariant.price}
        </p>
      </div>
    </section>
  );
}

export default VariantSelector;
