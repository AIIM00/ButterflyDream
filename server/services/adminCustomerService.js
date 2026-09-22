import { Prisma } from "@prisma/client";
import prisma from "../src/prisma.js";

const VALID_ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "READY_FOR_DELIVERY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

function decimal(value) {
  return new Prisma.Decimal(value ?? 0);
}

function formatMoney(value) {
  return decimal(value).toFixed(2);
}

function buildCustomerWhere(filters) {
  const where = {
    role: "CUSTOMER",
    deletedAt: null,
  };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    where.OR = [
      {
        fullName: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        phone: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
    ];
  }

  return where;
}

function getCustomerOrderBy(sort) {
  switch (sort) {
    case "oldest":
      return [
        { createdAt: "asc" },
        { id: "asc" },
      ];

    case "name_asc":
      return [
        { fullName: "asc" },
        { id: "asc" },
      ];

    case "name_desc":
      return [
        { fullName: "desc" },
        { id: "asc" },
      ];

    case "newest":
    default:
      return [
        { createdAt: "desc" },
        { id: "asc" },
      ];
  }
}

function createPagination({ page, limit, totalItems }) {
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
}

function sortSpendGroups(groups) {
  return [...groups].sort((first, second) => {
    const spendComparison = decimal(second._sum.totalAmount).comparedTo(
      decimal(first._sum.totalAmount),
    );

    if (spendComparison !== 0) {
      return spendComparison;
    }

    const orderComparison =
      (second._count?._all ?? 0) - (first._count?._all ?? 0);

    if (orderComparison !== 0) {
      return orderComparison;
    }

    return String(first.userId ?? "").localeCompare(String(second.userId ?? ""));
  });
}

function sortGovernorateGroups(groups) {
  return [...groups].sort((first, second) => {
    const revenueComparison = decimal(second._sum.totalAmount).comparedTo(
      decimal(first._sum.totalAmount),
    );

    if (revenueComparison !== 0) {
      return revenueComparison;
    }

    const orderComparison =
      (second._count?._all ?? 0) - (first._count?._all ?? 0);

    if (orderComparison !== 0) {
      return orderComparison;
    }

    return first.deliveryGovernorate.localeCompare(second.deliveryGovernorate);
  });
}

