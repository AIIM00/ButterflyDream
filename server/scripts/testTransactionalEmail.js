import "dotenv/config";
import mailTransporter, { senderEmail } from "../config/mailer.js";
import { buildOrderPlacedEmail } from "../utils/orderEmailTemplates.js";

async function testTransactionalEmail() {
  const recipientEmail =
    process.env.EMAIL_TEST_TO?.trim() || process.env.SMTP_USER?.trim();

  if (!recipientEmail) {
    throw new Error("Set EMAIL_TEST_TO or SMTP_USER in the server .env file.");
  }

  console.log("Verifying SMTP connection...");

  await mailTransporter.verify();

  console.log("SMTP connection verified.");

  const testOrder = {
    id: "transactional-email-test",
    orderNumber: "BD-TEST-0001",
    status: "PENDING",
    paymentMethod: "CASH_ON_DELIVERY",
    paymentStatus: "UNPAID",
    currency: "USD",

    subtotal: "42.00",
    deliveryFee: "3.00",
    discountAmount: "0.00",
    totalAmount: "45.00",

    customerName: "Test Customer",
    customerEmail: recipientEmail,

    deliveryRecipientName: "Test Customer",
    deliveryPhone: "+96100000000",
    deliveryGovernorate: "North Lebanon",
    deliveryCity: "Tripoli",
    deliveryStreet: "Test Street",
    deliveryBuilding: "Test Building",
    deliveryFloor: "2",
    deliveryLandmark: "Near the test landmark",

    items: [
      {
        id: "item-1",
        productName: "Butterfly Necklace",
        variantName: "Gold",
        quantity: 1,
        unitPrice: "25.00",
        lineTotal: "25.00",
      },
      {
        id: "item-2",
        productName: "Classic Bracelet",
        variantName: "Silver",
        quantity: 2,
        unitPrice: "8.50",
        lineTotal: "17.00",
      },
    ],
  };

  const email = buildOrderPlacedEmail(testOrder);

  const result = await mailTransporter.sendMail({
    from: senderEmail,
    to: recipientEmail,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });

  console.log("Transactional test email sent.");

  console.log({
    messageId: result.messageId,
    accepted: result.accepted,
    rejected: result.rejected,
  });
}

testTransactionalEmail()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Transactional email test failed:", error);

    process.exit(1);
  });
