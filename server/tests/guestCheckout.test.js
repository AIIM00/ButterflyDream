import request from "supertest";
import { describe, expect, test, vi } from "vitest";

vi.mock("../services/orderEmailService.js", () => ({
  sendOrderPlacedEmailSafely: vi.fn().mockResolvedValue({ status: "SKIPPED" }),
  sendOrderStatusEmailSafely: vi.fn().mockResolvedValue({ status: "SKIPPED" }),
  sendOrderCancelledEmailSafely: vi.fn().mockResolvedValue({ status: "SKIPPED" }),
  sendPaymentStatusEmailSafely: vi.fn().mockResolvedValue({ status: "SKIPPED" }),
}));

import app from "../src/app.js";
import prisma from "../src/prisma.js";
import createAuthCookie from "./helpers/createAuthCookie.js";
import { createTestUser } from "./helpers/createTestUser.js";
import {
  createTestCatalogItem,
  createTestDeliveryGovernorate,
  createTestStoreSetting,
} from "./helpers/createCommerceFixtures.js";

const DELIVERY_ADDRESS = {
  recipientName: "Guest Buyer",
  phone: "+96171123456",
  governorate: "North Lebanon",
  city: "Tripoli",
  street: "Mina Road",
  building: "Butterfly Building",
  floor: "2",
  landmark: "Near the sea",
  notes: "Call before delivery",
};

async function prepareCommerce() {
  await createTestStoreSetting({
    currency: "USD",
    defaultDeliveryFee: "3.00",
    ordersEnabled: true,
  });

  await createTestDeliveryGovernorate({
    name: "North Lebanon",
    deliveryFee: "4.00",
    isActive: true,
  });

  return createTestCatalogItem({
    productName: "Guest Butterfly Necklace",
    variantName: "Gold",
    price: "25.00",
    stock: 8,
  });
}

describe("Guest and manual checkout", () => {
  test("a guest can preview current prices and delivery without signing in", async () => {
    const { variant } = await prepareCommerce();

    const response = await request(app)
      .post("/api/checkout/preview")
      .send({
        items: [{ variantId: variant.id, quantity: 2 }],
        deliveryAddress: DELIVERY_ADDRESS,
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.checkout.cart.items).toHaveLength(1);
    expect(response.body.checkout.cart.summary).toMatchObject({
      subtotal: "50.00",
      deliveryFee: "4.00",
      totalAmount: "54.00",
      canPlaceOrder: true,
    });
  });

  test("a guest can place an order and inventory is reduced", async () => {
    const { variant } = await prepareCommerce();

    const response = await request(app)
      .post("/api/checkout/guest-orders")
      .send({
        items: [{ variantId: variant.id, quantity: 2 }],
        customer: {
          fullName: "Guest Buyer",
          email: "guest.buyer@example.com",
          phone: "+96171123456",
        },
        deliveryAddress: DELIVERY_ADDRESS,
        customerNote: "Gift wrap if possible",
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.checkoutMode).toBe("GUEST");
    expect(response.body.order).toMatchObject({
      userId: null,
      customerEmail: "guest.buyer@example.com",
      deliveryGovernorate: "North Lebanon",
      totalAmount: "54.00",
    });

    const storedOrder = await prisma.order.findUnique({
      where: { id: response.body.order.id },
    });
    expect(storedOrder.userId).toBeNull();

    const inventory = await prisma.inventory.findUnique({
      where: { variantId: variant.id },
    });
    expect(inventory.stockQuantity).toBe(6);
  });

  test("a signed-in customer can use a one-time manual address", async () => {
    const { variant } = await prepareCommerce();
    const customer = await createTestUser({
      fullName: "Manual Address Customer",
      email: "manual.address@example.com",
    });

    const cart = await prisma.cart.findUnique({
      where: {
        userId: customer.id,
      },
    });

    expect(cart).not.toBeNull();

    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId: variant.id,
        quantity: 1,
        unitPriceSnapshot: "25.00",
      },
    });

    const response = await request(app)
      .post("/api/checkout/manual-orders")
      .set("Cookie", createAuthCookie(customer))
      .send({
        deliveryAddress: {
          ...DELIVERY_ADDRESS,
          recipientName: customer.fullName,
        },
        customerNote: null,
      })
      .expect(201);

    expect(response.body.checkoutMode).toBe("CUSTOMER_MANUAL_ADDRESS");
    expect(response.body.order.userId).toBe(customer.id);
    expect(response.body.order.totalAmount).toBe("29.00");

    const remainingCartItems = await prisma.cartItem.count({
      where: { cartId: cart.id },
    });
    expect(remainingCartItems).toBe(0);
  });

  test("manual customer checkout still requires authentication", async () => {
    await request(app)
      .post("/api/checkout/manual-orders")
      .send({
        deliveryAddress: DELIVERY_ADDRESS,
      })
      .expect(401);
  });
});
