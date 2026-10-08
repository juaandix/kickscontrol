# KicksControl — Full-Stack Sneaker E-Commerce & Backoffice

> Proyecto de portfolio por **Juan David Gil**  
> DAW + Ingeniería de Sistemas @ UPM | ex Shift Leader @ Foot Locker

---

## Descripción

KicksControl es una aplicación web full-stack de venta de calzado deportivo con un backoffice de gestión avanzado. El diferenciador no es el e-commerce en sí, sino el panel de administración diseñado con **lógica de operaciones retail real**: gestión de inventario por variantes complejas y analítica de KPIs de turno directamente derivados de la experiencia trabajando como Shift Leader.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Backend** | Java 17 · Spring Boot 3.5 · Spring Security + JWT · Hibernate/JPA |
| **Base de datos** | PostgreSQL 16 · ENUMs · CHECK constraints · índices compuestos · vistas analíticas |
| **Frontend** | Next.js 16 (App Router) · React 19 · TypeScript strict · TanStack Query v5 · Recharts |
| **Estilos** | Tailwind CSS 4 |
| **Infraestructura** | Docker Compose (profiles) · Multi-stage Dockerfiles · Makefile |
| **Testing** | JUnit 5 + Mockito + @WebMvcTest · Vitest 4 + React Testing Library · Playwright E2E |
| **API Docs** | Springdoc OpenAPI 2.6 (Swagger UI interactivo) |

---

## Funcionalidades

### Tienda (clientes)

- **Catálogo con filtros dinámicos** — marca, categoría, talla, color, género e in-stock almacenados en la URL (bookmarkeable y compartible, con soporte SEO)
- **Detalle de producto** — selector de talla y color con estado de stock en tiempo real por variante
- **Carrito persistente en servidor** — sincronizado entre dispositivos y pestañas, sin `localStorage`
- **Checkout transaccional con protección en 3 capas** contra overselling concurrente
- **Historial de pedidos** con badges de estado y vista de detalle
- **Pasarela de pago simulada** con animación de tarjeta y descarga de recibo en PDF

### Backoffice (ADMIN / SHIFT_LEADER)

- **Gestión de inventario** — tabla expandible por modelo, modal de ajuste de stock con delta (+/-) y motivo (RECEPCIÓN / AJUSTE / MERMA / DEVOLUCIÓN)
- **Gestión de pedidos** — transiciones de estado inline
- **Dashboard KPI** — rango de fechas configurable + granularidad (día / semana / mes):
  - Ingresos totales, pedidos, ticket medio, unidades vendidas
  - **Sell-Through Rate** — `unidades vendidas × 100 / (vendidas + stock actual)`
  - **Días de Cobertura** — `stock actual / ventas diarias medias`
  - **Tasa de Merma** — ajustes negativos / total de movimientos
  - Gráfico de ingresos, top sellers, pedidos por estado

---

## Decisiones Técnicas Destacadas

### Modelo de datos — productos con variantes reales

Cada sneaker se modela con la granularidad del retail real: un producto tiene variantes independientes por talla y color, cada una con su propio SKU, stock y modificador de precio. El checkout descuenta la variante exacta comprada, no el producto genérico.

```
Air Max 90
├── Talla 40 / Blanco  → SKU: NK-AM90-40-WB  → Stock: 15
├── Talla 42 / Blanco  → SKU: NK-AM90-42-WB  → Stock: 18
└── Talla 44 / Blanco  → SKU: NK-AM90-44-WB  → Stock: 8 (+5€)
```

### Checkout con defensa en 3 capas contra overselling

Tres mecanismos independientes previenen la venta de más unidades de las disponibles en un sistema concurrente:

1. **`@Version` (Optimistic Lock)** — Hibernate rechaza automáticamente el segundo `UPDATE` cuando dos transacciones leen la misma versión
2. **`SELECT FOR UPDATE` (Pessimistic Lock)** — bloqueo a nivel de fila durante toda la transacción de checkout
3. **`CHECK (stock_quantity >= 0)`** — restricción de base de datos como última línea de defensa; ningún bug de aplicación puede generar stock negativo

Los tres mecanismos disparan dentro de un único método `@Transactional` que también limpia el carrito de forma atómica.

### Filtros dinámicos con JPA Specifications

El endpoint de catálogo soporta hasta 7 filtros combinables. En lugar de los 127 métodos de repositorio que requeriría la aproximación naive, `ProductSpecification` construye dinámicamente los predicados de la query con la Criteria API de JPA. Los filtros por talla y stock usan subqueries `EXISTS` sobre `product_variants` para evitar duplicados en la paginación.

### Carrito como estado de servidor (TanStack Query)

A diferencia del patrón típico de `useState + localStorage`, el carrito es estado de servidor gestionado con TanStack Query. Beneficios directos: sincronización entre pestañas, persistencia entre dispositivos para el usuario registrado, y acceso siempre al stock actualizado.

