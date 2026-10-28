-- Pone al día una base de datos creada antes de octubre de 2026.
-- schema.sql solo se ejecuta al crear el volumen; este script es idempotente y se puede repetir.
--   docker exec -i kickscontrol-db psql -U kickscontrol_user -d kickscontrol < kickscontrol-backend/src/main/resources/db/migrations/2026-10-tienda-fisica.sql

-- Calzado o ropa
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type VARCHAR(20) NOT NULL DEFAULT 'FOOTWEAR';
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);

-- Registro de ajustes manuales de stock
CREATE TABLE IF NOT EXISTS stock_movements (
    id          BIGSERIAL PRIMARY KEY,
    variant_id  BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    user_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
    delta       INT NOT NULL,
    reason      VARCHAR(20) NOT NULL,
    stock_after INT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_movement_delta  CHECK (delta <> 0),
    CONSTRAINT chk_movement_after  CHECK (stock_after >= 0),
    CONSTRAINT chk_movement_reason CHECK (reason IN ('RECEPCIÓN', 'DEVOLUCIÓN', 'AJUSTE', 'MERMA'))
);
CREATE INDEX IF NOT EXISTS idx_movements_variant_created ON stock_movements(variant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_movements_reason_created  ON stock_movements(reason, created_at);

-- Canal de venta: web o caja de la tienda física
ALTER TABLE orders ADD COLUMN IF NOT EXISTS channel VARCHAR(10) NOT NULL DEFAULT 'ONLINE';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(10);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cash_given NUMERIC(10, 2);
DO $$ BEGIN
  ALTER TABLE orders ADD CONSTRAINT chk_order_channel CHECK (channel IN ('ONLINE', 'STORE'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE orders ADD CONSTRAINT chk_order_payment CHECK (payment_method IS NULL OR payment_method IN ('CARD', 'CASH'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_orders_channel_created ON orders(channel, created_at);
