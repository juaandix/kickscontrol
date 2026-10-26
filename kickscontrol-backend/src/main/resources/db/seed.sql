-- ============================================================
-- KicksControl Seed Data
-- Passwords: Admin1234! (admin/shiftleader) / User1234! (cliente)
-- ============================================================

-- Users
INSERT INTO users (email, password, first_name, last_name, role) VALUES
('admin@kickscontrol.com', '$2b$10$G62AXboQYftLOK/QcatEpObMzB8/SVlrB6u2afJRAhPgz.X0dT542', 'Admin', 'KicksControl', 'ADMIN'),
('shiftleader@kickscontrol.com', '$2b$10$G62AXboQYftLOK/QcatEpObMzB8/SVlrB6u2afJRAhPgz.X0dT542', 'Juan', 'García', 'SHIFT_LEADER'),
('cliente@kickscontrol.com', '$2b$10$0GbXQgbyqoSrov6HODsjKOf3s5w2qylzQDLvr2ZISOsFDeUOfjKjK', 'María', 'López', 'USER')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- Products & Variants (25 zapatillas y 13 prendas)
-- ============================================================

-- 1. Nike Air Max 90
INSERT INTO products (name, brand, description, gender, category, base_price, image_url) VALUES
('Air Max 90', 'Nike', 'Icónica zapatilla con unidad Air Max visible en el talón. Diseño retro con materiales de alta calidad.', 'UNISEX', 'Lifestyle', 129.99, 'https://static.nike.com/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/dd656a06-b72a-45a4-8f5b-468693589ece/NIKE+AIR+MAX+90.png')
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
('Air Force 1 Low', 'Nike', 'El clásico por excelencia. Piel premium, suela de goma y la inconfundible silueta AF1.', 'UNISEX', 'Lifestyle', 109.99, 'https://static.nike.com/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/b7d9211c-26e7-431a-ac24-b0540fb3c00f/AIR+FORCE+1+%2707.png')
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
('Stan Smith', 'Adidas', 'La zapatilla de tenis más famosa del mundo. Piel suave, diseño limpio y tres franjas icónicas.', 'UNISEX', 'Lifestyle', 99.99, 'https://m.media-amazon.com/images/I/61NgvjBmCuL._SX700_.jpg')
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
('Superstar', 'Adidas', 'La shelloe característica y las tres franjas. Un ícono del streetwear desde 1969.', 'UNISEX', 'Lifestyle', 89.99, 'https://m.media-amazon.com/images/I/71TjiumjVQL._SX700_.jpg')
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
('React Infinity Run FK 3', 'Nike', 'Diseñada para reducir lesiones. Espuma React que ofrece amortiguación y retorno de energía superiores.', 'MAN', 'Running', 159.99, 'https://static.nike.com/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/935d489c-7819-4a65-ab22-7c2c68b45a7f/AIR+ZOOM+PEGASUS+42.png')
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
('Ultraboost 23', 'Adidas', 'Tecnología Boost para el mayor retorno de energía. Upper Primeknit adaptable al pie.', 'UNISEX', 'Running', 189.99, 'https://m.media-amazon.com/images/I/71qoec+8ZwL._SX700_.jpg')
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
('Suede Classic XXI', 'Puma', 'El Suede original desde 1968. Ante suave y suela de goma vulcanizada para un look atemporal.', 'UNISEX', 'Lifestyle', 79.99, 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/374915/01/sv01/fnd/PNA/fmt/png/Suede-Classic-XXI-Sneakers')
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
('574', 'New Balance', 'El clásico de New Balance. Absorción de impactos ENCAP y silueta chunky característica.', 'UNISEX', 'Lifestyle', 89.99, 'https://m.media-amazon.com/images/I/719Q57Jt0YL._SX700_.jpg')
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
('Air Jordan 1 Retro High OG', 'Nike', 'La zapatilla que lo cambió todo. Piel de alta calidad, suela de goma y el icónico swoosh lateral.', 'UNISEX', 'Basketball', 179.99, 'https://static.nike.com/a/images/t_default/u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/a4ab0300-a514-4e86-b5be-d2ac53ef1ea8/AIR+JORDAN+1+RETRO+HIGH+OG.png')
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
('Chuck Taylor All Star Hi', 'Converse', 'La bota de baloncesto más vendida de la historia. Lona resistente y puntera de goma vulcanizada.', 'UNISEX', 'Lifestyle', 69.99, 'https://m.media-amazon.com/images/I/71OVN8P6ojL._SX700_.jpg')
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
('Old Skool', 'Vans', 'El primer modelo con la firma lateral de Vans. Loneta y ante con suela vulcanizada WaffleCup.', 'UNISEX', 'Skateboarding', 74.99, 'https://m.media-amazon.com/images/I/719bI9CYrKL._SX700_.jpg')
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
('Free Run 5.0', 'Nike', 'Movimiento natural del pie. Upper de malla transpirable y suela segmentada para máxima flexibilidad.', 'WOMAN', 'Running', 99.99, 'https://static.nike.com/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/fda0adce-294b-462a-b016-6d90d8c76144/W+NIKE+FREE+2025.png')
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
('Gazelle', 'Adidas', 'Ante suave y silueta slim. Diseño clásico de los 60 con modernos detalles dorados.', 'UNISEX', 'Lifestyle', 99.99, 'https://m.media-amazon.com/images/I/51GJdFYhm6L._AC_SL1000_.jpg')
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
('2002R', 'New Balance', 'Tecnología ABZORB para la mejor amortiguación. Capas de malla y ante para un perfil premium.', 'UNISEX', 'Lifestyle', 149.99, 'https://m.media-amazon.com/images/I/71vfZeTKYGL._AC_SL1500_.jpg')
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
('RS-X3', 'Puma', 'Diseño futurista Running System con espuma RS y entresuela gruesa para máximo amortiguamiento.', 'UNISEX', 'Lifestyle', 109.99, 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/371570/05/sv01/fnd/PNA/fmt/png/RS-X-Puzzle-Men%27s-Sneakers')
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='RS-X3' AND brand='Puma'), '39', 'Puma White/Blue', 'PM-RSX3-39-WB', 11, 0),
((SELECT id FROM products WHERE name='RS-X3' AND brand='Puma'), '40', 'Puma White/Blue', 'PM-RSX3-40-WB', 14, 0),
((SELECT id FROM products WHERE name='RS-X3' AND brand='Puma'), '41', 'Puma White/Blue', 'PM-RSX3-41-WB', 12, 0),
((SELECT id FROM products WHERE name='RS-X3' AND brand='Puma'), '42', 'Puma White/Blue', 'PM-RSX3-42-WB', 9, 0),
((SELECT id FROM products WHERE name='RS-X3' AND brand='Puma'), '40', 'Black/Red', 'PM-RSX3-40-BR', 7, 0),
((SELECT id FROM products WHERE name='RS-X3' AND brand='Puma'), '42', 'Black/Red', 'PM-RSX3-42-BR', 5, 0)
ON CONFLICT (sku) DO NOTHING;

