# Nutripak Admin Dashboard

A production-ready e-commerce administration dashboard for **Nutripak**, a nutrition
products brand. Built with Next.js (App Router), TypeScript, Tailwind CSS v4,
shadcn/ui, Prisma and PostgreSQL.

Cash on delivery (COD) is the only supported payment method — there are no online
payments, discounts, or courier integrations by design.

## Features

- **Authentication** — admin-only login with signed JWT sessions (httpOnly cookie),
  bcrypt password hashing, route protection via `proxy.ts` for both pages and APIs.
- **Dashboard** — key stats (revenue potential, collected COD, orders, products,
  low stock) plus the latest orders.
- **Products** — full CRUD with images, Nutripak info fields (ingredients,
  benefits, nutrition info, certifications), SKU-based slugs, activate/deactivate.
- **Categories** — CRUD with delete protection while products reference them.
- **Inventory** — stock level overview with quick stock updates; low-stock
  (≤ 10 units) and out-of-stock filters.
- **Orders** — COD order list with search/status/payment/period filters, detail
  view with inline status and COD payment-status management.
- **Customers** — contact information derived from order records.
- **Settings** — update profile, change password, theme preference.
- **Theming** — light / dark / system themes with intentionally designed palettes
  (oklch) and smooth transitions.
- **UX** — responsive layout (collapsible sidebar, mobile drawer), URL-driven
  table filters with debounced search, link-based pagination, skeleton loaders,
  confirmation dialogs for destructive actions, toast notifications, keyboard
  accessible components, skip-to-content link.

## Tech Stack

| Layer      | Choice                                              |
| ---------- | --------------------------------------------------- |
| Framework  | Next.js 16 (App Router, route handlers, proxy)       |
| Language   | TypeScript                                          |
| UI         | Tailwind CSS v4 + shadcn/ui + lucide-react           |
| Database   | PostgreSQL (Neon-ready)                              |
| ORM        | Prisma 7 with driver adapters (`@prisma/adapter-pg`) |
| Auth       | `jose` (JWT sessions) + `bcryptjs`                   |
| Validation | Zod v4 (shared by forms and API routes)              |
| Forms      | React Hook Form                                      |

## Getting Started

### 1. Prerequisites

- Node.js 20.19+ or 22.13+ (developed on Node 22)
- A PostgreSQL database (local instance or [Neon](https://neon.tech))

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in `DATABASE_URL`, generate an `AUTH_SECRET`
(`openssl rand -base64 32`), and adjust the seed admin credentials if desired.

### 4. Apply migrations

```bash
npx prisma migrate deploy
```

### 5. Seed the database

```bash
npm run db:seed
```

This creates the admin account from `SEED_ADMIN_*`, three categories, nine
placeholder products, and twelve sample COD orders covering every status.

Default development login:

```
Email:    admin@nutripak.local
Password: Admin@123
```

### 6. Run the app

```bash
npm run dev
```

Open <http://localhost:3000> — you will be redirected to `/admin/login`.

## Scripts

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start the development server          |
| `npm run build`      | Create a production build             |
| `npm start`          | Serve the production build            |
| `npm run lint`       | Run ESLint                            |
| `npx prisma studio`  | Browse the database                   |
| `npx prisma migrate deploy` | Apply pending migrations       |
| `npm run db:seed`    | Seed the database (`prisma db seed`)  |

## Project Structure

```
prisma/
  schema.prisma          # Models: Admin, Category, Product, Order…
  migrations/            # SQL migrations
  seed.ts                # Development seed data
src/
  app/
    admin/
      login/             # Login page (public)
      (dashboard)/       # Authenticated pages: overview, products,
                         # categories, inventory, orders, customers, settings
    api/
      auth/              # login / logout endpoints
      admin/             # Protected JSON APIs (products, categories,
                         # inventory, orders, profile, settings, stats)
  components/
    ui/                  # shadcn/ui primitives
    layout/              # App shell: sidebar, header, nav config
    shared/              # Table filters, pagination, dialogs, skeletons…
    products/ categories/ inventory/ orders/ dashboard/ settings/
  lib/
    auth/                # Session/token/password helpers
    prisma.ts            # Prisma client with pg adapter
    constants.ts format.ts api.ts query-params.ts
  queries/               # Server-side data access functions
  validations/           # Zod schemas shared by forms and APIs
  proxy.ts               # Route protection (Next.js proxy/middleware)
```

## Security Notes

- All `/admin` pages require a valid session cookie; unauthenticated visitors are
  redirected to the login page (preserving the intended destination).
- All `/api/admin/*` endpoints return `401` without a session and validate every
  payload with Zod.
- Passwords are hashed with bcrypt (cost 12); login responses never reveal
  whether an email exists.
- Destructive actions use confirmation dialogs; category deletion is blocked
  while products still reference it.

## Deployment Notes

- Deploy to any Node-capable host (Vercel recommended).
- Set `DATABASE_URL` (Neon connection string with `sslmode=require`) and a strong
  random `AUTH_SECRET` in the host's environment variables.
- Run `npx prisma migrate deploy` during release, then create the first admin
  account via the seed script or manually.
