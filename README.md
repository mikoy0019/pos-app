# POS System

A web-based point-of-sale app for small shops. Staff use it to ring up sales, manage products and review orders. Supabase handles sign-in and data.

**Live demo:** https://pos-app-rho-neon.vercel.app

## Features

- **Checkout screen:** product grid, cart and order completion.
- **Products:** create, edit and manage the catalogue.
- **Orders:** order history and details.
- **Authentication:** Supabase Auth with protected dashboard routes, enforced by Next.js middleware and server-side sessions (`@supabase/ssr`).
- **Server Actions** for data changes, with toast notifications (Sonner).
- Light and dark themes.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Supabase (Postgres, Auth) · Tailwind CSS 4 · shadcn/ui on Base UI · lucide-react · Vercel

## Project layout

```
src/app/(dashboard)/   checkout, products, orders (protected)
src/app/login/         sign-in
src/actions/           server actions
src/components/        pos, products, orders, layout, ui
src/lib/supabase/      browser and server clients
supabase/              database schema
middleware.ts          route protection
```

## Run locally

```bash
npm install
# .env.local: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

---

Built by [Michael Tejada](https://github.com/mikoy0019).
