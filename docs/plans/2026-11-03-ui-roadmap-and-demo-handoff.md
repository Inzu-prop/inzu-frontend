# INZU: UI roadmap and populated demo handoff

Original plan: 3 November 2026 (Africa/Nairobi)
Status: Frontend implementation is partially complete. Backend-dependent work and integrated verification remain open.
Purpose: Durable project memory and a self-contained starting point for a new chat.

## Start here in the next chat

Read this document, the repository's `AGENTS.md`, and the BoardUI skill before further implementation. Inspect the current working tree and the delivery status below; the phase sections preserve the original scope and acceptance criteria, including work that remains open. The user explicitly deferred the populated demo account: do not populate a live account without a separate request.

Suggested opening prompt:

> Read docs/plans/2026-11-03-ui-roadmap-and-demo-handoff.md and its delivery status. Continue the unfinished UI roadmap using verified backend contracts, preserving INZU styling and authenticated integrations. Keep the populated five-year demo deferred unless I explicitly ask to start it.

Repository: `D:\PROJECT SWE\inzu-frontend-main\inzu-frontend-main`
Remote: `https://github.com/Inzu-prop/inzu-frontend.git`
Last verified pushed implementation commit: `f5526c8` on `master`, tracking `origin/master`, updating PR #13. Hosting/deployment success has not been verified.

## Delivery status (4 November 2026)

The user asked to proceed with the frontend work supported by the available code and will provide backend access later. The populated live demo remains deferred. The original phase descriptions below are requirements and acceptance criteria, not a claim that every item is complete.

| Phase | Status | Delivered and remaining |
| --- | --- | --- |
| 0: Backend contracts | Open | Client methods and types have been inspected; deployed API schemas, permissions, and a signed-in test organization are still needed. |
| 1: Sidebar persistence | Implemented; browser verification outstanding | `949fe6d` adds a server-readable preference, legacy local-storage migration, and internal client navigation. First paint, reload, back/forward, storage restrictions, and mobile behavior need browser verification. |
| 2: Search | Partial | `4777154` puts Search beside Reports, removes sidebar search, and consolidates Ctrl/Cmd+K into one accessible pages-and-quick-actions dialog. Record-wide search and preview fixture search remain open. |
| 3: Tenant information | Partial | `67ea348` shows available read-only employment, guarantor, emergency-contact, and document metadata, with safe HTTPS file links when supplied. Private upload, replacement, deletion, signed-link refresh, and permissions require backend contracts. |
| 4: Invoices | Partial | `245e3a9` adds an authenticated invoice detail route, links from tenant history and register, and a fictional preview detail. PDF download, full invoice search, and removal of the sidebar entry remain open. |
| 5: Payments | Partial | `37742fd` improves the portfolio register and tenant payment history using existing list fields. Direct payment details, allocation information, reference search, and sidebar removal remain open. |
| 6: Maintenance | Partial | `20a2504` adds authenticated and preview job details and links from the list and tenant history. Assignment, updates, completion contracts, search integration, and signed-in verification remain open. |
| 7: Properties | Partial | `f5526c8` improves property details and supported live editing, including purchase/current values and strict numeric validation; preview has a shared detail view and session-only location editing. Full preview editing and live persistence verification remain open. |
| 8: Integrated verification | Open | Automated checks pass, but browser, signed-in backend, production build, and release verification are incomplete. |

Latest completed automated checks: TypeScript and lint passed, with the existing `dashboard-gate.tsx:270` `orgList` hook-dependency warning; all 32 tests passed. Browser interactions and signed-in backend behavior were not verified. A previous production build compiled but could not complete page generation without a local Clerk publishable key; a production build with valid deployment configuration remains unverified.

Local preview: `http://127.0.0.1:3000/preview`
Tenant example: `http://127.0.0.1:3000/preview/tenants/tenant-0`
Start command: `npm run dev -- --hostname 127.0.0.1 --port 3000`
Local `.env.local` contains the explicit preview opt-in; it is git-ignored and must remain so.
Preview requires development mode and a loopback host. It is disabled in production, including if the preview flag is set. Real app authentication must remain intact.

