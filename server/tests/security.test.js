import request from "supertest";
import { describe, expect, test } from "vitest";
import { app } from "../src/index.js";

describe("API security", () => {
  test("does not expose the Express X-Powered-By header", async () => {
    const response = await request(app).get("/api/health").expect(200);

    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  test("adds a request identifier", async () => {
    const response = await request(app).get("/api/health").expect(200);

    expect(response.headers["x-request-id"]).toBeTruthy();
  });

  test("adds common Helmet security headers", async () => {
    const response = await request(app).get("/api/health").expect(200);

    expect(response.headers["x-content-type-options"]).toBe("nosniff");

    expect(response.headers["x-frame-options"]).toBeTruthy();
  });

  test("rejects malformed JSON", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send('{"email":')
      .expect(400);

    expect(response.body).toMatchObject({
      success: false,
      message: "The request body contains invalid JSON.",
    });
  });

  test("rejects a disallowed browser origin", async () => {
    const response = await request(app)
      .get("/api/health")
      .set("Origin", "https://untrusted-example.com")
      .expect(403);

    expect(response.body).toMatchObject({
      success: false,
      message: "This website is not allowed to access the API.",
    });
  });
});
