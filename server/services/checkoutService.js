import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import prisma from "../src/prisma.js";

const TRANSACTION_RETRY_LIMIT = 3;

export class CheckoutServiceError extends Error {
  constructor(code, message, data = {}) {
    super(message);

    this.name = "CheckoutServiceError";

    this.code = code;
    this.data = data;
  }
}

const addressSelect = {
  id: true,
  userId: true,
  label: true,
  recipientName: true,
  phone: true,
  governorate: true,
  city: true,
  street: true,
  building: true,
  floor: true,
  landmark: true,
  notes: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
};

const checkoutVariantSelect = {
  id: true,
  productId: true,
  sku: true,
  displayName: true,
  options: true,
  price: true,
  isDefault: true,
  isActive: true,
  archivedAt: true,

  inventory: {
    select: {
      id: true,
      variantId: true,
      stockQuantity: true,
      lowStockThreshold: true,
      createdAt: true,
      updatedAt: true,
    },
  },

  images: {
    orderBy: [
      {
        isPrimary: "desc",
      },
      {
        position: "asc",
      },
    ],

    take: 1,

    select: {
      id: true,
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
        orderBy: [
          {
            isPrimary: "desc",
          },
          {
            position: "asc",
          },
        ],

        take: 1,

        select: {
          id: true,
          imageUrl: true,
          altText: true,
          isPrimary: true,
          position: true,
        },
      },
    },
  },
};

const checkoutCartSelect = {
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,

  items: {
    orderBy: {
      createdAt: "asc",
    },

    select: {
      id: true,
      cartId: true,
      variantId: true,
      quantity: true,
      unitPriceSnapshot: true,
      createdAt: true,
      updatedAt: true,

      variant: {
        select: checkoutVariantSelect,
      },
    },
  },
};

const createdOrderSelect = {
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
  totalAmount: true,

  customerNote: true,
  adminNote: true,

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

  cancelledAt: true,
  cancellationReason: true,
  deliveredAt: true,
  createdAt: true,
  updatedAt: true,

  items: {
    orderBy: {
      createdAt: "asc",
    },

    select: {
      id: true,
      orderId: true,
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

  statusHistory: {
    orderBy: {
      createdAt: "asc",
    },

    select: {
      id: true,
      changedByUserId: true,
      fromStatus: true,
      toStatus: true,
      note: true,
      createdAt: true,
    },
  },
};

function formatMoney(value) {
  return new Prisma.Decimal(value).toFixed(2);
}

function generateOrderNumber() {
  const currentDate = new Date();

  const datePart = currentDate.toISOString().slice(0, 10).replaceAll("-", "");

  const randomPart = randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();

  return `BD-${datePart}-${randomPart}`;
}

function getStoreSettings(database) {
  return database.storeSetting.findFirst({
    orderBy: {
      createdAt: "asc",
    },

    select: {
      id: true,
      storeName: true,
      currency: true,
      ordersEnabled: true,
    },
  });
}
async function findDeliveryGovernorate(database, governorateName) {
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
      id: true,
      name: true,
      deliveryFee: true,
      isActive: true,
    },
  });
}
function getCartImage(variant) {
  return variant.images[0] ?? variant.product.images[0] ?? null;
}

