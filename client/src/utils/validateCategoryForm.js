const CATEGORY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function createCategorySlug(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/g, "");
}

export default function validateCategoryForm(formData) {
  const name = typeof formData?.name === "string" ? formData.name.trim() : "";

  const slug = typeof formData?.slug === "string" ? formData.slug.trim() : "";

  const description =
    typeof formData?.description === "string"
      ? formData.description.trim()
      : "";

  if (name.length < 2 || name.length > 100) {
    return "Category name must contain between 2 and 100 characters.";
  }

  if (!slug || slug.length > 120 || !CATEGORY_SLUG_PATTERN.test(slug)) {
    return "Slug must contain lowercase letters, numbers, and single hyphens.";
  }

  if (description.length > 1000) {
    return "Description must not exceed 1,000 characters.";
  }

  return null;
}
