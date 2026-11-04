# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 15** with **App Router** — server and client components |
| Runtime | React 19 RC |
| Auth | **Clerk** (`@clerk/nextjs`) — orgs, roles, sign-in/sign-up |
| State | **Jotai** v2 (atom-based, no Redux/Zustand) |
| Styling | **Tailwind CSS v4** — semantic BoardUI tokens and class-based dark mode |
| UI Components | **BoardUI** source components and existing Radix UI primitives |
| Charts | **VisActor** (`@visactor/react-vchart`) |
| Icons | `@remixicon/react` for BoardUI components; existing pages also use `lucide-react` |
| Path aliases | `@/*` → `./src/*` (defined in `tsconfig.json`) |

**Font:** Be Vietnam Pro, loaded in the root layout.

---

## Commands

```bash
pnpm dev        # Start dev server
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # ESLint
```

> Use `pnpm` — a `pnpm-lock.yaml` is present. The README incorrectly shows `npm`.

---

## Environment Variables

Copy `.env.example` and fill in:
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

---

## Architecture

### Routing (App Router)

```
app/
  layout.tsx              — Root layout: Providers + AppChrome
  providers.tsx           — ClerkProvider → JotaiProvider → ModeThemeProvider → ChartThemeProvider
  (dashboard)/            — Route group for all landlord dashboard pages
    layout.tsx            — DashboardGate (auth guard + role routing)
    page.tsx              — Dashboard home
    properties/…
    units/…
    tenants/…
    invoices/…
    payments/…
    maintenance/…
    reports/…
    settings/…
  tenant/                 — Tenant portal (separate layout, TenantPortalShell)
  sign-in/[[...sign-in]]/ — Clerk catch-all
  sign-up/[[...sign-up]]/ — Clerk catch-all
```

### Auth & Role Routing

`DashboardGate` (`src/components/dashboard-gate.tsx`) calls `useAuthMe()` and branches:
- **Tenant role** → redirects to `/tenant`
- **Landlord + no orgs** → shows org onboarding flow
- **Landlord + orgs** → renders `DashboardShell` (sidebar layout)

`AppChrome` (`src/components/app-chrome.tsx`) hides the nav shell for auth routes (`/sign-in`, `/sign-up`).

### API Client

`createInzuApiClient(deps)` in `src/lib/api/client.ts` — factory with dependency injection:
- `deps.getToken()` — from Clerk `useAuth()`
- `deps.getOrganizationId()` — resolved from the current Clerk organization

All API calls use `Authorization: Bearer <token>` and include org ID. Errors throw `ApiError` (`src/lib/api/errors.ts`).

**Hook:** `useInzuApi()` in `src/hooks/use-inzu-api.ts` returns a memoized API client instance, combining Clerk hooks + `useCurrentOrganizationId()`.

**Domains:** `auth`, `tenant`, `dashboard`, `properties`, `units`, `tenants`, `invoices`, `mpesaPayments`, `payments`, `arrears`, `maintenance`, `reports`.

**API module structure:** `src/lib/api/client.ts` contains all domain methods on the client object. Per-domain types live in separate files (`properties.ts`, `units.ts`, `invoices.ts`, etc.) and are re-exported from `src/lib/api/index.ts`.

**Payment status polling:** `use-payment-status.tsx` in `src/hooks/` handles M-Pesa STK push confirmation — polls `GET /api/payments/:paymentId` with exponential backoff, stops on `confirmed`/`failed`/`expired`. See `Payments integration.md` for full flow and status transitions.

### Auth Middleware

`src/middleware.ts` uses Clerk middleware to protect all routes except `/sign-in` and `/sign-up`. All other routes call `auth.protect()` — no per-page auth guards needed.

### Tenant Status Values

Valid values for tenant `status` field (from backend): `active`, `inactive`, `blacklisted`, `prospective`. Updated via `PUT /api/organizations/:organizationId/tenants/:tenantId` with `{ status: "..." }`. Requires `MANAGE_TENANTS` permission.

### State (Jotai)

Atoms in `src/lib/atoms.ts`:
- `mobileNavOpenAtom` — mobile navigation drawer state
- `commandPaletteOpenAtom` — global navigation search state
- `sidebarCollapsedAtom` — persisted desktop sidebar preference

### Tenant Context

`TenantMeContext` (`src/contexts/tenant-me-context.tsx`) wraps the tenant portal and provides `{ data, loading, error }` for the tenant's invoices, payments, and maintenance tickets in one API call.

---

## Design System

See `blueprint.md` for the full design philosophy ("INZU: The Laws of Minimalist Authority").

**Color palette (Tailwind `inzu.*` namespace):**
| Token | Hex | Usage |
|---|---|---|
| `inzu-forest` | `#32533D` | Primary green |
| `inzu-forest-deep` | `#2D4B3E` | App chassis / sidebar |
| `inzu-sage` | `#90B494` | Secondary text |
| `inzu-obsidian` | `#13270D` | Darkest shade |
| `inzu-cedar` | `#825D42` | Warm accent |
| `inzu-silk` | `#F5F7F6` | Off-white surfaces |
| `inzu-red` | `#E22026` | **Critical alerts only** (30+ day arrears, emergencies) |

**Motion:** Custom easing `luxury` = `cubic-bezier(0.19, 0.9, 0.22, 1)` — always use for transitions.

**Key design rules:**
- One focal point per screen (e.g., Net Collection on dashboard)
- No unnecessary borders or box shadows — use alignment and spacing instead
- Max 2 font weights per view: Semi-Bold for numbers, Regular for context
- Accent red (`inzu-red`) only for critical alerts, never decorative
- "Can we remove one more thing?" is the litmus test

---

## Payments

See `Payments integration.md` for M-Pesa (Daraja) integration details. The `mpesaPayments` API domain handles STK push initiation and status polling.
