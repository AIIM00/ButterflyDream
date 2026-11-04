import { DiscountError, normalizeDiscountCode } from "../services/discountService.js";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function requireDiscountId(id) {
  if (typeof id !== "string" || !uuid.test(id)) throw new DiscountError("Invalid campaign ID.", 400);
  return id;
}
function ids(value, label) {
  if (!Array.isArray(value) || value.length > 500 || value.some(id => typeof id !== "string" || !uuid.test(id))) {
    throw new DiscountError(`${label} must contain up to 500 valid IDs.`, 400);
  }
  return [...new Set(value)];
}
function date(value) {
  if (value == null || value === "") return null;
  // Explicit offset avoids server/browser timezone ambiguity.
  if (typeof value !== "string" || !/(Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value))) {
    throw new DiscountError("Campaign dates must be ISO timestamps with a timezone.", 400);
  }
  return new Date(value);
}
export function parseCampaign(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new DiscountError("Campaign data is required.", 400);
  const { name, mode, kind, active } = body;
  if (typeof name !== "string" || !name.trim() || name.trim().length > 120) throw new DiscountError("Campaign name is required (up to 120 characters).", 400);
  if (!["AUTOMATIC", "CODE", "VIP"].includes(mode) || !["PERCENTAGE", "FIXED"].includes(kind)) throw new DiscountError("Invalid discount mode or kind.", 400);
  if (typeof active !== "boolean") throw new DiscountError("Active must be true or false.", 400);
  if (!/^(\d{1,8})(\.\d{1,2})?$/.test(String(body.value)) || Number(body.value) <= 0 || (kind === "PERCENTAGE" && Number(body.value) > 100)) throw new DiscountError("Enter a positive discount with at most two decimal places; percentages cannot exceed 100.", 400);
  const code = normalizeDiscountCode(body.code);
  if ((mode === "AUTOMATIC" && code) || (mode !== "AUTOMATIC" && !code)) throw new DiscountError("Codes are required only for code and VIP campaigns.", 400);
  const startsAt = date(body.startsAt), endsAt = date(body.endsAt);
  if (startsAt && endsAt && endsAt <= startsAt) throw new DiscountError("End time must be after start time.", 400);
  const maxRedemptions = body.maxRedemptions ?? null;
  if (maxRedemptions !== null && (!Number.isInteger(maxRedemptions) || maxRedemptions < 1 || maxRedemptions > 2147483647)) throw new DiscountError("Usage limit must be a positive integer.", 400);
  const includedProductIds = ids(body.includedProductIds ?? [], "Included products");
  const excludedProductIds = ids(body.excludedProductIds ?? [], "Excluded products");
  const assignedCustomerIds = ids(body.assignedCustomerIds ?? [], "VIP customers");
  if (includedProductIds.some(id => excludedProductIds.includes(id))) throw new DiscountError("A product cannot be both included and excluded.", 400);
  if ((mode === "VIP" && !assignedCustomerIds.length) || (mode !== "VIP" && assignedCustomerIds.length)) throw new DiscountError("Assign customers only to VIP campaigns; VIP requires at least one customer.", 400);
  return { name: name.trim(), mode, kind, value: String(body.value), code, active, startsAt, endsAt, maxRedemptions,
    includedProductIds, excludedProductIds, assignedCustomerIds };
}
