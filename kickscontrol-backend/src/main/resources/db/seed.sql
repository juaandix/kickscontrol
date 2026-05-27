-- ============================================================
-- KicksControl Seed Data
-- Passwords: admin123 / user123 (BCrypt)
-- ============================================================

-- Users
INSERT INTO users (email, password, first_name, last_name, role) VALUES
('admin@kickscontrol.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y', 'Admin', 'KicksControl', 'ADMIN'),
('shiftleader@kickscontrol.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y', 'Juan', 'García', 'SHIFT_LEADER'),
('cliente@kickscontrol.com', '$2a$10$TKh8H1.PfY4GWABzqDvVoO9MkHm.1sFl3N7eMqOXyRpMXXq5FVOW', 'María', 'López', 'USER')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- Products & Variants (20 modelos reales)
-- ============================================================

-- 1. Nike Air Max 90
INSERT INTO products (name, brand, description, gender, category, base_price, image_url) VALUES
('Air Max 90', 'Nike', 'Icónica zapatilla con unidad Air Max visible en el talón. Diseño retro con materiales de alta calidad.', 'UNISEX', 'Lifestyle', 129.99, 'https://static.nike.com/a/images/t_PDP_1280_v1/air-max-90.jpg')
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Air Max 90' AND brand='Nike'), '40', 'White/Black', 'NK-AM90-40-WB', 15, 0),
((SELECT id FROM products WHERE name='Air Max 90' AND brand='Nike'), '41', 'White/Black', 'NK-AM90-41-WB', 20, 0),
((SELECT id FROM products WHERE name='Air Max 90' AND brand='Nike'), '42', 'White/Black', 'NK-AM90-42-WB', 18, 0),
((SELECT id FROM products WHERE name='Air Max 90' AND brand='Nike'), '43', 'White/Black', 'NK-AM90-43-WB', 12, 0),
((SELECT id FROM products WHERE name='Air Max 90' AND brand='Nike'), '44', 'White/Black', 'NK-AM90-44-WB', 8, 5.00),
((SELECT id FROM products WHERE name='Air Max 90' AND brand='Nike'), '40', 'University Red', 'NK-AM90-40-UR', 10, 0),
((SELECT id FROM products WHERE name='Air Max 90' AND brand='Nike'), '42', 'University Red', 'NK-AM90-42-UR', 14, 0),
((SELECT id FROM products WHERE name='Air Max 90' AND brand='Nike'), '43', 'University Red', 'NK-AM90-43-UR', 6, 0)
ON CONFLICT (sku) DO NOTHING;

-- 2. Nike Air Force 1 Low
INSERT INTO products (name, brand, description, gender, category, base_price, image_url) VALUES
('Air Force 1 Low', 'Nike', 'El clásico por excelencia. Piel premium, suela de goma y la inconfundible silueta AF1.', 'UNISEX', 'Lifestyle', 109.99, 'https://static.nike.com/a/images/t_PDP_1280_v1/air-force-1-low.jpg')
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Air Force 1 Low' AND brand='Nike'), '39', 'Triple White', 'NK-AF1L-39-TW', 25, 0),
((SELECT id FROM products WHERE name='Air Force 1 Low' AND brand='Nike'), '40', 'Triple White', 'NK-AF1L-40-TW', 30, 0),
((SELECT id FROM products WHERE name='Air Force 1 Low' AND brand='Nike'), '41', 'Triple White', 'NK-AF1L-41-TW', 28, 0),
((SELECT id FROM products WHERE name='Air Force 1 Low' AND brand='Nike'), '42', 'Triple White', 'NK-AF1L-42-TW', 22, 0),
((SELECT id FROM products WHERE name='Air Force 1 Low' AND brand='Nike'), '43', 'Triple White', 'NK-AF1L-43-TW', 15, 0),
((SELECT id FROM products WHERE name='Air Force 1 Low' AND brand='Nike'), '44', 'Triple White', 'NK-AF1L-44-TW', 3, 5.00),
((SELECT id FROM products WHERE name='Air Force 1 Low' AND brand='Nike'), '40', 'Black', 'NK-AF1L-40-BK', 20, 0),
((SELECT id FROM products WHERE name='Air Force 1 Low' AND brand='Nike'), '42', 'Black', 'NK-AF1L-42-BK', 18, 0)
ON CONFLICT (sku) DO NOTHING;

