import { quoteDiscount, discountSnapshot, applyDiscountToPreview, redeemDiscount } from "./discountService.js";
import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import prisma from "../src/prisma.js";

const TRANSACTION_RETRY_LIMIT = 3;

export class GuestCheckoutServiceError extends Error {
  constructor(code, message, data = {}) {
    super(message);
    this.name = "GuestCheckoutServiceError";
    this.code = code;
    this.data = data;
  }
}

const variantSelect = {
  id: true,
  productId: true,
  sku: true,
  displayName: true,
  options: true,
  price: true,
  isActive: true,
  archivedAt: true,
  inventory: {
    select: {
      stockQuantity: true,
    },
  },
  images: {
    orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
    take: 1,
    select: {
      imageUrl: true,
      altText: true,
      isPrimary: true,
      position: true,
    },
  },
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      archivedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
        },
      },
      images: {
        orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
        take: 1,
        select: {
          imageUrl: true,
          altText: true,
          isPrimary: true,
          position: true,
        },
      },
    },
  },
};

const orderSelect = {
  id: true,
  orderNumber: true,
  userId: true,
  status: true,
  paymentMethod: true,
  paymentStatus: true,
  currency: true,
  subtotal: true,
  deliveryFee: true,
  discountAmount: true,
  discountSnapshot: true,
  totalAmount: true,
  customerNote: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  deliveryRecipientName: true,
  deliveryPhone: true,
  deliveryGovernorate: true,
  deliveryCity: true,
  deliveryStreet: true,
  deliveryBuilding: true,
  deliveryFloor: true,
  deliveryLandmark: true,
  deliveryNotes: true,
  deliveredAt: true,
  cancelledAt: true,
  createdAt: true,
  items: {
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      productId: true,
      variantId: true,
      productName: true,
      variantName: true,
      sku: true,
      options: true,
      imageUrl: true,
      unitPrice: true,
      quantity: true,
      lineTotal: true,
      createdAt: true,
    },
  },
};

function money(value) {
  return new Prisma.Decimal(value ?? 0).toFixed(2);
}

function generateOrderNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();
  return `BD-${datePart}-${randomPart}`;
}

function getStoreSettings(database) {
  return database.storeSetting.findFirst({
    orderBy: { createdAt: "asc" },
    select: {
      currency: true,
      ordersEnabled: true,
    },
  });
}

function findDeliveryGovernorate(database, governorateName) {
  if (!governorateName) {
    return null;
  }

  return database.deliveryGovernorate.findFirst({
    where: {
      name: {
        equals: governorateName.trim(),
        mode: "insensitive",
      },
    },
    select: {
      name: true,
      deliveryFee: true,
      isActive: true,
    },
  });
}

function unavailableReason(variant) {
  if (variant.product.status !== "ACTIVE" || variant.product.archivedAt) {
    return "PRODUCT_UNAVAILABLE";
  }

  if (!variant.product.category.isActive) {
    return "CATEGORY_UNAVAILABLE";
  }

  if (!variant.isActive || variant.archivedAt) {
    return "VARIANT_UNAVAILABLE";
  }

  if (!variant.inventory) {
    return "INVENTORY_MISSING";
  }

  if (variant.inventory.stockQuantity <= 0) {
    return "OUT_OF_STOCK";
  }

  return null;
}

function getImage(variant) {
  return variant.images[0] ?? variant.product.images[0] ?? null;
}

async function loadVariants(database, items) {
  if (items.length === 0) {
    return [];
  }

  const variants = await database.productVariant.findMany({
    where: {
      id: {
        in: items.map((item) => item.variantId),
      },
    },
    select: variantSelect,
  });

  const byId = new Map(variants.map((variant) => [variant.id, variant]));

  return items.map((item) => ({
    ...item,
    variant: byId.get(item.variantId) ?? null,
  }));
}

function serializePreviewItem(entry) {
  const { variant, quantity, variantId } = entry;

  if (!variant) {
    return {
      id: variantId,
      variantId,
      quantity,
      product: {
        id: null,
        name: "Unavailable product",
        slug: "",
        category: null,
      },
      variant: {
        id: variantId,
        sku: "",
        displayName: "Unavailable option",
        options: {},
      },
      image: null,
      unitPrice: "0.00",
      unitPriceSnapshot: "0.00",
      lineTotal: "0.00",
      priceChanged: false,
      availability: {
        available: false,
        reason: "VARIANT_UNAVAILABLE",
        availableStock: 0,
        quantityAvailable: false,
      },
    };
  }

  const reason = unavailableReason(variant);
  const stock = variant.inventory?.stockQuantity ?? 0;
  const lineTotal = variant.price.mul(quantity);

  return {
    id: variant.id,
    variantId: variant.id,
    quantity,
    product: {
      id: variant.product.id,
      name: variant.product.name,
      slug: variant.product.slug,
      category: variant.product.category,
    },
    variant: {
      id: variant.id,
      sku: variant.sku,
      displayName: variant.displayName,
      options: variant.options,
    },
    image: getImage(variant),
    unitPrice: money(variant.price),
    unitPriceSnapshot: money(variant.price),
    lineTotal: money(lineTotal),
    priceChanged: false,
    availability: {
      available: reason === null,
      reason,
      availableStock: stock,
      quantityAvailable: quantity <= stock,
    },
  };
}