export async function getAdminCustomers(filters) {
  const where = buildCustomerWhere(filters);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalItems,
    customerRecords,
    totalCustomers,
    activeCustomers,
    suspendedCustomers,
    verifiedCustomers,
    newCustomers30d,
    deliveredCustomerGroups,
    orderedCustomerGroups,
    governorateGroups,
  ] = await Promise.all([
    prisma.user.count({ where }),

    prisma.user.findMany({
      where,
      skip: filters.skip,
      take: filters.limit,
      orderBy: getCustomerOrderBy(filters.sort),
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        status: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
      },
    }),

    prisma.user.count({
      where: {
        role: "CUSTOMER",
        deletedAt: null,
      },
    }),

    prisma.user.count({
      where: {
        role: "CUSTOMER",
        deletedAt: null,
        status: "ACTIVE",
      },
    }),

    prisma.user.count({
      where: {
        role: "CUSTOMER",
        deletedAt: null,
        status: "SUSPENDED",
      },
    }),

    prisma.user.count({
      where: {
        role: "CUSTOMER",
        deletedAt: null,
        emailVerifiedAt: {
          not: null,
        },
      },
    }),

    prisma.user.count({
      where: {
        role: "CUSTOMER",
        deletedAt: null,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    }),

    prisma.order.groupBy({
      by: ["userId"],
      where: {
        userId: {
          not: null,
        },
        status: "DELIVERED",
      },
      _count: {
        _all: true,
      },
      _sum: {
        totalAmount: true,
      },
      _max: {
        createdAt: true,
      },
    }),

    prisma.order.groupBy({
      by: ["userId"],
      where: {
        userId: {
          not: null,
        },
        status: {
          in: VALID_ORDER_STATUSES,
        },
      },
      _count: {
        _all: true,
      },
    }),

    prisma.order.groupBy({
      by: ["deliveryGovernorate"],
      where: {
        status: "DELIVERED",
        deliveryGovernorate: {
          not: "",
        },
      },
      _count: {
        _all: true,
      },
      _sum: {
        totalAmount: true,
      },
    }),
  ]);

  const rankedSpendGroups = sortSpendGroups(
    deliveredCustomerGroups.filter((group) => group.userId),
  );

  const rankByCustomerId = new Map(
    rankedSpendGroups.map((group, index) => [group.userId, index + 1]),
  );

  const topCustomerGroups = rankedSpendGroups.slice(0, 5);
  const topCustomerIds = topCustomerGroups.map((group) => group.userId);

  const topCustomerRecords =
    topCustomerIds.length > 0
      ? await prisma.user.findMany({
          where: {
            id: {
              in: topCustomerIds,
            },
            role: "CUSTOMER",
            deletedAt: null,
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            status: true,
            createdAt: true,
          },
        })
      : [];

  const topCustomerById = new Map(
    topCustomerRecords.map((customer) => [customer.id, customer]),
  );

  const pageCustomerIds = customerRecords.map((customer) => customer.id);

  const [pageValidOrderGroups, pageDeliveredOrderGroups] =
    pageCustomerIds.length > 0
      ? await Promise.all([
          prisma.order.groupBy({
            by: ["userId"],
            where: {
              userId: {
                in: pageCustomerIds,
              },
              status: {
                in: VALID_ORDER_STATUSES,
              },
            },
            _count: {
              _all: true,
            },
            _max: {
              createdAt: true,
            },
          }),

          prisma.order.groupBy({
            by: ["userId"],
            where: {
              userId: {
                in: pageCustomerIds,
              },
              status: "DELIVERED",
            },
            _count: {
              _all: true,
            },
            _sum: {
              totalAmount: true,
            },
          }),
        ])
      : [[], []];

  const validOrdersByCustomerId = new Map(
    pageValidOrderGroups
      .filter((group) => group.userId)
      .map((group) => [group.userId, group]),
  );

  const deliveredOrdersByCustomerId = new Map(
    pageDeliveredOrderGroups
      .filter((group) => group.userId)
      .map((group) => [group.userId, group]),
  );

  const lifetimeRevenue = rankedSpendGroups.reduce(
    (total, group) => total.plus(decimal(group._sum.totalAmount)),
    new Prisma.Decimal(0),
  );

  const customersWithDeliveredOrders = rankedSpendGroups.length;
  const repeatCustomers = rankedSpendGroups.filter(
    (group) => (group._count?._all ?? 0) >= 2,
  ).length;

  const averageCustomerValue =
    customersWithDeliveredOrders > 0
      ? lifetimeRevenue.div(customersWithDeliveredOrders)
      : new Prisma.Decimal(0);

  const repeatCustomerRate =
    customersWithDeliveredOrders > 0
      ? (repeatCustomers / customersWithDeliveredOrders) * 100
      : 0;

  const orderedGovernorates = sortGovernorateGroups(governorateGroups);
  const totalDeliveredOrderCount = orderedGovernorates.reduce(
    (total, group) => total + (group._count?._all ?? 0),
    0,
  );

  const topCustomers = topCustomerGroups.map((group, index) => {
    const customer = topCustomerById.get(group.userId);

    return {
      rank: index + 1,
      id: group.userId,
      fullName: customer?.fullName ?? "Deleted customer",
      email: customer?.email ?? null,
      status: customer?.status ?? null,
      joinedAt: customer?.createdAt ?? null,
      deliveredOrders: group._count?._all ?? 0,
      totalSpent: formatMoney(group._sum.totalAmount),
      lastDeliveredOrderAt: group._max?.createdAt ?? null,
    };
  });

  const governorates = orderedGovernorates.slice(0, 8).map((group, index) => ({
    rank: index + 1,
    governorate: group.deliveryGovernorate,
    deliveredOrders: group._count?._all ?? 0,
    revenue: formatMoney(group._sum.totalAmount),
    orderShare:
      totalDeliveredOrderCount > 0
        ? Number(
            (((group._count?._all ?? 0) / totalDeliveredOrderCount) * 100).toFixed(
              1,
            ),
          )
        : 0,
  }));

  const customers = customerRecords.map((customer) => {
    const validOrders = validOrdersByCustomerId.get(customer.id);
    const deliveredOrders = deliveredOrdersByCustomerId.get(customer.id);

    return {
      id: customer.id,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
      emailVerified: Boolean(customer.emailVerifiedAt),
      emailVerifiedAt: customer.emailVerifiedAt,
      joinedAt: customer.createdAt,
      lastLoginAt: customer.lastLoginAt,
      orderCount: validOrders?._count?._all ?? 0,
      deliveredOrders: deliveredOrders?._count?._all ?? 0,
      totalSpent: formatMoney(deliveredOrders?._sum?.totalAmount),
      lastOrderAt: validOrders?._max?.createdAt ?? null,
      lifetimeRank: rankByCustomerId.get(customer.id) ?? null,
    };
  });

  return {
    customers,
    pagination: createPagination({
      page: filters.page,
      limit: filters.limit,
      totalItems,
    }),
    appliedFilters: {
      search: filters.search ?? null,
      status: filters.status ?? null,
      sort: filters.sort,
    },
    summary: {
      totalCustomers,
      activeCustomers,
      suspendedCustomers,
      verifiedCustomers,
      newCustomers30d,
      customersWithOrders: orderedCustomerGroups.filter((group) => group.userId)
        .length,
      customersWithDeliveredOrders,
      repeatCustomers,
      repeatCustomerRate: Number(repeatCustomerRate.toFixed(1)),
      lifetimeRevenue: formatMoney(lifetimeRevenue),
      averageCustomerValue: formatMoney(averageCustomerValue),
    },
    topCustomers,
    governorates,
    topGovernorate: governorates[0] ?? null,
    currency: "USD",
    analyticsGeneratedAt: new Date(),
  };
}
