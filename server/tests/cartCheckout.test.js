import request from "supertest";
import { describe, expect, test, vi } from "vitest";

vi.mock("../services/orderEmailService.js", () => ({
  sendOrderPlacedEmailSafely: vi.fn().mockResolvedValue({
    status: "SKIPPED",
  }),

  sendOrderStatusEmailSafely: vi.fn().mockResolvedValue({
    status: "SKIPPED",
  }),

  sendOrderCancelledEmailSafely: vi.fn().mockResolvedValue({
    status: "SKIPPED",
  }),

  sendPaymentStatusEmailSafely: vi.fn().mockResolvedValue({
    status: "SKIPPED",
  }),
}));

import app from "../src/app.js";
import prisma from "../src/prisma.js";
import createAuthCookie from "./helpers/createAuthCookie.js";
import { createTestUser } from "./helpers/createTestUser.js";
import {
  createTestAddress,
  createTestCatalogItem,
  createTestStoreSetting,
} from "./helpers/createCommerceFixtures.js";

describe("Customer cart", () => {
  test("customer can add, merge, update, and remove a cart item", async () => {
    const customer = await createTestUser();

    const { variant } = await createTestCatalogItem({
      stock: 10,
      price: "25.00",
    });

    const cookie = createAuthCookie(customer);

    const firstAddResponse = await request(app)
      .post("/api/cart/items")
      .set("Cookie", cookie)
      .send({
        variantId: variant.id,
        quantity: 2,
      })
      .expect(200);

    expect(firstAddResponse.body.cart.summary).toMatchObject({
      distinctItemCount: 1,
      totalQuantity: 2,
      subtotal: "50.00",
      canCheckout: true,
    });

    const cartItemId = firstAddResponse.body.cart.items[0].id;

    const secondAddResponse = await request(app)
      .post("/api/cart/items")
      .set("Cookie", cookie)
      .send({
        variantId: variant.id,
        quantity: 1,
      })
      .expect(200);

    expect(secondAddResponse.body.cart.summary).toMatchObject({
      distinctItemCount: 1,
      totalQuantity: 3,
      subtotal: "75.00",
    });

    expect(secondAddResponse.body.cart.items[0].quantity).toBe(3);

    const storedItemsAfterMerge = await prisma.cartItem.findMany({
      where: {
        cart: {
          userId: customer.id,
        },
      },
    });

    expect(storedItemsAfterMerge).toHaveLength(1);

    const updateResponse = await request(app)
      .patch(`/api/cart/items/${cartItemId}`)
      .set("Cookie", cookie)
      .send({
        quantity: 4,
      })
      .expect(200);

    expect(updateResponse.body.cart.items[0].quantity).toBe(4);

    expect(updateResponse.body.cart.summary.subtotal).toBe("100.00");

    const removeResponse = await request(app)
      .delete(`/api/cart/items/${cartItemId}`)
      .set("Cookie", cookie)
      .expect(200);

    expect(removeResponse.body.cart.items).toHaveLength(0);

    expect(removeResponse.body.cart.summary).toMatchObject({
      distinctItemCount: 0,
      totalQuantity: 0,
      subtotal: "0.00",
      canCheckout: false,
    });

    const inventory = await prisma.inventory.findUnique({
      where: {
        variantId: variant.id,
      },
    });

    // Cart changes must not reserve
    // or deduct stock.
    expect(inventory.stockQuantity).toBe(10);
  });

  test("cart rejects a quantity larger than available stock", async () => {
    const customer = await createTestUser();

    const { variant } = await createTestCatalogItem({
      stock: 2,
    });

    const cookie = createAuthCookie(customer);

    const response = await request(app)
      .post("/api/cart/items")
      .set("Cookie", cookie)
      .send({
        variantId: variant.id,
        quantity: 3,
      })
      .expect(409);

    expect(response.body).toMatchObject({
      success: false,
      message: "The requested quantity exceeds the available stock.",
      availableStock: 2,
    });

    const cartItemCount = await prisma.cartItem.count({
      where: {
        cart: {
          userId: customer.id,
        },
      },
    });

    expect(cartItemCount).toBe(0);
  });

  test("customer can refresh a changed product price", async () => {
    const customer = await createTestUser();

    const { variant } = await createTestCatalogItem({
      price: "25.00",
      stock: 10,
    });

    const cookie = createAuthCookie(customer);

    await request(app)
      .post("/api/cart/items")
      .set("Cookie", cookie)
      .send({
        variantId: variant.id,
        quantity: 1,
      })
      .expect(200);

    await prisma.productVariant.update({
      where: {
        id: variant.id,
      },

      data: {
        price: "30.00",
      },
    });

    const changedCartResponse = await request(app)
      .get("/api/cart")
      .set("Cookie", cookie)
      .expect(200);

    expect(changedCartResponse.body.cart.summary).toMatchObject({
      hasPriceChanges: true,
      requiresPriceConfirmation: true,
      canCheckout: false,
    });

    expect(changedCartResponse.body.cart.items[0]).toMatchObject({
      unitPrice: "30.00",
      unitPriceSnapshot: "25.00",
      priceChanged: true,
    });

    const refreshResponse = await request(app)
      .post("/api/cart/refresh-prices")
      .set("Cookie", cookie)
      .expect(200);

    expect(refreshResponse.body.cart.summary).toMatchObject({
      hasPriceChanges: false,
      requiresPriceConfirmation: false,
      canCheckout: true,
    });

    expect(refreshResponse.body.cart.items[0]).toMatchObject({
      unitPrice: "30.00",
      unitPriceSnapshot: "30.00",
      priceChanged: false,
    });
  });
});

