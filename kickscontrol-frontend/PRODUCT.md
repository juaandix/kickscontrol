# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary: recruiters and tech leads evaluating Juan David Gil's portfolio. They arrive from a CV, LinkedIn or GitHub link, spend a few minutes clicking through, and judge whether the work reads as a real product built by someone who understands both engineering and retail.

In-fiction users the product must convincingly serve: shoppers browsing and buying sneakers (store), and ADMIN / SHIFT_LEADER staff managing stock, orders and KPIs (backoffice).

## Product Purpose
A full-stack sneaker e-commerce with a retail-operations backoffice. Success: an evaluator leaves convinced the store and backoffice look and behave like production software, and that the domain modeling (variants, stock, shift KPIs) comes from real retail experience.

## Positioning
Built by an ex Foot Locker Shift Leader: inventory is modeled per real variant (size × color, own SKU, stock and price modifier), checkout has three-layer overselling protection (optimistic lock, SELECT FOR UPDATE, DB CHECK), and the backoffice tracks shop-floor KPIs (sell-through, days of coverage, shrinkage). Stock truth per variant is the thread that ties store and backoffice together.

## Operating Context
- Demo runs locally or via Docker Compose; frontend Next.js on :3000 (dev also used on :3100), Spring Boot API on :8080/:8081.
- Evaluators typically view on a laptop browser; some open the link on a phone.
- Seeded catalog: ~15 models, 6 brands, 100+ variants. Product images are remote URLs (static.nike.com, images.puma.com, m.media-amazon.com).

## Capabilities and Constraints
- Store: catalog with URL-persisted filters (search, brand, category, gender, size, price, in-stock), product detail with color/size variant selector and live per-variant stock, server-side persistent cart drawer, transactional checkout with simulated payment (card animation, PDF receipt), order history with status timeline, profile, login/register.
- Backoffice ("la trastienda", redesigned 2026-10-27 on the same white sheet): shift-report KPI grid, restock list with working adjust, inventory with a size × colour stock matrix per model, paginated orders with item detail, users.
- Stack: Next.js 16 App Router, React 19, TypeScript strict, TanStack Query v5, Tailwind CSS 4, Heroicons, Recharts, jsPDF. Tests: Vitest + RTL, Playwright E2E.
- Order statuses: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED. Roles: USER, ADMIN, SHIFT_LEADER.

## Brand Commitments
- Name: KicksControl (wordmark currently "KICKS" + "CONTROL"). The name stays.
- All UI copy is in Spanish (`lang="es"`).
- It is openly a portfolio project; footer discloses this.
- Visual reference set by the user (2026-10-17): Kith (kith.com) and SVD (sivasdescalzo.com). White ground, photography-led, minimal chrome, clean product grid with small captions. Their craft level is the bar; KicksControl executes the premium sneaker-store standard rather than an invented world.
- Own personality on top of that base (chosen 2026-10-26): the stockroom. Shoebox end labels (barcode drawn from the real reference, style code / SKU, units) caption product cards, the product page prints the label of the selected variant's box, a live stock strip runs above the header, the voice is shop-floor Spanish ("Lo que ves, está en el almacén", "Pasar por caja"), and the footer tells the true story: built by an ex Foot Locker Shift Leader. Label lettering is JetBrains Mono (`.type-label`). Every number shown must come from the API.

## Evidence on Hand
- Real seeded catalog data and product images served by the API.
- Real technical decisions documented in README.md, PORTFOLIO.md, ARQUITECTURA.md at repo root.
- No real customers, reviews, testimonials, sales figures or shipping promises exist; do not fabricate them.

## Product Principles
1. Read as a real store first, a demo second: an evaluator should forget it is a portfolio until the footer.
2. Stock truth is visible: per-variant availability is a feature to show, not hide.
3. Retail floor knowledge over generic e-commerce tropes.
4. Every claim on screen must be true of the running system.
