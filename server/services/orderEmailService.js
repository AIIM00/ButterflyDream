import mailTransporter, { senderEmail } from "../config/mailer.js";
import {
  buildOrderCancelledEmail,
  buildOrderPlacedEmail,
  buildOrderStatusEmail,
  buildPaymentStatusEmail,
} from "../utils/orderEmailTemplates.js";

async function sendOrderEmailSafely({ eventName, order, buildEmail }) {
  const recipientEmail = order?.customerEmail?.trim();

  if (!recipientEmail) {
    console.warn(
      `[email] Skipped ${eventName} email because the customer email is missing.`,
    );

    return {
      status: "SKIPPED",
      reason: "Customer email is missing.",
    };
  }

  try {
    const email = buildEmail();

    const information = await mailTransporter.sendMail({
      from: senderEmail,
      to: recipientEmail,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });

    console.info(
      `[email] Sent ${eventName} email to ${recipientEmail} for order ${order.orderNumber}.`,
    );

    return {
      status: "SENT",
      messageId: information.messageId,
      accepted: information.accepted,
      rejected: information.rejected,
    };
  } catch (error) {
    console.error(
      `[email] Failed to send ${eventName} email for order ${
        order?.orderNumber ?? "unknown"
      }.`,
      error,
    );

    return {
      status: "FAILED",
      error,
    };
  }
}

export function sendOrderPlacedEmailSafely(order) {
  return sendOrderEmailSafely({
    eventName: "order placed",
    order,
    buildEmail: () => buildOrderPlacedEmail(order),
  });
}

export function sendOrderStatusEmailSafely(order, note = null) {
  return sendOrderEmailSafely({
    eventName: `order status ${order?.status ?? "unknown"}`,
    order,
    buildEmail: () => buildOrderStatusEmail(order, note),
  });
}

export function sendOrderCancelledEmailSafely(order) {
  return sendOrderEmailSafely({
    eventName: "order cancelled",
    order,
    buildEmail: () => buildOrderCancelledEmail(order),
  });
}

export function sendPaymentStatusEmailSafely(order, note = null) {
  return sendOrderEmailSafely({
    eventName: `payment status ${order?.paymentStatus ?? "unknown"}`,
    order,
    buildEmail: () => buildPaymentStatusEmail(order, note),
  });
}