function buildPreview(entries, storeSetting, deliveryAddress, governorate) {
  const items = entries.map(serializePreviewItem);
  const subtotal = items.reduce(
    (total, item) => total.plus(item.lineTotal),
    new Prisma.Decimal(0),
  );
  const deliveryAvailable = Boolean(
    deliveryAddress && governorate && governorate.isActive,
  );
  const deliveryFee = deliveryAvailable
    ? new Prisma.Decimal(governorate.deliveryFee)
    : new Prisma.Decimal(0);
  const hasUnavailableItems = items.some(
    (item) => !item.availability.available,
  );
  const hasInsufficientStock = items.some(
    (item) => !item.availability.quantityAvailable,
  );
  const ordersEnabled = storeSetting?.ordersEnabled ?? true;

  return {
    currency: storeSetting?.currency ?? "USD",
    ordersEnabled,
    delivery: {
      governorate: deliveryAddress?.governorate ?? null,
      configuredGovernorate: governorate?.name ?? null,
      available: deliveryAvailable,
      fee: deliveryAvailable ? money(deliveryFee) : null,
    },
    cart: {
      id: null,
      items,
      summary: {
        distinctItemCount: items.length,
        totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
        subtotal: money(subtotal),
        deliveryFee: deliveryAvailable ? money(deliveryFee) : null,
        discountAmount: "0.00",
        totalAmount: money(subtotal.plus(deliveryFee)),
        deliveryAvailable,
        hasPriceChanges: false,
        hasUnavailableItems,
        hasInsufficientStock,
        canPlaceOrder:
          ordersEnabled &&
          items.length > 0 &&
          deliveryAvailable &&
          !hasUnavailableItems &&
          !hasInsufficientStock,
      },
    },
  };
}

function validateOrderEntries(entries) {
  if (entries.length === 0) {
    throw new GuestCheckoutServiceError("CART_EMPTY", "Your bag is empty.");
  }

  const unavailableItems = [];
  const insufficientStockItems = [];

  for (const entry of entries) {
    if (!entry.variant) {
      unavailableItems.push({
        variantId: entry.variantId,
        reason: "VARIANT_UNAVAILABLE",
      });
      continue;
    }

    const reason = unavailableReason(entry.variant);

    if (reason) {
      unavailableItems.push({
        variantId: entry.variantId,
        productName: entry.variant.product.name,
        variantName: entry.variant.displayName,
        reason,
      });
      continue;
    }

    const availableStock = entry.variant.inventory?.stockQuantity ?? 0;

    if (entry.quantity > availableStock) {
      insufficientStockItems.push({
        variantId: entry.variantId,
        productName: entry.variant.product.name,
        variantName: entry.variant.displayName,
        requestedQuantity: entry.quantity,
        availableStock,
      });
    }
  }

  if (unavailableItems.length > 0) {
    throw new GuestCheckoutServiceError(
      "UNAVAILABLE_ITEMS",
      "Your bag contains unavailable products.",
      { items: unavailableItems },
    );
  }

  if (insufficientStockItems.length > 0) {
    throw new GuestCheckoutServiceError(
      "INSUFFICIENT_STOCK",
      "One or more quantities exceed the available stock.",
      { items: insufficientStockItems },
    );
  }
}

function serializeOrder(order) {
  return {
    ...order,
    subtotal: money(order.subtotal),
    deliveryFee: money(order.deliveryFee),
    discountAmount: money(order.discountAmount),
    totalAmount: money(order.totalAmount),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: money(item.unitPrice),
      lineTotal: money(item.lineTotal),
    })),
  };
}

