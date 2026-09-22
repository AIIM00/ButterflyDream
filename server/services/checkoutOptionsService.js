import { Prisma } from "@prisma/client";
import prisma from "../src/prisma.js";

function formatMoney(value) {
  return new Prisma.Decimal(value ?? 0).toFixed(2);
}

export async function getPublicCheckoutOptions() {
  const [storeSetting, governorates] = await Promise.all([
    prisma.storeSetting.findFirst({
      orderBy: { createdAt: "asc" },
      select: {
        currency: true,
        ordersEnabled: true,
      },
    }),
    prisma.deliveryGovernorate.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ name: "asc" }, { id: "asc" }],
      select: {
        id: true,
        name: true,
        deliveryFee: true,
      },
    }),
  ]);

  return {
    currency: storeSetting?.currency ?? "USD",
    ordersEnabled: storeSetting?.ordersEnabled ?? true,
    governorates: governorates.map((governorate) => ({
      id: governorate.id,
      name: governorate.name,
      deliveryFee: formatMoney(governorate.deliveryFee),
    })),
  };
}
