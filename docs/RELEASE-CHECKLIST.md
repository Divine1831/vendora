# Release checklist

- [ ] Supabase project URL and anon/publishable key are configured.
- [ ] Postgres connection string is private and uses SSL.
- [ ] Database backup created before schema changes.
- [ ] Existing schema compared with `src/db/schema.ts`.
- [ ] RLS and Storage policies tested with two different user accounts.
- [ ] User A cannot read or mutate User B's workspace.
- [ ] Public store exposes only active products and non-private business fields.
- [ ] Upload rejects non-image and oversized files.
- [ ] Order API uses server-side product prices and creates pending orders only.
- [ ] Payment verification/webhooks implemented before accepting real payments.
- [ ] `npm run typecheck`, `npm run lint`, and `npm run build` pass.
- [ ] Mobile layout, keyboard navigation and form errors reviewed.
- [ ] Vercel environment variables set without committing secrets.