## User requests and recommended decisions

| Area | User request | Proposed implementation decision |
| --- | --- | --- |
| Search placement | Remove search from navigation and put it in Overview next to Reports. | Add a compact Search control beside View reports; remove sidebar search. Preserve one global keyboard shortcut so other pages can still search. |
| Universal search | Search names, phone numbers, invoice numbers, and anything entered across the app. | Search authorized organization records across entity types, with deep links. Do not mistake filtering navigation labels for global search. Document contents require a separate indexing decision. |
| Tenant documents | Store/view ID and employer information and other onboarding records. | Add a Documents tab plus structured optional employment/emergency-contact fields. Confirm private storage and document permissions before enabling live uploads. |
| Invoices | Move invoices inside tenants, remove the separate navigation tab, and allow invoice numbers in tenant search. Open complete invoices and download PDFs. | Tenant profile is the primary entry. Keep a canonical invoice detail route for search/bookmarks and historical invoices; hiding navigation must not delete existing operations. |
| Payments | Prefer payments inside tenants; asks whether this is sensible. | Yes for tenant-specific history. Remove the primary sidebar item only after retaining a portfolio-wide view for unallocated payments/reconciliation through Overview or Reports. This is a recommendation, not a confirmed backend feature. |
| Maintenance | Open a real job-detail page with work description, contractor/contact, dates, and completion details. | Dedicated maintenance detail route, with backend-supported status updates and assignment. Keep Maintenance in sidebar. |
| Sidebar | Collapsed navigation briefly expands on nested pages, then collapses. | Preserve the chosen state through all navigation and first paint. A collapsed sidebar stays collapsed until explicitly toggled; an expanded sidebar stays expanded. Do not permanently disable expansion. |
| Properties | Open detailed property pages with editing, including value and relevant details. | Extend the existing real property-detail/edit flow; replace preview placeholders with shared detail screens. |
| Reports | Keep Reports as a separate section. | Preserve its metric switching and YTD functionality; add access to cross-portfolio finance without reintroducing sidebar clutter. |
| Populated demo | Save the proposal for a five-year, realistic, editable demo account. | Deferred workstream described below. Do not seed production or enable public preview as part of the UI roadmap. |

## Existing implementation and design constraints

- Overview, Reports, and Tenant Profile already share presentation components between live and local preview. Live containers call authenticated APIs; sample data is separate.
- Tenant profiles show contacts, tenancy, rent, reported arrears, lease dates, and searchable/paged invoice/payment/maintenance tables. Invoice and maintenance records link to details; payment detail remains unavailable. Live invoice generation exists.
- Preview property, invoice, and maintenance routes now have detail presentations. Payment detail and complete preview property editing remain open.
- Preserve original INZU forest/sage palette, supplied logo, Be Vietnam Pro typography, compact sidebar, small header, and useful information near the top. Avoid large hero sections and oversized controls.
- Use installed BoardUI source components, semantic tokens, and composite typography. `AGENTS.md` is authoritative for component mechanics; `src/styles/inzu-brand.css` contains current branding. Do not reinstall/reset the whole design system.
- `README.md` and `CLAUDE.md` include older stack descriptions. Current package/source files establish Tailwind 4 and BoardUI; do not revert them to match stale prose.
- The latest automated verification and its limitations are recorded in Delivery status above.

## Phase 0: Documentation discovery and backend contracts

### Confirmed frontend APIs and reusable source patterns

These are methods present in the frontend client, not proof that the deployed backend supports every field or query parameter.

