# Portfolio Tracker. Project brief v2

## Goal

Multi-user web app for tracking investment portfolios: stocks, ETFs, crypto and cash
across multiple currencies, with live prices, clear charts, and a Monte Carlo
scenario simulator.

Two parallel goals:
1. Real daily use by the author and friends
2. A strong portfolio piece on GitHub (auth, multi-tenant data isolation,
   external APIs, FX conversion, data visualization, Monte Carlo, deploy, PWA)

Author: Filip Goral, Management & AI graduate, investor since 2019, targeting
tech consulting and finance.

---

## MVP scope. This and only this

One module done properly, not several done half-way.

### Version 2 features

1. **Multi-user with Google Sign-In**
   - Auth.js (NextAuth) with Google provider only, no passwords
   - Access is gated by an email allowlist configured via env var
   - `User` model plus `Position.userId` and `PortfolioSnapshot.userId`
   - **Every database query is filtered by userId**. Data isolation between
     users is a hard requirement, not a nice-to-have
   - `PriceCache` and `FxRate` stay global (per ticker), market data is shared
   - Migration: existing positions are backfilled to the author's account

2. **Position management (unchanged from v1)**
   - Fields: name, ticker, type (stock / ETF / crypto / cash),
     quantity, purchase price, purchase currency, purchase date
   - Edit and delete
   - Data persists across restarts

3. **Live prices and FX (unchanged from v1)**
   - Crypto: CoinGecko (free, no key)
   - Stocks and ETFs: Finnhub (free tier, key in env)
   - FX: NBP table A (free, official)
   - DB-backed cache with per-source TTL (crypto 5m, stocks 15m, FX 1h)
   - Tiered fallback: live API -> DB cache -> hardcoded constants (only when DB is empty)
   - UI shows "as of X" per source and warns when data is stale

4. **Main dashboard layout (top to bottom)**
   - Top bar: app name, FX status, user avatar and sign-out
   - Row of four metric cards: total value, P/L, return %, positions count
   - **Full width: portfolio value chart** (TradingView Lightweight Charts)
     with an optional Monte Carlo cone overlay. This is the hero element.
   - Two columns: allocation donut | TradingView market widget for the selected position
   - Full width: positions table. Clicking a row switches the market widget target.

5. **Charts. Two tools, chosen deliberately**
   - **TradingView widgets (embed)** for market charts of individual assets.
     Free, TradingView provides the data.
   - **TradingView Lightweight Charts** (Apache 2.0) for the portfolio value
     history chart. Own data from daily snapshots.
   - **Do not use** TradingView Advanced Charts. No license for private projects.
   - UI clearly notes that prices in the table may differ from the widget
     (Finnhub free tier has delay, cache 15 min).

6. **Daily snapshots per user**
   - Snapshot table: `date`, `userId`, `totalValuePLN`, `totalCostPLN`
   - Lazy creation on first daily visit for local dev
   - Vercel Cron for production, one snapshot per user per day
   - Feeds the value history chart

7. **Monte Carlo scenario simulator (not a "predictor")**
   - Shows a **distribution of scenarios**, not a single forecast
   - Percentile fan (p10 / p50 / p90) expanding over time
   - Inputs: horizon, expected return, volatility (per-asset historical or
     manually entered), monthly contributions
   - Visible disclaimer in the UI: "this is a simulation under stated
     assumptions, not a forecast or investment advice"
   - Logic in its own module, pure functions, covered by tests

8. **PWA at the end**
   - Installable on phone: manifest, service worker, icons
   - No React Native
   - Offline: cached last known values, gracefully degrades

### Deliberately not in scope

- Password-based auth (Google only)
- Broker import
- Investment recommendations or price predictions
- Native mobile app

---

## Stack

- **Next.js 16 (App Router) + TypeScript**
- **Tailwind CSS v4**
- **Prisma 6 + Neon Postgres** (SQLite dropped, serverless-incompatible)
- **Auth.js (NextAuth) v5** with Google provider and Prisma adapter
- **Recharts** for the allocation donut
- **TradingView widgets** (embed) for per-asset market charts
- **TradingView Lightweight Charts** for portfolio history
- External API calls are server-side only, keys never leak to the client
- Deployed on **Vercel** with Neon Postgres

---

## Design

- Dark fintech theme: graphite / navy background, gold and teal accents
- Rounded ~14 px cards, generous spacing, financial typography
- Amounts always formatted with thousand separators and currency symbol
- Responsive, works on phone
- Interface language: **English**
- No em dashes in UI copy

---

## Data model (proposal)

```
User
  id, email, name, image, createdAt

Account, Session, VerificationToken   -- Auth.js standard tables

Position
  id, userId, name, ticker, assetType, quantity,
  purchasePrice, purchaseCurrency, purchaseDate, createdAt, updatedAt

PortfolioSnapshot
  id, userId, date, totalValuePLN, totalCostPLN
  UNIQUE(userId, date)

PriceCache       -- GLOBAL, shared across users
  ticker, price, currency, fetchedAt
  UNIQUE(ticker, currency)

FxRate           -- GLOBAL, shared across users
  currency, rateToPLN, fetchedAt
```

---

## Stages

1. Stage 0-4 delivered: scaffold, CRUD, table, deploy, live prices, DB cache
2. **Stage 4.5. Auth and multi-user (must ship before Stage 5)**
3. Stage 5. Allocation donut + TradingView widget for the selected position
4. Stage 6. Daily snapshots per user + portfolio value history (Lightweight Charts)
5. Stage 6.5. Monte Carlo simulator with percentile fan
6. Stage 7. Design polish and responsiveness
7. Stage 8. Vitest for finance / FX / Monte Carlo, README with screenshots
8. Stage 9. PWA (manifest, service worker, icons)

---

## Completion criteria

Project is done when:

- Multiple whitelisted users can sign in with Google and see only their portfolio
- Adding a position, seeing its current value and deleting it all work
- Total portfolio value matches manual calculation on paper
- App does not crash when a price API is unavailable
- Portfolio value history chart shows a trend fed by daily snapshots
- Monte Carlo simulator shows a percentile fan with a visible disclaimer
- App is installable on phone as a PWA
- Public repo with README, screenshots, feature list, stack, and lessons-learned section
- Working live URL

---

## Instructions for the coding assistant

- Before coding, ask about ambiguities and propose a plan
- Work stage by stage, show a working result after each
- English commit messages (short, imperative)
- Financial logic (FX conversion, P/L, percentages, Monte Carlo) lives in
  isolated modules and is covered by tests
- API keys live in `.env.local`, which is git-ignored
- Every DB query that touches user-owned data must filter by userId
- Never trust client-supplied userId; always read from the session
