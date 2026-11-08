import request from "supertest";
import { describe, expect, test, vi } from "vitest";
import { Prisma } from "@prisma/client";
vi.mock("../services/orderEmailService.js", () => ({
  sendOrderPlacedEmailSafely: vi.fn(), sendOrderStatusEmailSafely: vi.fn(),
  sendOrderCancelledEmailSafely: vi.fn(), sendPaymentStatusEmailSafely: vi.fn(),
}));
import app from "../src/app.js";
import prisma from "../src/prisma.js";
import { chooseBestDiscount, normalizeDiscountCode } from "../services/discountService.js";
import { parseCampaign } from "../utils/discountValidation.js";
import { createTestUser } from "./helpers/createTestUser.js";
import createAuthCookie from "./helpers/createAuthCookie.js";
import { createTestAddress, createTestCatalogItem, createTestDeliveryGovernorate, createTestStoreSetting } from "./helpers/createCommerceFixtures.js";
const address = { recipientName: "Buyer", phone: "+96171123456", governorate: "North Lebanon", city: "Tripoli", street: "Test Street" };
const customer = { fullName: "Guest", email: "guest@example.com", phone: "+96171123456" };
const base = { name: "Winter", mode: "AUTOMATIC", kind: "PERCENTAGE", value: "10", active: true };
async function campaign(data = {}) { return prisma.discountCampaign.create({ data: { ...base, ...data } }); }
async function commerce() {
  await createTestStoreSetting(); await createTestDeliveryGovernorate();
  return createTestCatalogItem({ price: "25.00", stock: 20 });
}
function guest(variant, code) { return { customer, deliveryAddress: address, items: [{ variantId: variant.id, quantity: 2 }], code }; }
async function fillCart(user, variant) {
  const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  await prisma.cartItem.create({ data: { cartId: cart.id, variantId: variant.id, quantity: 2, unitPriceSnapshot: variant.price } });
}
function pureCampaign(overrides = {}) {
  return { id: "a", ...base, value: new Prisma.Decimal(10), code: null, usedCount: 0, includedProducts: [], excludedProducts: [], assignedCustomers: [], ...overrides };
}
const lines = [{ productId: "p1", quantity: 3, unitPrice: "0.05" }, { productId: "p2", quantity: 1, unitPrice: "10.00" }];
describe("discount calculations", () => {
  test("rounds once on eligible merchandise and exclusions take precedence", () => {
    const result = chooseBestDiscount([pureCampaign({ includedProducts: [{ id: "p1" }, { id: "p2" }], excludedProducts: [{ id: "p2" }] })], lines);
    expect(result.amount.toFixed(2)).toBe("0.02");
  });
  test("caps fixed savings at eligible subtotal", () => {
    expect(chooseBestDiscount([pureCampaign({ kind: "FIXED", value: new Prisma.Decimal(99) })], lines).amount.toFixed(2)).toBe("10.15");
  });
  test("selects only the best offer and breaks equal offers deterministically", () => {
    const a = pureCampaign({ kind: "FIXED", value: new Prisma.Decimal(2) });
    const b = pureCampaign({ id: "b", kind: "FIXED", value: new Prisma.Decimal(2) });
    expect(chooseBestDiscount([b, a], lines).campaign.id).toBe("a");
  });
  test("schedule begins inclusively and ends exclusively", () => {
    const now = new Date("2026-11-04T12:00:00Z");
    expect(chooseBestDiscount([pureCampaign({ startsAt: now })], lines, { now })).not.toBeNull();
    expect(chooseBestDiscount([pureCampaign({ endsAt: now })], lines, { now })).toBeNull();
    expect(chooseBestDiscount([pureCampaign({ startsAt: new Date(now.getTime() + 1) })], lines, { now })).toBeNull();
  });
  test("inactive and exhausted offers do not apply", () => {
    expect(chooseBestDiscount([pureCampaign({ active: false }), pureCampaign({ usedCount: 1, maxRedemptions: 1 })], lines)).toBeNull();
  });
  test("normalizes codes and rejects malformed input", () => {
    expect(normalizeDiscountCode(" winter-10 ")).toBe("WINTER-10");
    for (const value of [[], {}, 123, "bad code", "X".repeat(65)]) expect(() => normalizeDiscountCode(value)).toThrow();
  });
  test.each([{ value: "101" }, { value: "0" }, { value: "1.111" }, { mode: "VIP", code: "VIP" }, { mode: "CODE" }, { startsAt: "2026-11-01T00:00" }, { maxRedemptions: 0 }])("rejects invalid campaign input %j", input => {
    expect(() => parseCampaign({ ...base, ...input })).toThrow();
  });
});
describe("discount checkout and management", () => {
  test("guest preview ignores forged amounts and does not consume usage; order retains snapshot", async () => {
    const { variant } = await commerce();
    const c = await campaign();
    const body = { ...guest(variant), discountAmount: 500, totalAmount: 0 };
    const preview = await request(app).post("/api/checkout/preview").send(body);
    expect(preview.status).toBe(200);
    expect(preview.body.checkout.cart.summary.discountAmount).toBe("5.00");
    expect((await prisma.discountCampaign.findUnique({ where: { id: c.id } })).usedCount).toBe(0);
    const order = await request(app).post("/api/checkout/guest-orders").send(body);
    expect(order.status).toBe(201);
    expect(order.body.order.totalAmount).toBe("48.00");
    expect(order.body.order.discountSnapshot.name).toBe("Winter");
    await prisma.discountCampaign.update({ where: { id: c.id }, data: { name: "Changed", active: false, value: "99" } });
    const stored = await prisma.order.findUnique({ where: { id: order.body.order.id }, include: { discountRedemption: true } });
    expect(stored.discountSnapshot.value).toBe("10.00");
    expect(stored.discountRedemption.amount.toFixed(2)).toBe("5.00");
  });
  test("public code competes with automatic offer without stacking", async () => {
    const { variant } = await commerce();
    await campaign({ value: "20" });
    const c = await campaign({ name: "Code", mode: "CODE", code: "SAVE", kind: "FIXED", value: "5" });
    const response = await request(app).post("/api/checkout/guest-orders").send(guest(variant, "save"));
    expect(response.status).toBe(201);
    expect(response.body.order.discountAmount).toBe("10.00");
    expect((await prisma.discountCampaign.findUnique({ where: { id: c.id } })).usedCount).toBe(0);
  });
  test("VIP requires assigned authenticated customer, never a supplied email or user ID", async () => {
    const { variant } = await commerce();
    const vip = await createTestUser();
    const other = await createTestUser({ email: "other@example.com" });
    await campaign({ mode: "VIP", code: "VIP", assignedCustomers: { connect: [{ id: vip.id }] } });
    const payload = { ...guest(variant, "VIP"), userId: vip.id, customer: { ...customer, email: vip.email } };
    expect((await request(app).post("/api/checkout/preview").send(payload)).status).toBe(409);
    expect((await request(app).post("/api/checkout/guest-orders").send(payload)).status).toBe(409);
    expect((await request(app).post("/api/checkout/preview").set("Cookie", createAuthCookie(other)).send(payload)).status).toBe(409);
    const preview = await request(app).post("/api/checkout/preview").set("Cookie", createAuthCookie(vip)).send(payload);
    expect(preview.status).toBe(200);
    await fillCart(vip, variant);
    const result = await request(app).post("/api/checkout/manual-orders").set("Cookie", createAuthCookie(vip)).send({ code: "VIP", deliveryAddress: address });
    expect(result.status).toBe(201);
    expect(result.body.order.discountAmount).toBe("5.00");
  });
  test("saved-address checkout quotes and consumes discounts", async () => {
    const { variant } = await commerce();
    const user = await createTestUser();
    const saved = await createTestAddress(user.id);
    await fillCart(user, variant); await campaign({ mode: "CODE", code: "SAVE" });
    const preview = await request(app).get(`/api/checkout?addressId=${saved.id}&code=SAVE`).set("Cookie", createAuthCookie(user));
    expect(preview.status).toBe(200);
    expect(preview.body.checkout.cart.summary.discountAmount).toBe("5.00");
    const response = await request(app).post("/api/checkout/orders").set("Cookie", createAuthCookie(user)).send({ addressId: saved.id, code: "SAVE", totalAmount: 0 });
    expect(response.status).toBe(201);
    expect(response.body.order.totalAmount).toBe("48.00");
    expect(await prisma.cartItem.count()).toBe(0);
  });
  test("invalid code rolls back stock and leaves no order or redemption", async () => {
    const { variant } = await commerce();
    const response = await request(app).post("/api/checkout/guest-orders").send(guest(variant, "MISSING"));
    expect(response.status).toBe(409);
    expect(await prisma.order.count()).toBe(0);
    expect(await prisma.discountRedemption.count()).toBe(0);
    expect((await prisma.inventory.findUnique({ where: { variantId: variant.id } })).stockQuantity).toBe(20);
  });
  test("inclusion limits fixed amount to eligible products and exclusions remove eligibility", async () => {
    const first = await commerce(); const second = await createTestCatalogItem();
    await campaign({ kind: "FIXED", value: "100", includedProducts: { connect: [{ id: first.product.id }] }, excludedProducts: { connect: [{ id: second.product.id }] } });
    const response = await request(app).post("/api/checkout/preview").send({ items: [{ variantId: first.variant.id, quantity: 1 }, { variantId: second.variant.id, quantity: 1 }] });
    expect(response.body.checkout.cart.summary.discountAmount).toBe("25.00");
  });
  test("concurrent guests cannot exceed the last campaign redemption", async () => {
    const { variant } = await commerce();
    const c = await campaign({ mode: "CODE", code: "LAST", maxRedemptions: 1 });
    const results = await Promise.all([1, 2].map(() => request(app).post("/api/checkout/guest-orders").send(guest(variant, "LAST"))));
    expect(results.map(r => r.status).sort()).toEqual([201, 409]);
    expect(await prisma.order.count()).toBe(1);
    expect((await prisma.discountCampaign.findUnique({ where: { id: c.id } })).usedCount).toBe(1);
    expect(await prisma.discountRedemption.count()).toBe(1);
  });
  test("concurrent manual checkout consumes a saved cart once", async () => {
    const { variant } = await commerce(); const user = await createTestUser();
    await fillCart(user, variant); await campaign();
    const results = await Promise.all([1, 2].map(() => request(app).post("/api/checkout/manual-orders").set("Cookie", createAuthCookie(user)).send({ deliveryAddress: address })));
    expect(results.filter(r => r.status === 201)).toHaveLength(1);
    expect(await prisma.order.count()).toBe(1);
  });
  test("concurrent and repeated cancellation restores usage, inventory and history exactly once", async () => {
    const { variant } = await commerce(); const c = await campaign({ maxRedemptions: 1 });
    const admin = await createTestUser({ role: "ADMIN" });
    const response = await request(app).post("/api/checkout/guest-orders").send(guest(variant));
    const orderId = response.body.order.id;
    const cancel = () => request(app).patch(`/api/admin/orders/${orderId}/cancel`).set("Cookie", createAuthCookie(admin)).send({ reason: "Customer requested cancellation" });
    const results = await Promise.all([cancel(), cancel()]);
    expect(results.map(r => r.status)).toEqual([200, 200]);
    expect((await cancel()).status).toBe(200);
    expect((await prisma.discountCampaign.findUnique({ where: { id: c.id } })).usedCount).toBe(0);
    expect((await prisma.discountRedemption.findUnique({ where: { orderId } })).restoredAt).not.toBeNull();
    expect((await prisma.inventory.findUnique({ where: { variantId: variant.id } })).stockQuantity).toBe(20);
    expect(await prisma.orderStatusHistory.count({ where: { orderId, toStatus: "CANCELLED" } })).toBe(1);
    expect((await prisma.order.findUnique({ where: { id: orderId } })).discountAmount.toFixed(2)).toBe("5.00");
  });
  test("a collection sale matches one-item checkout, respects exclusions and expiry", async () => {
    const member = await commerce();
    const excluded = await createTestCatalogItem();
    const outside = await createTestCatalogItem();
    const cookie = createAuthCookie(await createTestUser({ role: "ADMIN" }));
    const collection = await request(app).post("/api/admin/discounts/collections")
      .set("Cookie", cookie).send({ name: "Jewelry", productIds: [member.product.id, excluded.product.id] });
    expect(collection.status).toBe(201);
    const created = await request(app).post("/api/admin/discounts").set("Cookie", cookie)
      .send({ ...base, name: "  خصم العيد 20%  ", value: "20", collectionId: collection.body.collection.id,
        excludedProductIds: [excluded.product.id] });
    expect(created.status).toBe(201);
    expect(created.body.campaign.name).toBe("خصم العيد 20%");
    await campaign({ mode: "CODE", code: "BETTER", value: "60" });
    const catalog = () => request(app).get("/api/catalog/products");
    const listing = await catalog();
    expect(listing.status).toBe(200);
    const prices = new Map(listing.body.products.map(p => [p.id, p.salePrice]));
    expect(prices.get(member.product.id)).toBe("20.00");
    expect(prices.get(excluded.product.id)).toBeNull();
    expect(prices.get(outside.product.id)).toBeNull();
    const preview = await request(app).post("/api/checkout/preview").send({ items: [{ variantId: member.variant.id, quantity: 1 }] });
    expect(preview.body.checkout.cart.summary.discountAmount).toBe("5.00");
    await prisma.discountCampaign.update({ where: { id: created.body.campaign.id }, data: { endsAt: new Date(0) } });
    expect((await catalog()).body.products.every(p => p.salePrice === null)).toBe(true);
  });
  test("validates trimmed campaign name length", () => {
    expect(parseCampaign({ ...base, name: " A " }).name).toBe("A");
    expect(parseCampaign({ ...base, name: "x".repeat(80) }).name).toHaveLength(80);
    for (const name of [" ", "x".repeat(81)]) expect(() => parseCampaign({ ...base, name })).toThrow();
  });
  test("admin authorization, normalized duplicate codes, editing and history", async () => {
    const admin = await createTestUser({ role: "ADMIN" }); const user = await createTestUser({ email: "buyer@example.com" });
    expect((await request(app).get("/api/admin/discounts")).status).toBe(401);
    expect((await request(app).post("/api/admin/discounts").set("Cookie", createAuthCookie(user)).send(base)).status).toBe(403);
    const created = await request(app).post("/api/admin/discounts").set("Cookie", createAuthCookie(admin)).send({ ...base, mode: "CODE", code: "winter" });
    expect(created.status).toBe(201);
    expect(created.body.campaign.code).toBe("WINTER");
    expect((await request(app).post("/api/admin/discounts").set("Cookie", createAuthCookie(admin)).send({ ...base, mode: "CODE", code: "WINTER" })).status).toBe(409);
    const c = created.body.campaign;
    const edited = await request(app).put(`/api/admin/discounts/${c.id}`).set("Cookie", createAuthCookie(admin)).send({ ...base, mode: "CODE", code: "WINTER", active: false, updatedAt: c.updatedAt });
    expect(edited.status).toBe(200);
    expect(edited.body.campaign.active).toBe(false);
    expect((await request(app).put(`/api/admin/discounts/${c.id}`).set("Cookie", createAuthCookie(admin)).send({ ...base, updatedAt: c.updatedAt })).status).toBe(409);
    expect((await request(app).get(`/api/admin/discounts/${c.id}/redemptions`).set("Cookie", createAuthCookie(admin))).status).toBe(200);
  });
});
