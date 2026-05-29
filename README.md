# KicksControl — E-Commerce & Smart Backoffice

> Portfolio project by **Juan David Gil** (DAW + Systems Engineering @ UPM | ex Shift Leader @ Foot Locker)  
> Full-stack sneaker store with production-grade inventory management, transactional checkout, and a retail KPI dashboard built on real domain expertise.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 17 · Spring Boot 3.5 · Spring Security + JWT · Hibernate/JPA |
| **Database** | PostgreSQL 16 · ENUMs · CHECK constraints · composite indexes · analytics views |
| **Frontend** | Next.js 15 (App Router) · TypeScript strict · TanStack Query · Recharts |
| **Styling** | Tailwind CSS 4 |
| **Infrastructure** | Docker Compose (profiles) · Multi-stage Dockerfiles · Makefile |
| **API Docs** | Springdoc OpenAPI 2.6 (Swagger UI) |

---

## Features

### Store (customer-facing)
- **Catalog** with dynamic filters (brand, category, size, color, gender, in-stock only) stored in URL — bookmarkeable and shareable
- **Product detail** with color/size variant selector and live stock status
- **Shopping cart** (persistent, server-side via TanStack Query)
- **Transactional checkout** with 3-layer concurrency protection (optimistic lock → pessimistic SELECT FOR UPDATE → DB CHECK constraint)
- **Order history** with status badges and order detail

### Backoffice (ADMIN / SHIFT_LEADER)
- **Inventory management** — expandable product table, stock adjustment modal with delta + reason (RECEPCIÓN / AJUSTE / MERMA / DEVOLUCIÓN)
- **Order management** — inline status transitions
- **KPI Dashboard** — configurable date range + granularity:
  - Revenue, orders, avg ticket, units sold
  - **Sell-Through Rate** — `unitsSold * 100 / (unitsSold + currentStock)`
  - **Days of Coverage** — `currentStock / avgDailySales`
  - **Shrinkage Rate** — negative stock adjustments / total movements
  - Revenue line chart, top sellers bar chart, orders-by-status donut

---

## Quick Start

### Prerequisites
- Docker Desktop
- Java 17+ (for local backend dev only)
- Node.js 20+ (for local frontend dev only)

### Option 1 — Full stack in Docker

```bash
cp .env.example .env        # set JWT_SECRET and DB credentials
make full                   # builds + starts everything
```

- Frontend: http://localhost:3000  
- API: http://localhost:8080  
- Swagger UI: http://localhost:8080/swagger-ui.html

### Option 2 — Local development (hot reload)

```bash
# Terminal 1 — database only
make db

# Terminal 2 — backend with hot reload
make dev

# Terminal 3 — frontend
cd kickscontrol-frontend
npm install
npm run dev
```

### Seed data

```bash
make seed    # loads 15 real sneaker models with variants
```

Default seed creates an admin account:  
`admin@kickscontrol.com` / `Admin1234!`

---

## Project Structure

```
kickscontrol/
├── kickscontrol-backend/          Spring Boot API
│   └── src/main/java/
│       ├── controller/            REST controllers
│       ├── service/               Business logic
│       ├── repository/            JPA repositories + Specifications
│       ├── entity/                JPA entities
│       ├── dto/                   Request & response DTOs
│       ├── security/              JWT filter + config
│       └── exception/             Global error handler
├── kickscontrol-frontend/         Next.js 15 App Router
│   ├── app/
│   │   ├── (store)/               Public store pages
│   │   ├── backoffice/            Protected admin pages
│   │   ├── login/                 Auth pages
│   │   └── register/
│   ├── components/
│   │   ├── backoffice/            KpiCard, charts, StockAdjustModal
│   │   ├── cart/                  CartDrawer
│   │   ├── catalog/               FilterPanel, ProductGrid
│   │   └── layout/                Header, Footer
│   ├── context/                   AuthContext, CartContext
│   └── lib/                       apiClient, analytics, products, admin, cart
├── docker-compose.yml             profiles: db | full
├── Makefile                       dev workflow commands
└── ARQUITECTURA.md                technical decisions document
```

---

## API Reference

Full interactive docs at `/swagger-ui.html` when the backend is running.

| Group | Endpoints |
|---|---|
| Auth | `POST /api/auth/register` · `POST /api/auth/login` |
| Catalog | `GET /api/products` · `GET /api/products/{id}` · `/brands` · `/categories` |
| Cart | `GET/POST /api/cart` · `PUT/DELETE /api/cart/items/{id}` |
| Orders | `POST /api/orders/checkout` · `GET /api/orders` · `GET /api/orders/{id}` |
| Admin — Products | `GET/POST /api/admin/products` · `PUT/DELETE /api/admin/products/{id}` |
| Admin — Inventory | `PATCH /api/admin/variants/{id}/stock` · `GET /api/admin/products/inventory/alerts` |
| Admin — Orders | `GET /api/admin/orders` · `PATCH /api/admin/orders/{id}/status` |
| Analytics | `GET /api/admin/analytics/summary` · `/revenue-chart` · `/top-sellers` · `/orders-by-status` |

---

## Checkout Concurrency (3-layer defense)

Concurrent purchases of the last unit are handled at three levels:

1. **`@Version` (optimistic lock)** — `ProductVariant` has a `version` column. Two concurrent transactions reading the same version will cause one to throw `OptimisticLockException` on flush.
2. **`SELECT FOR UPDATE` (pessimistic lock)** — `findByIdForUpdate()` in the repository acquires a row-level lock before decrementing stock.
3. **`CHECK (stock_quantity >= 0)` (DB constraint)** — last line of defense; raises a constraint violation if anything slips through.

All three layers fire within a single `@Transactional` method that also calls `clearCart()` atomically.

---

## Retail KPIs

Metrics come from real-world retail operations (Foot Locker Shift Leader experience):

| KPI | Formula | Why it matters |
|---|---|---|
| Sell-Through Rate | `unitsSold × 100 / (unitsSold + currentStock)` | Measures how efficiently inventory converts to sales |
| Days of Coverage | `currentStock / avgDailySales` | Predicts when stock will run out |
| Shrinkage Rate | `negativeAdjustments × 100 / totalMovements` | Tracks inventory loss from theft/damage/error |
| Avg Ticket | `totalRevenue / totalOrders` | Key profitability indicator per transaction |

---

## Development Commands

```bash
make db           # start PostgreSQL only
make dev          # start DB + backend (hot reload)
make full         # start full stack in Docker
make build        # build Docker images
make test         # run backend tests (mvn verify)
make seed         # reload seed data
make logs         # tail all logs
make stop         # stop containers (keep data)
make clean        # stop + delete volumes
```

---

## Git Flow

```
main          ← production releases (tagged)
develop       ← integration branch
feature/*     ← sprint work (merged with --no-ff)
```

Commits follow [Conventional Commits](https://www.conventionalcommits.org/):  
`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`

---

## Architecture Decisions

See [ARQUITECTURA.md](ARQUITECTURA.md) for a detailed explanation of every major technical decision and its rationale — written for portfolio defense and technical interviews.
