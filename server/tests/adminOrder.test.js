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

import { app } from "../src/index.js";
import prisma from "../src/prisma.js";
import createAuthCookie from "./helpers/createAuthCookie.js";
import {
  createTestUser,
  TEST_ADMIN_PASSWORD,
} from "./helpers/createTestUser.js";
import { createTestOrder } from "./helpers/createCommerceFixtures.js";

async function createCustomerAndAdmin() {
  const customer = await createTestUser({
    fullName: "Order Customer",
    email: "order.customer@example.com",
  });

  const admin = await createTestUser({
    fullName: "Order Administrator",
    email: "order.admin@example.com",
    password: TEST_ADMIN_PASSWORD,
    role: "ADMIN",
  });

  return {
    customer,
    admin,
    adminCookie: createAuthCookie(admin),
  };
}

describe("Admin order status transitions", () => {
  test("admin cannot skip required order statuses", async () => {
    const { customer, adminCookie } = await createCustomerAndAdmin();

    const { order } = await createTestOrder({
      customer,
      status: "PENDING",
    });

    const response = await request(app)
      .patch(`/api/admin/orders/${order.id}/status`)
      .set("Cookie", adminCookie)
      .send({
        status: "PROCESSING",
        note: "Trying to skip confirmation.",
      })
      .expect(409);

    expect(response.body).toMatchObject({
      success: false,
      currentStatus: "PENDING",
      requestedStatus: "PROCESSING",
      allowedStatuses: ["CONFIRMED"],
    });

    const storedOrder = await prisma.order.findUnique({
      where: {
        id: order.id,
      },
    });

    expect(storedOrder.status).toBe("PENDING");

    const historyCount = await prisma.orderStatusHistory.count({
      where: {
        orderId: order.id,
      },
    });

    expect(historyCount).toBe(1);
  });

  test("admin can move an order through delivery and return it", async () => {
    const { customer, admin, adminCookie } = await createCustomerAndAdmin();

    const { order, variant } = await createTestOrder({
      customer,
      quantity: 3,
      stockAfterOrder: 7,
    });

    const transitions = [
      "CONFIRMED",
      "PROCESSING",
      "READY_FOR_DELIVERY",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ];

    for (const status of transitions) {
      const response = await request(app)
        .patch(`/api/admin/orders/${order.id}/status`)
        .set("Cookie", adminCookie)
        .send({
          status,
          note: `Moved to ${status}.`,
        })
        .expect(200);

      expect(response.body.order.status).toBe(status);
    }

    const deliveredOrder = await prisma.order.findUnique({
      where: {
        id: order.id,
      },
    });

    expect(deliveredOrder.status).toBe("DELIVERED");

    expect(deliveredOrder.deliveredAt).toBeInstanceOf(Date);

    const inventoryBeforeReturn = await prisma.inventory.findUnique({
      where: {
        variantId: variant.id,
      },
    });

    expect(inventoryBeforeReturn.stockQuantity).toBe(7);

    const returnResponse = await request(app)
      .patch(`/api/admin/orders/${order.id}/status`)
      .set("Cookie", adminCookie)
      .send({
        status: "RETURNED",
        note: "Customer returned the order.",
      })
      .expect(200);

    expect(returnResponse.body.order.status).toBe("RETURNED");

    const inventoryAfterReturn = await prisma.inventory.findUnique({
      where: {
        variantId: variant.id,
      },
    });

    expect(inventoryAfterReturn.stockQuantity).toBe(10);

    const history = await prisma.orderStatusHistory.findMany({
      where: {
        orderId: order.id,
      },

      orderBy: {
        createdAt: "asc",
      },
    });

    expect(history).toHaveLength(7);

    expect(history.at(-1)).toMatchObject({
      changedByUserId: admin.id,
      fromStatus: "DELIVERED",
      toStatus: "RETURNED",
      note: "Customer returned the order.",
    });

    const statusNotifications = await prisma.notification.findMany({
      where: {
        orderId: order.id,
      },
    });

    expect(statusNotifications).toHaveLength(6);
  });

  test("cancelling an order restores inventory only once", async () => {
    const { customer, adminCookie } = await createCustomerAndAdmin();

    const { order, variant } = await createTestOrder({
      customer,
      quantity: 3,
      stockAfterOrder: 7,
    });

    const firstResponse = await request(app)
      .patch(`/api/admin/orders/${order.id}/cancel`)
      .set("Cookie", adminCookie)
      .send({
        reason: "Customer requested cancellation.",
      })
      .expect(200);

    expect(firstResponse.body).toMatchObject({
      success: true,
      message: "Order cancelled successfully.",
    });

    expect(firstResponse.body.order).toMatchObject({
      status: "CANCELLED",
      cancellationReason: "Customer requested cancellation.",
    });

    const inventoryAfterFirstCancellation = await prisma.inventory.findUnique({
      where: {
        variantId: variant.id,
      },
    });

    expect(inventoryAfterFirstCancellation.stockQuantity).toBe(10);

    const secondResponse = await request(app)
      .patch(`/api/admin/orders/${order.id}/cancel`)
      .set("Cookie", adminCookie)
      .send({
        reason: "Repeated cancellation request.",
      })
      .expect(200);

    expect(secondResponse.body.message).toBe("Order is already cancelled.");

    const inventoryAfterSecondCancellation = await prisma.inventory.findUnique({
      where: {
        variantId: variant.id,
      },
    });

    expect(inventoryAfterSecondCancellation.stockQuantity).toBe(10);

    const cancellationHistoryCount = await prisma.orderStatusHistory.count({
      where: {
        orderId: order.id,
        toStatus: "CANCELLED",
      },
    });

    expect(cancellationHistoryCount).toBe(1);

    const cancellationNotificationCount = await prisma.notification.count({
      where: {
        orderId: order.id,
        type: "ORDER_CANCELLED",
      },
    });

    expect(cancellationNotificationCount).toBe(1);
  });

  test("a delivered order cannot be cancelled", async () => {
    const { customer, adminCookie } = await createCustomerAndAdmin();

    const { order, variant } = await createTestOrder({
      customer,
      status: "DELIVERED",
      quantity: 2,
      stockAfterOrder: 8,
    });

    const response = await request(app)
      .patch(`/api/admin/orders/${order.id}/cancel`)
      .set("Cookie", adminCookie)
      .send({
        reason: "Cancellation attempted too late.",
      })
      .expect(409);

    expect(response.body).toMatchObject({
      success: false,
      currentStatus: "DELIVERED",
    });

    const inventory = await prisma.inventory.findUnique({
      where: {
        variantId: variant.id,
      },
    });

    expect(inventory.stockQuantity).toBe(8);
  });
});