| Source | Available contract/pattern | Use and limitations |
| --- | --- | --- |
| `src/lib/api/client.ts:243` | `properties.list(params?)`, `get(id)`, `create(body)`, `update(id, body)`, `delete(id)`, `getUploadPhotoUrl(id, body?)` | Reuse existing property operations. Photo upload is not a tenant-document API. |
| `src/lib/api/properties.ts` | Property includes address, type, status, yearBuilt, totalFloors, purchasePrice, currentValue, notes, photos, documents. `UpdatePropertyBody = Partial<CreatePropertyBody>`. | Valuation fields already exist in frontend types. Property documents have metadata, but this does not establish tenant document upload/download support. |
| `src/lib/api/client.ts:293` | `tenants.list(params?)`, `get(id)`, `create(body)`, `update(id, body)`, `delete(id)`, invite methods | Request/response bodies are incompletely typed. Never trigger invitations just to populate a preview. |
| `src/lib/api/client.ts:317`; `src/lib/api/invoices.ts` | `invoices.list(params?)`, `get(invoiceId)`, `generate({period?, tenantIds?})` | Detail retrieval exists. Line-item/tax/allocation schema and PDF export are not established. No PDF client method exists. |
| `src/lib/api/client.ts:343` | `payments.list(params?)`, `request({invoiceId, phoneNumber?})`, `reconcile(body)` | No generic payment-detail getter exists in this client. Request/reconciliation are real financial operations, not demo-data creation methods. |
| `src/lib/api/client.ts:361` | `maintenance.list(params?)`, `get(ticketId)`, `create(body)`, `update(ticketId, body)`, `getUploadPhotoUrl(ticketId, body?)` | Contractor, completion, cost, attachment, and event-history schemas require confirmation. |
| `src/hooks/use-inzu-api.ts`; `src/lib/api/client.ts` | Clerk token and current organization supplied to shared API client | Reuse this boundary. Never bypass it for private search or documents. |
| `src/lib/api/uploads.ts` | `uploadFileToPresignedUrl()` | Existing upload helper keeps Clerk authorization out of the storage PUT. Reuse after obtaining an authorized upload URL; verify each upload response contract. |
| `src/components/tenant-profile-view.tsx`; `src/app/(dashboard)/tenants/[tenantId]/page.tsx`; `src/lib/tenant-profile.ts` | Shared presentation, live container, strict tenant scoping, partial failure states | Reuse for detail tabs. Payments may link through owned invoices; explicit conflicting tenant IDs are excluded. |
| `src/components/base/table/table.tsx`; `src/components/base/pagination/pagination.tsx`; `src/components/base/tabs/tabs.tsx` | BoardUI accessible tables, pagination, tabs | Copy established profile patterns; retain keyboard navigation and explicit empty/error states. |
| `src/components/command-palette.tsx` | Ctrl/Cmd+K dialog searches pages and quick actions | Shared by live and preview; full record search still needs a verified backend contract. |
| `src/components/base/buttons/button.tsx`; `src/lib/atoms.ts`; `src/lib/sidebar-preference.ts` | Internal `ButtonLink` navigation uses Next Link; sidebar preference uses server-readable cookie storage | Legacy local-storage state is migrated; first-paint behavior still needs browser verification. |
| `frontend_tenant_status_brief.md` | `active`, `inactive`, `blacklisted`, `prospective`; update requires MANAGE_TENANTS | Preserve supported statuses. Do not invent a backend `archived` status. |

### Required backend discovery before dependent implementation

1. Obtain backend repository/schema or verified API documentation and a signed-in test organization. Do not ask for passwords in chat; user can authenticate in an accessible browser.
2. Confirm pagination, query filtering, tenant/invoice associations, error envelopes, and historical tenancy support. A client method accepting arbitrary `params` does not prove the server implements `q`, `tenantId`, or pagination options.
3. Establish actual global search support. No universal-search client method was found. Define a proposed contract for backend review rather than calling an invented endpoint.
4. Establish tenant-document metadata, private object storage, authorized upload/read/delete flows, and optional employment/contact fields.
5. Establish invoice detail/line-item/issuer snapshots, PDF export, and payment allocation/detail contracts.
6. Establish maintenance assignee/contact, status values, event dates, costs, and completion contract.
7. Verify update permissions and mutable fields for properties. Do not silently attach unsupported fields to an `unknown` body and call that integration complete.