async function createManualOrderTransaction({
  userId,
  customer,
  items,
  deliveryAddress,
  customerNote,
  code,
}) {
  return prisma.$transaction(
    async (transaction) => {
      // Read the account and cart inside every retry, so concurrent submissions
      // cannot both order the same saved cart after one transaction clears it.
      if (userId) {
        const account = await transaction.user.findUnique({ where: { id: userId } });
        if (!account || account.deletedAt || account.status !== "ACTIVE" || account.role !== "CUSTOMER") {
          throw new GuestCheckoutServiceError("CUSTOMER_UNAVAILABLE", "Your customer account is not available for checkout.");
        }
        customer = { fullName: account.fullName, email: account.email, phone: account.phone ?? deliveryAddress.phone };
        const cart = await transaction.cart.findUnique({ where: { userId }, include: { items: true } });
        items = cart?.items ?? [];
      }
      const [storeSetting, entries, deliveryGovernorate] = await Promise.all([
        getStoreSettings(transaction),
        loadVariants(transaction, items),
        findDeliveryGovernorate(transaction, deliveryAddress.governorate),
      ]);

      if (storeSetting && !storeSetting.ordersEnabled) {
        throw new GuestCheckoutServiceError(
          "ORDERS_DISABLED",
          "The store is not currently accepting orders.",
        );
      }

      if (!deliveryGovernorate || !deliveryGovernorate.isActive) {
        throw new GuestCheckoutServiceError(
          "DELIVERY_GOVERNORATE_UNAVAILABLE",
          "Delivery is not currently available for the selected governorate.",
          { governorate: deliveryAddress.governorate },
        );
      }

      validateOrderEntries(entries);

      let subtotal = new Prisma.Decimal(0);
      const orderItems = entries.map(({ variant, quantity }) => {
        const lineTotal = variant.price.mul(quantity);
        subtotal = subtotal.plus(lineTotal);
        const image = getImage(variant);

        return {
          productId: variant.product.id,
          variantId: variant.id,
          productName: variant.product.name,
          variantName: variant.displayName,
          sku: variant.sku,
          options: variant.options,
          imageUrl: image?.imageUrl ?? null,
          unitPrice: variant.price,
          quantity,
          lineTotal,
        };
      });

      for (const entry of entries) {
        const inventoryUpdate = await transaction.inventory.updateMany({
          where: {
            variantId: entry.variantId,
            stockQuantity: {
              gte: entry.quantity,
            },
          },
          data: {
            stockQuantity: {
              decrement: entry.quantity,
            },
          },
        });

        if (inventoryUpdate.count !== 1) {
          throw new GuestCheckoutServiceError(
            "INSUFFICIENT_STOCK",
            "One or more quantities exceed the available stock.",
          );
        }
      }

      const deliveryFee = new Prisma.Decimal(deliveryGovernorate.deliveryFee);
      const discount = await quoteDiscount(transaction, orderItems, { code, userId });
      const discountAmount = discount?.amount ?? new Prisma.Decimal(0);
      const totalAmount = subtotal.plus(deliveryFee).minus(discountAmount);

      const order = await transaction.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          status: "PENDING",
          paymentMethod: "CASH_ON_DELIVERY",
          paymentStatus: "UNPAID",
          currency: storeSetting?.currency ?? "USD",
          subtotal,
          deliveryFee,
          discountAmount,
          ...(discount ? { discountSnapshot: discountSnapshot(discount) } : {}),
          totalAmount,
          customerNote,
          customerName: customer.fullName,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          deliveryRecipientName: deliveryAddress.recipientName,
          deliveryPhone: deliveryAddress.phone,
          deliveryGovernorate: deliveryGovernorate.name,
          deliveryCity: deliveryAddress.city,
          deliveryStreet: deliveryAddress.street,
          deliveryBuilding: deliveryAddress.building,
          deliveryFloor: deliveryAddress.floor,
          deliveryLandmark: deliveryAddress.landmark,
          deliveryNotes: deliveryAddress.notes,
          items: {
            create: orderItems,
          },
          statusHistory: {
            create: {
              changedByUserId: userId,
              fromStatus: null,
              toStatus: "PENDING",
              note: userId
                ? "Order placed by customer using a manually entered delivery address."
                : "Order placed by guest checkout.",
            },
          },
        },
        select: orderSelect,
      });

      await redeemDiscount(transaction, discount, order.id, userId);

      if (userId) {
        await transaction.cartItem.deleteMany({
          where: {
            cart: {
              userId,
            },
          },
        });
      }

      return serializeOrder(order);
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

async function withTransactionRetry(operation) {
  for (let attempt = 1; attempt <= TRANSACTION_RETRY_LIMIT; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034" &&
        attempt < TRANSACTION_RETRY_LIMIT
      ) {
        continue;
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034"
      ) {
        throw new GuestCheckoutServiceError(
          "TRANSACTION_CONFLICT",
          "Your order could not be completed because the stock changed. Please try again.",
        );
      }

      throw error;
    }
  }

  throw new GuestCheckoutServiceError(
    "TRANSACTION_CONFLICT",
    "Your order could not be completed. Please try again.",
  );
}

export async function previewFlexibleCheckout({ items, deliveryAddress, code, userId = null }) {
  const [entries, storeSetting, deliveryGovernorate] = await Promise.all([
    loadVariants(prisma, items),
    getStoreSettings(prisma),
    deliveryAddress
      ? findDeliveryGovernorate(prisma, deliveryAddress.governorate)
      : Promise.resolve(null),
  ]);

  const preview = buildPreview(
    entries,
    storeSetting,
    deliveryAddress,
    deliveryGovernorate,
  );
  const discount = await quoteDiscount(prisma, preview.cart.items.map(item => ({ productId: item.product.id, unitPrice: item.unitPrice, quantity: item.quantity })), { code, userId });
  return applyDiscountToPreview(preview, discount, code);
}

export async function placeGuestOrder(input) {
  return withTransactionRetry(() =>
    createManualOrderTransaction({
      userId: null,
      customer: input.customer,
      items: input.items,
      deliveryAddress: input.deliveryAddress,
      code: input.code,
      customerNote: input.customerNote,
    }),
  );
}

export async function placeCustomerManualOrder(userId, input) {
  return withTransactionRetry(() => createManualOrderTransaction({
    userId, code: input.code, deliveryAddress: input.deliveryAddress, customerNote: input.customerNote,
  }));
}