describe("Admin payment transitions", () => {
  test("admin cannot move directly from UNPAID to REFUNDED", async () => {
    const { customer, adminCookie } = await createCustomerAndAdmin();

    const { order } = await createTestOrder({
      customer,
      paymentStatus: "UNPAID",
    });

    const response = await request(app)
      .patch(`/api/admin/orders/${order.id}/payment`)
      .set("Cookie", adminCookie)
      .send({
        paymentStatus: "REFUNDED",
        note: "Invalid direct refund.",
      })
      .expect(409);

    expect(response.body).toMatchObject({
      success: false,
      currentPaymentStatus: "UNPAID",
      requestedPaymentStatus: "REFUNDED",
    });

    expect(response.body.allowedPaymentStatuses).toEqual(
      expect.arrayContaining(["PAID", "FAILED"]),
    );
  });

  test("admin can mark payment as paid and then refunded", async () => {
    const { customer, adminCookie } = await createCustomerAndAdmin();

    const { order } = await createTestOrder({
      customer,
      paymentStatus: "UNPAID",
    });

    const paidResponse = await request(app)
      .patch(`/api/admin/orders/${order.id}/payment`)
      .set("Cookie", adminCookie)
      .send({
        paymentStatus: "PAID",
        note: "Cash collected.",
      })
      .expect(200);

    expect(paidResponse.body.order.paymentStatus).toBe("PAID");

    const refundResponse = await request(app)
      .patch(`/api/admin/orders/${order.id}/payment`)
      .set("Cookie", adminCookie)
      .send({
        paymentStatus: "REFUNDED",
        note: "Payment returned to customer.",
      })
      .expect(200);

    expect(refundResponse.body.order.paymentStatus).toBe("REFUNDED");

    const storedOrder = await prisma.order.findUnique({
      where: {
        id: order.id,
      },
    });

    expect(storedOrder.paymentStatus).toBe("REFUNDED");

    const paymentNotifications = await prisma.notification.findMany({
      where: {
        orderId: order.id,
        type: "SYSTEM",
        title: "Payment status updated",
      },

      orderBy: {
        createdAt: "asc",
      },
    });

    expect(paymentNotifications).toHaveLength(2);

    expect(paymentNotifications[0].data).toMatchObject({
      paymentStatus: "PAID",
      note: "Cash collected.",
    });

    expect(paymentNotifications[1].data).toMatchObject({
      paymentStatus: "REFUNDED",
      note: "Payment returned to customer.",
    });
  });
});
