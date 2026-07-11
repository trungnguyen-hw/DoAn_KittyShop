-- Database schema for kidty_shop
-- Table structure matching requested spec

CREATE DATABASE IF NOT EXISTS kidty_shop;
USE kidty_shop;

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NOTE: Admin data will be created via seedAdmin.js using bcrypt.
-- DO NOT insert plain or default password here for security.

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default data for Categories
INSERT IGNORE INTO categories (id, name, slug, status) VALUES 
(1, 'Bé Gái', 'be-gai', 'active'),
(2, 'Bé Trai', 'be-trai', 'active'),
(3, 'Sơ Sinh', 'so-sinh', 'active'),
(4, 'Unisex', 'unisex', 'active');

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    price INT NOT NULL,
    old_price INT DEFAULT NULL,
    image VARCHAR(255) DEFAULT '/Sản Phẩm – Kidty Shop_files/pro-16_master.jpg',
    category_id INT DEFAULT NULL,
    stock INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Default data for Products matching Kidty Shop
INSERT IGNORE INTO products (id, name, slug, price, old_price, image, category_id, stock, status) VALUES 
(1, 'Áo vest bé trai FM V5', 'ao-vest-be-trai-fm-v5', 450000, NULL, '/Sản Phẩm – Kidty Shop_files/pro-10_master.jpg', 2, 24, 'active'),
(2, 'Body bé trai hình siêu nhân', 'body-be-trai-hinh-sieu-nhan', 189000, NULL, '/Sản Phẩm – Kidty Shop_files/pro-1_master.jpg', 3, 45, 'active'),
(3, 'Body dài cho bé dễ thương', 'body-dai-cho-be', 199000, NULL, '/Sản Phẩm – Kidty Shop_files/pro-3_master.jpg', 3, 30, 'active'),
(4, 'Body dài siêu nhân FM D08', 'body-dai-sieu-nhan-fm-d08', 210000, NULL, '/Sản Phẩm – Kidty Shop_files/pro-5_61ec3f7b79554b52b47ecdbdd502dc2e_grande.jpg', 3, 18, 'active'),
(5, 'Body hoạt hình cho bé năng động', 'body-hoat-hinh-cho-be', 175000, NULL, '/Sản Phẩm – Kidty Shop_files/pro-15_grande.jpg', 3, 52, 'active'),
(6, 'Body tam giác tay ngắn mát mẻ', 'body-tam-giac-tay-ngan', 150000, NULL, '/Sản Phẩm – Kidty Shop_files/pro-7_master.jpg', 3, 60, 'active'),
(7, 'Đầm công chúa cho bé gái M003', 'dam-cong-chua-cho-be-gai-m003', 320000, NULL, '/Sản Phẩm – Kidty Shop_files/pro-21_grande.jpg', 1, 12, 'active'),
(8, 'Đầm công chúa bé gái xinh xắn', 'dam-cong-chua-cho-be-gai', 299000, NULL, '/Sản Phẩm – Kidty Shop_files/pro-13_53ad16c019174224ac3b64fc0bf06691_grande.jpg', 1, 15, 'active'),
(9, 'Đầm Hoa Công Chúa FM-45', 'dam-hoa-cong-chua-fm-45', 389000, NULL, '/Đầm Hoa Công Chúa FM-45 – Kidty Shop - KIểu hiển thị 1_files/pro-16_master.jpg', 1, 8, 'active'),
(10, 'Đồ vest lịch lãm cho bé trai', 'do-vest-cho-be-trai', 520000, NULL, '/Sản Phẩm – Kidty Shop_files/pro-6_master.jpg', 2, 10, 'active'),
(11, 'Set áo rời quần DM A2', 'set-ao-roi-quan-dm-a2', 270000, NULL, '/Sản Phẩm – Kidty Shop_files/pro-9_master.jpg', 4, 35, 'active'),
(12, 'Set áo rời quần FM F0045', 'set-ao-roi-quan-fm-f0045', 285000, NULL, '/Sản Phẩm – Kidty Shop_files/pro-8_0d32e65e43ea4abeaf91e51b93043965_grande.jpg', 4, 22, 'active');

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) DEFAULT NULL,
    address TEXT NOT NULL,
    note TEXT,
    payment_method VARCHAR(20) DEFAULT 'cod',
    total_price INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT DEFAULT NULL, -- Allow NULL to keep history if product is deleted
    product_name VARCHAR(255) NOT NULL,
    price INT NOT NULL,
    quantity INT NOT NULL,
    image VARCHAR(255) DEFAULT NULL,
    variant VARCHAR(100) DEFAULT '',
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL -- Set NULL on product deletion
);