-- ============================================================
-- More shoes for the category pages (Unsplash photos, free licence)
-- Idempotent: safe to run against a database that already has the base seed.
-- ============================================================

-- Jordan Air Jordan 4 Retro
INSERT INTO products (name, brand, description, gender, category, base_price, image_url)
SELECT 'Air Jordan 4 Retro', 'Jordan', 'Malla en los laterales, alas de sujeción y Air visible en el talón. El clásico de 1989, en su colorway más buscado.', 'MAN', 'Basketball', 214.99, 'https://images.unsplash.com/photo-1560906992-4b00de401b90?w=1600&q=80&fm=jpg&fit=crop&crop=entropy'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Air Jordan 4 Retro' AND brand = 'Jordan');

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Air Jordan 4 Retro' AND brand='Jordan'), '40', 'Black/Red', 'JD-AJ4-40-BR', 6, 0.00),
((SELECT id FROM products WHERE name='Air Jordan 4 Retro' AND brand='Jordan'), '41', 'Black/Red', 'JD-AJ4-41-BR', 9, 0.00),
((SELECT id FROM products WHERE name='Air Jordan 4 Retro' AND brand='Jordan'), '42', 'Black/Red', 'JD-AJ4-42-BR', 11, 0.00),
((SELECT id FROM products WHERE name='Air Jordan 4 Retro' AND brand='Jordan'), '43', 'Black/Red', 'JD-AJ4-43-BR', 7, 0.00),
((SELECT id FROM products WHERE name='Air Jordan 4 Retro' AND brand='Jordan'), '44', 'Black/Red', 'JD-AJ4-44-BR', 3, 5.00),
((SELECT id FROM products WHERE name='Air Jordan 4 Retro' AND brand='Jordan'), '41', 'White/Cement', 'JD-AJ4-41-WC', 5, 0.00),
((SELECT id FROM products WHERE name='Air Jordan 4 Retro' AND brand='Jordan'), '42', 'White/Cement', 'JD-AJ4-42-WC', 8, 0.00),
((SELECT id FROM products WHERE name='Air Jordan 4 Retro' AND brand='Jordan'), '43', 'White/Cement', 'JD-AJ4-43-WC', 4, 0.00)
ON CONFLICT (sku) DO NOTHING;

-- Jordan Air Jordan 11 Retro
INSERT INTO products (name, brand, description, gender, category, base_price, image_url)
SELECT 'Air Jordan 11 Retro', 'Jordan', 'Charol, upper de nailon balístico y placa de fibra de carbono. La zapatilla que Jordan llevó en la temporada de las 72 victorias.', 'MAN', 'Basketball', 229.99, 'https://images.unsplash.com/photo-1577655199646-736691c95b13?w=1600&q=80&fm=jpg&fit=crop&crop=entropy'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Air Jordan 11 Retro' AND brand = 'Jordan');

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Air Jordan 11 Retro' AND brand='Jordan'), '41', 'Black/Red', 'JD-AJ11-41-BR', 7, 0.00),
((SELECT id FROM products WHERE name='Air Jordan 11 Retro' AND brand='Jordan'), '42', 'Black/Red', 'JD-AJ11-42-BR', 10, 0.00),
((SELECT id FROM products WHERE name='Air Jordan 11 Retro' AND brand='Jordan'), '43', 'Black/Red', 'JD-AJ11-43-BR', 8, 0.00),
((SELECT id FROM products WHERE name='Air Jordan 11 Retro' AND brand='Jordan'), '44', 'Black/Red', 'JD-AJ11-44-BR', 4, 0.00),
((SELECT id FROM products WHERE name='Air Jordan 11 Retro' AND brand='Jordan'), '45', 'Black/Red', 'JD-AJ11-45-BR', 2, 5.00),
((SELECT id FROM products WHERE name='Air Jordan 11 Retro' AND brand='Jordan'), '42', 'Concord', 'JD-AJ11-42-CO', 6, 0.00),
((SELECT id FROM products WHERE name='Air Jordan 11 Retro' AND brand='Jordan'), '43', 'Concord', 'JD-AJ11-43-CO', 5, 0.00)
ON CONFLICT (sku) DO NOTHING;

-- Jordan Air Jordan 13 Retro
INSERT INTO products (name, brand, description, gender, category, base_price, image_url)
SELECT 'Air Jordan 13 Retro', 'Jordan', 'Suela inspirada en la garra de una pantera y holograma en el tobillo. Amortiguación Zoom Air para la pista y la calle.', 'MAN', 'Basketball', 199.99, 'https://images.unsplash.com/photo-1585701407425-7122b55a8efc?w=1600&q=80&fm=jpg&fit=crop&crop=entropy'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Air Jordan 13 Retro' AND brand = 'Jordan');

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Air Jordan 13 Retro' AND brand='Jordan'), '40', 'Black/True Red', 'JD-AJ13-40-BT', 5, 0.00),
((SELECT id FROM products WHERE name='Air Jordan 13 Retro' AND brand='Jordan'), '41', 'Black/True Red', 'JD-AJ13-41-BT', 8, 0.00),
((SELECT id FROM products WHERE name='Air Jordan 13 Retro' AND brand='Jordan'), '42', 'Black/True Red', 'JD-AJ13-42-BT', 9, 0.00),
((SELECT id FROM products WHERE name='Air Jordan 13 Retro' AND brand='Jordan'), '43', 'Black/True Red', 'JD-AJ13-43-BT', 6, 0.00),
((SELECT id FROM products WHERE name='Air Jordan 13 Retro' AND brand='Jordan'), '44', 'Black/True Red', 'JD-AJ13-44-BT', 3, 0.00)
ON CONFLICT (sku) DO NOTHING;

