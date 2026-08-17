const IDENTITY_OPTION_KEYS = ["metalColor", "stoneColor", "size"];

const SUPPORTED_OPTION_KEYS = new Set([
  "metalColor",
  "color",
  "metalColorHex",
  "colorHex",
  "stoneColor",
  "stoneColorHex",
  "size",
  "sizeType",
]);

function getRawOptions(variant) {
  const options = variant?.options;

  if (!options || typeof options !== "object" || Array.isArray(options)) {
    return {};
  }

  return options;
}

function normalizeOptionValue(value) {
  return String(value ?? "").trim().toLowerCase();
}

function hasSupportedValue(value) {
  return (
    value == null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

export function getVariantOptions(variant) {
  const rawOptions = getRawOptions(variant);

  return {
    metalColor: String(rawOptions.metalColor ?? rawOptions.color ?? "").trim(),
    metalColorHex: rawOptions.metalColorHex ?? rawOptions.colorHex ?? null,
    stoneColor: String(rawOptions.stoneColor ?? "").trim(),
    stoneColorHex: rawOptions.stoneColorHex ?? null,
    size: String(rawOptions.size ?? "").trim(),
    sizeType: rawOptions.sizeType ?? null,
  };
}

export function getVariantColorChoices(variants, colorAxis = "metalColor") {
  if (!Array.isArray(variants)) {
    return [];
  }

  const valueKey = colorAxis === "stoneColor" ? "stoneColor" : "metalColor";
  const hexKey =
    colorAxis === "stoneColor" ? "stoneColorHex" : "metalColorHex";
  const choices = [];
  const choiceIndexByValue = new Map();

  for (const variant of variants) {
    const options = getVariantOptions(variant);
    const value = options[valueKey];

    if (!value) {
      continue;
    }

    const normalizedValue = normalizeOptionValue(value);
    const existingIndex = choiceIndexByValue.get(normalizedValue);
    const color = options[hexKey] || null;

    if (existingIndex !== undefined) {
      if (!choices[existingIndex].color && color) {
        choices[existingIndex].color = color;
      }

      continue;
    }

    choiceIndexByValue.set(normalizedValue, choices.length);
    choices.push({
      value,
      color,
    });
  }

  return choices;
}

export function valuesMatch(first, second) {
  return normalizeOptionValue(first) === normalizeOptionValue(second);
}

export function isVariantInStock(variant) {
  return (
    variant?.inStock === true && variant?.stockStatus !== "OUT_OF_STOCK"
  );
}

export function findVariant(
  variants,
  { metalColor = "", stoneColor = "", size = "" },
  { inStockOnly = false } = {},
) {
  if (!Array.isArray(variants)) {
    return null;
  }

  return (
    variants.find((variant) => {
      if (inStockOnly && !isVariantInStock(variant)) {
        return false;
      }

      const options = getVariantOptions(variant);

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

export function hasVariant(variants, filters, options) {
  return Boolean(findVariant(variants, filters, options));
}

export function selectInitialVariant(variants) {
  if (!Array.isArray(variants) || variants.length === 0) {
    return null;
  }

  return (
    variants.find(
      (variant) => variant.isDefault && isVariantInStock(variant),
    ) ??
    variants.find((variant) => isVariantInStock(variant)) ??
    variants.find((variant) => variant.isDefault) ??
    variants[0] ??
    null
  );
}

export function canUseGroupedVariantSelector(variants) {
  if (!Array.isArray(variants) || variants.length === 0) {
    return false;
  }

  let expectedAxes = null;
  const tuples = new Set();

  for (const variant of variants) {
    const rawOptions = getRawOptions(variant);
    const rawEntries = Object.entries(rawOptions);

    if (
      rawEntries.some(
        ([optionKey, value]) =>
          !SUPPORTED_OPTION_KEYS.has(optionKey) || !hasSupportedValue(value),
      )
    ) {
      return false;
    }

    const metalColor = normalizeOptionValue(rawOptions.metalColor);
    const colorAlias = normalizeOptionValue(rawOptions.color);

    if (metalColor && colorAlias && metalColor !== colorAlias) {
      return false;
    }

    const options = getVariantOptions(variant);
    const axes = IDENTITY_OPTION_KEYS.filter(
      (optionKey) => normalizeOptionValue(options[optionKey]) !== "",
    );

    if (axes.length === 0) {
      return false;
    }

    if (expectedAxes === null) {
      expectedAxes = axes;
    } else if (
      axes.length !== expectedAxes.length ||
      axes.some((optionKey, index) => optionKey !== expectedAxes[index])
    ) {
      return false;
    }

    const tupleValues = axes.map((optionKey) =>
      normalizeOptionValue(options[optionKey]),
    );
    const tuple = JSON.stringify(tupleValues);

    if (tuples.has(tuple)) {
      return false;
    }

    tuples.add(tuple);
  }

  return true;
}

export function getConcreteVariantChoices(variants) {
  if (!Array.isArray(variants)) {
    return [];
  }

  const displayNames = variants.map((variant, index) => {
    const displayName = String(variant?.displayName ?? "").trim();
    return displayName || `Option ${index + 1}`;
  });
  const counts = new Map();

  for (const displayName of displayNames) {
    const normalizedName = normalizeOptionValue(displayName);
    counts.set(normalizedName, (counts.get(normalizedName) ?? 0) + 1);
  }

  return variants.map((variant, index) => {
    const displayName = displayNames[index];
    const hasDuplicateName =
      (counts.get(normalizeOptionValue(displayName)) ?? 0) > 1;
    const identifier = String(variant?.sku ?? variant?.id ?? index + 1).trim();

    return {
      variantId: variant?.id ?? "",
      displayName,
      identifier: hasDuplicateName ? identifier : "",
      accessibleLabel: hasDuplicateName
        ? `${displayName}, SKU ${identifier}`
        : displayName,
    };
  });
}
