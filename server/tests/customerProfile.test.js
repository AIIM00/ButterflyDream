import request from "supertest";
import { describe, expect, test } from "vitest";
import { app } from "../src/index.js";
import prisma from "../src/prisma.js";
import { comparePassword } from "../services/passwordService.js";
import createAuthCookie from "./helpers/createAuthCookie.js";
import {
  createTestUser,
  TEST_CUSTOMER_PASSWORD,
} from "./helpers/createTestUser.js";

describe("Customer profile", () => {
  test("authenticated customer can retrieve their profile", async () => {
    const customer = await createTestUser({
      fullName: "Ali Test",
    });

    const cookie = createAuthCookie(customer);

    const response = await request(app)
      .get("/api/customer/profile")
      .set("Cookie", cookie)
      .expect(200);

    expect(response.body.success).toBe(true);

    expect(response.body.profile).toMatchObject({
      id: customer.id,

      fullName: "Ali Test",

      email: customer.email,

      role: "CUSTOMER",
    });
  });

  test("customer can update full name and phone", async () => {
    const customer = await createTestUser();

    const cookie = createAuthCookie(customer);

    const response = await request(app)
      .patch("/api/customer/profile")
      .set("Cookie", cookie)
      .send({
        fullName: "Updated Customer",

        phone: "+961 71 123 456",
      })
      .expect(200);

    expect(response.body.profile).toMatchObject({
      fullName: "Updated Customer",

      phone: "+961 71 123 456",
    });

    const storedUser = await prisma.user.findUnique({
      where: {
        id: customer.id,
      },
    });

    expect(storedUser.fullName).toBe("Updated Customer");

    expect(storedUser.phone).toBe("+961 71 123 456");
  });

  test("password change rejects an incorrect current password", async () => {
    const customer = await createTestUser();

    const cookie = createAuthCookie(customer);

    const response = await request(app)
      .patch("/api/customer/password")
      .set("Cookie", cookie)
      .send({
        currentPassword: "WrongPassword123!",

        newPassword: "NewCustomerPassword123!",

        confirmPassword: "NewCustomerPassword123!",
      })
      .expect(400);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Current password is incorrect.");
  });

  test("password change updates the hash and invalidates the old session", async () => {
    const customer = await createTestUser();

    const oldCookie = createAuthCookie(customer);

    const newPassword = "NewCustomerPassword123!";

    const passwordResponse = await request(app)
      .patch("/api/customer/password")
      .set("Cookie", oldCookie)
      .send({
        currentPassword: TEST_CUSTOMER_PASSWORD,

        newPassword,

        confirmPassword: newPassword,
      })
      .expect(200);

    expect(passwordResponse.body).toMatchObject({
      success: true,
      requiresReauthentication: true,
    });

    const updatedUser = await prisma.user.findUnique({
      where: {
        id: customer.id,
      },

      select: {
        passwordHash: true,
        passwordChangedAt: true,
      },
    });

    expect(updatedUser.passwordChangedAt).toBeInstanceOf(Date);

    const newPasswordMatches = await comparePassword(
      newPassword,
      updatedUser.passwordHash,
    );

    expect(newPasswordMatches).toBe(true);

    await request(app).get("/api/auth/me").set("Cookie", oldCookie).expect(401);

    const securityNotification = await prisma.notification.findFirst({
      where: {
        userId: customer.id,

        type: "SYSTEM",

        title: "Password changed",
      },
    });

    expect(securityNotification).not.toBeNull();
  });
});
