import { Prisma } from "@prisma/client";
import prisma from "../src/prisma.js";
import {
  AdminCustomerValidationError,
  parseAdminCustomerQuery,
} from "../utils/adminCustomerValidation.js";

const DAY = 86400000;
const sql = Prisma.sql;
const customers = sql`SELECT id, "fullName", email, phone, status, "createdAt" FROM "User"
  WHERE role = 'CUSTOMER' AND "deletedAt" IS NULL`;
const purchases = sql`SELECT id, "userId", COALESCE("deliveredAt","createdAt") AS purchased,
  subtotal - "discountAmount" AS net FROM "Order" WHERE status='DELIVERED' AND "paymentStatus"='PAID'`;

function day(value) {
  const date = new Date(value + "T00:00:00Z");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(+date) ||
    date.toISOString().slice(0, 10) !== value
  )
    throw new AdminCustomerValidationError("Choose valid calendar dates.");
  return date;
}

async function range(query) {
  const today = day(new Date().toISOString().slice(0, 10));
  let end = new Date(+today + DAY);
  let start;
  switch (query.period ?? "30d") {
    case "30d":
      start = new Date(+end - 30 * DAY);
      break;
    case "month":
      start = new Date(
        Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1),
      );
      break;
    case "all": {
      const [row] =
        await prisma.$queryRaw`SELECT LEAST(MIN("createdAt"),(SELECT MIN("createdAt") FROM "Order")) AS first FROM "User"`;
      start = day((row.first ?? today).toISOString().slice(0, 10));
      break;
    }
    case "custom":
      start = day(query.start);
      end = new Date(+day(query.end) + DAY);
      if (start >= end || end > +today + DAY)
        throw new AdminCustomerValidationError(
          "Choose a past or current date range.",
        );
      break;
    default:
      throw new AdminCustomerValidationError("Unknown date period.");
  }
  return { start, end };
}

export async function customerMetrics(query) {
  const { start, end } = await range(query);
  const length = +end - +start;
  const windows = [{ key: "current", start, end }];
  if (query.period !== "all")
    windows.push({
      key: "previous",
      start: new Date(+start - length),
      end: start,
    });
  // Weekly buckets for normal periods. Bound the chart size for long histories.
  const step = Math.max(7, Math.ceil(length / DAY / 12)) * DAY;
  for (let at = +start; at < +end; at += step) {
    windows.push({
      key: new Date(at).toISOString().slice(0, 10),
      start: new Date(at),
      end: new Date(Math.min(at + step, +end)),
    });
  }
  const values = windows.map(
    (w) => sql`(${w.key}::text,${w.start}::timestamp,${w.end}::timestamp)`,
  );
  const records = await prisma.$queryRaw`
    WITH windows(k,a,b) AS (VALUES ${Prisma.join(values)}), customers AS (${customers}),
    purchases AS (${purchases}), firsts AS (SELECT "userId", MIN(purchased) AS first FROM purchases GROUP BY "userId")
    SELECT w.k AS key, (SELECT COUNT(*)::int FROM customers WHERE "createdAt">=w.a AND "createdAt"<w.b) AS registrations,
      COUNT(DISTINCT c.id)::int AS buyers,
      (COUNT(DISTINCT c.id) FILTER (WHERE f.first<w.a))::int AS returning,
      (COUNT(p.id) FILTER (WHERE p."userId" IS NULL))::int AS guests,
      COALESCE(ROUND(AVG(p.net),2),0)::float8 AS average
    FROM windows w LEFT JOIN purchases p ON p.purchased>=w.a AND p.purchased<w.b
    LEFT JOIN customers c ON c.id=p."userId" LEFT JOIN firsts f ON f."userId"=c.id
    GROUP BY w.k,w.a,w.b ORDER BY w.a,w.k`;
  return {
    current: records.find((r) => r.key === "current"),
    previous: records.find((r) => r.key === "previous") ?? null,
    series: records.filter((r) => r.key !== "current" && r.key !== "previous"),
  };
}

