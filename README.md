# Daddy SoSo Closet

A multi-branch boutique & salon management system for Daddy SoSo Closet (Tweapease & Abaam branches, Eastern Region, Ghana).

## Features

- **Public storefront** -- Landing page, per-branch product pages, salon booking
- **Staff dashboard** -- Record sales, manage inventory, print receipts
- **Admin panel** -- Products, staff, analytics, site settings, sales editing
- **SMS alerts** -- Automatic notifications on sales, restocks, and customer orders via Arkesel
- **Role-based access** -- Admin vs. staff permissions enforced via middleware and Supabase RLS

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database & Auth | Supabase (Postgres + Row Level Security) |
| Storage | Supabase Storage (product images, site assets) |
| SMS | Arkesel API |
| Styling | Tailwind CSS |
| State | Zustand |
| Hosting | Vercel |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full setup and deployment guide (Supabase, Arkesel, Vercel, DNS, and database schema).

## Project Structure

```
src/
  app/
    page.tsx              # Landing page
    tweapease/            # Tweapease branch page
    abaam/                # Abaam branch page
    salon/                # Salon booking
    auth/login/           # Staff login
    dashboard/            # Staff dashboard (sales, inventory, receipts)
    admin/                # Admin panel (products, staff, analytics, settings)
    api/                  # API routes (staff management, SMS notifications, orders)
  components/             # Shared & feature components
  lib/                    # Supabase clients, Arkesel SMS, utilities
  store/                  # Zustand auth store
middleware.ts             # Auth & role-based route protection
```