-- 3. Adidas Stan Smith
INSERT INTO products (name, brand, description, gender, category, base_price, image_url) VALUES
('Stan Smith', 'Adidas', 'La zapatilla de tenis más famosa del mundo. Piel suave, diseño limpio y tres franjas icónicas.', 'UNISEX', 'Lifestyle', 99.99, 'https://assets.adidas.com/images/stan-smith.jpg')
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Stan Smith' AND brand='Adidas'), '39', 'White/Green', 'AD-SS-39-WG', 20, 0),
((SELECT id FROM products WHERE name='Stan Smith' AND brand='Adidas'), '40', 'White/Green', 'AD-SS-40-WG', 25, 0),
((SELECT id FROM products WHERE name='Stan Smith' AND brand='Adidas'), '41', 'White/Green', 'AD-SS-41-WG', 22, 0),
((SELECT id FROM products WHERE name='Stan Smith' AND brand='Adidas'), '42', 'White/Green', 'AD-SS-42-WG', 18, 0),
((SELECT id FROM products WHERE name='Stan Smith' AND brand='Adidas'), '43', 'White/Green', 'AD-SS-43-WG', 10, 0),
((SELECT id FROM products WHERE name='Stan Smith' AND brand='Adidas'), '40', 'White/Navy', 'AD-SS-40-WN', 15, 0),
((SELECT id FROM products WHERE name='Stan Smith' AND brand='Adidas'), '42', 'White/Navy', 'AD-SS-42-WN', 12, 0)
ON CONFLICT (sku) DO NOTHING;

-- 4. Adidas Superstar
INSERT INTO products (name, brand, description, gender, category, base_price, image_url) VALUES
('Superstar', 'Adidas', 'La shelloe característica y las tres franjas. Un ícono del streetwear desde 1969.', 'UNISEX', 'Lifestyle', 89.99, 'https://assets.adidas.com/images/superstar.jpg')
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Superstar' AND brand='Adidas'), '39', 'White/Black', 'AD-SUP-39-WB', 18, 0),
((SELECT id FROM products WHERE name='Superstar' AND brand='Adidas'), '40', 'White/Black', 'AD-SUP-40-WB', 22, 0),
((SELECT id FROM products WHERE name='Superstar' AND brand='Adidas'), '41', 'White/Black', 'AD-SUP-41-WB', 20, 0),
((SELECT id FROM products WHERE name='Superstar' AND brand='Adidas'), '42', 'White/Black', 'AD-SUP-42-WB', 16, 0),
((SELECT id FROM products WHERE name='Superstar' AND brand='Adidas'), '43', 'White/Black', 'AD-SUP-43-WB', 0, 0),
((SELECT id FROM products WHERE name='Superstar' AND brand='Adidas'), '40', 'All Black', 'AD-SUP-40-AB', 12, 0),
((SELECT id FROM products WHERE name='Superstar' AND brand='Adidas'), '42', 'All Black', 'AD-SUP-42-AB', 9, 0)
ON CONFLICT (sku) DO NOTHING;