### KPIs derivados de experiencia retail real

Las métricas del dashboard no son genéricas — son las que se usan en operaciones de turno reales:

| KPI | Fórmula | Por qué importa |
|---|---|---|
| Sell-Through Rate | `vendidas × 100 / (vendidas + stock)` | Eficiencia de la compra de producto |
| Días de Cobertura | `stock / ventas diarias medias` | Alerta de reposición de stock |
| Tasa de Merma | `ajustes negativos / total movimientos` | Pérdida por robo, daño o error |
| Ticket Medio | `ingresos / pedidos` | Rentabilidad por transacción |

### Autenticación JWT stateless

El token incluye `userId` y `role` como claims, evitando queries adicionales a la BD por request. La cadena de filtros de Spring Security protege `/api/admin/**` con una sola regla. El middleware de Next.js protege las rutas del backoffice antes de renderizar en servidor, sin flash de contenido no autorizado.

### URL State para filtros y reportes

Los filtros del catálogo y el rango de fechas del dashboard se almacenan en los `searchParams` de la URL. El catálogo se puede marcar como favorito o compartir con los filtros activos; los reportes del dashboard son reproducibles con un enlace.

---

## Arquitectura

```
kickscontrol/
├── kickscontrol-backend/          Spring Boot API
│   └── src/main/java/
│       ├── controller/            REST endpoints (público + admin separados)
│       ├── service/               Lógica de negocio con interface + impl
│       ├── repository/            JPA + Specifications para filtros dinámicos
│       ├── entity/                @Version, @PrePersist, ENUMs
│       ├── dto/                   DTOs de request y response separados
│       ├── security/              JwtFilter + SecurityFilterChain
│       └── exception/             GlobalExceptionHandler + jerarquía de excepciones
│
├── kickscontrol-frontend/         Next.js 16 App Router
│   ├── app/
│   │   ├── (store)/               Catálogo, producto, carrito, pedidos
│   │   ├── backoffice/            Dashboard, inventario, pedidos (admin)
│   │   └── login / register/
│   ├── components/
│   │   ├── backoffice/            KpiCard, gráficos Recharts, StockAdjustModal
│   │   ├── cart/                  CartDrawer
│   │   └── catalog/               FilterPanel, ProductGrid
│   ├── context/                   AuthContext (useReducer), CartContext
│   └── lib/                       apiClient, analytics, products, admin
│
├── docker-compose.yml             Profiles: db | full
└── Makefile                       Comandos de desarrollo unificados
```

---

## Testing

| Capa | Framework | Qué se cubre |
|---|---|---|
| Servicios backend | JUnit 5 + Mockito | Lógica de checkout, carrito, merge de ítems |
| Controladores backend | @WebMvcTest + MockMvc | Mapeo de rutas, serialización JSON, códigos HTTP |
| Utilidades JWT | JUnit 5 + ReflectionTestUtils | Generación, validación y expiración de tokens |
| Componentes frontend | Vitest 4 + React Testing Library | Login, registro, ProductCard, comportamiento UI |
| End-to-end | Playwright | Flujo completo de registro → checkout → pedido |

---

## Infraestructura Docker

- **Multi-stage Dockerfile** — imagen de producción con solo el JRE y el JAR, sin Maven ni código fuente (~200 MB menos)
- **Docker Compose profiles** — `make db` (solo PostgreSQL), `make full` (stack completo)
- **Health checks con Actuator** — el frontend solo arranca cuando el backend está listo (`depends_on: condition: service_healthy`)
- **Makefile** como interfaz del proyecto — `make dev`, `make seed`, `make clean`

---

## API Reference

Documentación interactiva completa en `/swagger-ui.html`. Endpoints principales:

| Grupo | Endpoints |
|---|---|
| Auth | `POST /api/auth/register` · `POST /api/auth/login` |
| Catálogo | `GET /api/products` (7 filtros) · `GET /api/products/{id}` |
| Carrito | `GET/POST /api/cart` · `PUT/DELETE /api/cart/items/{id}` |
| Pedidos | `POST /api/orders/checkout` · `GET /api/orders` |
| Admin — Inventario | `PATCH /api/admin/variants/{id}/stock` · alertas de stock bajo |
| Admin — Pedidos | `GET /api/admin/orders` · `PATCH /api/admin/orders/{id}/status` |
| Analytics | `GET /api/admin/analytics/summary` · `/revenue-chart` · `/top-sellers` |

---

## Quick Start

```bash
# Clonar y arrancar el stack completo
cp .env.example .env
make full
```

- Frontend: `http://localhost:3000`
- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

Cuenta de administrador del seed: `admin@kickscontrol.com` / `Admin1234!`

---

*Proyecto desarrollado íntegramente por Juan David Gil. Sprints 1–4 completados: cimientos, catálogo e inventario, carrito y checkout transaccional, KPI dashboard y suite de tests.*
