import request from "supertest";
import { describe, expect, test } from "vitest";
import app from "../src/app.js";
import prisma from "../src/prisma.js";
import createAuthCookie from "./helpers/createAuthCookie.js";
import {
  createTestUser,
  TEST_ADMIN_PASSWORD,
} from "./helpers/createTestUser.js";
import { createTestOrder } from "./helpers/createCommerceFixtures.js";

async function createAdmin() {
  const admin = await createTestUser({
    fullName: "Customer Analytics Admin",
    email: "customer.analytics.admin@example.com",
    password: TEST_ADMIN_PASSWORD,
    role: "ADMIN",
  });

  return {
    admin,
    adminCookie: createAuthCookie(admin),
  };
}

describe("Admin customer analytics", () => {
  test("requires administrator authentication", async () => {
    await request(app).get("/api/admin/customers").expect(401);
  });

  test("returns customer statistics, spend ranking and governorate analytics", async () => {
    const { adminCookie } = await createAdmin();

    const alice = await createTestUser({
      fullName: "Alice Butterfly",
      email: "alice.butterfly@example.com",
    });

    const bob = await createTestUser({
      fullName: "Bob Dream",
      email: "bob.dream@example.com",
    });

    await createTestUser({
      fullName: "Suspended Customer",
      email: "suspended.customer@example.com",
      status: "SUSPENDED",
      emailVerified: false,
    });

    const aliceFirst = await createTestOrder({
      customer: alice,
      status: "DELIVERED",
      quantity: 2,
      unitPrice: "20.00",
      deliveryFee: "0.00",
    });

    const aliceSecond = await createTestOrder({
      customer: alice,
      status: "DELIVERED",
      quantity: 1,
      unitPrice: "20.00",
      deliveryFee: "0.00",
    });

    const bobDelivered = await createTestOrder({
      customer: bob,
      status: "DELIVERED",
      quantity: 2,
      unitPrice: "10.00",
      deliveryFee: "0.00",
    });

    await createTestOrder({
      customer: bob,
      status: "PENDING",
      quantity: 1,
      unitPrice: "99.00",
      deliveryFee: "0.00",
    });

    await prisma.order.update({
      where: { id: aliceFirst.order.id },
      data: { deliveryGovernorate: "North Lebanon" },
    });

    await prisma.order.update({
      where: { id: aliceSecond.order.id },
      data: { deliveryGovernorate: "North Lebanon" },
    });

    await prisma.order.update({
      where: { id: bobDelivered.order.id },
      data: { deliveryGovernorate: "Beirut" },
    });

    const response = await request(app)
      .get("/api/admin/customers?limit=20")
      .set("Cookie", adminCookie)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.summary).toMatchObject({
      totalCustomers: 3,
      activeCustomers: 2,
      suspendedCustomers: 1,
      verifiedCustomers: 2,
      customersWithOrders: 2,
      customersWithDeliveredOrders: 2,
      repeatCustomers: 1,
      lifetimeRevenue: "80.00",
      averageCustomerValue: "40.00",
    });

    expect(response.body.topCustomers[0]).toMatchObject({
      rank: 1,
      id: alice.id,
      fullName: "Alice Butterfly",
      deliveredOrders: 2,
      totalSpent: "60.00",
    });

    expect(response.body.topGovernorate).toMatchObject({
      rank: 1,
      governorate: "North Lebanon",
      deliveredOrders: 2,
      revenue: "60.00",
    });

    const aliceResult = response.body.customers.find(
      (customer) => customer.id === alice.id,
    );

    const bobResult = response.body.customers.find(
      (customer) => customer.id === bob.id,
    );

    expect(aliceResult).toMatchObject({
      deliveredOrders: 2,
      totalSpent: "60.00",
      lifetimeRank: 1,
    });

    expect(bobResult).toMatchObject({
      orderCount: 2,
      deliveredOrders: 1,
      totalSpent: "20.00",
      lifetimeRank: 2,
    });
  });

  test("supports customer search and status filtering", async () => {
    const { adminCookie } = await createAdmin();

    await createTestUser({
      fullName: "Active Customer",
      email: "active.customer@example.com",
    });

    const suspended = await createTestUser({
      fullName: "Maya Suspended",
      email: "maya.suspended@example.com",
      status: "SUSPENDED",
    });

    const response = await request(app)
      .get("/api/admin/customers?status=SUSPENDED&search=maya")
      .set("Cookie", adminCookie)
      .expect(200);

    expect(response.body.customers).toHaveLength(1);
    expect(response.body.customers[0]).toMatchObject({
      id: suspended.id,
      fullName: "Maya Suspended",
      status: "SUSPENDED",
    });
    expect(response.body.pagination.totalItems).toBe(1);
  });
});