-- 5. Nike React Infinity Run FK 3
INSERT INTO products (name, brand, description, gender, category, base_price, image_url) VALUES
('React Infinity Run FK 3', 'Nike', 'Diseñada para reducir lesiones. Espuma React que ofrece amortiguación y retorno de energía superiores.', 'MAN', 'Running', 159.99, 'https://static.nike.com/a/images/t_PDP_1280_v1/react-infinity-run-3.jpg')
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='React Infinity Run FK 3'), '40', 'Black/Volt', 'NK-RIFK3-40-BV', 10, 0),
((SELECT id FROM products WHERE name='React Infinity Run FK 3'), '41', 'Black/Volt', 'NK-RIFK3-41-BV', 14, 0),
((SELECT id FROM products WHERE name='React Infinity Run FK 3'), '42', 'Black/Volt', 'NK-RIFK3-42-BV', 11, 0),
((SELECT id FROM products WHERE name='React Infinity Run FK 3'), '43', 'Black/Volt', 'NK-RIFK3-43-BV', 8, 0),
((SELECT id FROM products WHERE name='React Infinity Run FK 3'), '44', 'Black/Volt', 'NK-RIFK3-44-BV', 4, 5.00),
((SELECT id FROM products WHERE name='React Infinity Run FK 3'), '41', 'White/Blue', 'NK-RIFK3-41-WB', 7, 0),
((SELECT id FROM products WHERE name='React Infinity Run FK 3'), '42', 'White/Blue', 'NK-RIFK3-42-WB', 9, 0)
ON CONFLICT (sku) DO NOTHING;

-- 6. Adidas Ultraboost 23
INSERT INTO products (name, brand, description, gender, category, base_price, image_url) VALUES
('Ultraboost 23', 'Adidas', 'Tecnología Boost para el mayor retorno de energía. Upper Primeknit adaptable al pie.', 'UNISEX', 'Running', 189.99, 'https://assets.adidas.com/images/ultraboost-23.jpg')
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Ultraboost 23'), '39', 'Core Black', 'AD-UB23-39-CB', 8, 0),
((SELECT id FROM products WHERE name='Ultraboost 23'), '40', 'Core Black', 'AD-UB23-40-CB', 12, 0),
((SELECT id FROM products WHERE name='Ultraboost 23'), '41', 'Core Black', 'AD-UB23-41-CB', 10, 0),
((SELECT id FROM products WHERE name='Ultraboost 23'), '42', 'Core Black', 'AD-UB23-42-CB', 9, 0),
((SELECT id FROM products WHERE name='Ultraboost 23'), '43', 'Core Black', 'AD-UB23-43-CB', 5, 0),
((SELECT id FROM products WHERE name='Ultraboost 23'), '40', 'Cloud White', 'AD-UB23-40-CW', 7, 0),
((SELECT id FROM products WHERE name='Ultraboost 23'), '42', 'Cloud White', 'AD-UB23-42-CW', 6, 0)
ON CONFLICT (sku) DO NOTHING;

-- 7. Puma Suede Classic XXI
INSERT INTO products (name, brand, description, gender, category, base_price, image_url) VALUES
('Suede Classic XXI', 'Puma', 'El Suede original desde 1968. Ante suave y suela de goma vulcanizada para un look atemporal.', 'UNISEX', 'Lifestyle', 79.99, 'https://images.puma.com/image/upload/suede-classic-xxi.jpg')
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Suede Classic XXI'), '39', 'Puma Black', 'PM-SXXI-39-PB', 15, 0),
((SELECT id FROM products WHERE name='Suede Classic XXI'), '40', 'Puma Black', 'PM-SXXI-40-PB', 18, 0),
((SELECT id FROM products WHERE name='Suede Classic XXI'), '41', 'Puma Black', 'PM-SXXI-41-PB', 20, 0),
((SELECT id FROM products WHERE name='Suede Classic XXI'), '42', 'Puma Black', 'PM-SXXI-42-PB', 16, 0),
((SELECT id FROM products WHERE name='Suede Classic XXI'), '39', 'Peacoat/White', 'PM-SXXI-39-PW', 10, 0),
((SELECT id FROM products WHERE name='Suede Classic XXI'), '41', 'Peacoat/White', 'PM-SXXI-41-PW', 8, 0)
ON CONFLICT (sku) DO NOTHING;