Deliverable: a short contract checklist marking each field/operation supported, requires backend work, or deferred. UI fixtures can demonstrate pending contracts, but live UI must identify unavailable capabilities honestly.

Verification: compare client signatures to actual backend responses with a test account; include organization isolation and pagination. Anti-pattern guards: no invented methods, guessed query parameters, fake success messages, or claims of end-to-end verification from TypeScript alone. `Payments integration.md` explicitly contains assumptions and is not proof of deployed endpoints.

### Delivery order and dependencies

Phases 1–7 have been implemented to the extent listed in Delivery status. Continue Phase 0 backend discovery before the dependent work; Phase 8 remains the release gate. Do not call search complete while record search and its destinations are incomplete. Split future work into reviewable changes and record incomplete dependencies explicitly.

## Phase 1: Fix navigation persistence before adding detail flows

What to implement:

- Reproduce collapsed Sidebar -> Tenants -> View profile -> invoice/detail -> Back, plus Properties and Maintenance equivalents, in both preview and authenticated app.
- Inspect `ButtonLink` usage: plain anchors can reload the document while sidebar navigation already uses Next Link. Compose BoardUI styling with Next Link for internal navigation; retain normal anchors for downloads, external URLs, email, and telephone links.
- Inspect provider lifetime and initial storage hydration. `atomWithStorage(..., false)` starts expanded before stored state loads; full reloads and a 300ms width transition can expose that default. This is a source-supported hypothesis, not a browser-confirmed diagnosis.
- Choose a first-paint strategy that keeps sidebar and content offset consistent, including hard reload and direct nested URLs. Prefer a server-readable preference if suitable; otherwise use a stable initialization boundary. Avoid hydration mismatch, blanking the entire app, or an expanded-width placeholder for collapsed users.
- Only animate explicit user toggles. Preserve compact logo/toggle alignment. Mobile drawer open/close must not overwrite the desktop preference.

References: `src/lib/atoms.ts`, `src/app/providers.tsx`, `src/components/app-chrome.tsx`, `src/components/application/dashboard/dashboard-sidebar.tsx`, `src/components/base/buttons/button.tsx`, `src/components/inzu-brand.tsx`.

Verification: record first paint and transitions with saved collapsed and expanded preferences; test direct URL, reload, browser back/forward, slow hydration, blocked storage, and narrow screen. Only clicking the toggle should change desktop state. No layout flash, header jump, or stale selection.

Guard: do not fix this with a pathname effect that forces collapse on every route; that would destroy the user's explicitly expanded preference.

## Phase 2: Universal search and Overview placement

What to implement:

- Put Search next to View reports in the compact Overview action row. Remove sidebar search/filter controls, including collapsed/mobile variants. The current sidebar shortcut is Ctrl/Cmd+J; the separate command palette uses Ctrl/Cmd+K. Consolidate to one Ctrl/Cmd+K action available throughout the authenticated app; local preview uses the same presentation with fixtures. The current top navigation has no visible search, so the control being moved is the sidebar Quick Search.
- Use one search experience instead of competing sidebar and command-palette search implementations. Preserve navigation/action results as a secondary group.
- Cover tenant names and aliases, normalized phone/email, property names/addresses/cities, unit numbers, invoice numbers/periods, payment references, maintenance titles/descriptions, and contractor names/contacts when supported. Include authorized historical/inactive tenants and records.
- Tenant-list search must also resolve invoice numbers to the correct tenant, with a matched-invoice shortcut. Do not just search the strings already loaded in the tenants list.
- Return grouped, typed results with meaningful context: tenant/property/unit, record number, status, and destination. Support exact identifier matches first, partial text, case-insensitive matching, and phone punctuation/country-prefix normalization according to stored country information.
- Define backend search across the full authorized dataset with indexes, bounded results, pagination/cursors, debounce, and stale-request cancellation. Initial UI target: debounce around 250ms; assess actual latency before setting a release performance budget.
- Searching dates and amounts should use documented parsing or explicit filters; avoid interpreting an arbitrary string as an authoritative financial total.
- Show loading, no results, partial failure, retry, and permission-limited states. Cancel/reset results when the organization changes; do not expose cached results from the previous organization.

