# Eskalate News API

Backend REST API for the **A2SV Eskalate assessment**. Authors publish articles, Readers consume them, and an Analytics Engine aggregates read counts into daily reports (GMT).

## Repository structure

```
├── README.md
├── .gitignore
├── .env.example
└── backend/
    ├── index.ts          # Entry point
    ├── src/              # Application code
    ├── tests/            # Tests (optional)
    ├── prisma/
    ├── scripts/
    ├── package.json
    └── .env.example
```

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

---

## Setup

### Prerequisites

- **Node.js** 18+
- **PostgreSQL**

### 1. Go to backend

```bash
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment

Copy `backend/.env.example` to `backend/.env` and set:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (e.g. `postgresql://user:password@localhost:5432/eskalate_news`) |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `24h`) |
| `PORT` | Server port (default `3000`) |

### 4. Database

```bash
npx prisma generate
npx prisma db push
```

**Test connection:** `npm run db:test`

### 5. Run

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

## Scripts (run from `backend/`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (ts-node-dev) |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled app |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to DB |
| `npm run db:test` | Test PostgreSQL connection |
| `npm test` | Run unit tests (Jest, DB mocked) |
| `npm run test:watch` | Run tests in watch mode |

---

## License

ISC
