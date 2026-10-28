# KicksControl — Full-Stack Sneaker E-Commerce & Backoffice

> Proyecto de portfolio por **Juan David Gil**  
> DAW + Ingeniería de Sistemas @ UPM | ex Shift Leader @ Foot Locker

---

## Descripción

KicksControl es una aplicación full-stack de una tienda de zapatillas y ropa con tres caras que comparten **un único stock por talla y color**:

1. **Tienda online** (`/`) — catálogo, ficha de producto con el stock de cada talla, cesta, checkout y pedidos.
2. **Tienda física** (`/tienda`) — portada para los dispositivos de la tienda, catálogo con lo que queda en el almacén, **caja (TPV)** e inventario; caja e inventario piden el acceso del personal.
3. **Backoffice** (`/backoffice`) — dashboard de KPIs de turno, inventario por variante, reposición, pedidos de ambos canales y usuarios.

El diferenciador no es el e-commerce en sí, sino la **lógica de operaciones retail real** que hay detrás: inventario por variante, trazabilidad de cada ajuste de stock, una caja que vende del mismo almacén que la web sin vender dos veces la última unidad, y KPIs de turno (sell-through, cobertura, merma) que salen de la experiencia como Shift Leader en Foot Locker.

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

### Tienda online (clientes)

- **Identidad de almacén** — base blanca al estilo Kith / SVD con personalidad propia: etiqueta de caja de zapatos (código de barras, referencia, unidades) en cada producto y una franja de stock en directo sobre la cabecera
- **Páginas de categoría propias** — Running, Basketball, Lifestyle y Skateboarding tienen cada una su diseño, no una plantilla recoloreada
- **Catálogo con filtros dinámicos** — marca, categoría, talla, color, género e in-stock almacenados en la URL (bookmarkeable y compartible, con soporte SEO)
- **Detalle de producto** — selector de talla y color con estado de stock en tiempo real por variante
- **Carrito persistente en servidor** — sincronizado entre dispositivos y pestañas, sin `localStorage`
- **Checkout transaccional con protección en 3 capas** contra overselling concurrente
- **Historial de pedidos** con badges de estado y vista de detalle
- **Pasarela de pago simulada** con animación de tarjeta y descarga de recibo en PDF

### Tienda física (personal y clientes en tienda)

- **Portada de tienda** (`/tienda`) — tres accesos: Catálogo (abierto) y Caja e Inventario (con candado: piden el inicio de sesión del personal y vuelven a la pantalla pedida)
- **Catálogo de tienda** — buscador, filtro por categoría y la matriz talla × color con las unidades que quedan en el almacén
- **Caja (TPV)** — escaneo de SKU (un lector de códigos teclea el SKU + Enter) o búsqueda por modelo, ticket con cantidades limitadas al stock, cobro con tarjeta o efectivo con cálculo del cambio, comprobante y resumen de "Hoy en caja"
- La venta en caja **nace entregada**, queda a nombre del dependiente y aparece en el backoffice con la etiqueta *Tienda*

### Backoffice (ADMIN / SHIFT_LEADER)

- **Gestión de inventario** — fila por modelo con miniatura, avisos de tallas agotadas o bajas y una **matriz talla × color** donde cada caja se pulsa para ajustar su stock
- **Ajuste de stock trazable** — delta (+/−) y motivo (Recepción / Devolución / Recuento / Merma); el servidor valida el signo (una merma no puede sumar) y cada ajuste queda en `stock_movements` con autor y stock resultante, visible como historial de la caja
- **Lista de reposición** — las variantes con ≤ 5 unidades, de la más vacía a la menos, con acceso directo al ajuste
- **Gestión de pedidos** — filtros por estado con recuento, paginación, desglose de artículos, canal (online / tienda) y transiciones de estado inline
- **Dashboard KPI** — rango de fechas configurable + granularidad (día / semana / mes):
  - Ingresos totales, pedidos, ticket medio, unidades vendidas
  - **Sell-Through Rate** — `unidades vendidas × 100 / (vendidas + stock actual)`
  - **Días de Cobertura** — `stock actual / ventas diarias medias`
  - **Tasa de Merma** — unidades dadas de baja por merma / (vendidas + dadas de baja)
  - Gráfico de ingresos, lo que más sale y pedidos por estado
  - Cuenta como venta todo pedido confirmado, enviado o entregado, de la web y de la caja

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

### Un único stock para dos canales

Web y caja venden del mismo almacén. El descuento de stock con las tres capas vive en un único método privado (`takeFromShelf`) que usan tanto `checkout()` como `storeSale()`: bloquea cada variante con `SELECT FOR UPDATE`, comprueba las unidades, las descuenta y congela el precio. Si un cliente online y el dependiente intentan llevarse la última unidad a la vez, uno de los dos recibe `InsufficientStockException` y su transacción hace rollback completo.

Cada pedido lleva `channel` (`ONLINE` / `STORE`), `payment_method` y `cash_given`; en una venta de caja `user_id` es el dependiente que la cobró.

