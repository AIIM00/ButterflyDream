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

function validateImageUrl(imageUrl) {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl.length > 2048) {
    return "The image URL is too long.";
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return "Enter a valid image URL.";
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return "The image URL must use HTTP or HTTPS.";
  }

  return null;
}

export default function validateCategoryForm(formData) {
  const name = formData.name.trim();
  const slug = formData.slug.trim();
  const description = formData.description.trim();
  const imageUrl = formData.imageUrl.trim();

  if (name.length < 2 || name.length > 100) {
    return "Category name must contain between 2 and 100 characters.";
  }

  if (!slug || slug.length > 120 || !CATEGORY_SLUG_PATTERN.test(slug)) {
    return "Slug must contain lowercase letters, numbers, and single hyphens.";
  }

  if (description.length > 1000) {
    return "Description must not exceed 1,000 characters.";
  }

  const imageError = validateImageUrl(imageUrl);

  if (imageError) {
    return imageError;
  }

  return null;
}
