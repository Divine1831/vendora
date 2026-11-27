# Vendora migration and delivery roadmap

## Existing database migrations

- `0001_vendora_core.sql` — core Vendora schema for a fresh project.
- `0002_paystack_customer_orders.sql` — payment references, customer ownership, webhook event idempotency and checkout reservation fields.
- `0003_order_fulfilment_tracking.sql` — buyer delivery address and merchant shipment tracking fields.

All migrations are source files only until reviewed and explicitly applied to the intended database. Back up production and compare the live schema before applying. Never assume the legacy Vite SQL and the current Drizzle model are identical.

## Remaining priorities

1. Complete a full local dependency install, TypeScript typecheck, ESLint and production build.
2. Verify Paystack test-mode initialization, amount/currency/reference checks, webhook signature verification, replay handling and late payment handling.
3. Run cross-account merchant and buyer authorization tests against a staging database.
4. Add a proper shipping policy: store-level delivery zones, quotes, fees, and whether shipping is paid with the order or invoiced separately.
5. Add buyer and merchant notification delivery through a configured provider, with retries and delivery logs.
6. Design vendor commission and settlement ledgers before enabling split payments or payouts. Never calculate merchant balances from mutable order status alone.
7. Add refunds, disputes, reconciliation and audit trails before production payment operations.
