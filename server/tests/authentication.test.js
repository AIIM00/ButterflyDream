import request from "supertest";
import { describe, expect, test } from "vitest";
import { app } from "../src/index.js";
import prisma from "../src/prisma.js";
import authConfig from "../config/authConfig.js";
import createAuthCookie from "./helpers/createAuthCookie.js";
import {
  createTestUser,
  TEST_ADMIN_PASSWORD,
  TEST_CUSTOMER_PASSWORD,
} from "./helpers/createTestUser.js";

describe("Authentication and authorization", () => {
  test("GET /api/health reports a connected API", async () => {
    const response = await request(app).get("/api/health").expect(200);

    expect(response.body.success).toBe(true);

    expect(response.body.database).toBe("connected");
  });

  test("customer can log in and retrieve the current user", async () => {
    const customer = await createTestUser();

    const agent = request.agent(app);

    const loginResponse = await agent
      .post("/api/auth/login")
      .send({
        email: customer.email,

        password: TEST_CUSTOMER_PASSWORD,
      })
      .expect(200);

    expect(loginResponse.body.success).toBe(true);

    expect(loginResponse.body.user).toMatchObject({
      id: customer.id,
      email: customer.email,
      role: "CUSTOMER",
    });

    const cookies = loginResponse.headers["set-cookie"];

    expect(Array.isArray(cookies)).toBe(true);

    expect(cookies.join(";")).toContain(`${authConfig.cookieName}=`);

    expect(cookies.join(";")).toContain("HttpOnly");

    const currentUserResponse = await agent.get("/api/auth/me").expect(200);

    expect(currentUserResponse.body.user).toMatchObject({
      id: customer.id,
      email: customer.email,
      role: "CUSTOMER",
    });
  });

  test("customer login rejects an incorrect password", async () => {
    await createTestUser();

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "customer.test@example.com",

        password: "IncorrectPassword123!",
      })
      .expect(401);

    expect(response.body).toMatchObject({
      success: false,
      message: "Invalid email or password.",
    });
  });

  test("protected customer route rejects a missing cookie", async () => {
    const response = await request(app)
      .get("/api/customer/addresses")
      .expect(401);

    expect(response.body).toMatchObject({
      success: false,
      message: "Authentication is required.",
    });
  });

  test("customer cannot access an admin route", async () => {
    const customer = await createTestUser();

    const cookie = createAuthCookie(customer);

    const response = await request(app)
      .get("/api/admin/dashboard")
      .set("Cookie", cookie)
      .expect(403);

    expect(response.body).toMatchObject({
      success: false,
      message: "You do not have permission to access this resource.",
    });
  });

  test("admin cannot access a customer route", async () => {
    const admin = await createTestUser({
      fullName: "Test Administrator",

      email: "admin.test@example.com",

      password: TEST_ADMIN_PASSWORD,

      role: "ADMIN",
    });

    const cookie = createAuthCookie(admin);

    const response = await request(app)
      .get("/api/customer/addresses")
      .set("Cookie", cookie)
      .expect(403);

    expect(response.body).toMatchObject({
      success: false,
      message: "You do not have permission to access this resource.",
    });
  });

  test("session becomes invalid after passwordChangedAt changes", async () => {
    const customer = await createTestUser();

    const cookie = createAuthCookie(customer);

    await request(app).get("/api/auth/me").set("Cookie", cookie).expect(200);

    await prisma.user.update({
      where: {
        id: customer.id,
      },

      data: {
        passwordChangedAt: new Date(Date.now() + 2000),
      },
    });

    const response = await request(app)
      .get("/api/auth/me")
      .set("Cookie", cookie)
      .expect(401);

    expect(response.body).toMatchObject({
      success: false,
      message: "Your password has changed. Please log in again.",
    });
  });
});