-- 8. New Balance 574
INSERT INTO products (name, brand, description, gender, category, base_price, image_url) VALUES
('574', 'New Balance', 'El clásico de New Balance. Absorción de impactos ENCAP y silueta chunky característica.', 'UNISEX', 'Lifestyle', 89.99, 'https://nb.com/images/574.jpg')
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='574' AND brand='New Balance'), '39', 'Grey/White', 'NB-574-39-GW', 12, 0),
((SELECT id FROM products WHERE name='574' AND brand='New Balance'), '40', 'Grey/White', 'NB-574-40-GW', 16, 0),
((SELECT id FROM products WHERE name='574' AND brand='New Balance'), '41', 'Grey/White', 'NB-574-41-GW', 14, 0),
((SELECT id FROM products WHERE name='574' AND brand='New Balance'), '42', 'Grey/White', 'NB-574-42-GW', 10, 0),
((SELECT id FROM products WHERE name='574' AND brand='New Balance'), '43', 'Grey/White', 'NB-574-43-GW', 6, 0),
((SELECT id FROM products WHERE name='574' AND brand='New Balance'), '40', 'Navy', 'NB-574-40-NV', 9, 0),
((SELECT id FROM products WHERE name='574' AND brand='New Balance'), '42', 'Navy', 'NB-574-42-NV', 7, 0)
ON CONFLICT (sku) DO NOTHING;

-- 9. Nike Air Jordan 1 Retro High OG
INSERT INTO products (name, brand, description, gender, category, base_price, image_url) VALUES
('Air Jordan 1 Retro High OG', 'Nike', 'La zapatilla que lo cambió todo. Piel de alta calidad, suela de goma y el icónico swoosh lateral.', 'UNISEX', 'Basketball', 179.99, 'https://static.nike.com/a/images/t_PDP_1280_v1/air-jordan-1-high.jpg')
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Air Jordan 1 Retro High OG'), '40', 'Chicago', 'NK-AJ1H-40-CH', 3, 0),
((SELECT id FROM products WHERE name='Air Jordan 1 Retro High OG'), '41', 'Chicago', 'NK-AJ1H-41-CH', 2, 0),
((SELECT id FROM products WHERE name='Air Jordan 1 Retro High OG'), '42', 'Chicago', 'NK-AJ1H-42-CH', 1, 0),
((SELECT id FROM products WHERE name='Air Jordan 1 Retro High OG'), '43', 'Chicago', 'NK-AJ1H-43-CH', 0, 0),
((SELECT id FROM products WHERE name='Air Jordan 1 Retro High OG'), '41', 'Shadow', 'NK-AJ1H-41-SH', 5, 0),
((SELECT id FROM products WHERE name='Air Jordan 1 Retro High OG'), '42', 'Shadow', 'NK-AJ1H-42-SH', 4, 0),
((SELECT id FROM products WHERE name='Air Jordan 1 Retro High OG'), '43', 'Shadow', 'NK-AJ1H-43-SH', 3, 0)
ON CONFLICT (sku) DO NOTHING;

-- 10. Converse Chuck Taylor All Star
INSERT INTO products (name, brand, description, gender, category, base_price, image_url) VALUES
('Chuck Taylor All Star Hi', 'Converse', 'La bota de baloncesto más vendida de la historia. Lona resistente y puntera de goma vulcanizada.', 'UNISEX', 'Lifestyle', 69.99, 'https://www.converse.com/images/chuck-taylor.jpg')
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Chuck Taylor All Star Hi'), '37', 'Optical White', 'CV-CTASH-37-OW', 20, 0),
((SELECT id FROM products WHERE name='Chuck Taylor All Star Hi'), '38', 'Optical White', 'CV-CTASH-38-OW', 22, 0),
((SELECT id FROM products WHERE name='Chuck Taylor All Star Hi'), '39', 'Optical White', 'CV-CTASH-39-OW', 25, 0),
((SELECT id FROM products WHERE name='Chuck Taylor All Star Hi'), '40', 'Optical White', 'CV-CTASH-40-OW', 28, 0),
((SELECT id FROM products WHERE name='Chuck Taylor All Star Hi'), '41', 'Optical White', 'CV-CTASH-41-OW', 24, 0),
((SELECT id FROM products WHERE name='Chuck Taylor All Star Hi'), '42', 'Optical White', 'CV-CTASH-42-OW', 20, 0),
((SELECT id FROM products WHERE name='Chuck Taylor All Star Hi'), '38', 'Black', 'CV-CTASH-38-BK', 18, 0),
((SELECT id FROM products WHERE name='Chuck Taylor All Star Hi'), '40', 'Black', 'CV-CTASH-40-BK', 22, 0),
((SELECT id FROM products WHERE name='Chuck Taylor All Star Hi'), '42', 'Black', 'CV-CTASH-42-BK', 17, 0)
ON CONFLICT (sku) DO NOTHING;

