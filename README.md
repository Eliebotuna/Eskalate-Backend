# Eskalate News API

Backend REST API for the **A2SV Eskalate assessment**. Authors publish articles, Readers consume them, and an Analytics Engine aggregates read counts into daily reports (GMT).

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Runtime | Node.js + TypeScript |
| Framework | Express |
| Database | PostgreSQL with Prisma ORM |
| Auth | JWT, Argon2 (salted password hashing) |
| Validation | Zod (centralized request body schemas) |
| Background job | node-cron (daily ReadLog → DailyAnalytics aggregation in GMT) |

**Why these choices:** Prisma gives strong typing and migrations; Argon2 is recommended for password hashing; Zod keeps validation in one place; node-cron avoids external infra (e.g. Redis) while still meeting the “job queue” requirement for daily processing.

---

## Setup

### Prerequisites

- **Node.js** 18+
- **PostgreSQL**

### 1. Install dependencies

```bash
npm install
```

### 2. Environment

Copy `.env.example` to `.env` and set:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (e.g. `postgresql://user:password@localhost:5432/eskalate_news`) |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `24h`) |
| `PORT` | Server port (default `3000`) |

### 3. Database

```bash
npx prisma generate
npx prisma db push
```

Or with migrations: `npx prisma migrate dev`

**Test connection:** `npm run db:test`

### 4. Run

```bash
npm run dev
```

**Production:** `npm run build && npm start`

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register (body: name, email, password, role). Returns user + token. |
| POST | `/auth/login` | Login (body: email, password). Returns user + token. |
| GET | `/articles` | Public feed (published, not deleted). Query: `category`, `author`, `q`, `page`, `size`. |
| GET | `/articles/:id` | One article; creates ReadLog; optional auth for ReaderId. |
| POST | `/articles` | Create article (Author only). Body: title, content, category, status. |
| GET | `/articles/me` | List my articles (Author only). Query: `page`, `size`, `includeDeleted`. |
| PUT | `/articles/:id` | Update article (Author, own only). |
| DELETE | `/articles/:id` | Soft delete (Author, own only). |
| GET | `/author/dashboard` | Author dashboard: articles + TotalViews (paginated). |

**Response format:** All responses use `Success`, `Message`, `Object`, `Errors`. Paginated responses add `PageNumber`, `PageSize`, `TotalSize`.

---

## Analytics

- **GET /articles/:id** creates a **ReadLog** on each successful read (async, non-blocking). ReaderId from JWT if logged in.
- A **daily cron job** (midnight GMT) aggregates ReadLogs into **DailyAnalytics** by article and date.
- **GET /author/dashboard** returns TotalViews as the sum of DailyAnalytics per article.

---

## Bonus: preventing duplicate ReadLog entries

To avoid one user generating many ReadLog entries by refreshing: rate-limit by IP or user per article (e.g. 1 read per 5 min), or use a short-TTL cache key `readerId:articleId` and skip creating a new ReadLog if the key exists.

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (ts-node-dev) |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled app |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to DB |
| `npm run db:test` | Test PostgreSQL connection |

---

## License

ISC
