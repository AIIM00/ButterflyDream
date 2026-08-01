const storeName = process.env.STORE_NAME?.trim() || "Accessories Store";

const clientUrl = (
  process.env.CLIENT_URL?.trim() || "http://localhost:5173"
).replace(/\/+$/, "");

function escapeHtml(value) {
  const characters = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) => characters[character],
  );
}

function formatStatus(status) {
  if (!status) {
    return "Unknown";
  }

  return String(status)
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatMoney(value, currency = "USD") {
  const numericValue = Number(value ?? 0);

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(numericValue) ? numericValue : 0);
  } catch {
    return `${currency} ${
      Number.isFinite(numericValue) ? numericValue.toFixed(2) : "0.00"
    }`;
  }
}

function getOrderUrl(order) {
  return `${clientUrl}/orders/${encodeURIComponent(order.id)}`;
}

function getCustomerGreeting(order) {
  const customerName = order.customerName?.trim();

  return customerName ? `Hello ${customerName},` : "Hello,";
}

function getItemLineTotal(item) {
  if (item.lineTotal !== undefined && item.lineTotal !== null) {
    return item.lineTotal;
  }

  return Number(item.unitPrice ?? 0) * Number(item.quantity ?? 0);
}

function renderOrderItems(order) {
  const items = Array.isArray(order.items) ? order.items : [];

  if (items.length === 0) {
    return "";
  }

  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
            <div style="font-weight: 700; color: #111827;">
              ${escapeHtml(item.productName)}
            </div>

            ${
              item.variantName
                ? `
                  <div style="margin-top: 4px; font-size: 13px; color: #6b7280;">
                    ${escapeHtml(item.variantName)}
                  </div>
                `
                : ""
            }

            <div style="margin-top: 4px; font-size: 13px; color: #6b7280;">
              Quantity: ${escapeHtml(item.quantity)}
            </div>
          </td>

          <td
            align="right"
            style="padding: 14px 0; border-bottom: 1px solid #e5e7eb; font-weight: 700; color: #111827;"
          >
            ${escapeHtml(formatMoney(getItemLineTotal(item), order.currency))}
          </td>
        </tr>
      `,
    )
    .join("");

  return `
    <div style="margin-top: 28px;">
      <h2 style="margin: 0 0 10px; font-size: 18px; color: #111827;">
        Order items
      </h2>

      <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        style="border-collapse: collapse;"
      >
        ${rows}
      </table>
    </div>
  `;
}

function renderOrderSummary(order) {
  const discountAmount = Number(order.discountAmount ?? 0);

  return `
    <div
      style="margin-top: 28px; padding: 20px; background: #f9fafb; border-radius: 14px;"
    >
      <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
      >
        <tr>
          <td style="padding: 5px 0; color: #6b7280;">
            Subtotal
          </td>

          <td
            align="right"
            style="padding: 5px 0; font-weight: 600; color: #111827;"
          >
            ${escapeHtml(formatMoney(order.subtotal, order.currency))}
          </td>
        </tr>

        <tr>
          <td style="padding: 5px 0; color: #6b7280;">
            Delivery
          </td>

          <td
            align="right"
            style="padding: 5px 0; font-weight: 600; color: #111827;"
          >
            ${escapeHtml(formatMoney(order.deliveryFee, order.currency))}
          </td>
        </tr>

        ${
          discountAmount > 0
            ? `
              <tr>
                <td style="padding: 5px 0; color: #6b7280;">
                  Discount
                </td>

                <td
                  align="right"
                  style="padding: 5px 0; font-weight: 600; color: #111827;"
                >
                  -${escapeHtml(formatMoney(discountAmount, order.currency))}
                </td>
              </tr>
            `
            : ""
        }

        <tr>
          <td style="padding: 14px 0 5px; font-size: 18px; font-weight: 700; color: #111827;">
            Total
          </td>

          <td
            align="right"
            style="padding: 14px 0 5px; font-size: 20px; font-weight: 800; color: #111827;"
          >
            ${escapeHtml(formatMoney(order.totalAmount, order.currency))}
          </td>
        </tr>
      </table>
    </div>
  `;
}

function renderDeliveryAddress(order) {
  if (!order.deliveryRecipientName) {
    return "";
  }

  const addressParts = [
    order.deliveryStreet,
    order.deliveryBuilding,
    order.deliveryFloor ? `Floor ${order.deliveryFloor}` : null,
    order.deliveryCity,
    order.deliveryGovernorate,
  ].filter(Boolean);

  return `
    <div style="margin-top: 28px;">
      <h2 style="margin: 0 0 10px; font-size: 18px; color: #111827;">
        Delivery address
      </h2>

      <p style="margin: 0; font-weight: 700; color: #111827;">
        ${escapeHtml(order.deliveryRecipientName)}
      </p>

      <p style="margin: 6px 0 0; line-height: 1.7; color: #4b5563;">
        ${escapeHtml(addressParts.join(", "))}
      </p>

      ${
        order.deliveryPhone
          ? `
            <p style="margin: 6px 0 0; color: #4b5563;">
              ${escapeHtml(order.deliveryPhone)}
            </p>
          `
          : ""
      }

      ${
        order.deliveryLandmark
          ? `
            <p style="margin: 6px 0 0; color: #6b7280;">
              Landmark: ${escapeHtml(order.deliveryLandmark)}
            </p>
          `
          : ""
      }
    </div>
  `;
}

function renderEmailLayout({
  title,
  preheader,
  greeting,
  introduction,
  content,
  order,
}) {
  const orderUrl = getOrderUrl(order);

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

        <title>${escapeHtml(title)}</title>
      </head>

      <body
        style="margin: 0; padding: 0; background: #f3f4f6; font-family: Arial, Helvetica, sans-serif;"
      >
        <div
          style="display: none; max-height: 0; overflow: hidden; opacity: 0;"
        >
          ${escapeHtml(preheader)}
        </div>

        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          style="background: #f3f4f6;"
        >
          <tr>
            <td align="center" style="padding: 30px 15px;">
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                style="max-width: 640px; background: #ffffff; border-radius: 20px; overflow: hidden;"
              >
                <tr>
                  <td
                    style="padding: 26px 32px; background: #111827; color: #ffffff;"
                  >
                    <div style="font-size: 22px; font-weight: 800;">
                      ${escapeHtml(storeName)}
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 34px 32px;">
                    <p style="margin: 0; color: #4b5563;">
                      ${escapeHtml(greeting)}
                    </p>

                    <h1
                      style="margin: 16px 0 0; font-size: 30px; line-height: 1.25; color: #111827;"
                    >
                      ${escapeHtml(title)}
                    </h1>

                    <p
                      style="margin: 16px 0 0; line-height: 1.8; color: #4b5563;"
                    >
                      ${escapeHtml(introduction)}
                    </p>

                    <div
                      style="margin-top: 24px; padding: 18px; background: #f9fafb; border-radius: 14px;"
                    >
                      <div style="font-size: 13px; color: #6b7280;">
                        Order number
                      </div>

                      <div
                        style="margin-top: 6px; font-size: 18px; font-weight: 800; color: #111827;"
                      >
                        ${escapeHtml(order.orderNumber)}
                      </div>

                      <div style="margin-top: 10px; font-size: 14px; color: #6b7280;">
                        Status:
                        <strong style="color: #111827;">
                          ${escapeHtml(formatStatus(order.status))}
                        </strong>
                      </div>
                    </div>

                    ${content}

                    <div style="margin-top: 30px;">
                      <a
                        href="${escapeHtml(orderUrl)}"
                        style="display: inline-block; padding: 13px 22px; background: #111827; border-radius: 10px; color: #ffffff; text-decoration: none; font-weight: 700;"
                      >
                        View order
                      </a>
                    </div>

                    <p
                      style="margin: 32px 0 0; font-size: 13px; line-height: 1.7; color: #9ca3af;"
                    >
                      This is an automated transactional email about your
                      order.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function buildPlainText({ title, introduction, order, extraLines = [] }) {
  return [
    title,
    "",
    introduction,
    "",
    `Order number: ${order.orderNumber}`,
    `Order status: ${formatStatus(order.status)}`,
    `Payment status: ${formatStatus(order.paymentStatus)}`,
    `Total: ${formatMoney(order.totalAmount, order.currency)}`,
    ...extraLines,
    "",
    `View order: ${getOrderUrl(order)}`,
  ].join("\n");
}

export function buildOrderPlacedEmail(order) {
  const title = "We received your order";

  const introduction =
    "Your order was placed successfully and is waiting for confirmation from the store.";

  return {
    subject: `Order received — ${order.orderNumber}`,

    text: buildPlainText({
      title,
      introduction,
      order,
      extraLines: [`Payment method: ${formatStatus(order.paymentMethod)}`],
    }),

    html: renderEmailLayout({
      title,
      preheader: `We received order ${order.orderNumber}.`,
      greeting: getCustomerGreeting(order),
      introduction,
      order,
      content: `
        ${renderOrderItems(order)}
        ${renderOrderSummary(order)}
        ${renderDeliveryAddress(order)}
      `,
    }),
  };
}

export function buildOrderStatusEmail(order, note = null) {
  const statusInformation = {
    CONFIRMED: {
      title: "Your order is confirmed",
      introduction:
        "The store confirmed your order and will begin preparing it.",
    },

    PROCESSING: {
      title: "Your order is being prepared",
      introduction: "Your items are currently being prepared for delivery.",
    },

    READY_FOR_DELIVERY: {
      title: "Your order is ready for delivery",
      introduction:
        "Your order has been prepared and is ready to leave the store.",
    },

    OUT_FOR_DELIVERY: {
      title: "Your order is out for delivery",
      introduction:
        "Your order is on its way. Please keep your phone available for the courier.",
    },

    DELIVERED: {
      title: "Your order was delivered",
      introduction:
        "Your order has been marked as delivered. Thank you for shopping with us.",
    },

    RETURNED: {
      title: "Your order was returned",
      introduction:
        "Your order has been marked as returned. Contact the store if you need additional information.",
    },
  };

  const selectedInformation = statusInformation[order.status] ?? {
    title: `Order ${formatStatus(order.status)}`,
    introduction: `The status of your order is now ${formatStatus(order.status)}.`,
  };

  const noteContent = note
    ? `
      <div
        style="margin-top: 24px; padding: 16px; border-left: 4px solid #111827; background: #f9fafb; color: #4b5563; line-height: 1.7;"
      >
        ${escapeHtml(note)}
      </div>
    `
    : "";

  return {
    subject: `${selectedInformation.title} — ${order.orderNumber}`,

    text: buildPlainText({
      title: selectedInformation.title,
      introduction: selectedInformation.introduction,
      order,
      extraLines: note ? [`Update note: ${note}`] : [],
    }),

    html: renderEmailLayout({
      title: selectedInformation.title,
      preheader: `Order ${order.orderNumber}: ${formatStatus(order.status)}.`,
      greeting: getCustomerGreeting(order),
      introduction: selectedInformation.introduction,
      order,
      content: `
        ${noteContent}
        ${renderOrderSummary(order)}
      `,
    }),
  };
}

export function buildOrderCancelledEmail(order) {
  const title = "Your order was cancelled";

  const introduction =
    "Your order has been cancelled and will not be delivered.";

  const reason =
    order.cancellationReason || "No cancellation reason was provided.";

  return {
    subject: `Order cancelled — ${order.orderNumber}`,

    text: buildPlainText({
      title,
      introduction,
      order,
      extraLines: [`Cancellation reason: ${reason}`],
    }),

    html: renderEmailLayout({
      title,
      preheader: `Order ${order.orderNumber} was cancelled.`,
      greeting: getCustomerGreeting(order),
      introduction,
      order,
      content: `
        <div
          style="margin-top: 24px; padding: 18px; background: #fef2f2; border-radius: 14px; color: #991b1b;"
        >
          <strong>Cancellation reason</strong>

          <p style="margin: 8px 0 0; line-height: 1.7;">
            ${escapeHtml(reason)}
          </p>
        </div>

        ${renderOrderSummary(order)}
      `,
    }),
  };
}

export function buildPaymentStatusEmail(order, note = null) {
  const formattedPaymentStatus = formatStatus(order.paymentStatus);

  const title = `Payment status: ${formattedPaymentStatus}`;

  const introduction = `The payment status for your order is now ${formattedPaymentStatus}.`;

  const noteContent = note
    ? `
      <div
        style="margin-top: 24px; padding: 16px; background: #f9fafb; border-radius: 14px; color: #4b5563; line-height: 1.7;"
      >
        ${escapeHtml(note)}
      </div>
    `
    : "";

  return {
    subject: `Payment ${formattedPaymentStatus} — ${order.orderNumber}`,

    text: buildPlainText({
      title,
      introduction,
      order,
      extraLines: note ? [`Payment note: ${note}`] : [],
    }),

    html: renderEmailLayout({
      title,
      preheader: `Payment for ${order.orderNumber} is ${formattedPaymentStatus}.`,
      greeting: getCustomerGreeting(order),
      introduction,
      order,
      content: `
        ${noteContent}
        ${renderOrderSummary(order)}
      `,
    }),
  };
}