Search scope clarification: "anything" means authorized app records, not a browser DOM scan or a scrape of every page. Document names/categories can be indexed; full document contents/OCR and sensitive ID-number search need an explicit, access-controlled follow-up decision. Never expose hidden documents through snippets or counts.

References: `src/components/dashboard-view.tsx:124`, `src/components/command-palette.tsx`, `src/components/application/dashboard/dashboard-sidebar.tsx`, `src/config/site.ts`, `src/components/nav/side-nav/index.tsx`, `src/lib/api/client.ts`.

Verification: find a tenant by partial name and formatted phone, a property by city, an invoice by number, a payment by reference, and a maintenance job by contractor; include records beyond the first API page. Test no match, rapid query changes, forbidden records, organization switch, keyboard operation, and mobile result layout. Check there is only one shortcut handler.

Guard: do not download the entire five-year portfolio into the browser to simulate global search. If backend search is absent, label any interim search scope and keep the full requirement open.

## Phase 3: Tenant documents and onboarding information

What to implement:

- Add Documents to the tenant profile. Each record shows category, filename, uploaded date, uploader where available, optional expiry, and View/Download actions. Enable add/replace/delete only with verified backend support and permission.
- Proposed optional categories: identification/passport, signed tenancy agreement, employment letter/proof of income, guarantor/reference documents, move-in inspection/handover, and Other. These are product suggestions, not claims that every document is required.
- Separate structured fields from attachments: employer/business name, occupation, optional work contact, emergency contact name/relationship/phone, and guarantor details if applicable. Do not require unnecessary personal information or fabricate absent fields.
- Use a signed URL/private object access flow with organization and tenant authorization checked server-side for every read/write. Do not reuse property-photo public URLs for tenant IDs. Define allowed file types, size limit, server validation/scanning, original name handling, retention/deletion behavior, and replacement history before live upload.
- Preview PDFs/images safely, with download fallback for other supported formats. Show missing/expired-file and upload-failure states. Access errors must not be mislabeled as "no documents".
- Use visibly fictional sample documents in preview; never create realistic government identity documents for the sample account.

References: shared tenant profile and container; `src/lib/api/properties.ts` for an existing metadata pattern only; `src/lib/api/client.ts` for authenticated request mechanics. There is currently no tenant-document API method.

Verification: permitted upload/view/download/delete; file type/size rejection; expired signed URL refresh; unauthorized tenant/org access; replacement failure; preview remains backend-free. Confirm source files never enter public assets or localStorage in the live app.

Guard: no dummy upload button that reports success without persistence; no document-content search enabled by default; no blanket mandatory ID/employment fields without product agreement.

## Phase 4: Tenant-centered invoices with full view and PDF

What to implement:

- Make invoice identifiers/rows in tenant history keyboard-accessible links to full invoice detail. Reuse a canonical `/invoices/[invoiceId]` route, with context linking back to its tenant and selected Invoices tab. Preview uses `/preview/invoices/[invoiceId]` and the same presentation.
- Display issuer identity/logo and contact/address, invoice number, issue/due date, billing period, tenant billing identity, property/unit, supported line items, amounts, applicable discounts/taxes, total, paid amount, balance, status, and payment instructions when supplied.
- Preserve historical billing details from the invoice/lease snapshot. Do not rebuild an old invoice from today's tenant address, rent, property name, or bank instructions.
- Add View and Download PDF. Prefer backend-issued authoritative PDFs where supported; otherwise agree a deterministic PDF rendering contract using the same verified invoice data. A print dialog alone is not completion of the requested PDF download. Check multipage layout, long names, currency formatting, filename, and missing fields.
- Keep invoice generation, period selection, zero-generated/errors, and existing payment-request behavior accessible in appropriate tenant/portfolio contexts. Preserve organization-wide bulk generation before removing its navigation entry.
- Remove Invoices from the primary sidebar after replacement entry points work. Keep old `/invoices` URLs usable as a secondary register or intentional redirect preserving useful query context. Update Overview links, global navigation configuration, command results, mobile navigation, and preview together.

