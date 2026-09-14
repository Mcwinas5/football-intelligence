# AGENTS.md — Football Intelligence Engineering Constitution

This document is the permanent engineering constitution for the Football Intelligence
repository. Every human contributor and every AI agent (Codex, Claude, Manus, Cursor,
Copilot, etc.) MUST read and obey this file before proposing or making any change.
Where a task instruction conflicts with this constitution, this constitution wins
unless the owner explicitly approves an exception in writing.

---

## PROJECT

Football Intelligence.

## PRODUCT

An auditable football prediction and decision-intelligence platform.

## POSITIONING

"Know which football predictions deserve your trust."

## CORE PRINCIPLE

**Proof is free. Intelligence is paid.**

---

## INITIAL VALIDATION MARKET

- Nigeria
- Adults only (18+)
- Weekly football bettors
- Followers of football tipsters/communities on Telegram and WhatsApp

## INITIAL FOOTBALL SCOPE

- English Premier League
- Over/Under 2.5 goals
- BTTS (Both Teams To Score)

## PRODUCT MODEL

- 1–3 qualified predictions per day
- 0 qualified predictions = NO BET (not generating a pick is a valid decision)
- Every prediction must be timestamped before kickoff
- Every prediction remains in the historical record
- Losses must never be deleted or hidden
- Public ledger is free
- Paid users receive current intelligence first
- Public current-pick visibility is delayed by 1 hour

## PREDICTION INTELLIGENCE CARD

Every published prediction must expose:

- Match
- Market
- Model probability
- Market odds
- Implied probability
- Estimated edge
- Confidence
- Reasoning
- Risk flags
- Timestamp
- Status
- Result

## PREDICTION QUALIFICATION

A prediction requires ALL of:

1. Calibrated probability
2. Minimum qualifying edge
3. Acceptable data quality

Human review may reject a prediction because of data quality or model concerns.

**Human review must NOT be used to cherry-pick winning predictions.**

## VALIDATION PRICING

- A/B experiment
- Variant A = ₦1,000
- Variant B = ₦2,000
- 50/50 server-side assignment
- 7-day trial
- No auto-renewal

The server is the single authority for variant assignment. The client displays the
server-assigned variant and price; it never computes, overrides, or persists its own
independent assignment. Displayed variant and recorded variant must always be identical.

## TRUST PRINCIPLES

- Never guarantee wins
- Never guarantee profit
- Never use "sure odds"
- Never use "fixed matches"
- Never use "banker"
- Never hide losses
- Never alter historical predictions without an auditable correction record

## PRODUCT BOUNDARIES

The platform must NOT:

- Operate a sportsbook
- Accept betting funds
- Hold user betting balances
- Place bets
- Provide autonomous betting
- Generate guaranteed-win claims

---

## TECHNICAL PRINCIPLES

- Server is authoritative for pricing
- Server is authoritative for timestamps
- Server is authoritative for prediction IDs
- Database must become authoritative for persistence
- Client must never determine payment success
- Client must never determine prediction settlement
- Client must never bypass access control
- All sensitive operations require server-side authorization

## CURRENT STATUS (updated: Phase 2 — pre-Supabase hardening)

The application is a **non-live validation system** (V.I.B.E.S. Validation Sprint 001).

Current integrations are mocked:

- Payment (`MockPaymentProvider` — interface exists, Paystack not connected)
- Telegram (`MockTelegramGateway` — interface exists, bot not connected)
- Persistence (in-memory server arrays — **data is lost on restart**)

A Supabase/PostgreSQL schema exists (`supabase/schema.sql`) but is **not yet connected**.
No Supabase SDK is installed. Do not connect it outside a controlled migration phase.

### Temporary access-control limitation (documented, accepted for non-live mode)

- There is **no user authentication**. "Subscriber" visibility on `/api/predictions`
  is currently requested via an unauthenticated `?access=subscriber` query parameter.
  This is an explicitly accepted temporary state for the non-live validation sprint.
- Admin endpoints are protected by a single shared `ADMIN_TOKEN` sent as the
  `x-admin-token` header. The server **fails closed**: if `ADMIN_TOKEN` is not set in
  the environment, admin endpoints are disabled with an explicit error (there is no
  default token).
- Mock payment/Telegram endpoints (`/api/validation/mock/*`) are only available when
  `NODE_ENV !== "production"`. In production mode they return an explicit error and
  must not be used.
- The final authentication/access-control model will be designed around Supabase in a
  later phase. Do not implement ad-hoc auth before then.

---

## ENGINEERING PRINCIPLE

**Prefer incremental migration over rewriting working code.**

## PRESERVE (do not change without owner approval)

- Approved visual design
- Routes
- Product positioning
- Validation experiment
- API contracts where practical
- Existing tests

Do not introduce unnecessary frameworks.

## CHANGE DISCIPLINE

- Read this file before every change.
- Do not modify existing tests merely to make them pass. If an existing test conflicts
  with an intended business rule, explain the conflict and get approval first.
- New behavior requires new tests. Server-authoritative rules must be tested for
  client-tamper resistance.
- No secrets in source code. Credentials live only in environment variables.
  `config/ENVIRONMENT.example` documents the required variables.
- Keep the validation contract intact: prospect creation, pricing assignment, checkout
  creation, mock payment, Telegram activation flow, prediction creation, 1-hour public
  delay, settlement, correction history, validation metrics, attribution tracking.

## LOCAL COMMANDS

- Install: `pnpm install`
- Typecheck: `pnpm check`
- Dev server: `pnpm dev`
- Production build: `pnpm build`
- Offline validation test (pricing distribution/persistence/mapping): `node validation_audit_test.mjs`
- Client-tamper pricing test (200 prospects, requires running server): `node validation_pricing_test.mjs`
- Pricing consistency test (requires running server): `node validation_pricing_consistency_test.mjs`
- Security fail-closed test (self-contained, spawns servers): `node validation_security_test.mjs`
- End-to-end validation test (requires running server): `node validation_e2e.mjs`
- Start a server for tests: `ADMIN_TOKEN=<token> PORT=3100 npx tsx server/index.ts`
  (`BASE_URL=http://127.0.0.1:3100` is the default for the server-based test scripts)
