# Phase 5 — delivery details and fulfilment tracking

## Included in this source update

- Checkout collects a Nigerian delivery phone number, street address, city and state, with an optional postal code.
- The order API validates and stores those fields server-side; the browser cannot supply a delivery fee or change the server-calculated product total.
- Merchant order cards show the delivery destination and provide a carrier, tracking-number and optional HTTPS tracking-link form when an order is moved from `processing` to `shipped`.
- The server action checks that the signed-in merchant owns the order, enforces the existing status progression, validates the tracking URL as HTTPS, and records `shipped_at` / `completed_at` timestamps.
- Customer order history displays the saved delivery destination and tracking details once the merchant marks an order shipped.
- Migration `0003_order_fulfilment_tracking.sql` adds the delivery and tracking columns without deleting or rewriting existing records.

## Explicit commercial limitation

The current checkout amount covers products only. Shipping fees are **not calculated or collected** by Vendora in this phase. The checkout tells the buyer that delivery arrangements and any delivery charges are handled directly with the merchant. Merchants must agree delivery charges with the buyer before fulfilment. Do not advertise shipping as included or automatically calculated.

## Apply and validate safely

1. Back up the target database and inspect the live `public.orders` definition first.
2. Review `0003_order_fulfilment_tracking.sql` against the live schema; apply only after approval.
3. Deploy the matching application build after the migration is applied.
4. Test a guest order and a signed-in order using Paystack test credentials.
5. Confirm the correct merchant sees the delivery address and another merchant cannot access it.
6. Move a paid order through processing and shipped; verify tracking data appears in the buyer's order history.
7. Verify invalid or non-HTTPS tracking URLs are rejected and that no status skips are possible.

## Not included

- Carrier API integrations, live shipping quotes, labels, pickup booking or delivery webhooks.
- Shipping fee calculation or payment collection.
- Email/SMS delivery notifications.
- Vendor subaccounts, commissions, split payments, refunds or payouts.
- Production database migration or deployment.

## Validation performed for this source update

- TypeScript/TSX syntax transpilation: 39 files, zero syntax diagnostics.
- `npm ci --ignore-scripts --no-audit --no-fund --prefer-offline`: timed out; no full type-check, ESLint run or Next.js production build could be completed.
- No live database, Paystack account, Vercel deployment or customer data was changed.