export async function customerDirectory(query) {
  const { start, end } = await range(query);
  const {
    page,
    search = "",
    status,
  } = parseAdminCustomerQuery({
    page: query.page,
    search: query.search,
    status: query.status,
  });
  const sort = query.rank ?? "spend";
  if (!["spend", "items"].includes(sort))
    throw new AdminCustomerValidationError("Unknown ranking.");
  const activity = {
    all: sql`TRUE`,
    buying: sql`orders>0`,
    first: sql`orders>0 AND first>=${start}`,
    returning: sql`orders>0 AND first<${start}`,
    inactive: sql`lifetime>=2 AND last<CURRENT_TIMESTAMP-INTERVAL '90 days'`,
    never: sql`lifetime=0`,
    new: sql`"createdAt">=${start} AND "createdAt"<${end}`,
    vip: sql`vip`,
  };
  if (!Object.hasOwn(activity, query.activity ?? "all"))
    throw new AdminCustomerValidationError("Unknown purchase filter.");
  const term = search.toLowerCase();
  const searchFilter = search
    ? sql`(strpos(lower(c."fullName"),${term})>0 OR strpos(lower(c.email),${term})>0
    OR strpos(c.phone,${term})>0 OR EXISTS (SELECT 1 FROM "Order" o WHERE o."userId"=c.id AND strpos(lower(o."orderNumber"),${term})>0))`
    : sql`TRUE`;
  const ranked = await prisma.$queryRaw`
    WITH customers AS (${customers}), purchases AS (${purchases}),
    period_orders AS (SELECT p.*, (SELECT SUM(quantity) FROM "OrderItem" WHERE "orderId"=p.id) AS units
      FROM purchases p WHERE purchased>=${start} AND purchased<${end}),
    totals AS (SELECT "userId", SUM(net) AS spend, SUM(units) AS items, COUNT(*) AS orders FROM period_orders GROUP BY "userId"),
    history AS (SELECT "userId",MIN(purchased) AS first,MAX(purchased) AS last,COUNT(*) AS lifetime FROM purchases GROUP BY "userId"),
    directory AS (SELECT c.*,COALESCE(t.spend,0)::float8 AS spend, COALESCE(t.items,0)::int AS items,
      COALESCE(t.orders,0)::int AS orders, COALESCE(h.lifetime,0)::int AS lifetime, h.first,h.last,
      EXISTS (SELECT 1 FROM "_VIPCustomers" v JOIN "DiscountCampaign" d ON d.id=v."A" WHERE v."B"=c.id AND d.mode='VIP'
        AND d.active AND (d."startsAt" IS NULL OR d."startsAt"<=CURRENT_TIMESTAMP)
        AND (d."endsAt" IS NULL OR d."endsAt">CURRENT_TIMESTAMP)
        AND (d."maxRedemptions" IS NULL OR d."usedCount"<d."maxRedemptions")) AS vip
      FROM customers c LEFT JOIN totals t ON t."userId"=c.id LEFT JOIN history h ON h."userId"=c.id
      WHERE ${searchFilter} AND ${status ? sql`c.status::text=${status}` : sql`TRUE`})
    SELECT *,COUNT(*) OVER()::int AS matches FROM directory WHERE ${activity[query.activity ?? "all"]}
    ORDER BY ${sort === "items" ? sql`items DESC,spend DESC` : sql`spend DESC,items DESC`}, "fullName",id
    LIMIT 10 OFFSET ${(page - 1) * 10}`;
  const guests = search
    ? await prisma.order.findMany({
        where: {
          userId: null,
          OR: ["customerName", "customerEmail", "orderNumber"].map((field) => ({
            [field]: { contains: search, mode: "insensitive" },
          })),
        },
        select: { id: true, orderNumber: true, customerName: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    : [];
  return { rows: ranked, total: ranked[0]?.matches ?? 0, guests };
}