-- Nike SB Dunk Low Pro
INSERT INTO products (name, brand, description, gender, category, base_price, image_url)
SELECT 'SB Dunk Low Pro', 'Nike', 'Ante resistente, plantilla con Zoom Air y lengüeta acolchada. La Dunk adaptada al skate, con agarre y protección para la tabla.', 'UNISEX', 'Skateboarding', 119.99, 'https://images.unsplash.com/photo-1692620334820-355161f652a8?w=1600&q=80&fm=jpg&fit=crop&crop=entropy'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'SB Dunk Low Pro' AND brand = 'Nike');

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='SB Dunk Low Pro' AND brand='Nike'), '39', 'Orange/Teal', 'NK-SBDL-39-OT', 6, 0.00),
((SELECT id FROM products WHERE name='SB Dunk Low Pro' AND brand='Nike'), '40', 'Orange/Teal', 'NK-SBDL-40-OT', 8, 0.00),
((SELECT id FROM products WHERE name='SB Dunk Low Pro' AND brand='Nike'), '41', 'Orange/Teal', 'NK-SBDL-41-OT', 9, 0.00),
((SELECT id FROM products WHERE name='SB Dunk Low Pro' AND brand='Nike'), '42', 'Orange/Teal', 'NK-SBDL-42-OT', 7, 0.00),
((SELECT id FROM products WHERE name='SB Dunk Low Pro' AND brand='Nike'), '43', 'Orange/Teal', 'NK-SBDL-43-OT', 4, 0.00),
((SELECT id FROM products WHERE name='SB Dunk Low Pro' AND brand='Nike'), '40', 'Black/White', 'NK-SBDL-40-BW', 10, 0.00),
((SELECT id FROM products WHERE name='SB Dunk Low Pro' AND brand='Nike'), '41', 'Black/White', 'NK-SBDL-41-BW', 12, 0.00),
((SELECT id FROM products WHERE name='SB Dunk Low Pro' AND brand='Nike'), '42', 'Black/White', 'NK-SBDL-42-BW', 9, 0.00)
ON CONFLICT (sku) DO NOTHING;

-- Vans Sk8-Hi
INSERT INTO products (name, brand, description, gender, category, base_price, image_url)
SELECT 'Sk8-Hi', 'Vans', 'Caña alta acolchada, puntera reforzada y suela waffle vulcanizada. Nació en 1978 para proteger el tobillo en la rampa.', 'UNISEX', 'Skateboarding', 89.99, 'https://images.unsplash.com/photo-1574946943172-4800feadfab7?w=1600&q=80&fm=jpg&fit=crop&crop=entropy'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Sk8-Hi' AND brand = 'Vans');

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Sk8-Hi' AND brand='Vans'), '39', 'Brown/White', 'VN-SK8-39-BN', 7, 0.00),
((SELECT id FROM products WHERE name='Sk8-Hi' AND brand='Vans'), '40', 'Brown/White', 'VN-SK8-40-BN', 9, 0.00),
((SELECT id FROM products WHERE name='Sk8-Hi' AND brand='Vans'), '41', 'Brown/White', 'VN-SK8-41-BN', 11, 0.00),
((SELECT id FROM products WHERE name='Sk8-Hi' AND brand='Vans'), '42', 'Brown/White', 'VN-SK8-42-BN', 8, 0.00),
((SELECT id FROM products WHERE name='Sk8-Hi' AND brand='Vans'), '38', 'Black/White', 'VN-SK8-38-BW', 10, 0.00),
((SELECT id FROM products WHERE name='Sk8-Hi' AND brand='Vans'), '39', 'Black/White', 'VN-SK8-39-BW', 14, 0.00),
((SELECT id FROM products WHERE name='Sk8-Hi' AND brand='Vans'), '40', 'Black/White', 'VN-SK8-40-BW', 16, 0.00),
((SELECT id FROM products WHERE name='Sk8-Hi' AND brand='Vans'), '41', 'Black/White', 'VN-SK8-41-BW', 15, 0.00),
((SELECT id FROM products WHERE name='Sk8-Hi' AND brand='Vans'), '42', 'Black/White', 'VN-SK8-42-BW', 12, 0.00),
((SELECT id FROM products WHERE name='Sk8-Hi' AND brand='Vans'), '43', 'Black/White', 'VN-SK8-43-BW', 6, 0.00)
ON CONFLICT (sku) DO NOTHING;

-- Vans Authentic
INSERT INTO products (name, brand, description, gender, category, base_price, image_url)
SELECT 'Authentic', 'Vans', 'Lona resistente, ojales metálicos y suela waffle. El primer modelo de Vans, de 1966, y todavía el más sencillo para patinar.', 'UNISEX', 'Skateboarding', 69.99, 'https://images.unsplash.com/photo-1553521014-3a56a6964ffe?w=1600&q=80&fm=jpg&fit=crop&crop=entropy'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Authentic' AND brand = 'Vans');

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Authentic' AND brand='Vans'), '38', 'Black/White', 'VN-AUTH-38-BW', 12, 0.00),
((SELECT id FROM products WHERE name='Authentic' AND brand='Vans'), '39', 'Black/White', 'VN-AUTH-39-BW', 15, 0.00),
((SELECT id FROM products WHERE name='Authentic' AND brand='Vans'), '40', 'Black/White', 'VN-AUTH-40-BW', 18, 0.00),
((SELECT id FROM products WHERE name='Authentic' AND brand='Vans'), '41', 'Black/White', 'VN-AUTH-41-BW', 14, 0.00),
((SELECT id FROM products WHERE name='Authentic' AND brand='Vans'), '42', 'Black/White', 'VN-AUTH-42-BW', 10, 0.00),
((SELECT id FROM products WHERE name='Authentic' AND brand='Vans'), '39', 'True White', 'VN-AUTH-39-TW', 8, 0.00),
((SELECT id FROM products WHERE name='Authentic' AND brand='Vans'), '40', 'True White', 'VN-AUTH-40-TW', 9, 0.00),
((SELECT id FROM products WHERE name='Authentic' AND brand='Vans'), '41', 'True White', 'VN-AUTH-41-TW', 7, 0.00)
ON CONFLICT (sku) DO NOTHING;