function getUnavailableReason(variant) {
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

function serializeCheckoutItem(item) {
  const unavailableReason = getUnavailableReason(item.variant);

  const availableStock = item.variant.inventory?.stockQuantity ?? 0;

  const priceChanged = !item.unitPriceSnapshot.equals(item.variant.price);

  const quantityAvailable = item.quantity <= availableStock;

  const lineTotal = item.variant.price.mul(item.quantity);

  return {
    id: item.id,
    variantId: item.variantId,
    quantity: item.quantity,

    product: {
      id: item.variant.product.id,

      name: item.variant.product.name,

      slug: item.variant.product.slug,

      category: item.variant.product.category,
    },

    variant: {
      id: item.variant.id,

      sku: item.variant.sku,

      displayName: item.variant.displayName,

      options: item.variant.options,
    },

    image: getCartImage(item.variant),

    unitPrice: formatMoney(item.variant.price),

    unitPriceSnapshot: formatMoney(item.unitPriceSnapshot),

    lineTotal: formatMoney(lineTotal),

    priceChanged,

    availability: {
      available: unavailableReason === null,

      reason: unavailableReason,

      availableStock,

      quantityAvailable,
    },
  };
}

function buildCheckoutSummary(
  cart,
  storeSetting,
  addresses,
  selectedAddress,
  deliveryGovernorate,
) {
  const items = cart?.items.map(serializeCheckoutItem) ?? [];

  let subtotal = new Prisma.Decimal(0);

  for (const item of items) {
    subtotal = subtotal.add(item.lineTotal);
  }

  const deliveryAvailable =
    Boolean(selectedAddress) &&
    Boolean(deliveryGovernorate) &&
    deliveryGovernorate.isActive;

  const deliveryFee = deliveryAvailable
    ? new Prisma.Decimal(deliveryGovernorate.deliveryFee)
    : new Prisma.Decimal(0);

  const totalAmount = subtotal.add(deliveryFee);

  const hasPriceChanges = items.some((item) => item.priceChanged);

  const hasUnavailableItems = items.some(
    (item) => !item.availability.available,
  );

  const hasInsufficientStock = items.some(
    (item) => !item.availability.quantityAvailable,
  );

  const defaultAddress =
    addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;

  const ordersEnabled = storeSetting?.ordersEnabled ?? true;

  const canPlaceOrder =
    ordersEnabled &&
    items.length > 0 &&
    addresses.length > 0 &&
    Boolean(selectedAddress) &&
    deliveryAvailable &&
    !hasPriceChanges &&
    !hasUnavailableItems &&
    !hasInsufficientStock;

  return {
    currency: storeSetting?.currency ?? "USD",

    ordersEnabled,

    addresses,

    defaultAddressId: defaultAddress?.id ?? null,

    selectedAddressId: selectedAddress?.id ?? null,

    delivery: {
      governorate: selectedAddress?.governorate ?? null,

      configuredGovernorate: deliveryGovernorate?.name ?? null,

      available: deliveryAvailable,

      fee: deliveryAvailable ? formatMoney(deliveryFee) : null,
    },

    cart: {
      id: cart?.id ?? null,

      items,

      summary: {
        distinctItemCount: items.length,

        totalQuantity: items.reduce((total, item) => total + item.quantity, 0),

        subtotal: formatMoney(subtotal),

        deliveryFee: deliveryAvailable ? formatMoney(deliveryFee) : null,

        discountAmount: "0.00",

        totalAmount: formatMoney(totalAmount),

        deliveryAvailable,

        hasPriceChanges,
        hasUnavailableItems,
        hasInsufficientStock,
        canPlaceOrder,
      },
    },
  };
}

function serializeCreatedOrder(order) {
  return {
    ...order,

    subtotal: formatMoney(order.subtotal),

    deliveryFee: formatMoney(order.deliveryFee),

    discountAmount: formatMoney(order.discountAmount),

    totalAmount: formatMoney(order.totalAmount),

    items: order.items.map((item) => ({
      ...item,

      unitPrice: formatMoney(item.unitPrice),

      lineTotal: formatMoney(item.lineTotal),
    })),
  };
}

function validateCheckoutCart(cart) {
  if (!cart || cart.items.length === 0) {
    throw new CheckoutServiceError("CART_EMPTY", "Your cart is empty.");
  }

  const priceChangedItems = [];
  const unavailableItems = [];
  const insufficientStockItems = [];

  for (const item of cart.items) {
    const unavailableReason = getUnavailableReason(item.variant);

    if (unavailableReason) {
      unavailableItems.push({
        cartItemId: item.id,
        variantId: item.variantId,
        productName: item.variant.product.name,
        variantName: item.variant.displayName,
        reason: unavailableReason,
      });

      continue;
    }

    if (!item.unitPriceSnapshot.equals(item.variant.price)) {
      priceChangedItems.push({
        cartItemId: item.id,
        variantId: item.variantId,
        productName: item.variant.product.name,
        variantName: item.variant.displayName,

        oldPrice: formatMoney(item.unitPriceSnapshot),

        currentPrice: formatMoney(item.variant.price),
      });
    }

    const availableStock = item.variant.inventory?.stockQuantity ?? 0;

    if (item.quantity > availableStock) {
      insufficientStockItems.push({
        cartItemId: item.id,
        variantId: item.variantId,
        productName: item.variant.product.name,
        variantName: item.variant.displayName,
        requestedQuantity: item.quantity,
        availableStock,
      });
    }
  }

  if (unavailableItems.length > 0) {
    throw new CheckoutServiceError(
      "UNAVAILABLE_ITEMS",
      "Your cart contains unavailable products.",
      {
        items: unavailableItems,
      },
    );
  }

  if (insufficientStockItems.length > 0) {
    throw new CheckoutServiceError(
      "INSUFFICIENT_STOCK",
      "One or more cart items exceed the available stock.",
      {
        items: insufficientStockItems,
      },
    );
  }

  if (priceChangedItems.length > 0) {
    throw new CheckoutServiceError(
      "PRICE_CHANGED",
      "One or more product prices have changed.",
      {
        items: priceChangedItems,
      },
    );
  }
}

async function createOrderTransaction(userId, input) {
  return prisma.$transaction(
    async (transaction) => {
      const [user, address, cart, storeSetting] = await Promise.all([
        transaction.user.findUnique({
          where: {
            id: userId,
          },

          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            deletedAt: true,
          },
        }),

        transaction.address.findFirst({
          where: {
            id: input.addressId,
            userId,
          },

          select: addressSelect,
        }),

        transaction.cart.findUnique({
          where: {
            userId,
          },

          select: checkoutCartSelect,
        }),

        getStoreSettings(transaction),
      ]);

      if (
        !user ||
        user.deletedAt ||
        user.status !== "ACTIVE" ||
        user.role !== "CUSTOMER"
      ) {
        throw new CheckoutServiceError(
          "CUSTOMER_UNAVAILABLE",
          "Your customer account is not available for checkout.",
        );
      }

      if (!storeSetting?.ordersEnabled && storeSetting) {
        throw new CheckoutServiceError(
          "ORDERS_DISABLED",
          "The store is not currently accepting orders.",
        );
      }

      if (!address) {
        throw new CheckoutServiceError(
          "ADDRESS_NOT_FOUND",
          "The selected delivery address was not found.",
        );
      }
      const deliveryGovernorate = await findDeliveryGovernorate(
        transaction,
        address.governorate,
      );

      if (!deliveryGovernorate || !deliveryGovernorate.isActive) {
        throw new CheckoutServiceError(
          "DELIVERY_GOVERNORATE_UNAVAILABLE",
          "Delivery is not currently available for the selected governorate.",
          {
            governorate: address.governorate,
          },
        );
      }

      validateCheckoutCart(cart);

      let subtotal = new Prisma.Decimal(0);

      const orderItems = cart.items.map((item) => {
        const unitPrice = item.variant.price;

        const lineTotal = unitPrice.mul(item.quantity);

        subtotal = subtotal.add(lineTotal);

        const image = getCartImage(item.variant);

        return {
          productId: item.variant.product.id,

          variantId: item.variant.id,

          productName: item.variant.product.name,

          variantName: item.variant.displayName,

          sku: item.variant.sku,

          options: item.variant.options,

          imageUrl: image?.imageUrl ?? null,

          unitPrice,

          quantity: item.quantity,

          lineTotal,
        };
      });

      for (const item of cart.items) {
        const inventoryUpdate = await transaction.inventory.updateMany({
          where: {
            variantId: item.variantId,

            stockQuantity: {
              gte: item.quantity,
            },
          },

          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });

        if (inventoryUpdate.count !== 1) {
          throw new CheckoutServiceError(
            "INSUFFICIENT_STOCK",
            "Stock changed while the order was being placed.",
            {
              items: [
                {
                  cartItemId: item.id,

                  variantId: item.variantId,

                  productName: item.variant.product.name,

                  variantName: item.variant.displayName,

                  requestedQuantity: item.quantity,

                  availableStock: item.variant.inventory?.stockQuantity ?? 0,
                },
              ],
            },
          );
        }
      }

      const deliveryFee = new Prisma.Decimal(deliveryGovernorate.deliveryFee);

      const discountAmount = new Prisma.Decimal(0);

      const totalAmount = subtotal.add(deliveryFee).sub(discountAmount);

      const orderNumber = generateOrderNumber();

      const order = await transaction.order.create({
        data: {
          orderNumber,
          userId,

          status: "PENDING",

          paymentMethod: "CASH_ON_DELIVERY",

          paymentStatus: "UNPAID",

          currency: storeSetting?.currency ?? "USD",

          subtotal,
          deliveryFee,
          discountAmount,
          totalAmount,

          customerNote: input.customerNote,

          customerName: user.fullName,

          customerEmail: user.email,

          customerPhone: user.phone ?? address.phone,

          deliveryRecipientName: address.recipientName,

          deliveryPhone: address.phone,

          deliveryGovernorate: address.governorate,

          deliveryCity: address.city,

          deliveryStreet: address.street,

          deliveryBuilding: address.building,

          deliveryFloor: address.floor,

          deliveryLandmark: address.landmark,

          deliveryNotes: address.notes,

          items: {
            create: orderItems,
          },

          statusHistory: {
            create: {
              changedByUserId: userId,

              fromStatus: null,

              toStatus: "PENDING",

              note: "Order placed by customer.",
            },
          },
        },

        select: createdOrderSelect,
      });

      await transaction.notification.create({
        data: {
          userId,
          orderId: order.id,

          type: "ORDER_PLACED",

          title: "Order received",

          message: `Your order ${order.orderNumber} has been received successfully.`,

          data: {
            orderNumber: order.orderNumber,

            status: order.status,

            totalAmount: formatMoney(order.totalAmount),
          },
        },
      });

      await transaction.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      await transaction.cart.update({
        where: {
          id: cart.id,
        },

        data: {
          updatedAt: new Date(),
        },
      });

      return {
        order: serializeCreatedOrder(order),
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,

      maxWait: 5000,
      timeout: 15000,
    },
  );
}

export async function getCustomerCheckout(userId, input = {}) {
  const [addresses, cart, storeSetting] = await Promise.all([
    prisma.address.findMany({
      where: {
        userId,
      },

      orderBy: [
        {
          isDefault: "desc",
        },
        {
          createdAt: "desc",
        },
      ],

      select: addressSelect,
    }),

    prisma.cart.findUnique({
      where: {
        userId,
      },

      select: checkoutCartSelect,
    }),

    getStoreSettings(prisma),
  ]);

  const defaultAddress =
    addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;

  let selectedAddress = defaultAddress;

  if (input.addressId) {
    selectedAddress =
      addresses.find((address) => address.id === input.addressId) ?? null;

    if (!selectedAddress) {
      throw new CheckoutServiceError(
        "ADDRESS_NOT_FOUND",
        "The selected delivery address was not found.",
      );
    }
  }

  const deliveryGovernorate = selectedAddress
    ? await findDeliveryGovernorate(prisma, selectedAddress.governorate)
    : null;

  return buildCheckoutSummary(
    cart,
    storeSetting,
    addresses,
    selectedAddress,
    deliveryGovernorate,
  );
}

export async function placeCustomerOrder(userId, input) {
  for (let attempt = 1; attempt <= TRANSACTION_RETRY_LIMIT; attempt += 1) {
    try {
      return await createOrderTransaction(userId, input);
    } catch (error) {
      const isTransactionConflict =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034";

      if (isTransactionConflict && attempt < TRANSACTION_RETRY_LIMIT) {
        continue;
      }

      if (isTransactionConflict) {
        throw new CheckoutServiceError(
          "TRANSACTION_CONFLICT",
          "The order could not be completed because inventory changed. Please try again.",
        );
      }

      throw error;
    }
  }

  throw new CheckoutServiceError(
    "TRANSACTION_CONFLICT",
    "The order could not be completed. Please try again.",
  );
}
