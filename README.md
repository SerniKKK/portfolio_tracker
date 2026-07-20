# Portfolio Tracker

Personal investment portfolio tracker for stocks, ETFs, crypto and cash across multiple currencies. Built as both a daily-use tool and a portfolio piece.

**Live demo:** https://portfolio-tracker-iota-one.vercel.app

> Public demo, no login. Please do not enter real amounts. Basic auth will land in a later stage.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Prisma 6 + Neon Postgres
- Recharts (planned, Stage 5)
- Deployed on Vercel

## Features

- Add, edit and delete portfolio positions (stocks, ETFs, crypto, cash)
- Portfolio summary with total value, cost and P/L in PLN plus EUR/USD preview
- Sortable positions table with per-position P/L in PLN

## Roadmap

- [x] Stage 0. Project scaffold with dark fintech theme
- [x] Stage 1. Prisma schema and positions CRUD
- [x] Stage 2. Summary card, sortable table, finance and format helpers
- [x] First deploy to Vercel (Neon Postgres)
- [ ] Stage 3. Real market data (CoinGecko, Finnhub) and NBP FX rates
- [ ] Stage 4. Price cache with TTL and API error handling
- [ ] Stage 5. Portfolio structure charts
- [ ] Stage 6. Daily snapshots and value history chart
- [ ] Stage 7. Design polish, mobile, basic auth
- [ ] Stage 8. Unit tests, screenshots, final README

## Local development

```bash
npm install
cp .env.example .env   # then set DATABASE_URL
npx prisma migrate dev
npm run dev
```

Requires a Postgres instance. Neon free tier works out of the box.
