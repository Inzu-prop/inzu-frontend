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
- **Tailwind CSS v3** — Custom `inzu.*` color tokens
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
