# CredoBuy — Mobile Accessories E-commerce

A production-ready, responsive e-commerce web app for **CredoBuy**, an Indian
mobile-accessories store (starting in Tamil Nadu). Built with Next.js App
Router, TypeScript (strict), Tailwind CSS v4, and a Supabase-ready data layer.

The app runs **fully on bundled dummy data** out of the box — no database or
keys required — so you can explore the entire shopping experience immediately.
Supabase and Razorpay are architected in and can be switched on later without
touching the UI.

## Quick start

```bash
npm install       # already done
npm run dev       # start the dev server
```

Then open http://localhost:3000

Other scripts:

```bash
npm run build     # production build
npm run start     # run the production build
npm run lint      # eslint
```

## What to explore

| Area | Route |
| --- | --- |
| Home (all sections) | `/` |
| Shop + filters | `/shop` |
| Category | `/category/chargers` |
| **Shop by Device** (brand → model → compatible items) | `/device` |
| Product detail | `/product/spigen-tough-armor-iphone-16-pro` |
| Search | `/search?q=charger` |
| Cart → Checkout → Order success | `/cart` |
| Track order | `/track` |
| Account (login required) | `/account` |
| Admin dashboard | `/admin` |

> Auth is in **demo mode** — any valid email + 6-char password signs you in.
> Cart, wishlist, addresses and orders persist in the browser (localStorage).

## Tech & architecture

- **Next.js 16 (App Router)** + **React 19**, TypeScript strict mode
- **Tailwind CSS v4** design system in `src/app/globals.css`
- **Zustand** (persisted) for cart, wishlist, orders, addresses, auth
- Clean folder structure:
  - `src/app` — routes (customer + `/admin`)
  - `src/components` — reusable UI, layout, product, home, account, admin
  - `src/lib` — data access (`queries.ts`), cart/order logic, payment, supabase
  - `src/data` — dummy catalog (8 categories, 12 brands, 10 device brands,
    30 models, 40 products) with realistic INR pricing
  - `src/store` — client state
  - `src/types` — shared domain types
  - `supabase/` — `schema.sql`, `rls.sql`, `seed.sql`

## Payments (mock now, Razorpay later)

Checkout depends only on the `PaymentService` interface
(`src/lib/payment/`). A `MockPaymentService` simulates a successful capture so
the full flow works today. To enable Razorpay later, implement
`RazorpayPaymentService`, set the env vars, and switch
`NEXT_PUBLIC_PAYMENT_GATEWAY=razorpay` — no checkout UI changes needed.

## Admin (`/admin`)

- **Demo mode** (no Supabase): open `/admin/login` with  
  `admin@credobuy.com` / `CredoBuy@Admin1`  
  (override via `DEMO_ADMIN_EMAIL` / `DEMO_ADMIN_PASSWORD` in `.env.local`).
- Product + banner create/edit works in demo via an in-memory store (resets on restart).
- **Supabase mode**: create an Auth user, set `public.users.role = 'admin'`, then
  sign in at `/admin/login`. Products/banners persist in the database.

## Enabling Supabase (source of truth)

**Final V1 — 20 tables** (no `inventory`; stock on `products`):

`users`, `addresses`, `categories`, `brands`, `device_brands`, `device_models`,
`products` (37 fields; images/variants/compat on the row), `banners`, `coupons`,
`reviews`, `carts`, `cart_items`, `wishlists`, `orders`, `order_items`,
`payments`, `shipments`, `distributors`, `supplier_products`,
`fast_delivery_pincodes`.

1. Create a Supabase project.
2. In the SQL editor run:
   - `supabase/schema.sql`
   - `supabase/rls.sql`
3. Create `.env.local` in the project root with:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (seed only)
   - `NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER` (WhatsApp float button)
4. Load the catalogue:
   ```bash
   npm run seed:supabase
   ```
5. Promote an Auth user:
   ```sql
   update public.users set role = 'admin' where email = 'you@credobuy.com';
   ```
6. Restart `npm run dev`.

Without Supabase env vars the app still runs on bundled demo data.
Cart / wishlist / orders stay in Zustand until wired to the matching tables.

Do **not** create demo chart tables (`demo_*`, `monthly_revenue`,
`category_sales`, `verticals`) — those stay in `src/data`.

## Notes

- Product/brand/device imagery uses self-contained SVG placeholders so the demo
  renders offline; `<SmartImage>` supports real Supabase Storage URLs as-is.
- Accessibility: skip link, focus-visible rings, semantic landmarks, labelled
  controls, keyboard-friendly menus.
- SEO: per-page metadata, Open Graph, and JSON-LD product structured data.
