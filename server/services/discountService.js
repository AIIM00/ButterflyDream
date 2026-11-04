import { Prisma } from "@prisma/client";

export class DiscountError extends Error {
  constructor(message, statusCode = 409) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function normalizeDiscountCode(value) {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || !/^[A-Z0-9_-]{1,64}$/i.test(value.trim())) {
    throw new DiscountError("Use a valid promotional code (up to 64 letters, numbers, - or _).", 400);
  }
  return value.trim().toUpperCase();
}

export function chooseBestDiscount(campaigns, items, { code = null, userId = null, now = new Date() } = {}) {
  let best = null;
  let codeEligible = !code;
  for (const campaign of campaigns) {
    if (!campaign.active || (campaign.startsAt && campaign.startsAt > now) ||
        (campaign.endsAt && campaign.endsAt <= now) ||
        (campaign.maxRedemptions != null && campaign.usedCount >= campaign.maxRedemptions)) continue;
    if (campaign.mode !== "AUTOMATIC" && campaign.code !== code) continue;
    if (campaign.mode === "VIP" && (!userId || !campaign.assignedCustomers.some(c => c.id === userId))) continue;
    const included = new Set(campaign.includedProducts.map(p => p.id));
    const excluded = new Set(campaign.excludedProducts.map(p => p.id));
    const eligibleSubtotal = items.reduce((sum, item) => {
      if (excluded.has(item.productId) || (included.size && !included.has(item.productId))) return sum;
      return sum.plus(new Prisma.Decimal(item.unitPrice).mul(item.quantity));
    }, new Prisma.Decimal(0));
    const calculated = campaign.kind === "PERCENTAGE"
      ? eligibleSubtotal.mul(campaign.value).div(100) : new Prisma.Decimal(campaign.value);
    const amount = Prisma.Decimal.min(eligibleSubtotal, calculated).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
    if (amount.lte(0)) continue;
    if (campaign.mode !== "AUTOMATIC") codeEligible = true;
    // Stable tie-break: lexical campaign ID; input ordering never changes the winner.
    if (!best || amount.gt(best.amount) || (amount.eq(best.amount) && campaign.id < best.campaign.id)) {
      best = { campaign, amount, eligibleSubtotal };
    }
  }
  if (!codeEligible) throw new DiscountError("This promotional code is not available for this bag or account.");
  return best;
}

export async function quoteDiscount(database, items, { code: rawCode, userId = null } = {}) {
  const code = normalizeDiscountCode(rawCode);
  const campaigns = await database.discountCampaign.findMany({
    where: { active: true, OR: [{ mode: "AUTOMATIC" }, ...(code ? [{ code }] : [])] },
    include: {
      includedProducts: { select: { id: true } },
      excludedProducts: { select: { id: true } },
      assignedCustomers: { where: { id: userId ?? "00000000-0000-0000-0000-000000000000" }, select: { id: true } },
    },
  });
  return chooseBestDiscount(campaigns, items, { code, userId });
}

export function discountSnapshot(quote) {
  if (!quote) return null;
  const { campaign, amount, eligibleSubtotal } = quote;
  return {
    campaignId: campaign.id, name: campaign.name, mode: campaign.mode,
    code: campaign.code, kind: campaign.kind, value: campaign.value.toFixed(2),
    eligibleSubtotal: eligibleSubtotal.toFixed(2), amount: amount.toFixed(2),
  };
}

export function applyDiscountToPreview(preview, quote, code = null) {
  const summary = preview.cart.summary;
  const amount = quote?.amount ?? new Prisma.Decimal(0);
  summary.requestedCode = normalizeDiscountCode(code) ?? "";
  summary.discountAmount = amount.toFixed(2);
  summary.discount = discountSnapshot(quote);
  summary.totalAmount = new Prisma.Decimal(summary.subtotal).plus(summary.deliveryFee ?? 0).minus(amount).toFixed(2);
  return preview;
}

// Must run inside the order's serializable transaction. A failed claim rolls back
// inventory, order creation, and cart clearing together; caller retries conflicts.
export async function redeemDiscount(transaction, quote, orderId, userId) {
  if (!quote) return;
  const c = quote.campaign;
  const claim = await transaction.discountCampaign.updateMany({
    where: { id: c.id, active: true, usedCount: c.usedCount, updatedAt: c.updatedAt,
      ...(c.maxRedemptions == null ? {} : { usedCount: { equals: c.usedCount, lt: c.maxRedemptions } }) },
    data: { usedCount: { increment: 1 } },
  });
  if (claim.count !== 1) throw new DiscountError("Promotion availability changed. Please review your bag and try again.");
  await transaction.discountRedemption.create({ data: {
    campaignId: c.id, orderId, userId, amount: quote.amount,
  } });
}

export async function restoreDiscountRedemption(transaction, orderId) {
  const redemption = await transaction.discountRedemption.findUnique({ where: { orderId } });
  if (!redemption || redemption.restoredAt) return;
  const claimed = await transaction.discountRedemption.updateMany({
    where: { id: redemption.id, restoredAt: null }, data: { restoredAt: new Date() },
  });
  if (claimed.count === 1) {
    await transaction.discountCampaign.update({ where: { id: redemption.campaignId }, data: { usedCount: { decrement: 1 } } });
  }
}