-- Vans Classic Slip-On
INSERT INTO products (name, brand, description, gender, category, base_price, image_url)
SELECT 'Classic Slip-On', 'Vans', 'Sin cordones, cuello elástico y suela waffle vulcanizada. El cuadro de ajedrez que convirtió una zapatilla de skate en icono.', 'UNISEX', 'Skateboarding', 74.99, 'https://images.unsplash.com/photo-1510268865107-dc384c742735?w=1600&q=80&fm=jpg&fit=crop&crop=entropy'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Classic Slip-On' AND brand = 'Vans');

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Classic Slip-On' AND brand='Vans'), '37', 'Checkerboard', 'VN-SLIP-37-CB', 9, 0.00),
((SELECT id FROM products WHERE name='Classic Slip-On' AND brand='Vans'), '38', 'Checkerboard', 'VN-SLIP-38-CB', 12, 0.00),
((SELECT id FROM products WHERE name='Classic Slip-On' AND brand='Vans'), '39', 'Checkerboard', 'VN-SLIP-39-CB', 14, 0.00),
((SELECT id FROM products WHERE name='Classic Slip-On' AND brand='Vans'), '40', 'Checkerboard', 'VN-SLIP-40-CB', 13, 0.00),
((SELECT id FROM products WHERE name='Classic Slip-On' AND brand='Vans'), '41', 'Checkerboard', 'VN-SLIP-41-CB', 10, 0.00),
((SELECT id FROM products WHERE name='Classic Slip-On' AND brand='Vans'), '42', 'Checkerboard', 'VN-SLIP-42-CB', 7, 0.00),
((SELECT id FROM products WHERE name='Classic Slip-On' AND brand='Vans'), '39', 'Black', 'VN-SLIP-39-BK', 8, 0.00),
((SELECT id FROM products WHERE name='Classic Slip-On' AND brand='Vans'), '40', 'Black', 'VN-SLIP-40-BK', 9, 0.00),
((SELECT id FROM products WHERE name='Classic Slip-On' AND brand='Vans'), '41', 'Black', 'VN-SLIP-41-BK', 6, 0.00)
ON CONFLICT (sku) DO NOTHING;

-- Hoka Mach 7
INSERT INTO products (name, brand, description, gender, category, base_price, image_url)
SELECT 'Mach 7', 'Hoka', 'Espuma SCF ligera y reactiva, drop bajo y suela con goma en las zonas de apoyo. Para series y rodajes rápidos.', 'UNISEX', 'Running', 154.99, 'https://images.unsplash.com/photo-1774280246516-5a817f172a39?w=1600&q=80&fm=jpg&fit=crop&crop=entropy'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Mach 7' AND brand = 'Hoka');

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Mach 7' AND brand='Hoka'), '39', 'White/Lime', 'HK-MACH7-39-WL', 6, 0.00),
((SELECT id FROM products WHERE name='Mach 7' AND brand='Hoka'), '40', 'White/Lime', 'HK-MACH7-40-WL', 8, 0.00),
((SELECT id FROM products WHERE name='Mach 7' AND brand='Hoka'), '41', 'White/Lime', 'HK-MACH7-41-WL', 9, 0.00),
((SELECT id FROM products WHERE name='Mach 7' AND brand='Hoka'), '42', 'White/Lime', 'HK-MACH7-42-WL', 9, 0.00),
((SELECT id FROM products WHERE name='Mach 7' AND brand='Hoka'), '43', 'White/Lime', 'HK-MACH7-43-WL', 6, 0.00),
((SELECT id FROM products WHERE name='Mach 7' AND brand='Hoka'), '44', 'White/Lime', 'HK-MACH7-44-WL', 3, 0.00),
((SELECT id FROM products WHERE name='Mach 7' AND brand='Hoka'), '41', 'Black', 'HK-MACH7-41-BK', 7, 0.00),
((SELECT id FROM products WHERE name='Mach 7' AND brand='Hoka'), '42', 'Black', 'HK-MACH7-42-BK', 6, 0.00)
ON CONFLICT (sku) DO NOTHING;

-- Asics Gel-Kinsei OG
INSERT INTO products (name, brand, description, gender, category, base_price, image_url)
SELECT 'Gel-Kinsei OG', 'Asics', 'Amortiguación GEL en talón y antepié con placa de estabilidad. Un clásico de las tiradas largas, recuperado tal cual.', 'WOMAN', 'Running', 139.99, 'https://images.unsplash.com/photo-1575456571326-2a5c7478aeb2?w=1600&q=80&fm=jpg&fit=crop&crop=entropy'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Gel-Kinsei OG' AND brand = 'Asics');

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Gel-Kinsei OG' AND brand='Asics'), '36', 'White/Purple', 'AS-KINSEI-36-WP', 6, 0.00),
((SELECT id FROM products WHERE name='Gel-Kinsei OG' AND brand='Asics'), '37', 'White/Purple', 'AS-KINSEI-37-WP', 9, 0.00),
((SELECT id FROM products WHERE name='Gel-Kinsei OG' AND brand='Asics'), '38', 'White/Purple', 'AS-KINSEI-38-WP', 10, 0.00),
((SELECT id FROM products WHERE name='Gel-Kinsei OG' AND brand='Asics'), '39', 'White/Purple', 'AS-KINSEI-39-WP', 8, 0.00),
((SELECT id FROM products WHERE name='Gel-Kinsei OG' AND brand='Asics'), '40', 'White/Purple', 'AS-KINSEI-40-WP', 5, 0.00)
ON CONFLICT (sku) DO NOTHING;

