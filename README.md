# VENDORA — Starter Project

**Every Business Deserves Its Own Digital World.**

This is the first development version of Vendora. It includes:
- Responsive marketing landing page
- Sign-up and sign-in UI using Supabase Auth
- Business onboarding
- Private business dashboard
- Product catalogue creation, search and deletion
- Basic recent-order display
- Initial PostgreSQL schema with Row Level Security

## 1. Requirements
Install:
- Node.js (LTS version)
- Visual Studio Code

## 2. Run the project
Open this folder in VS Code. Open Terminal → New Terminal and run:

```bash
npm install
```

Then:

```bash
npm run dev
```

Open the local URL shown in the terminal (usually http://localhost:5173).

## 3. Connect Supabase
1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Copy and run `supabase/schema.sql`.
4. Open Project Settings → API.
5. Copy the Project URL and anon/public key.
6. Create a file named `.env` in the project root (same level as package.json).
7. Add:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

8. Save and restart the Vite server.

The anon/public key is designed for frontend use when Row Level Security is configured correctly. NEVER put a Supabase service-role key, Paystack secret key, or AI provider secret key in a VITE_ variable or frontend code.

## 4. Supabase authentication
In Supabase → Authentication → URL Configuration:
- Set Site URL to your local development URL while testing.
- Add your local URL to Redirect URLs.
Before production, add your real Vercel domain.

Email confirmation may be enabled by default. If enabled, confirm your email before signing in.

## 5. Current project status
This is an MVP foundation, not the complete platform described in the master prompt.

Implemented in this starter:
- Landing page and responsive design
- Supabase email/password authentication
- Business onboarding
- Business dashboard
- Add, search and delete products
- Basic stock indicators
- Basic recent-order display

Not implemented yet:
- Public published storefronts and customer checkout
- Payment processing or payment webhooks
- Vendora AI
- Real analytics and charts
- Customer Passport and loyalty
- Subscription billing
- Admin console
- Production email notifications
- Full order creation and stock reservation

Do not accept real customer payments or store sensitive customer data until these systems are implemented, tested and reviewed.

## 6. Next development milestones
1. Complete and test authentication and onboarding.
2. Add product editing, image uploads and categories.
3. Build public store pages.
4. Build cart and secure order creation.
5. Add payment provider integration on the server.
6. Add AI, analytics, loyalty and subscriptions.
7. Security review, testing and deployment.

## 7. Useful commands
```bash
npm run dev
npm run build
npm run preview
```
