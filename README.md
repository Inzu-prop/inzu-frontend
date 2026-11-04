# INZU

**Property management, built for Nairobi.**

INZU is a landlord dashboard and tenant portal for managing residential and commercial properties in Kenya. Track rent collection, monitor arrears, handle maintenance, and give tenants a clean self-service experience — all in one place.

---

## What it does

- **Dashboard** — Net collection, occupancy rate, monthly trends at a glance
- **Properties & Units** — Add properties, manage units, track vacancies
- **Tenants** — Onboard tenants, send portal invites, view lease details
- **Invoices & Payments** — Auto-generate rent invoices, reconcile M-Pesa payments
- **Maintenance** — Log and track repair tickets across all units
- **Reports** — P&L, arrears aging, cashflow, period comparisons
- **Tenant Portal** — Tenants see their invoices, payment history, and raise tickets

---

## Stack

- **Next.js 15** — App Router, server + client components
- **React 19**
- **Clerk** — Authentication and organization management
- **Jotai** — Lightweight atom-based state
- **Tailwind CSS v4 and BoardUI** — semantic design tokens and source-owned components
- **VisActor** — Charts and data visualization
- **Shadcn/Radix UI** — Accessible UI primitives

---

## Getting started

```bash
npm install
npm run dev
```

Create a `.env.local` with:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
```

---

## Design

INZU follows a strict minimalist aesthetic — one focal point per screen, no decorative borders, weight-only status indicators, and a deep forest-green palette. The full design philosophy is documented in `blueprint.md`.


## Local UI preview

Set `NEXT_PUBLIC_LOCAL_PREVIEW=true` in the git-ignored `.env.local`, run
`npm run dev -- --hostname 127.0.0.1 --port 3000`, and open
<http://127.0.0.1:3000/preview>.

The preview reuses the dashboard presentation with fictional data. Navigation,
chart hover, search, record details, and adding sample properties are available.
Sample property changes are stored only in this tab's sessionStorage; use
**Reset sample data** to restore the defaults. No backend API or Clerk session
is used on preview routes. Other routes keep their normal authentication.

Preview routes return 404 outside development, without the explicit flag, or
for non-loopback request hosts. Production always disables the preview even if
the flag is accidentally set. To disable it locally, remove the flag or set it
to `false` and restart the dev server. There is no auth to reconnect before push.

Run the guard checks with `node --test tests/local-preview.test.mjs`.