References: `src/app/(dashboard)/invoices/page.tsx`, `src/lib/api/invoices.ts`, `src/lib/api/client.ts:317`, `src/components/tenant-profile-view.tsx`, `src/app/(dashboard)/tenants/[tenantId]/page.tsx`, `src/components/mpesa-payment-modal.tsx`.

Verification: tenant -> invoice -> PDF and back; direct URL; invoice-number search; partial/paid/overdue/cancelled states supported by backend; long/multipage PDF; no cross-tenant access; mismatch between URL tenant and actual owner rejected if a nested route is chosen. Totals in screen/PDF must agree with backend values.

Guard: do not invent tax rates, payment allocations, or a download endpoint. Unknown amounts are not zero. No real M-Pesa initiation from sample invoices.

## Phase 5: Tenant-centered payments without losing portfolio operations

Recommendation: tenant profiles are the natural home for a person's payment history. A separate primary sidebar item is optional. However, unallocated payments, duplicate references, and portfolio reconciliation cannot reliably live under a known tenant until allocation is resolved.

What to implement:

- Make payments in tenant history open a detail view showing reference, amount/currency, actual status, received/confirmed date, method, bank/provider label if recorded, allocations to invoice(s), and outstanding/unallocated amount if supported.
- Support failed/pending/reversed/refunded states only according to the backend contract; show them separately from confirmed received money.
- Add a secondary portfolio Payments register through Reports or an Overview collections shortcut. Include unallocated records if backend supports them. Keep reconciliation capability and permissions discoverable.
- Hide Payments in the sidebar only after these replacement paths work. Update the existing Overview `/payments` link and preserve bookmarked routes. Support global search by reference and tenant.
- A generic detail getter/allocation schema is currently absent from the client; establish it before implementing direct-link loading. Do not rely on a record passed through navigation state as the only detail data source.

References: `src/app/(dashboard)/payments/page.tsx`, `src/lib/api/client.ts:343`, `src/lib/tenant-profile.ts`, `src/components/dashboard-view.tsx:262`, existing payment modal/status polling. Treat `Payments integration.md` as a proposal whose endpoints need confirmation.

Verification: tenant-linked and unallocated cases, partial allocation, refunds if supported, direct link/reload, payment-reference search, correct ledger totals, and restricted reconciliation access. No regression to payment confirmation flows.

Guard: never associate a historical payment with the current occupant just because unit IDs match; never make a search/view operation request or reconcile a real payment.

## Phase 6: Maintenance job details

What to implement:

- Add `/maintenance/[ticketId]` and corresponding preview detail route; connect list View details, tenant history, and search results.
- Show title, description, property/unit, requester/tenant where recorded, priority, actual status, reported date, scheduled date if available, started date if available, and completed date. Keep reported/scheduled/completed dates semantically distinct.
- Show contractor/assignee name or business, trade, phone/email, and completion/work notes. Add verified assignment/edit/status actions. Use "Unassigned" or "Not recorded" when appropriate.
- Include photos/attachments and estimated/actual cost only when supported. If activity history exists, display actor, event, date, and notes; do not fabricate a timeline from current state.
- If contractor directory, completion fields, or timeline do not exist, specify backend schema/API changes and sequence them before live editing. A detail page alone is not backend implementation.

References: `src/app/(dashboard)/maintenance/page.tsx`, `src/lib/api/client.ts:361`, shared tenant profile tables and preview routing.

Verification: open existing ticket, assign/update if permitted, reload to prove persistence, show completed job with contractor/date, empty fields, denied edit, stale-save/error handling, deep links and return navigation. Preview edits remain simulated and visibly separate from real integrations.

Guard: no invented status names or success on failed updates; contact links do not automatically send messages.

## Phase 7: Property details and complete editing

What to implement:

- Reuse `src/app/(dashboard)/properties/[propertyId]/page.tsx` rather than replacing existing get/update/delete functionality from scratch. Give preview property cards a genuine shared detail screen.
- Compact summary: name, type, status, address/city, units and occupancy where real aggregates exist; links to units, current tenants, maintenance, and relevant reports.
- Editing: name, type, status, street/city/country/postcode, construction year, floors, purchase price, current value, and notes as supported. Existing live detail displays valuation fields, but its edit form/body needs review to expose them.
- Distinguish property valuation from monthly rent. Valuation does not automatically change unit rents or historical invoices. Add valuation date/source only after confirming backend support.
- Preserve unit add/edit/bulk workflows and accurate counts. Distinguish declared totalUnits from actual unit records until the backend defines the source of truth.
- Show photos/documents if available; do not imply that a document upload workflow exists just because the read type has a documents array.
- Validate numeric values, preserve meaningful zero versus missing values, show server validation errors, handle save/cancel, and refresh related data after success. Confirm clear/unset semantics for optional fields: simply omitting a blank field from an update can leave the old value permanently in place. Retain existing deletion constraints and deliberate confirmation.

References: property-detail page, `src/app/(dashboard)/properties/new/page.tsx`, `src/app/(dashboard)/properties/[propertyId]/units/page.tsx`, `src/lib/api/properties.ts`, `src/lib/api/units.ts`, `src/components/local-preview.tsx`.

Verification: open from list/search, edit and reload, value change persists without modifying rents, invalid values rejected, property with no units/documents, unauthorized edits, linked-unit navigation, preview mutation/reset consistency.

Guard: no rebuilding live functionality as a disconnected mock; no deletion behavior that bypasses backend dependencies.

## Phase 8: Integrated verification and release handoff

- Read current component/API documentation before implementing each phase; confirm no undocumented methods or query flags were introduced.
- Preserve one coherent local demo fixture graph across properties, units, tenants, invoices, payments, and maintenance. Reuse shared presentations and validate relationship IDs. Replace the relevant placeholder cards rather than adding another disconnected demo.
- Run `pnpm exec tsc --noEmit`, `npm run lint`, and relevant tests. Existing baseline: `node --test tests/tenant-profile.test.mjs tests/reporting.test.mjs tests/local-preview.test.mjs`.
- Add meaningful tests for navigation state/first paint, search isolation/full-dataset coverage, document permissions, invoice ownership and PDF totals, and mutation error paths. Avoid tests that merely reproduce implementation details.
- Test production build with valid deployment configuration. Missing Clerk configuration is an environment limitation, not a reason to bypass authentication.
- Exercise signed-in tenant/property/finance/maintenance flows against a designated test organization. Record what was actually tested versus merely compiled.
- Browser review at desktop/mobile sizes and normal zoom: sidebar no flash, compact headers, keyboard access, readable PDFs, responsive tables, search usability, clear loading/error/empty states.
- Confirm preview remains disabled in production and local fixtures cannot be mixed with live records. Preserve existing reports/YTD, tenant invitation workflows, and payment integrations.
- Reconcile all navigation entry points before release. Removing two sidebar items must not strand bulk invoicing, historical records, or reconciliation.
- Update this handoff with implemented phases, remaining backend gaps, tests, and commit IDs. Push/deploy only under the user's instructions at that time.

Definition of done: every requested detail screen opens real, scoped data in the authenticated app where supported; missing contracts are explicitly resolved or documented as incomplete; matching preview screens are interactive; no sidebar flash; universal search is not limited to the loaded page; invoice PDFs download correctly; no regressions to existing operations.

## Deferred workstream: populated live demo account (remember for later)

The user wants to revisit a real authenticated demo organization populated with fictional, internally consistent data. This is different from the current development-only `/preview` route and does not require making that route public.

Target dataset:

