import request from "supertest";
import { describe, expect, test } from "vitest";

import app from "../src/app.js";
import prisma from "../src/prisma.js";
import createAuthCookie from "./helpers/createAuthCookie.js";
import { createTestUser } from "./helpers/createTestUser.js";

describe("Customer feedback", () => {
  test("feedback is public, editable, deletable, and can be submitted again", async () => {
    const olderCustomer = await createTestUser({
      fullName: "Older Customer",
      email: "older.feedback@example.com",
    });

    await prisma.feedback.create({
      data: {
        userId: olderCustomer.id,
        rating: 3,
        comment: "An older review.",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
      },
    });

    const customer = await createTestUser({
      fullName: "Feedback Customer",
      email: "feedback.customer@example.com",
    });

    const cookie = createAuthCookie(customer);

    const createResponse = await request(app)
      .post("/api/feedback")
      .set("Cookie", cookie)
      .send({
        rating: 5,
        comment: "A newly published review.",
      })
      .expect(201);

    const feedbackId = createResponse.body.feedback.id;

    expect(
      await prisma.feedback.count({
        where: {
          userId: customer.id,
        },
      }),
    ).toBe(1);

    const firstPublicResponse = await request(app)
      .get("/api/feedback?page=1&limit=8&sort=newest")
      .expect(200);

    expect(firstPublicResponse.body.feedbacks[0]).toMatchObject({
      id: feedbackId,
      rating: 5,
      comment: "A newly published review.",
      customerName: "Feedback C.",
    });

    const refreshedPublicResponse = await request(app)
      .get("/api/feedback?page=1&limit=8&sort=newest")
      .expect(200);

    expect(refreshedPublicResponse.body.feedbacks[0].id).toBe(feedbackId);

    await request(app)
      .post("/api/feedback")
      .set("Cookie", cookie)
      .send({
        rating: 4,
        comment: "This duplicate must not be created.",
      })
      .expect(409);

    const updateResponse = await request(app)
      .patch("/api/feedback/me")
      .set("Cookie", cookie)
      .send({
        rating: 4,
        comment: "The same review, now updated.",
      })
      .expect(200);

    expect(updateResponse.body.feedback).toMatchObject({
      id: feedbackId,
      rating: 4,
      comment: "The same review, now updated.",
    });

    expect(
      await prisma.feedback.count({
        where: {
          userId: customer.id,
        },
      }),
    ).toBe(1);

    const updatedPublicResponse = await request(app)
      .get("/api/feedback?page=1&limit=8&sort=newest")
      .expect(200);

    expect(updatedPublicResponse.body.feedbacks[0]).toMatchObject({
      id: feedbackId,
      rating: 4,
      comment: "The same review, now updated.",
    });

    await request(app).delete("/api/feedback/me").expect(401);

    const deleteResponse = await request(app)
      .delete("/api/feedback/me")
      .set("Cookie", cookie)
      .expect(200);

    expect(deleteResponse.body).toMatchObject({
      success: true,
      message: "Your feedback has been deleted.",
    });

    expect(
      await prisma.feedback.count({
        where: {
          userId: customer.id,
        },
      }),
    ).toBe(0);

    const myFeedbackAfterDelete = await request(app)
      .get("/api/feedback/me")
      .set("Cookie", cookie)
      .expect(200);

    expect(myFeedbackAfterDelete.body.feedback).toBeNull();

    const publicResponseAfterDelete = await request(app)
      .get("/api/feedback?page=1&limit=8&sort=newest")
      .expect(200);

    expect(
      publicResponseAfterDelete.body.feedbacks.some(
        (feedback) => feedback.id === feedbackId,
      ),
    ).toBe(false);
    expect(publicResponseAfterDelete.body.summary.totalFeedbacks).toBe(1);

    await request(app)
      .delete("/api/feedback/me")
      .set("Cookie", cookie)
      .expect(404);

    const recreatedResponse = await request(app)
      .post("/api/feedback")
      .set("Cookie", cookie)
      .send({
        rating: 5,
        comment: "A new review after deleting the previous one.",
      })
      .expect(201);

    expect(recreatedResponse.body.feedback.id).not.toBe(feedbackId);

    expect(
      await prisma.feedback.count({
        where: {
          userId: customer.id,
        },
      }),
    ).toBe(1);

    const publicResponseAfterRecreation = await request(app)
      .get("/api/feedback?page=1&limit=8&sort=newest")
      .expect(200);

    expect(publicResponseAfterRecreation.body.feedbacks[0]).toMatchObject({
      id: recreatedResponse.body.feedback.id,
      rating: 5,
      comment: "A new review after deleting the previous one.",
    });
  });
});
