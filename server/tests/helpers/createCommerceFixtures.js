import { randomUUID } from "node:crypto";
import prisma from "../../src/prisma.js";

function createUniqueValue(prefix) {
  return `${prefix}-${randomUUID()
    .replaceAll("-", "")
    .slice(0, 12)
    .toLowerCase()}`;
}

export async function createTestCatalogItem({
  productName = "Butterfly Necklace",
  variantName = "Gold",
  price = "25.00",
  stock = 10,
  lowStockThreshold = 2,
  productStatus = "ACTIVE",
  categoryActive = true,
  variantActive = true,
} = {}) {
  const uniqueSuffix = createUniqueValue("test");

  const category = await prisma.category.create({
    data: {
      name: `Test Category ${uniqueSuffix}`,
      slug: `test-category-${uniqueSuffix}`,
      description: "Category created for automated integration testing.",
      isActive: categoryActive,
      displayOrder: 0,
    },
  });

  const product = await prisma.product.create({
    data: {
      categoryId: category.id,
      name: productName,
      slug: `test-product-${uniqueSuffix}`,
      description: "Product created for automated integration testing.",
      status: productStatus,
      isFeatured: false,
    },
  });

  const variant = await prisma.productVariant.create({
    data: {
      productId: product.id,
      sku: `TEST-${uniqueSuffix.toUpperCase()}`,
      displayName: variantName,

      options: {
        color: variantName,
      },

      price,
      isDefault: true,
      isActive: variantActive,
    },
  });

  const inventory = await prisma.inventory.create({
    data: {
      variantId: variant.id,
      stockQuantity: stock,
      lowStockThreshold,
    },
  });

  return {
    category,
    product,
    variant,
    inventory,
  };
}

export async function createTestAddress(userId, overrides = {}) {
  return prisma.address.create({
    data: {
      userId,
      label: "Home",
      recipientName: "Test Customer",
      phone: "+96171123456",
      governorate: "North Lebanon",
      city: "Tripoli",
      street: "Test Street",
      building: "Test Building",
      floor: "2",
      landmark: "Near Test Landmark",
      notes: null,
      isDefault: true,
      ...overrides,
    },
  });
}

export async function createTestStoreSetting(overrides = {}) {
  return prisma.storeSetting.create({
    data: {
      storeName: "Butterfly Dream Test Store",
      supportEmail: "support.test@example.com",
      supportPhone: "+96170000000",
      currency: "USD",
      defaultDeliveryFee: "3.00",
      ordersEnabled: true,
      ...overrides,
    },
  });
}

export async function createTestOrder({
  customer,
  status = "PENDING",
  paymentStatus = "UNPAID",
  quantity = 3,
  unitPrice = "25.00",
  stockAfterOrder = 7,
  deliveryFee = "3.00",
} = {}) {
  if (!customer) {
    throw new Error("createTestOrder requires a customer.");
  }

  const catalogItem = await createTestCatalogItem({
    price: unitPrice,
    stock: stockAfterOrder,
  });

  const subtotal = (Number(unitPrice) * quantity).toFixed(2);

  const totalAmount = (Number(subtotal) + Number(deliveryFee)).toFixed(2);

  const order = await prisma.order.create({
    data: {
      orderNumber: `BD-TEST-${randomUUID()
        .replaceAll("-", "")
        .slice(0, 10)
        .toUpperCase()}`,

      userId: customer.id,
      status,
      paymentMethod: "CASH_ON_DELIVERY",
      paymentStatus,
      currency: "USD",

      subtotal,
      deliveryFee,
      discountAmount: "0.00",
      totalAmount,

      customerNote: "Test order",
      adminNote: null,

      customerName: customer.fullName,

      customerEmail: customer.email,

      customerPhone: customer.phone ?? "+96171123456",

      deliveryRecipientName: customer.fullName,

      deliveryPhone: "+96171123456",

      deliveryGovernorate: "North Lebanon",

      deliveryCity: "Tripoli",

      deliveryStreet: "Test Street",

      deliveryBuilding: "Test Building",

      deliveryFloor: "2",

      deliveryLandmark: "Near Test Landmark",

      deliveryNotes: null,

      items: {
        create: {
          productId: catalogItem.product.id,

          variantId: catalogItem.variant.id,

          productName: catalogItem.product.name,

          variantName: catalogItem.variant.displayName,

          sku: catalogItem.variant.sku,

          options: catalogItem.variant.options,

          imageUrl: null,
          unitPrice,
          quantity,
          lineTotal: subtotal,
        },
      },

      statusHistory: {
        create: {
          changedByUserId: customer.id,

          fromStatus: null,
          toStatus: status,
          note: "Test order created.",
        },
      },
    },

    include: {
      items: true,
      statusHistory: true,
    },
  });

  return {
    order,
    category: catalogItem.category,
    product: catalogItem.product,
    variant: catalogItem.variant,
    inventory: catalogItem.inventory,
  };
}
