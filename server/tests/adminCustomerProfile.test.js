import request from "supertest";
import { describe, expect, test } from "vitest";

import app from "../src/app.js";
import createAuthCookie from "./helpers/createAuthCookie.js";
import {
  createTestUser,
  TEST_ADMIN_PASSWORD,
} from "./helpers/createTestUser.js";
import {
  createTestAddress,
  createTestOrder,
} from "./helpers/createCommerceFixtures.js";

async function createAdmin() {
  const admin = await createTestUser({
    fullName: "Customer Profile Admin",
    email: "customer.profile.admin@example.com",
    password: TEST_ADMIN_PASSWORD,
    role: "ADMIN",
  });

  return {
    admin,
    cookie: createAuthCookie(admin),
  };
}

describe("Admin customer profile", () => {
  test("requires admin authentication", async () => {
    const customer = await createTestUser({
      fullName: "Profile Customer",
      email: "profile.customer@example.com",
    });

    await request(app)
      .get(`/api/admin/customers/${customer.id}`)
      .expect(401);
  });

  test("returns a complete customer profile with commerce analytics", async () => {
    const customer = await createTestUser({
      fullName: "Loyal Customer",
      email: "loyal.customer@example.com",
    });
    const { cookie } = await createAdmin();

    await createTestAddress(customer.id, {
      label: "Home",
      governorate: "North Lebanon",
      city: "Tripoli",
    });

    await createTestOrder({
      customer,
      status: "DELIVERED",
      paymentStatus: "PAID",
      quantity: 1,
      unitPrice: "25.00",
      deliveryFee: "3.00",
    });

    await createTestOrder({
      customer,
      status: "DELIVERED",
      paymentStatus: "PAID",
      quantity: 2,
      unitPrice: "20.00",
      deliveryFee: "3.00",
    });

    await createTestOrder({
      customer,
      status: "CANCELLED",
      paymentStatus: "UNPAID",
      quantity: 1,
      unitPrice: "100.00",
      deliveryFee: "3.00",
    });

    const response = await request(app)
      .get(`/api/admin/customers/${customer.id}`)
      .set("Cookie", cookie)
      .expect(200);

    expect(response.body).toMatchObject({
      success: true,
      customer: {
        id: customer.id,
        fullName: "Loyal Customer",
        email: "loyal.customer@example.com",
        emailVerified: true,
      },
      summary: {
        totalOrders: 3,
        deliveredOrders: 2,
        cancelledOrders: 1,
        returnedOrders: 0,
        lifetimeSpend: "71.00",
        averageOrderValue: "35.50",
        lifetimeRank: 1,
      },
      currency: "USD",
    });

    expect(response.body.addresses).toHaveLength(1);
    expect(response.body.addresses[0]).toMatchObject({
      governorate: "North Lebanon",
      city: "Tripoli",
      isDefault: true,
    });

    expect(response.body.orders).toHaveLength(3);
    expect(response.body.favoriteProducts.length).toBeGreaterThan(0);
    expect(response.body.favoriteCategories.length).toBeGreaterThan(0);
    expect(response.body.activity.length).toBeGreaterThanOrEqual(4);
  });

  test("returns 400 for an invalid customer id and 404 for a missing customer", async () => {
    const { cookie } = await createAdmin();

    await request(app)
      .get("/api/admin/customers/not-a-uuid")
      .set("Cookie", cookie)
      .expect(400);

    await request(app)
      .get("/api/admin/customers/00000000-0000-4000-8000-000000000000")
      .set("Cookie", cookie)
      .expect(404);
  });
});