-- 11. Vans Old Skool
INSERT INTO products (name, brand, description, gender, category, base_price, image_url) VALUES
('Old Skool', 'Vans', 'El primer modelo con la firma lateral de Vans. Loneta y ante con suela vulcanizada WaffleCup.', 'UNISEX', 'Skateboarding', 74.99, 'https://images.vans.com/old-skool.jpg')
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Old Skool' AND brand='Vans'), '38', 'Black/White', 'VN-OS-38-BW', 20, 0),
((SELECT id FROM products WHERE name='Old Skool' AND brand='Vans'), '39', 'Black/White', 'VN-OS-39-BW', 22, 0),
((SELECT id FROM products WHERE name='Old Skool' AND brand='Vans'), '40', 'Black/White', 'VN-OS-40-BW', 25, 0),
((SELECT id FROM products WHERE name='Old Skool' AND brand='Vans'), '41', 'Black/White', 'VN-OS-41-BW', 23, 0),
((SELECT id FROM products WHERE name='Old Skool' AND brand='Vans'), '42', 'Black/White', 'VN-OS-42-BW', 20, 0),
((SELECT id FROM products WHERE name='Old Skool' AND brand='Vans'), '39', 'True White', 'VN-OS-39-TW', 14, 0),
((SELECT id FROM products WHERE name='Old Skool' AND brand='Vans'), '41', 'True White', 'VN-OS-41-TW', 12, 0)
ON CONFLICT (sku) DO NOTHING;

-- 12. Nike Free Run 5.0
INSERT INTO products (name, brand, description, gender, category, base_price, image_url) VALUES
('Free Run 5.0', 'Nike', 'Movimiento natural del pie. Upper de malla transpirable y suela segmentada para máxima flexibilidad.', 'WOMAN', 'Running', 99.99, 'https://static.nike.com/a/images/t_PDP_1280_v1/free-run-5.jpg')
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Free Run 5.0'), '36', 'Sail/Pink', 'NK-FR5-36-SP', 12, 0),
((SELECT id FROM products WHERE name='Free Run 5.0'), '37', 'Sail/Pink', 'NK-FR5-37-SP', 15, 0),
((SELECT id FROM products WHERE name='Free Run 5.0'), '38', 'Sail/Pink', 'NK-FR5-38-SP', 14, 0),
((SELECT id FROM products WHERE name='Free Run 5.0'), '39', 'Sail/Pink', 'NK-FR5-39-SP', 10, 0),
((SELECT id FROM products WHERE name='Free Run 5.0'), '37', 'Black/White', 'NK-FR5-37-BW', 8, 0),
((SELECT id FROM products WHERE name='Free Run 5.0'), '38', 'Black/White', 'NK-FR5-38-BW', 9, 0)
ON CONFLICT (sku) DO NOTHING;