### Trazabilidad de stock: `stock_movements`

Cada ajuste manual (recepción, devolución, recuento, merma) se guarda con autor, motivo, delta y stock resultante, en la misma transacción que el cambio de stock y con el mismo bloqueo de fila. Las reglas del motivo (`StockMovementReason`: una recepción suma, una merma resta) se validan en el servidor, no solo en la interfaz. Así la tasa de merma del dashboard es un dato real y cada caja tiene su historial ("−1 · Recuento · Juan García · quedan 0").

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
| Tasa de Merma | `uds merma × 100 / (uds vendidas + uds merma)` | Qué parte de lo que salió de la estantería fue pérdida (robo, daño, error) y no venta |
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
│   │   ├── (store)/               Tienda online: catálogo, categorías, producto, checkout, pedidos
│   │   ├── tienda/                Tienda física: portada, catálogo, caja, inventario
│   │   ├── backoffice/            Dashboard, inventario, pedidos, usuarios
│   │   └── login / register/
│   ├── components/
│   │   ├── tienda/                StoreShell, Till (caja), StoreCatalog, ProductSizes
│   │   ├── backoffice/            KpiCard, gráficos, StockAdjustModal, LowStockPanel
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
| Servicios backend | JUnit 5 + Mockito | Checkout, venta en caja (efectivo, cambio, líneas repetidas, stock insuficiente), ajuste de stock y su registro, carrito |
| Controladores backend | @WebMvcTest + MockMvc | Mapeo de rutas, serialización JSON, códigos HTTP |
| Utilidades JWT | JUnit 5 + ReflectionTestUtils | Generación, validación y expiración de tokens |
| Componentes frontend | Vitest 4 + React Testing Library | Login, KpiCard, StockBadge, analytics, detección de SKU escaneado |
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
| Tienda física | `POST /api/store/sales` · `GET /api/store/sales/today` · `GET /api/store/variants/{sku}` |
| Admin — Inventario | `PATCH /api/admin/variants/{id}/stock` · `GET /api/admin/variants/{id}/movements` · alertas de stock bajo |
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

Cuentas del seed:

| Rol | Email | Contraseña |
|---|---|---|
| Admin | `admin@kickscontrol.com` | `Admin1234!` |
| Shift Leader | `shiftleader@kickscontrol.com` | `Admin1234!` |
| Cliente | `cliente@kickscontrol.com` | `User1234!` |

---

## Capturas

Todas en [`docs/capturas/`](docs/capturas/). Se regeneran con `BASE=http://localhost:3000 node kickscontrol-frontend/scripts/capturas-portfolio.mjs` (añade `--con-venta` para cobrar una venta real y capturar el ticket).

**Tienda online**

| | |
|---|---|
| ![Portada](docs/capturas/01-web-portada.png) | ![Catálogo](docs/capturas/02-web-catalogo.png) |
| ![Categoría Running](docs/capturas/03-web-categoria-running.png) | ![Categoría Skate](docs/capturas/04-web-categoria-skate.png) |
| ![Producto con talla elegida](docs/capturas/05-web-producto-talla.png) | ![Cesta](docs/capturas/06-web-cesta.png) |
| ![Checkout](docs/capturas/07-web-checkout-pago.png) | ![Mis pedidos](docs/capturas/08-web-mis-pedidos.png) |

**Backoffice**

| | |
|---|---|
| ![Ajuste de stock con historial](docs/capturas/10-backoffice-ajuste-stock.png) | ![Inventario con matriz talla × color](docs/capturas/11-backoffice-inventario-matriz.png) |
| ![Pedidos con venta de tienda](docs/capturas/12-backoffice-pedidos.png) | ![Usuarios](docs/capturas/13-backoffice-usuarios.png) |

Dashboard completo: [`09-backoffice-dashboard.png`](docs/capturas/09-backoffice-dashboard.png)

**Tienda física**

| | |
|---|---|
| ![Portada de tienda](docs/capturas/14-tienda-portada.png) | ![Catálogo de tienda](docs/capturas/15-tienda-catalogo.png) |
| ![Tallas en almacén](docs/capturas/16-tienda-tallas.png) | ![Acceso del personal](docs/capturas/17-tienda-acceso-personal.png) |
| ![Caja: ticket y cobro en efectivo](docs/capturas/18-tienda-caja-ticket.png) | ![Caja: venta cobrada](docs/capturas/19-tienda-caja-cobrado.png) |

**Móvil y tablet**

| | | | |
|---|---|---|---|
| ![Portada móvil](docs/capturas/20-movil-portada.png) | ![Producto móvil](docs/capturas/21-movil-producto.png) | ![Backoffice móvil](docs/capturas/22-movil-backoffice.png) | ![Catálogo de tienda en tablet](docs/capturas/23-tablet-vertical-catalogo-tienda.png) |

---

*Proyecto desarrollado íntegramente por Juan David Gil. Sprints 1–5 completados: cimientos, catálogo e inventario, carrito y checkout transaccional, KPI dashboard, y rediseño con trazabilidad de stock y tienda física.*