describe("Customer checkout", () => {
  test("checkout creates an order, deducts inventory, clears the cart, and creates snapshots", async () => {
    await createTestStoreSetting({
      defaultDeliveryFee: "4.50",
    });

    const customer = await createTestUser({
      fullName: "Checkout Customer",
    });

    const address = await createTestAddress(customer.id, {
      recipientName: "Checkout Customer",
    });

    const { product, variant } = await createTestCatalogItem({
      price: "25.00",
      stock: 10,
    });

    const cookie = createAuthCookie(customer);

    await request(app)
      .post("/api/cart/items")
      .set("Cookie", cookie)
      .send({
        variantId: variant.id,
        quantity: 2,
      })
      .expect(200);

    const checkoutResponse = await request(app)
      .post("/api/checkout/orders")
      .set("Cookie", cookie)
      .send({
        addressId: address.id,
        customerNote: "Please call before delivery.",
      })
      .expect(201);

    expect(checkoutResponse.body.success).toBe(true);

    expect(checkoutResponse.body.order).toMatchObject({
      userId: customer.id,
      status: "PENDING",
      paymentMethod: "CASH_ON_DELIVERY",
      paymentStatus: "UNPAID",
      currency: "USD",
      subtotal: "50.00",
      deliveryFee: "4.50",
      discountAmount: "0.00",
      totalAmount: "54.50",
      customerNote: "Please call before delivery.",
      customerName: "Checkout Customer",
      deliveryRecipientName: "Checkout Customer",
    });

    expect(checkoutResponse.body.order.items).toHaveLength(1);

    expect(checkoutResponse.body.order.items[0]).toMatchObject({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      variantName: variant.displayName,
      sku: variant.sku,
      unitPrice: "25.00",
      quantity: 2,
      lineTotal: "50.00",
    });

    const storedInventory = await prisma.inventory.findUnique({
      where: {
        variantId: variant.id,
      },
    });

    expect(storedInventory.stockQuantity).toBe(8);

    const remainingCartItems = await prisma.cartItem.count({
      where: {
        cart: {
          userId: customer.id,
        },
      },
    });

    expect(remainingCartItems).toBe(0);

    const storedOrder = await prisma.order.findUnique({
      where: {
        id: checkoutResponse.body.order.id,
      },

      include: {
        items: true,
        statusHistory: true,
        notifications: true,
      },
    });

    expect(storedOrder).not.toBeNull();

    expect(storedOrder.items).toHaveLength(1);

    expect(storedOrder.statusHistory).toHaveLength(1);

    expect(storedOrder.statusHistory[0]).toMatchObject({
      changedByUserId: customer.id,
      fromStatus: null,
      toStatus: "PENDING",
      note: "Order placed by customer.",
    });

    expect(storedOrder.notifications).toHaveLength(1);

    expect(storedOrder.notifications[0]).toMatchObject({
      userId: customer.id,
      type: "ORDER_PLACED",
      title: "Order received",
    });
  });

  test("checkout rejects an empty cart", async () => {
    const customer = await createTestUser();

    const address = await createTestAddress(customer.id);

    const cookie = createAuthCookie(customer);

    const response = await request(app)
      .post("/api/checkout/orders")
      .set("Cookie", cookie)
      .send({
        addressId: address.id,
        customerNote: null,
      })
      .expect(400);

    expect(response.body).toMatchObject({
      success: false,
      message: "Your cart is empty.",
    });

    const orderCount = await prisma.order.count({
      where: {
        userId: customer.id,
      },
    });

    expect(orderCount).toBe(0);
  });

  test("checkout rejects changed prices without changing inventory", async () => {
    const customer = await createTestUser();

    const address = await createTestAddress(customer.id);

    const { variant } = await createTestCatalogItem({
      price: "25.00",
      stock: 10,
    });

    const cookie = createAuthCookie(customer);

    await request(app)
      .post("/api/cart/items")
      .set("Cookie", cookie)
      .send({
        variantId: variant.id,
        quantity: 2,
      })
      .expect(200);

    await prisma.productVariant.update({
      where: {
        id: variant.id,
      },

      data: {
        price: "30.00",
      },
    });

    const response = await request(app)
      .post("/api/checkout/orders")
      .set("Cookie", cookie)
      .send({
        addressId: address.id,
      })
      .expect(409);

    expect(response.body).toMatchObject({
      success: false,
      message: "One or more product prices have changed.",
    });

    expect(response.body.items).toHaveLength(1);

    expect(response.body.items[0]).toMatchObject({
      variantId: variant.id,
      oldPrice: "25.00",
      currentPrice: "30.00",
    });

    const inventory = await prisma.inventory.findUnique({
      where: {
        variantId: variant.id,
      },
    });

    expect(inventory.stockQuantity).toBe(10);

    const orderCount = await prisma.order.count();

    expect(orderCount).toBe(0);

    const cartItemCount = await prisma.cartItem.count({
      where: {
        cart: {
          userId: customer.id,
        },
      },
    });

    expect(cartItemCount).toBe(1);
  });

  test("concurrent checkout requests cannot oversell one remaining item", async () => {
    await createTestStoreSetting();

    const { variant } = await createTestCatalogItem({
      stock: 1,
      price: "25.00",
    });

    const firstCustomer = await createTestUser({
      fullName: "First Customer",
      email: "first.checkout@example.com",
    });

    const secondCustomer = await createTestUser({
      fullName: "Second Customer",
      email: "second.checkout@example.com",
    });

    const firstAddress = await createTestAddress(firstCustomer.id, {
      label: "First Home",
      recipientName: "First Customer",
    });

    const secondAddress = await createTestAddress(secondCustomer.id, {
      label: "Second Home",
      recipientName: "Second Customer",
    });

    const firstCookie = createAuthCookie(firstCustomer);

    const secondCookie = createAuthCookie(secondCustomer);

    await request(app)
      .post("/api/cart/items")
      .set("Cookie", firstCookie)
      .send({
        variantId: variant.id,
        quantity: 1,
      })
      .expect(200);

    await request(app)
      .post("/api/cart/items")
      .set("Cookie", secondCookie)
      .send({
        variantId: variant.id,
        quantity: 1,
      })
      .expect(200);

    const [firstResponse, secondResponse] = await Promise.all([
      request(app)
        .post("/api/checkout/orders")
        .set("Cookie", firstCookie)
        .send({
          addressId: firstAddress.id,
        }),

      request(app)
        .post("/api/checkout/orders")
        .set("Cookie", secondCookie)
        .send({
          addressId: secondAddress.id,
        }),
    ]);

    const statusCodes = [firstResponse.status, secondResponse.status].sort(
      (first, second) => first - second,
    );

    expect(statusCodes).toEqual([201, 409]);

    const inventory = await prisma.inventory.findUnique({
      where: {
        variantId: variant.id,
      },
    });

    expect(inventory.stockQuantity).toBe(0);

    const orderCount = await prisma.order.count({
      where: {
        items: {
          some: {
            variantId: variant.id,
          },
        },
      },
    });

    expect(orderCount).toBe(1);

    // The winning cart is cleared.
    // The losing cart keeps its item.
    const remainingCartItems = await prisma.cartItem.count({
      where: {
        variantId: variant.id,
      },
    });

    expect(remainingCartItems).toBe(1);
  });
});
