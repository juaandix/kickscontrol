-- ============================================================
-- KicksControl Database Schema
-- ============================================================

CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'SHIFT_LEADER');
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- Users
CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    role        user_role NOT NULL DEFAULT 'USER',
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    brand       VARCHAR(100) NOT NULL,
    description TEXT,
    gender      VARCHAR(20),
    category    VARCHAR(100),
    base_price  NUMERIC(10, 2) NOT NULL,
    image_url   VARCHAR(500),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_brand    ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active   ON products(is_active);

-- Product Variants (SKU level — talla + color)
CREATE TABLE IF NOT EXISTS product_variants (
    id             BIGSERIAL PRIMARY KEY,
    product_id     BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size           VARCHAR(10) NOT NULL,
    color          VARCHAR(50) NOT NULL,
    sku            VARCHAR(100) NOT NULL UNIQUE,
    stock_quantity INT NOT NULL DEFAULT 0,
    price_modifier NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    image_url      VARCHAR(500),
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    version        BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_stock_non_negative CHECK (stock_quantity >= 0),
    CONSTRAINT chk_quantity_positive  CHECK (stock_quantity >= 0)
);

CREATE INDEX IF NOT EXISTS idx_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku        ON product_variants(sku);
CREATE UNIQUE INDEX IF NOT EXISTS idx_variants_product_size_color ON product_variants(product_id, size, color);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES users(id),
    status           order_status NOT NULL DEFAULT 'PENDING',
    total_amount     NUMERIC(10, 2) NOT NULL,
    shipping_address TEXT,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id            ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status             ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at_status  ON orders(created_at, status);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id          BIGSERIAL PRIMARY KEY,
    order_id    BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    variant_id  BIGINT NOT NULL REFERENCES product_variants(id),
    quantity    INT NOT NULL,
    unit_price  NUMERIC(10, 2) NOT NULL,
    CONSTRAINT chk_item_quantity CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);

-- Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    variant_id  BIGINT NOT NULL REFERENCES product_variants(id),
    quantity    INT NOT NULL,
    added_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_cart_quantity CHECK (quantity > 0),
    CONSTRAINT uq_cart_user_variant UNIQUE (user_id, variant_id)
);

-- ============================================================
-- Analytics Views
-- ============================================================

CREATE OR REPLACE VIEW v_product_stock_summary AS
    SELECT
        p.id AS product_id,
        p.name,
        p.brand,
        SUM(pv.stock_quantity) AS total_stock,
        COUNT(pv.id) AS variant_count,
        MIN(pv.stock_quantity) AS min_variant_stock
    FROM products p
    JOIN product_variants pv ON pv.product_id = p.id AND pv.is_active = TRUE
    WHERE p.is_active = TRUE
    GROUP BY p.id, p.name, p.brand;

CREATE OR REPLACE VIEW v_top_sellers AS
    SELECT
        p.id AS product_id,
        p.name,
        p.brand,
        pv.color,
        pv.size,
        pv.sku,
        SUM(oi.quantity) AS units_sold,
        SUM(oi.quantity * oi.unit_price) AS revenue
    FROM order_items oi
    JOIN product_variants pv ON pv.id = oi.variant_id
    JOIN products p ON p.id = pv.product_id
    JOIN orders o ON o.id = oi.order_id AND o.status = 'CONFIRMED'
    GROUP BY p.id, p.name, p.brand, pv.color, pv.size, pv.sku
    ORDER BY revenue DESC;
