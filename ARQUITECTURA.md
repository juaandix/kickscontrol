# KicksControl — Documento de Arquitectura y Decisiones Técnicas

> Este documento explica las decisiones de diseño y tecnología tomadas en cada capa del proyecto. El objetivo es que puedas defender cada elección en una entrevista técnica y entender por qué se descartaron las alternativas.

---

## Índice

1. [Visión General del Proyecto](#1-visión-general-del-proyecto)
2. [Estructura del Repositorio](#2-estructura-del-repositorio)
3. [Stack Tecnológico — Por qué cada elección](#3-stack-tecnológico--por-qué-cada-elección)
4. [Sprint 1 — Los Cimientos](#4-sprint-1--los-cimientos)
   - [Modelo de datos](#41-modelo-de-datos)
   - [Autenticación JWT y Spring Security](#42-autenticación-jwt-y-spring-security)
   - [Arquitectura por capas del backend](#43-arquitectura-por-capas-del-backend)
   - [Manejo global de errores](#44-manejo-global-de-errores)
   - [Infraestructura Docker](#45-infraestructura-docker)
   - [Frontend: estructura y contextos](#46-frontend-estructura-y-contextos)
5. [Sprint 2 — Catálogo e Inventario](#5-sprint-2--catálogo-e-inventario)
   - [Filtros dinámicos con JPA Specifications](#51-filtros-dinámicos-con-jpa-specifications)
   - [Diseño de endpoints REST](#52-diseño-de-endpoints-rest)
   - [TanStack Query sobre useEffect](#53-tanstack-query-sobre-useeffect)
   - [URL State para filtros del catálogo](#54-url-state-para-filtros-del-catálogo)
   - [Route Groups de Next.js](#55-route-groups-de-nextjs)
   - [Backoffice: tabla expandible y modal de stock](#56-backoffice-tabla-expandible-y-modal-de-stock)
6. [Decisiones transversales y de calidad](#6-decisiones-transversales-y-de-calidad)
7. [Decisiones pendientes — Sprints 3 y 4](#7-decisiones-pendientes--sprints-3-y-4)

---

## 1. Visión General del Proyecto

KicksControl es una aplicación web full-stack de venta de calzado deportivo con un **Backoffice de gestión avanzado**. El diferenciador no es el e-commerce en sí, sino el panel de administración diseñado con lógica de operaciones retail real: gestión de inventario por variantes complejas (modelo → talla + color → stock independiente) y analítica de KPIs de turno.

La arquitectura refleja dos dominios distintos con necesidades técnicas distintas:

| Dominio | Necesidad principal | Solución técnica |
|---|---|---|
| E-Commerce público | SEO, rendimiento, UX fluida | Next.js 15 con Server Components + TanStack Query |
| Backoffice privado | Interactividad rica, estado complejo | React Client Components, mutaciones con TanStack Query |
| API | Seguridad por roles, consistencia, escalabilidad | Spring Boot 3.5 + Spring Security + JWT |
| Datos | Transaccionalidad estricta, consultas analíticas | PostgreSQL + Hibernate/JPA |

---

## 2. Estructura del Repositorio

```
Proyecto_Inventario/
├── kickscontrol-backend/     # Spring Boot — API REST
├── kickscontrol-frontend/    # Next.js 15 — UI
├── docker-compose.yml        # Orquestación local
├── Makefile                  # Interfaz de comandos del proyecto
├── .env.example              # Plantilla de variables de entorno
└── ARQUITECTURA.md           # Este documento
```

### ¿Monorepo o dos repositorios separados?

Se eligió **monorepo** por ser un proyecto de portfolio unipersonal. Las ventajas en este contexto son claras:

- Un solo `git clone` para quien revise el proyecto
- El `docker-compose.yml` y el `Makefile` viven junto al código que orquestan
- Los cambios que afectan a backend y frontend se pueden ver en un solo commit

En un equipo real con pipelines de CI independientes y equipos separados, la decisión se invertiría hacia repositorios independientes.

---

## 3. Stack Tecnológico — Por qué cada elección

### Java 17 + Spring Boot 3.5

**Por qué Java y no Node.js/Python para el backend:**

El objetivo del proyecto es demostrar dominio de Java en un entorno empresarial real. Spring Boot es el estándar de facto en empresas españolas y europeas para aplicaciones backend de negocio. Elegir Node.js aquí habría sido más cómodo pero menos diferenciador para el perfil objetivo.

**Por qué Spring Boot 3.5 y no versiones anteriores:**

Spring Boot 3.x requiere Java 17+ y trae mejoras sustanciales sobre la línea 2.x: soporte nativo de Jakarta EE 10, mejor integración con GraalVM para compilación nativa (relevante para optimización futura), y el ecosistema de librerías más actualizado. La versión 3.5 es la última estable en el momento del desarrollo.

**Alternativas descartadas:**

| Alternativa | Por qué se descartó |
|---|---|
| Quarkus | Stack más pequeño pero menos conocido en el mercado laboral español |
| Micronaut | Misma razón. Spring sigue dominando en entrevistas y ofertas de trabajo |
| Spring MVC sin Boot | Configuración manual innecesaria. Boot resuelve el 90% del setup |

### PostgreSQL

**Por qué relacional y no NoSQL:**

El dominio del problema lo exige. Las relaciones entre `products`, `product_variants`, `orders` y `order_items` son inherentemente relacionales y se benefician de las garantías ACID de PostgreSQL, especialmente en el flujo de checkout donde la integridad transaccional es crítica.

**Por qué PostgreSQL y no MySQL:**

- Soporte superior de tipos de datos complejos (ENUMs nativos, JSON, arrays)
- Mejor rendimiento en consultas analíticas complejas (relevante para los KPIs del Sprint 4)
- Las vistas materializadas de PostgreSQL son más potentes para los dashboards
- Es el estándar en el ecosistema cloud moderno (Railway, Supabase, Render)

### Next.js 15 con App Router

**Por qué Next.js y no React puro + Vite:**

Next.js resuelve varias necesidades del proyecto que React puro no cubre sin configuración adicional:

1. **Server Components:** el catálogo público puede renderizarse en servidor, lo que significa cero JavaScript de cliente para la lista de productos, mejor SEO y First Contentful Paint más rápido
2. **App Router:** layout anidados (`(store)/layout.tsx` vs `backoffice/layout.tsx`) permiten estructurar la aplicación en dos dominios visuales completamente distintos sin duplicar lógica
3. **Middleware:** la protección de rutas del backoffice se implementa a nivel de servidor, antes de que el HTML llegue al cliente. Ningún usuario sin token válido recibirá nunca el HTML del backoffice

**Por qué App Router y no Pages Router:**

El Pages Router está en modo mantenimiento. El App Router es el futuro de Next.js y demuestra conocimiento del paradigma moderno de React Server Components, que es exactamente lo que diferencia a alguien que "usa Next.js" de alguien que "entiende Next.js".

### TypeScript estricto

El `tsconfig.json` tiene `"strict": true`. Esto no es un detalle menor: TypeScript sin modo estricto es esencialmente JavaScript con sintaxis adicional. El modo estricto habilita `strictNullChecks`, `noImplicitAny` y otras reglas que previenen la categoría de bugs más común en frontend.

---

## 4. Sprint 1 — Los Cimientos

### 4.1 Modelo de datos

#### La decisión más importante: separar `products` de `product_variants`

Este es el núcleo del diferenciador técnico del proyecto. En la mayoría de e-commerces de portfolio, un producto tiene un único precio y un único stock. En KicksControl el modelo refleja la realidad del retail de calzado:

```
Air Max 90 (producto)
├── Talla 40 / Color Blanco   → SKU: NK-AM90-40-WB  → Stock: 15
├── Talla 40 / Color Rojo     → SKU: NK-AM90-40-UR  → Stock: 10
├── Talla 42 / Color Blanco   → SKU: NK-AM90-42-WB  → Stock: 18
└── Talla 44 / Color Blanco   → SKU: NK-AM90-44-WB  → Stock: 8  (+5€)
```

Cada variante es una entidad independiente con su propio `sku`, `stock_quantity` y `price_modifier`. Esta separación tiene consecuencias técnicas directas:

- El checkout descuenta stock de la **variante específica**, no del producto
- Un producto puede estar "disponible" aunque algunas tallas estén agotadas
- El sistema puede aplicar diferencial de precio por talla (práctica común en el mercado)

#### El campo `@Version` en `ProductVariant`

```java
@Version
private Long version;
```

Esta anotación de Hibernate activa el **Optimistic Locking** de forma automática. Cuando dos usuarios intentan comprar la última unidad de una variante simultáneamente, solo uno tendrá éxito. El mecanismo es el siguiente:

1. Usuario A lee la variante: `version = 5, stock = 1`
2. Usuario B lee la variante: `version = 5, stock = 1`
3. Usuario A hace `UPDATE SET stock=0, version=6 WHERE id=? AND version=5` → éxito
4. Usuario B hace `UPDATE SET stock=0, version=6 WHERE id=? AND version=5` → falla (version ya es 6)
5. Hibernate lanza `OptimisticLockingFailureException` → el checkout de B hace rollback

Esto se combina en el Sprint 3 con un lock pesimista en la query de checkout para una defensa en capas.

#### `unit_price` en `order_items`: el snapshot de precio

```sql
unit_price  NUMERIC(10, 2) NOT NULL
```

El precio de un ítem de pedido nunca se calcula desde el catálogo actual. Se guarda en el momento de la compra. Si mañana el precio del Air Max 90 sube a 149€, los pedidos de hoy siguen mostrando 129,99€. Esto es correcto tanto técnica como legalmente.

#### ENUMs a nivel de base de datos

```sql
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'SHIFT_LEADER');
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED');
```

Definir los ENUMs en PostgreSQL además de en Java garantiza integridad a nivel de base de datos. Ninguna aplicación externa podría insertar un rol inválido directamente en la BD. En Java se mapean con `@Enumerated(EnumType.STRING)` para que los valores sean legibles en la base de datos (no números enteros).

#### Índices y su justificación

```sql
CREATE INDEX idx_products_brand    ON products(brand);
CREATE INDEX idx_orders_created_at_status ON orders(created_at, status);
```

Cada índice tiene una justificación de negocio:
- `brand`, `category`: filtros del catálogo que se ejecutarán en cada request de usuario
- `created_at, status` compuesto en orders: las queries de KPIs siempre filtran por rango de fechas Y estado `CONFIRMED`. Un índice compuesto evita un full scan en la tabla de pedidos

### 4.2 Autenticación JWT y Spring Security

#### JWT sobre sesiones con estado

La decisión de usar JWT en lugar de sesiones de servidor tiene implicaciones arquitectónicas importantes:

| Criterio | JWT (stateless) | Sesiones (stateful) |
|---|---|---|
| Escalabilidad | Cualquier instancia puede validar el token | Requiere sticky sessions o cache compartida |
| Infraestructura | Sin dependencia de Redis/memcached | Necesita almacenamiento de sesiones |
| Revocación | Compleja (lista negra) | Trivial (borrar sesión) |
| Frontend desacoplado | Sí, el token viaja en header | Depende de cookies de dominio |

Para este proyecto, JWT es la elección correcta: la API está pensada para ser consumida por un frontend desacoplado (diferente puerto en desarrollo, potencialmente diferente dominio en producción).

**Qué contiene el token:**

```java
Jwts.builder()
    .subject(user.getEmail())
    .claim("userId", user.getId())
    .claim("role", user.getRole().name())
    ...
```

El token lleva `userId` y `role` como claims, evitando una query a la base de datos en cada request solo para saber quién es el usuario. El backend puede extraer el rol directamente del token firmado.

#### La cadena de filtros de Spring Security

```
Request HTTP
    ↓
JwtAuthenticationFilter (OncePerRequestFilter)
    → Extrae Bearer token del header Authorization
    → Valida firma + expiración con JwtUtil
    → Carga UserDetails y establece SecurityContext
    ↓
SecurityFilterChain
    → /api/auth/** → público
    → /api/products GET → público
    → /api/admin/** → requiere ROLE_ADMIN o ROLE_SHIFT_LEADER
    → resto → requiere autenticación
```

El filtro `OncePerRequestFilter` garantiza que se ejecuta **exactamente una vez** por request, incluso en cadenas de filtros complejas. Es el contrato correcto para un filtro de autenticación.

#### Por qué `ROLE_` prefix en las autoridades

```java
return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
```

Spring Security usa por convención el prefijo `ROLE_` para las autoridades cuando se usa `hasRole()`. Si se usa `hasAuthority()` no hace falta el prefijo. En este proyecto se usa `hasAnyRole('ADMIN', 'SHIFT_LEADER')` en el `SecurityFilterChain`, por lo que el prefijo es obligatorio en el `GrantedAuthority`.

### 4.3 Arquitectura por capas del backend

```
Controller      → Recibe HTTP, delega, devuelve ResponseEntity
    ↓
Service (interface + impl)  → Lógica de negocio, @Transactional
    ↓
Repository      → Acceso a datos, JPA queries
    ↓
Entity          → Mapeo objeto-relacional, @Version, @PrePersist
```

#### Por qué `interface` + `impl` para los servicios

```
service/
├── ProductService.java          (interfaz)
└── impl/
    └── ProductServiceImpl.java  (implementación)
```

Este patrón, aunque añade un archivo extra, tiene ventajas reales:

1. **Testabilidad:** en tests se puede inyectar un mock de la interfaz sin depender de la implementación real
2. **Desacoplamiento:** el controlador no conoce la implementación, solo el contrato
3. **Convención Spring:** Spring crea proxies AOP (para `@Transactional`) sobre interfaces, no sobre clases concretas en la configuración por defecto

#### DTOs separados de las entidades

Las entidades JPA **nunca** se devuelven directamente en los endpoints. Se usan DTOs específicos por dirección:

```
ProductRequestDto   → lo que entra (POST/PUT del cliente)
ProductResponseDto  → lo que sale (GET al cliente)
```

Las razones son múltiples:
- Evita exponer campos internos (como `@Version`, `createdAt` en ciertos contextos, o la contraseña del usuario)
- Permite que la forma del JSON de respuesta evolucione independientemente del esquema de base de datos
- Evita problemas de serialización de proxies Hibernate lazy (el `LazyInitializationException` es uno de los errores más comunes al serializar entidades directamente)

### 4.4 Manejo global de errores

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class) → 404
    @ExceptionHandler(BusinessException.class)         → 400
    @ExceptionHandler(InsufficientStockException.class)→ 409 Conflict
    @ExceptionHandler(MethodArgumentNotValidException.class) → 400 con detalle
    ...
}
```

#### Jerarquía de excepciones propias

Se definieron 3 excepciones de dominio:

| Excepción | HTTP | Cuándo se lanza |
|---|---|---|
| `ResourceNotFoundException` | 404 | Entidad no encontrada por ID |
| `BusinessException` | 400 | Regla de negocio violada (email duplicado, SKU repetido) |
| `InsufficientStockException` | 409 | Stock insuficiente en el checkout |

El código HTTP `409 Conflict` para stock insuficiente es deliberado: no es un error de cliente (400) ni un error de servidor (500). Es un conflicto de estado del recurso, que es exactamente lo que define la especificación HTTP para el 409.

#### `ApiResponse<T>` wrapper

```json
{
  "success": true,
  "message": "Login successful",
  "data": { "token": "...", "email": "...", "role": "ADMIN" },
  "timestamp": "2026-05-28T10:30:00"
}
```

Todos los endpoints devuelven esta estructura. Esto permite al frontend hacer un contrato simple: si `success === false`, mostrar `message` como error. Si `success === true`, usar `data`. Sin necesidad de parsear el código HTTP para decidir cómo tratar la respuesta.

### 4.5 Infraestructura Docker

#### Docker Compose con profiles

```yaml
profiles: [db, full]
```

La decisión de usar profiles de Compose en lugar de múltiples archivos `docker-compose.override.yml` hace la interfaz de desarrollo más simple:

```bash
docker compose --profile db up    # Solo PostgreSQL
docker compose --profile full up  # Todo el stack
```

En el día a día de desarrollo, el backend corre con `mvn spring-boot:run` (hot reload) apuntando a PostgreSQL en Docker. Levantar el frontend en Docker solo tiene sentido para la demo final o pruebas de integración.

#### Makefile como interfaz del proyecto

```makefile
make db      # PostgreSQL
make dev     # BD + backend hot-reload
make full    # Stack completo
make seed    # Recargar datos de prueba
make clean   # Limpiar todo
```

Un `Makefile` es una decisión de ergonomía para el equipo (o para quien revise el portfolio). Documenta implícitamente cómo se trabaja con el proyecto y elimina la fricción de recordar comandos Docker largos. Es una práctica habitual en proyectos backend y demuestra mentalidad DevOps.

#### Multi-stage Dockerfile del backend

```dockerfile
# Stage 1: Build (imagen pesada con JDK + Maven)
FROM eclipse-temurin:17-jdk-alpine AS builder
RUN ./mvnw package -DskipTests

# Stage 2: Runtime (imagen ligera con solo JRE)
FROM eclipse-temurin:17-jre-alpine
COPY --from=builder /app/target/*.jar app.jar
```

La imagen final de producción no contiene Maven, el código fuente, ni las dependencias de compilación. Solo el JAR ejecutable y el JRE mínimo. Esto reduce el tamaño de la imagen final en ~200MB y reduce la superficie de ataque en seguridad.

#### Health checks con Actuator

```yaml
healthcheck:
  test: ["CMD-SHELL", "wget -qO- http://localhost:8080/actuator/health || exit 1"]
  interval: 30s
  start_period: 60s
```

Sin el `start_period`, Docker Compose marcaría el backend como `unhealthy` mientras Spring Boot está arrancando (que puede tardar 30-60 segundos). El frontend tiene `depends_on: backend: condition: service_healthy`, lo que garantiza que no intenta conectarse hasta que el backend está realmente listo.

### 4.6 Frontend: estructura y contextos

#### `AuthContext` con `useReducer`

Se eligió `useReducer` sobre múltiples `useState` para el estado de autenticación por una razón de coherencia de estado:

```typescript
// Con useState (problemático)
setUser(user)
setToken(token)
setIsAuthenticated(true)  // ¿Y si falla entre estos tres?

// Con useReducer (atómico)
dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } })
```

La transición de estado `LOGIN_SUCCESS` es atómica: o se aplican todos los cambios o ninguno. No hay estados intermedios inconsistentes.

#### Middleware de Next.js para protección de rutas

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('kc_token')?.value
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
```

La protección de rutas del backoffice ocurre **antes de renderizar** en el servidor de Next.js. Un usuario sin token nunca recibe el HTML del backoffice. Esto es fundamentalmente diferente a proteger rutas con un `useEffect` en el cliente, donde el HTML se descarga primero y luego se redirige, lo que puede provocar un flash de contenido no autorizado (FOUC).

---

## 5. Sprint 2 — Catálogo e Inventario

### 5.1 Filtros dinámicos con JPA Specifications

#### El problema

El endpoint `GET /api/products` necesita soportar cualquier combinación de hasta 7 filtros. La solución naive sería escribir un método en el repositorio por cada combinación posible:

```java
// MAL: combinatoria explosiva
findByBrand(brand)
findByBrandAndCategory(brand, category)
findByBrandAndCategoryAndGender(brand, category, gender)
// ... 127 combinaciones posibles
```

#### La solución: JPA Specifications

```java
Specification<Product> spec = ProductSpecification.withFilters(
    brand, gender, category, minPrice, maxPrice, size, inStock
);
productRepository.findAll(spec, pageable);
```

`ProductSpecification.withFilters()` construye dinámicamente los predicados de la query usando la Criteria API de JPA. Solo se añaden las cláusulas `WHERE` correspondientes a los parámetros no nulos. El resultado es una única query SQL optimizada.

#### Subqueries para filtros sobre variantes

Los filtros de `size` e `inStock` son especialmente delicados porque filtran sobre la tabla `product_variants`, no sobre `products`. Un JOIN simple duplicaría filas en el resultado paginado (un producto con 5 variantes que cumplen el filtro aparecería 5 veces).

La solución es una **subquery de existencia**:

```sql
-- SQL generado para ?inStock=true
WHERE products.is_active = true
AND EXISTS (
    SELECT pv.product_id
    FROM product_variants pv
    WHERE pv.product_id = products.id
    AND pv.stock_quantity > 0
    AND pv.is_active = true
)
```

`EXISTS` es eficiente: el motor para en cuanto encuentra la primera variante con stock, sin necesitar leer todas.

### 5.2 Diseño de endpoints REST

#### Separación de recursos admin en controladores distintos

```
ProductController       → /api/products/**      (público)
AdminProductController  → /api/admin/products/** (admin)
AdminVariantController  → /api/admin/variants/** (admin)
```

Aunque se podría haber usado un único controlador con anotaciones `@PreAuthorize` por método, la separación en controladores distintos tiene ventajas:

- La URL deja claro el nivel de acceso (`/api/admin/` siempre requiere rol)
- El `SecurityFilterChain` puede proteger todo `/api/admin/**` con una sola regla
- En Swagger UI los endpoints aparecen agrupados por tag, mejorando la documentación

#### Soft delete en lugar de hard delete

```java
// ProductServiceImpl.java
product.setIsActive(false);  // nunca DELETE físico
productRepository.save(product);
```

Eliminar físicamente un producto crearía problemas de integridad referencial: los pedidos históricos tienen `order_items` apuntando a variantes de ese producto. En retail, un producto que deja de venderse no desaparece del historial de ventas.

### 5.3 TanStack Query sobre useEffect

Este es uno de los cambios más importantes en el frontend moderno. El patrón clásico:

```typescript
// Patrón 2020 — problemático
const [products, setProducts] = useState([])
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

useEffect(() => {
  setLoading(true)
  fetch('/api/products')
    .then(r => r.json())
    .then(data => setProducts(data))
    .catch(err => setError(err))
    .finally(() => setLoading(false))
}, [filters])  // ¿Y si filters cambia mientras la request está en vuelo?
```

Este patrón tiene problemas reales: condiciones de carrera cuando los filtros cambian rápido, no hay caché, cada desmontaje/montaje del componente repite la request, y el código de loading/error se duplica en cada componente.

Con TanStack Query:

```typescript
// Patrón actual
const { data, isLoading, isError } = useQuery({
  queryKey: ['products', filters],   // cache key + invalidación automática
  queryFn: () => fetchProducts(filters),
  staleTime: 1000 * 60,             // cache válida 1 minuto
})
```

TanStack Query proporciona de forma gratuita:
- **Caché automática**: navegar de vuelta al catálogo no refetcha si los datos son recientes
- **Deduplicación**: si dos componentes piden los mismos datos simultáneamente, solo hay una request HTTP
- **Background refetch**: cuando el usuario vuelve a la pestaña, los datos se revalidan silenciosamente
- **Invalidación explícita**: tras ajustar el stock en el backoffice, `queryClient.invalidateQueries({ queryKey: ['admin-products'] })` fuerza un refetch inmediato

### 5.4 URL State para filtros del catálogo

Los filtros del catálogo se almacenan en los `searchParams` de la URL:

```
/?brand=Nike&size=42&inStock=true
```

Esta decisión tiene impacto real en la UX:

1. **Bookmarkeabilidad**: un usuario puede guardar o compartir "Nike, talla 42 con stock" como enlace
2. **Botón atrás del navegador**: funciona como el usuario espera, volviendo al estado de filtros anterior
3. **SEO**: los bots de Google ven URLs con parámetros semánticamente descriptivos

La alternativa sería gestionar los filtros con `useState` local, que es más simple de implementar pero rompe todas las expectativas anteriores.

### 5.5 Route Groups de Next.js

```
app/
├── (store)/           ← Route Group — no aparece en la URL
│   ├── layout.tsx     ← Header + Footer para el e-commerce
│   ├── page.tsx       ← / (catálogo)
│   └── products/[id]/ ← /products/123
└── backoffice/        ← Sin paréntesis — sí aparece en la URL
    ├── layout.tsx     ← Sidebar oscuro del backoffice
    ├── page.tsx       ← /backoffice
    └── inventory/     ← /backoffice/inventory
```

Los Route Groups con paréntesis `(store)` permiten compartir un layout (Header + Footer) entre páginas sin que el nombre del grupo aparezca en la URL. Así `/` y `/products/123` comparten el mismo layout de tienda, mientras que `/backoffice` tiene su propio layout completamente distinto con sidebar oscuro.

### 5.6 Backoffice: tabla expandible y modal de stock

#### Tabla con filas expandibles

La decisión de mostrar las variantes dentro de la misma tabla (como filas expandibles al hacer clic en el producto) en lugar de una página de detalle separada fue una decisión de UX deliberada. Un Shift Leader que gestiona el inventario necesita ver rápidamente qué tallas hay de cada modelo y ajustar el stock sin navegar a otra pantalla.

```typescript
const [expandedId, setExpandedId] = useState<number | null>(null)
// Un solo ID puede estar expandido a la vez
```

#### `StockAdjustModal` con delta, no con valor absoluto

El modal de ajuste de stock pide una **diferencia** (`+10`, `-3`) en lugar de un valor absoluto final. Esta es una decisión directamente informada por la experiencia en operaciones retail:

- En un recuento de inventario, introduces cuántas unidades recibes (`+20`), no el stock total
- En un ajuste por merma, introduces cuántas unidades se dan de baja (`-2`)
- El sistema muestra en tiempo real el stock resultante para confirmar antes de guardar

El valor absoluto sería propenso a errores (¿cuánto hay actualmente? ¿introduzco el nuevo total?) y no refleja cómo se trabaja realmente en un almacén.

```typescript
// Vista previa del resultado antes de confirmar
const newStock = variant.stockQuantity + delta
// Color rojo si el resultado sería negativo
```

---

## 6. Decisiones transversales y de calidad

### Conventional Commits

Todo el historial de Git sigue la especificación Conventional Commits:

```
feat(sprint-1): complete project foundation and infrastructure
feat(sprint-2): catalog API, inventory CRUD and backoffice UI
```

El formato `tipo(scope): descripción` permite:
- Generación automática de CHANGELOGs
- Identificar el tipo de cambio sin leer el diff
- Herramientas como `semantic-release` para automatizar versiones

### Git Flow

```
main      ← código de producción (etiquetado con versiones)
develop   ← integración de features completadas
feature/* ← desarrollo de cada Sprint
```

Cada Sprint se desarrolla en su rama `feature/sprint-N-nombre`, se hace un PR (implícito en este proyecto unipersonal) y se mergea con `--no-ff` para preservar el grafo de commits. El flag `--no-ff` (no fast-forward) mantiene el merge commit, que hace visible en el historial cuándo se completó cada sprint.

### Swagger / OpenAPI en `/swagger-ui.html`

```java
@OpenAPIDefinition(info = @Info(title = "KicksControl API", version = "1.0"))
@SecurityScheme(name = "bearerAuth", type = SecuritySchemeType.HTTP, scheme = "bearer")
```

La UI de Swagger permite probar la API directamente desde el navegador sin necesidad de Postman o curl. Es especialmente valioso en un portfolio: un reclutador técnico puede levantar el stack con `make full` y explorar los endpoints sin escribir ni una línea de código.

### `@Transactional(readOnly = true)` en queries de lectura

```java
@Transactional(readOnly = true)
public Page<ProductResponseDto> findAll(...) { ... }
```

`readOnly = true` no es solo una optimización: indica explícitamente que este método no debe modificar datos, y Hibernate lo respeta:
- No hace flush del contexto de persistencia al final
- Algunos drivers de BD pueden enrutar a réplicas de solo lectura
- Actúa como documentación: cualquier desarrollador que lea el código sabe que este método no tiene efectos secundarios

### `@PrePersist` en entidades

```java
@PrePersist
protected void onCreate() {
    createdAt = LocalDateTime.now();
}
```

En lugar de gestionar las fechas de creación en el código de servicio, las entidades se auto-gestionan. Ningún servicio puede olvidarse de establecer `createdAt` porque la entidad lo hace ella misma antes de persistirse.

---

## 7. Decisiones pendientes — Sprints 3 y 4

### Sprint 3: Checkout transaccional — defensa en 3 capas

El flujo de compra implementará tres niveles de protección contra el problema de "dos usuarios compran el último par":

```
Capa 1 — @Version (Optimistic Lock)
    Hibernate detecta conflictos en memoria. Rápido, sin bloqueo de BD.

Capa 2 — SELECT FOR UPDATE (Pessimistic Lock)
    La query findByIdForUpdate() ya está preparada en ProductVariantRepository.
    Bloquea la fila durante la transacción. Garantía total, coste en throughput.

Capa 3 — CHECK (stock_quantity >= 0)
    Constraint de base de datos. Safety net absoluto.
    Ningún bug de aplicación puede poner el stock en negativo.
```

### Sprint 4: KPI Dashboard — métricas de retail reales

El dashboard implementará métricas que van más allá de las habituales en portfolios de e-commerce:

| Métrica | Fórmula | Relevancia |
|---|---|---|
| Ticket Medio | revenue total / nº pedidos | KPI universal de retail |
| Sell-Through Rate | unidades vendidas / unidades recibidas | Estándar en buying |
| Días de Cobertura | stock actual / promedio ventas diarias | Gestión de reposición |
| Tasa de Stock Crítico | variantes con stock ≤ 5 / total variantes | Alertas operativas |

Las vistas SQL `v_top_sellers` y `v_product_stock_summary` ya están creadas en el schema para servir estas queries de forma eficiente.

---

*Documento generado durante el desarrollo del proyecto KicksControl. Última actualización: Sprint 2 completado.*