-- 13. Adidas Gazelle
INSERT INTO products (name, brand, description, gender, category, base_price, image_url) VALUES
('Gazelle', 'Adidas', 'Ante suave y silueta slim. Diseño clásico de los 60 con modernos detalles dorados.', 'UNISEX', 'Lifestyle', 99.99, 'https://assets.adidas.com/images/gazelle.jpg')
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Gazelle' AND brand='Adidas'), '39', 'Collegiate Navy', 'AD-GAZ-39-CN', 14, 0),
((SELECT id FROM products WHERE name='Gazelle' AND brand='Adidas'), '40', 'Collegiate Navy', 'AD-GAZ-40-CN', 16, 0),
((SELECT id FROM products WHERE name='Gazelle' AND brand='Adidas'), '41', 'Collegiate Navy', 'AD-GAZ-41-CN', 12, 0),
((SELECT id FROM products WHERE name='Gazelle' AND brand='Adidas'), '42', 'Collegiate Navy', 'AD-GAZ-42-CN', 8, 0),
((SELECT id FROM products WHERE name='Gazelle' AND brand='Adidas'), '40', 'Scarlet', 'AD-GAZ-40-SC', 6, 0),
((SELECT id FROM products WHERE name='Gazelle' AND brand='Adidas'), '41', 'Scarlet', 'AD-GAZ-41-SC', 5, 0)
ON CONFLICT (sku) DO NOTHING;

-- 14. New Balance 2002R
INSERT INTO products (name, brand, description, gender, category, base_price, image_url) VALUES
('2002R', 'New Balance', 'Tecnología ABZORB para la mejor amortiguación. Capas de malla y ante para un perfil premium.', 'UNISEX', 'Lifestyle', 149.99, 'https://nb.com/images/2002r.jpg')
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='2002R' AND brand='New Balance'), '40', 'Moonbeam', 'NB-2002R-40-MB', 7, 0),
((SELECT id FROM products WHERE name='2002R' AND brand='New Balance'), '41', 'Moonbeam', 'NB-2002R-41-MB', 9, 0),
((SELECT id FROM products WHERE name='2002R' AND brand='New Balance'), '42', 'Moonbeam', 'NB-2002R-42-MB', 8, 0),
((SELECT id FROM products WHERE name='2002R' AND brand='New Balance'), '43', 'Moonbeam', 'NB-2002R-43-MB', 4, 0),
((SELECT id FROM products WHERE name='2002R' AND brand='New Balance'), '41', 'Black', 'NB-2002R-41-BK', 5, 0),
((SELECT id FROM products WHERE name='2002R' AND brand='New Balance'), '42', 'Black', 'NB-2002R-42-BK', 4, 0)
ON CONFLICT (sku) DO NOTHING;

-- 15. Puma RS-X
INSERT INTO products (name, brand, description, gender, category, base_price, image_url) VALUES
('RS-X3', 'Puma', 'Diseño futurista Running System con espuma RS y entresuela gruesa para máximo amortiguamiento.', 'UNISEX', 'Lifestyle', 109.99, 'https://images.puma.com/image/upload/rs-x3.jpg')
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='RS-X3' AND brand='Puma'), '39', 'Puma White/Blue', 'PM-RSX3-39-WB', 11, 0),
((SELECT id FROM products WHERE name='RS-X3' AND brand='Puma'), '40', 'Puma White/Blue', 'PM-RSX3-40-WB', 14, 0),
((SELECT id FROM products WHERE name='RS-X3' AND brand='Puma'), '41', 'Puma White/Blue', 'PM-RSX3-41-WB', 12, 0),
((SELECT id FROM products WHERE name='RS-X3' AND brand='Puma'), '42', 'Puma White/Blue', 'PM-RSX3-42-WB', 9, 0),
((SELECT id FROM products WHERE name='RS-X3' AND brand='Puma'), '40', 'Black/Red', 'PM-RSX3-40-BR', 7, 0),
((SELECT id FROM products WHERE name='RS-X3' AND brand='Puma'), '42', 'Black/Red', 'PM-RSX3-42-BR', 5, 0)
ON CONFLICT (sku) DO NOTHING;