- At least 100 apartment units; proposed fixture is 120 units across eight buildings: five in Nairobi, two in Mombasa, one in Eldoret. Counts can change, but meet the minimum.
- Around 150 distinct fictional tenants, including current and former occupants. A possible present-day state is 108 occupied units, 12 vacant units, 108 current tenants and 42 former tenants. Validate tenancy intervals rather than arbitrarily assigning names to units.
- Five years of history anchored to the seed date. If anchored to this note, the window is 3 November 2021 through 3 November 2026. Make the anchor configurable for future runs.
- Varied fictional names (not exclusively Kenyan), plausible locations and building addresses, rent changes, deposits, lease starts/ends, vacancies, maintenance, invoices, and payments. Clearly label sample addresses/contacts; do not borrow real personal identities.
- Plausible monetary amounts, partial and late payments, arrears, and recorded payment references associated with a fictional bank/provider. These are simulated records, not transactions sent to a bank.
- Data relationships must reconcile: leases determine occupancy; historical lease rates generate period invoices; payment allocations determine balances; no overlapping occupants unless explicitly supported. Preserve former tenants' records after turnover.
- Reports should derive from these underlying records, not separately hard-coded chart totals. Document handling of prorated periods, cancellations, credits, refunds, and deposits according to supported backend rules.
- Live presentations should support creating/editing records and adding/removing a fresh demonstration tenant. Existing tenants with financial history should end tenancy/become inactive if deletion is prohibited. Do not invent an archive status or force-delete ledger records.

Implementation approach when separately authorized:

1. Inspect backend schemas, historical leases, import options, validation, reporting aggregation, and data volume limits. Frontend account access alone may not enable a reliable historical import.
2. Create a separate demo organization/account; user signs in themselves. Prefer an isolated demo environment if production jobs/integrations cannot be disabled per organization.
3. Disable email/SMS/WhatsApp invitations, payment requests, bank connections, scheduled collections, and other real side effects for this demo at the server/job boundary, not merely by hiding buttons. Tenant creation may have invitation side effects; check before seeding.
4. Build a deterministic, repeatable seed/import script with a fixed random seed, fixture version and organization ID, stable record keys, dry-run counts, idempotency, chunking/retry, and a validation report. Do not use thousands of browser form submissions or real reconciliation endpoints to simulate payments.
5. Generate buildings -> units -> tenants -> tenancy history -> invoices -> payments/allocations -> maintenance/documents in dependency order. Any sample document is visibly marked as fictional.
6. Scope reset to the dedicated demo organization and seed-owned records. Include a deliberate reset action and cleanup for edits made during a demo session, with no ability to wipe another organization.
7. Verify counts, five-year coverage, balances, occupancy, referential integrity, report totals, mutation persistence, side-effect suppression, and reset/reseed behavior. Test bounded search/pagination against several thousand invoices/payments.
8. Share an authenticated demo URL. If a public/link-only experience is later requested, design it separately: an obscure URL is not authorization, and shared visitors need isolation so one demo does not corrupt another.

Effort assessment retained from discussion: moderate, feasible work. Synthetic data generation is straightforward; backend support for historical tenancy, consistent financial records, import access, and safe demo isolation determine the actual effort. Do not promise a timeline before the backend audit.

## Decisions to settle at the relevant phase

No immediate questions are required to retain this plan. Resolve these when implementation reaches them:

1. Where should portfolio payments/reconciliation and bulk invoicing live: Overview shortcut, Reports tab, or secondary register? Recommended: retain existing routes and expose them from Overview/Reports without sidebar items.
2. Which tenant onboarding fields/documents are actually used, optional, and visible to which roles? Document contents search/OCR is a separate scope decision.
3. Which backend repository/test environment is available, and which missing contracts will be implemented there?
4. Will PDFs be backend-issued or generated from an agreed authoritative invoice payload? Do not silently substitute print-only behavior.
5. For the later demo, dedicated production organization versus isolated deployment, permitted audience, reset ownership, and whether all side effects can be suppressed.

## Current handoff status

This file preserves the requested changes, delivered frontend work, remaining backend dependencies, acceptance checks, and deferred demo proposal. Continue from the Delivery status rather than restarting Phase 1. Keep this handoff updated so future chats do not need the original conversation.
