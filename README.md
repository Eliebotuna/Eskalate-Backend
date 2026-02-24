# Eskalate News API

Backend REST API for the A2SV Eskalate assessment: Authors publish articles, Readers consume them, and an Analytics Engine aggregates read counts into daily reports.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT, Argon2 for password hashing
- **Validation**: Zod (centralized request body validation)
- **Job Queue**: BullMQ + Redis (daily aggregation of ReadLog → DailyAnalytics in GMT)

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis (for the analytics job queue)

### Install

```bash
npm install
```

### Environment

Copy `.env.example` to `.env` and set:

| Variable       | Description                          |
|----------------|--------------------------------------|
| `DATABASE_URL` | PostgreSQL connection string         |
| `JWT_SECRET`   | Secret for signing JWTs              |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `24h`)         |
| `REDIS_URL`    | Redis URL for BullMQ (e.g. `redis://localhost:6379`) |
| `PORT`         | Server port (default `3000`)          |

### Database

```bash
npx prisma generate
npx prisma db push
```

Or with migrations: `npx prisma migrate dev`

### Run

```bash
npm run dev
```

Production: `npm run build && npm start`

## API Overview

- **POST /auth/signup** – Register (body: name, email, password, role). Role: `author` \| `reader`. Returns user + token.
- **POST /auth/login** – Login (body: email, password). Returns user + token.
- **GET /articles** – Public feed (published, not deleted). Query: `category`, `author` (partial name), `q` (title search), `page`, `size`.
- **GET /articles/:id** – Get one article (creates ReadLog; optional auth for ReaderId).
- **POST /articles** – Create article (Author only). Body: title, content, category, status (optional).
- **GET /articles/me** – List my articles (Author only). Query: `page`, `size`, `includeDeleted=true`.
- **PUT /articles/:id** – Update article (Author, own only).
- **DELETE /articles/:id** – Soft delete (Author, own only).
- **GET /author/dashboard** – Author dashboard with TotalViews per article (paginated).

All responses follow the standard envelope: `Success`, `Message`, `Object`, `Errors` (and for paginated: `PageNumber`, `PageSize`, `TotalSize`).

## Analytics

- Each successful **GET /articles/:id** creates a **ReadLog** (async, non-blocking). ReaderId is set from JWT when logged in.
- A **daily job** (BullMQ, cron `0 0 * * *`) aggregates ReadLogs into **DailyAnalytics** by article and date in **GMT**.
- **GET /author/dashboard** returns TotalViews as the sum of DailyAnalytics for each article.

## Preventing duplicate ReadLog entries (bonus)

To avoid the same user generating many ReadLog entries by refreshing:

- **Rate limit**: Limit requests per IP (or per user) per article per time window (e.g. 1 read per article per 5 minutes per user/IP).
- **Deduplication**: If the user is logged in, store a key `readerId:articleId` with a short TTL in Redis; skip creating a new ReadLog if the key exists.
- **Throttling**: Use a middleware that checks Redis/cache before creating the ReadLog and only records once per reader/article/minute.

## License

ISC
