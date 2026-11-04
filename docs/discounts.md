# Discounts and promotions

This feature is implemented on `feature/discounts-promotions-2026-11`. Do not merge or deploy without the owner's approval.

## Behavior

- An administrator can create and edit campaigns at `/admin/discounts`, activate/deactivate them, set optional start/end times, choose percentage or fixed savings, restrict products, and assign customers to VIP codes.
- Automatic campaigns compete with the one entered public or VIP code. The server applies only the eligible campaign giving the largest savings. Equal savings use ascending campaign ID for a stable winner.
- Empty inclusions mean all products. Exclusions take precedence. Savings apply to eligible merchandise only, never delivery, and cannot exceed the eligible subtotal. Percentage savings round once to two decimals using half-up rounding.
- Codes are trimmed, uppercase, and unique. Invalid, expired, exhausted, unassigned or product-ineligible codes return the same generic message. Guest identity is never inferred from an email or a submitted user ID. VIP previews require the existing authenticated customer session; guest order endpoints never grant VIP access.
- Active campaigns run from the start timestamp (inclusive) until the end timestamp (exclusive). Admin inputs are local times converted to UTC. No scheduler process is necessary: eligibility is checked on each quote and order.
- Optional usage caps count currently consumed redemptions across guest and signed-in orders. Preview requests never consume usage. There is no per-email or per-customer usage limit.
- Codes are kept in the cart context when navigating from bag to checkout and cleared after a successful order. Changing accounts changes the context's code owner. Browser refresh does not retain an entered code.

## Data and transactions

`DiscountCampaign` stores configuration and current consumed usage. Product and VIP assignments have database foreign keys. Campaigns have no deletion endpoint.

`Order.discountSnapshot` stores campaign ID, name, code, mode, kind, configured value, eligible subtotal, and final amount at purchase. `Order.discountAmount` and `totalAmount` remain the historical financial values. Subsequent campaign edits and cancellations do not rewrite them.

`DiscountRedemption` has one unique row per order, an amount, timestamps, and an optional authenticated user ID. A restored row remains in history. The admin can inspect the latest 100 redemptions per campaign.

All three order paths re-read catalog prices and calculate discounts on the server. Usage reservation, order creation, stock decrement, and authenticated cart clearing share a serializable transaction. A conditional campaign update checks usage and campaign modification time. Existing order transaction retries handle serialization conflicts; exhausted or changed promotions fail without partial writes. Manual checkout reads account/cart inside each transaction retry to prevent duplicate orders from a previously loaded cart.

Cancellation takes a row lock before inspecting order status. Status and payment transitions use the same row lock. Only the cancellation winner restores stock, claims the redemption's `restoredAt = NULL` marker, decrements consumed usage, and records status history, all in one transaction. Repeated or concurrent cancellations return the existing cancelled order. Existing cancellable statuses are PENDING, CONFIRMED, PROCESSING, READY_FOR_DELIVERY, and OUT_FOR_DELIVERY. DELIVERED/RETURNED orders do not restore usage.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/admin/discounts` | List latest 500 campaigns and assignments |
| GET | `/api/admin/discounts/options` | Product/customer selectors |
| POST | `/api/admin/discounts` | Create campaign |
| PUT | `/api/admin/discounts/:id` | Replace campaign configuration; requires last read `updatedAt` |
| GET | `/api/admin/discounts/:id/redemptions` | Latest 100 redemptions |

All admin endpoints use existing authentication, ADMIN role, completed-password-change enforcement, and admin rate limits. Campaign updates reject stale versions and limits below current usage. Client input cannot set usage counters.

The existing checkout preview/query and order endpoints accept an optional `code`. Only `/api/checkout/preview` permits optional authentication. It validates a supplied session with the existing authentication middleware; it never trusts a body user ID. Existing price and availability checks remain in force.

## Migration and verification

The additive migration is `server/prisma/migrations/20261104230000_add_discount_campaigns/migration.sql`. Existing order totals are unchanged and old orders have a null snapshot. It adds enums, tables, assignment relations, indexes, foreign keys, and check constraints for money, schedules, usage, and normalized codes.

After approval, apply using the existing deployment migration procedure (`npm run db:deploy` in `server`) before serving the new backend. Do not run `migrate dev` or reset a production database. Rollback should disable campaigns and roll back application code; retain the additive tables and historical data.

Run the existing PostgreSQL test workflow (`npm run test:db:migrate`, then `npm test` from `server`). `tests/discounts.test.js` covers calculations, schedule boundaries, caps, VIP access, product scope, all three checkout paths, history, authorization, failed-order rollback, duplicate manual checkout, competing final redemptions, and concurrent/repeated cancellation. Client checks: `npm run lint` and `npm run build` from `client`.

## Specification provenance

The earlier Phase 1/2 discussions were not available in the continuation session. This implementation follows the requirements in the user's continuation request; the behavior above records implementation assumptions for review, especially cancellation eligibility, merchandise-only savings, usage-cap semantics, invalid-code handling, and tie-breaking.