-- ============================================================
-- Apparel, plus one more shoe (Unsplash photos, free licence; 'KicksControl' is the store's own label)
-- Idempotent: safe to run against a database that already has the base seed.
-- ============================================================

-- Adidas Samba OG
INSERT INTO products (name, brand, description, gender, category, product_type, base_price, image_url)
SELECT 'Samba OG', 'Adidas', 'Ante en la puntera, piel suave y suela de goma. Nació como zapatilla de fútbol sala en los 50 y hoy es un básico de calle.', 'UNISEX', 'Lifestyle', 'FOOTWEAR', 119.99, 'https://images.unsplash.com/photo-1695552835943-cbee8150addc?w=1600&q=80&fm=jpg&fit=crop&crop=entropy'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Samba OG' AND brand = 'Adidas');

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Samba OG' AND brand='Adidas'), '38', 'White/Green', 'AD-SAMBA-38-WG', 9, 0.00),
((SELECT id FROM products WHERE name='Samba OG' AND brand='Adidas'), '39', 'White/Green', 'AD-SAMBA-39-WG', 12, 0.00),
((SELECT id FROM products WHERE name='Samba OG' AND brand='Adidas'), '40', 'White/Green', 'AD-SAMBA-40-WG', 14, 0.00),
((SELECT id FROM products WHERE name='Samba OG' AND brand='Adidas'), '41', 'White/Green', 'AD-SAMBA-41-WG', 13, 0.00),
((SELECT id FROM products WHERE name='Samba OG' AND brand='Adidas'), '42', 'White/Green', 'AD-SAMBA-42-WG', 10, 0.00),
((SELECT id FROM products WHERE name='Samba OG' AND brand='Adidas'), '43', 'White/Green', 'AD-SAMBA-43-WG', 6, 0.00),
((SELECT id FROM products WHERE name='Samba OG' AND brand='Adidas'), '40', 'Black/White', 'AD-SAMBA-40-BW', 8, 0.00),
((SELECT id FROM products WHERE name='Samba OG' AND brand='Adidas'), '41', 'Black/White', 'AD-SAMBA-41-BW', 9, 0.00),
((SELECT id FROM products WHERE name='Samba OG' AND brand='Adidas'), '42', 'Black/White', 'AD-SAMBA-42-BW', 7, 0.00)
ON CONFLICT (sku) DO NOTHING;

-- Nike Sportswear Club Fleece Hoodie
INSERT INTO products (name, brand, description, gender, category, product_type, base_price, image_url)
SELECT 'Sportswear Club Fleece Hoodie', 'Nike', 'Felpa cepillada por dentro, capucha forrada y bolsillo canguro. La sudadera de diario, con el swoosh bordado en el pecho.', 'UNISEX', 'Lifestyle', 'APPAREL', 64.99, 'https://images.unsplash.com/photo-1552337557-45792b252a2e?w=1600&q=80&fm=jpg&fit=crop&crop=entropy'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Sportswear Club Fleece Hoodie' AND brand = 'Nike');

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Sportswear Club Fleece Hoodie' AND brand='Nike'), 'S', 'Black', 'NK-CLUBHD-S-BK', 14, 0.00),
((SELECT id FROM products WHERE name='Sportswear Club Fleece Hoodie' AND brand='Nike'), 'M', 'Black', 'NK-CLUBHD-M-BK', 22, 0.00),
((SELECT id FROM products WHERE name='Sportswear Club Fleece Hoodie' AND brand='Nike'), 'L', 'Black', 'NK-CLUBHD-L-BK', 20, 0.00),
((SELECT id FROM products WHERE name='Sportswear Club Fleece Hoodie' AND brand='Nike'), 'XL', 'Black', 'NK-CLUBHD-XL-BK', 12, 0.00),
((SELECT id FROM products WHERE name='Sportswear Club Fleece Hoodie' AND brand='Nike'), 'XXL', 'Black', 'NK-CLUBHD-XXL-BK', 5, 0.00),
((SELECT id FROM products WHERE name='Sportswear Club Fleece Hoodie' AND brand='Nike'), 'S', 'Grey Heather', 'NK-CLUBHD-S-GH', 8, 0.00),
((SELECT id FROM products WHERE name='Sportswear Club Fleece Hoodie' AND brand='Nike'), 'M', 'Grey Heather', 'NK-CLUBHD-M-GH', 12, 0.00),
((SELECT id FROM products WHERE name='Sportswear Club Fleece Hoodie' AND brand='Nike'), 'L', 'Grey Heather', 'NK-CLUBHD-L-GH', 10, 0.00),
((SELECT id FROM products WHERE name='Sportswear Club Fleece Hoodie' AND brand='Nike'), 'XL', 'Grey Heather', 'NK-CLUBHD-XL-GH', 6, 0.00)
ON CONFLICT (sku) DO NOTHING;

-- Nike Sportswear Graphic Hoodie
INSERT INTO products (name, brand, description, gender, category, product_type, base_price, image_url)
SELECT 'Sportswear Graphic Hoodie', 'Nike', 'Sudadera de felpa con el gran swoosh y la tipografía de archivo de Nike en el pecho. Corte holgado.', 'UNISEX', 'Lifestyle', 'APPAREL', 74.99, 'https://images.unsplash.com/photo-1582113943690-eb2d7b74cdb5?w=1600&q=80&fm=jpg&fit=crop&crop=entropy'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Sportswear Graphic Hoodie' AND brand = 'Nike');

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Sportswear Graphic Hoodie' AND brand='Nike'), 'S', 'University Red', 'NK-GRPHHD-S-UR', 7, 0.00),
((SELECT id FROM products WHERE name='Sportswear Graphic Hoodie' AND brand='Nike'), 'M', 'University Red', 'NK-GRPHHD-M-UR', 11, 0.00),
((SELECT id FROM products WHERE name='Sportswear Graphic Hoodie' AND brand='Nike'), 'L', 'University Red', 'NK-GRPHHD-L-UR', 10, 0.00),
((SELECT id FROM products WHERE name='Sportswear Graphic Hoodie' AND brand='Nike'), 'XL', 'University Red', 'NK-GRPHHD-XL-UR', 6, 0.00)
ON CONFLICT (sku) DO NOTHING;

-- Adidas Adicolor Track Jacket
INSERT INTO products (name, brand, description, gender, category, product_type, base_price, image_url)
SELECT 'Adicolor Track Jacket', 'Adidas', 'Chaqueta de chándal de tricot con las tres bandas en las mangas y cuello alto. El clásico de los 70, tal cual.', 'UNISEX', 'Lifestyle', 'APPAREL', 84.99, 'https://images.unsplash.com/photo-1566925577633-122e56da5040?w=1600&q=80&fm=jpg&fit=crop&crop=entropy'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Adicolor Track Jacket' AND brand = 'Adidas');

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Adicolor Track Jacket' AND brand='Adidas'), 'S', 'Maroon', 'AD-TRKJK-S-MR', 6, 0.00),
((SELECT id FROM products WHERE name='Adicolor Track Jacket' AND brand='Adidas'), 'M', 'Maroon', 'AD-TRKJK-M-MR', 10, 0.00),
((SELECT id FROM products WHERE name='Adicolor Track Jacket' AND brand='Adidas'), 'L', 'Maroon', 'AD-TRKJK-L-MR', 9, 0.00),
((SELECT id FROM products WHERE name='Adicolor Track Jacket' AND brand='Adidas'), 'XL', 'Maroon', 'AD-TRKJK-XL-MR', 5, 0.00),
((SELECT id FROM products WHERE name='Adicolor Track Jacket' AND brand='Adidas'), 'M', 'Black/White', 'AD-TRKJK-M-BW', 12, 0.00),
((SELECT id FROM products WHERE name='Adicolor Track Jacket' AND brand='Adidas'), 'L', 'Black/White', 'AD-TRKJK-L-BW', 11, 0.00),
((SELECT id FROM products WHERE name='Adicolor Track Jacket' AND brand='Adidas'), 'XL', 'Black/White', 'AD-TRKJK-XL-BW', 7, 0.00)
ON CONFLICT (sku) DO NOTHING;

-- KicksControl Camiseta Básica
INSERT INTO products (name, brand, description, gender, category, product_type, base_price, image_url)
SELECT 'Camiseta Básica', 'KicksControl', 'Algodón peinado de 200 g, cuello canalé y corte recto. La camiseta que va debajo de todo.', 'UNISEX', 'Lifestyle', 'APPAREL', 24.99, 'https://images.unsplash.com/photo-1778671394516-8270eac13c42?w=1600&q=80&fm=jpg&fit=crop&crop=entropy'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Camiseta Básica' AND brand = 'KicksControl');

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Camiseta Básica' AND brand='KicksControl'), 'XS', 'White', 'KC-TEE-XS-WH', 10, 0.00),
((SELECT id FROM products WHERE name='Camiseta Básica' AND brand='KicksControl'), 'S', 'White', 'KC-TEE-S-WH', 18, 0.00),
((SELECT id FROM products WHERE name='Camiseta Básica' AND brand='KicksControl'), 'M', 'White', 'KC-TEE-M-WH', 25, 0.00),
((SELECT id FROM products WHERE name='Camiseta Básica' AND brand='KicksControl'), 'L', 'White', 'KC-TEE-L-WH', 22, 0.00),
((SELECT id FROM products WHERE name='Camiseta Básica' AND brand='KicksControl'), 'XL', 'White', 'KC-TEE-XL-WH', 14, 0.00),
((SELECT id FROM products WHERE name='Camiseta Básica' AND brand='KicksControl'), 'XXL', 'White', 'KC-TEE-XXL-WH', 6, 0.00),
((SELECT id FROM products WHERE name='Camiseta Básica' AND brand='KicksControl'), 'S', 'Black', 'KC-TEE-S-BK', 15, 0.00),
((SELECT id FROM products WHERE name='Camiseta Básica' AND brand='KicksControl'), 'M', 'Black', 'KC-TEE-M-BK', 20, 0.00),
((SELECT id FROM products WHERE name='Camiseta Básica' AND brand='KicksControl'), 'L', 'Black', 'KC-TEE-L-BK', 18, 0.00),
((SELECT id FROM products WHERE name='Camiseta Básica' AND brand='KicksControl'), 'XL', 'Black', 'KC-TEE-XL-BK', 10, 0.00)
ON CONFLICT (sku) DO NOTHING;

-- KicksControl Cortavientos Retro
INSERT INTO products (name, brand, description, gender, category, product_type, base_price, image_url)
SELECT 'Cortavientos Retro', 'KicksControl', 'Nailon ligero con bloques de color de los 90, media cremallera y capucha guardada en el cuello.', 'UNISEX', 'Lifestyle', 'APPAREL', 69.99, 'https://images.unsplash.com/photo-1569665309263-7a6be70f8a78?w=1600&q=80&fm=jpg&fit=crop&crop=entropy'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Cortavientos Retro' AND brand = 'KicksControl');

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Cortavientos Retro' AND brand='KicksControl'), 'S', 'Red/White/Blue', 'KC-WINDB-S-RWB', 5, 0.00),
((SELECT id FROM products WHERE name='Cortavientos Retro' AND brand='KicksControl'), 'M', 'Red/White/Blue', 'KC-WINDB-M-RWB', 9, 0.00),
((SELECT id FROM products WHERE name='Cortavientos Retro' AND brand='KicksControl'), 'L', 'Red/White/Blue', 'KC-WINDB-L-RWB', 8, 0.00),
((SELECT id FROM products WHERE name='Cortavientos Retro' AND brand='KicksControl'), 'XL', 'Red/White/Blue', 'KC-WINDB-XL-RWB', 4, 0.00)
ON CONFLICT (sku) DO NOTHING;

-- Nike Everyday Cushioned Crew
INSERT INTO products (name, brand, description, gender, category, product_type, base_price, image_url)
SELECT 'Everyday Cushioned Crew', 'Nike', 'Pack de tres pares de calcetines con planta acolchada y tejido que evacúa el sudor.', 'UNISEX', 'Lifestyle', 'APPAREL', 17.99, 'https://images.unsplash.com/photo-1615658342135-f63ba996dcd3?w=1600&q=80&fm=jpg&fit=crop&crop=entropy'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Everyday Cushioned Crew' AND brand = 'Nike');

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Everyday Cushioned Crew' AND brand='Nike'), 'S', 'White', 'NK-CREW-S-WH', 20, 0.00),
((SELECT id FROM products WHERE name='Everyday Cushioned Crew' AND brand='Nike'), 'M', 'White', 'NK-CREW-M-WH', 30, 0.00),
((SELECT id FROM products WHERE name='Everyday Cushioned Crew' AND brand='Nike'), 'L', 'White', 'NK-CREW-L-WH', 26, 0.00),
((SELECT id FROM products WHERE name='Everyday Cushioned Crew' AND brand='Nike'), 'M', 'Black', 'NK-CREW-M-BK', 18, 0.00),
((SELECT id FROM products WHERE name='Everyday Cushioned Crew' AND brand='Nike'), 'L', 'Black', 'NK-CREW-L-BK', 15, 0.00)
ON CONFLICT (sku) DO NOTHING;

-- KicksControl Camiseta Técnica Run
INSERT INTO products (name, brand, description, gender, category, product_type, base_price, image_url)
SELECT 'Camiseta Técnica Run', 'KicksControl', 'Tejido ligero que seca rápido, costuras planas para que no rocen y detalles reflectantes para salir de noche.', 'MAN', 'Running', 'APPAREL', 34.99, 'https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=1600&q=80&fm=jpg&fit=crop&crop=entropy'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Camiseta Técnica Run' AND brand = 'KicksControl');

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Camiseta Técnica Run' AND brand='KicksControl'), 'S', 'Black', 'KC-RUNTEE-S-BK', 12, 0.00),
((SELECT id FROM products WHERE name='Camiseta Técnica Run' AND brand='KicksControl'), 'M', 'Black', 'KC-RUNTEE-M-BK', 18, 0.00),
((SELECT id FROM products WHERE name='Camiseta Técnica Run' AND brand='KicksControl'), 'L', 'Black', 'KC-RUNTEE-L-BK', 16, 0.00),
((SELECT id FROM products WHERE name='Camiseta Técnica Run' AND brand='KicksControl'), 'XL', 'Black', 'KC-RUNTEE-XL-BK', 9, 0.00),
((SELECT id FROM products WHERE name='Camiseta Técnica Run' AND brand='KicksControl'), 'M', 'Volt', 'KC-RUNTEE-M-VT', 8, 0.00),
((SELECT id FROM products WHERE name='Camiseta Técnica Run' AND brand='KicksControl'), 'L', 'Volt', 'KC-RUNTEE-L-VT', 7, 0.00)
ON CONFLICT (sku) DO NOTHING;

-- KicksControl Mallas Run
INSERT INTO products (name, brand, description, gender, category, product_type, base_price, image_url)
SELECT 'Mallas Run', 'KicksControl', 'Talle alto, compresión media y bolsillo trasero para el móvil. Para series y tiradas largas.', 'WOMAN', 'Running', 'APPAREL', 49.99, 'https://images.unsplash.com/photo-1628257492622-794c87956698?w=1600&q=80&fm=jpg&fit=crop&crop=entropy'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Mallas Run' AND brand = 'KicksControl');

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Mallas Run' AND brand='KicksControl'), 'XS', 'Purple', 'KC-RUNTGT-XS-PU', 8, 0.00),
((SELECT id FROM products WHERE name='Mallas Run' AND brand='KicksControl'), 'S', 'Purple', 'KC-RUNTGT-S-PU', 12, 0.00),
((SELECT id FROM products WHERE name='Mallas Run' AND brand='KicksControl'), 'M', 'Purple', 'KC-RUNTGT-M-PU', 11, 0.00),
((SELECT id FROM products WHERE name='Mallas Run' AND brand='KicksControl'), 'L', 'Purple', 'KC-RUNTGT-L-PU', 6, 0.00),
((SELECT id FROM products WHERE name='Mallas Run' AND brand='KicksControl'), 'XS', 'Black', 'KC-RUNTGT-XS-BK', 10, 0.00),
((SELECT id FROM products WHERE name='Mallas Run' AND brand='KicksControl'), 'S', 'Black', 'KC-RUNTGT-S-BK', 14, 0.00),
((SELECT id FROM products WHERE name='Mallas Run' AND brand='KicksControl'), 'M', 'Black', 'KC-RUNTGT-M-BK', 13, 0.00),
((SELECT id FROM products WHERE name='Mallas Run' AND brand='KicksControl'), 'L', 'Black', 'KC-RUNTGT-L-BK', 8, 0.00)
ON CONFLICT (sku) DO NOTHING;

-- KicksControl Top Manga Larga Run
INSERT INTO products (name, brand, description, gender, category, product_type, base_price, image_url)
SELECT 'Top Manga Larga Run', 'KicksControl', 'Corte ajustado y tejido térmico para las mañanas frías, con orificio para el pulgar.', 'WOMAN', 'Running', 'APPAREL', 39.99, 'https://images.unsplash.com/photo-1609377375722-46264cf88939?w=1600&q=80&fm=jpg&fit=crop&crop=entropy'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Top Manga Larga Run' AND brand = 'KicksControl');

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Top Manga Larga Run' AND brand='KicksControl'), 'XS', 'Black', 'KC-RUNLS-XS-BK', 7, 0.00),
((SELECT id FROM products WHERE name='Top Manga Larga Run' AND brand='KicksControl'), 'S', 'Black', 'KC-RUNLS-S-BK', 11, 0.00),
((SELECT id FROM products WHERE name='Top Manga Larga Run' AND brand='KicksControl'), 'M', 'Black', 'KC-RUNLS-M-BK', 10, 0.00),
((SELECT id FROM products WHERE name='Top Manga Larga Run' AND brand='KicksControl'), 'L', 'Black', 'KC-RUNLS-L-BK', 5, 0.00)
ON CONFLICT (sku) DO NOTHING;

-- NBA Lakers Bryant #24
INSERT INTO products (name, brand, description, gender, category, product_type, base_price, image_url)
SELECT 'Lakers Bryant #24', 'NBA', 'Réplica de la camiseta de Kobe Bryant con los Lakers: tejido de malla, número y nombre cosidos.', 'UNISEX', 'Basketball', 'APPAREL', 119.99, 'https://images.unsplash.com/photo-1580089595767-98745d7025c5?w=1600&q=80&fm=jpg&fit=crop&crop=entropy'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Lakers Bryant #24' AND brand = 'NBA');

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Lakers Bryant #24' AND brand='NBA'), 'S', 'White/Gold', 'NBA-LAL24-S-WG', 4, 0.00),
((SELECT id FROM products WHERE name='Lakers Bryant #24' AND brand='NBA'), 'M', 'White/Gold', 'NBA-LAL24-M-WG', 8, 0.00),
((SELECT id FROM products WHERE name='Lakers Bryant #24' AND brand='NBA'), 'L', 'White/Gold', 'NBA-LAL24-L-WG', 9, 0.00),
((SELECT id FROM products WHERE name='Lakers Bryant #24' AND brand='NBA'), 'XL', 'White/Gold', 'NBA-LAL24-XL-WG', 6, 0.00),
((SELECT id FROM products WHERE name='Lakers Bryant #24' AND brand='NBA'), 'XXL', 'White/Gold', 'NBA-LAL24-XXL-WG', 3, 0.00)
ON CONFLICT (sku) DO NOTHING;

-- KicksControl Pantalón Corto Basket
INSERT INTO products (name, brand, description, gender, category, product_type, base_price, image_url)
SELECT 'Pantalón Corto Basket', 'KicksControl', 'Malla transpirable, cintura elástica con cordón y largo por encima de la rodilla. Para la pista y el playground.', 'MAN', 'Basketball', 'APPAREL', 39.99, 'https://images.unsplash.com/photo-1598309466969-494f63b2743c?w=1600&q=80&fm=jpg&fit=crop&crop=entropy'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Pantalón Corto Basket' AND brand = 'KicksControl');

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Pantalón Corto Basket' AND brand='KicksControl'), 'S', 'Black', 'KC-BBSHRT-S-BK', 9, 0.00),
((SELECT id FROM products WHERE name='Pantalón Corto Basket' AND brand='KicksControl'), 'M', 'Black', 'KC-BBSHRT-M-BK', 15, 0.00),
((SELECT id FROM products WHERE name='Pantalón Corto Basket' AND brand='KicksControl'), 'L', 'Black', 'KC-BBSHRT-L-BK', 14, 0.00),
((SELECT id FROM products WHERE name='Pantalón Corto Basket' AND brand='KicksControl'), 'XL', 'Black', 'KC-BBSHRT-XL-BK', 10, 0.00),
((SELECT id FROM products WHERE name='Pantalón Corto Basket' AND brand='KicksControl'), 'XXL', 'Black', 'KC-BBSHRT-XXL-BK', 4, 0.00)
ON CONFLICT (sku) DO NOTHING;

-- KicksControl Sudadera Capucha Skate
INSERT INTO products (name, brand, description, gender, category, product_type, base_price, image_url)
SELECT 'Sudadera Capucha Skate', 'KicksControl', 'Felpa gruesa de 400 g, costuras reforzadas y capucha doble. Aguanta caídas y lavados.', 'UNISEX', 'Skateboarding', 'APPAREL', 59.99, 'https://images.unsplash.com/photo-1567384069554-975d6af4fb08?w=1600&q=80&fm=jpg&fit=crop&crop=entropy'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Sudadera Capucha Skate' AND brand = 'KicksControl');

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Sudadera Capucha Skate' AND brand='KicksControl'), 'S', 'Black', 'KC-SKTHD-S-BK', 10, 0.00),
((SELECT id FROM products WHERE name='Sudadera Capucha Skate' AND brand='KicksControl'), 'M', 'Black', 'KC-SKTHD-M-BK', 14, 0.00),
((SELECT id FROM products WHERE name='Sudadera Capucha Skate' AND brand='KicksControl'), 'L', 'Black', 'KC-SKTHD-L-BK', 13, 0.00),
((SELECT id FROM products WHERE name='Sudadera Capucha Skate' AND brand='KicksControl'), 'XL', 'Black', 'KC-SKTHD-XL-BK', 7, 0.00)
ON CONFLICT (sku) DO NOTHING;

-- KicksControl Pantalón Chino Skate
INSERT INTO products (name, brand, description, gender, category, product_type, base_price, image_url)
SELECT 'Pantalón Chino Skate', 'KicksControl', 'Sarga resistente con elastano, rodilla con pinza para moverse y bajo recto que no se engancha.', 'MAN', 'Skateboarding', 'APPAREL', 54.99, 'https://images.unsplash.com/photo-1593797353564-1a7dc24cfdbd?w=1600&q=80&fm=jpg&fit=crop&crop=entropy'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Pantalón Chino Skate' AND brand = 'KicksControl');

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price_modifier) VALUES
((SELECT id FROM products WHERE name='Pantalón Chino Skate' AND brand='KicksControl'), 'S', 'Khaki', 'KC-SKTCHN-S-KH', 8, 0.00),
((SELECT id FROM products WHERE name='Pantalón Chino Skate' AND brand='KicksControl'), 'M', 'Khaki', 'KC-SKTCHN-M-KH', 12, 0.00),
((SELECT id FROM products WHERE name='Pantalón Chino Skate' AND brand='KicksControl'), 'L', 'Khaki', 'KC-SKTCHN-L-KH', 11, 0.00),
((SELECT id FROM products WHERE name='Pantalón Chino Skate' AND brand='KicksControl'), 'XL', 'Khaki', 'KC-SKTCHN-XL-KH', 6, 0.00),
((SELECT id FROM products WHERE name='Pantalón Chino Skate' AND brand='KicksControl'), 'M', 'Black', 'KC-SKTCHN-M-BK', 9, 0.00),
((SELECT id FROM products WHERE name='Pantalón Chino Skate' AND brand='KicksControl'), 'L', 'Black', 'KC-SKTCHN-L-BK', 8, 0.00)
ON CONFLICT (sku) DO NOTHING;
