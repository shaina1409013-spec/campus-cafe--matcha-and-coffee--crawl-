-- Campus Café – Complete MySQL Schema
-- Run this once against your MySQL database (local or hosted, e.g., Aiven, TiDB, PlanetScale).

CREATE DATABASE IF NOT EXISTS coffee_crawl
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

USE coffee_crawl;

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    user_id    INT          NOT NULL AUTO_INCREMENT,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(100) NOT NULL,
    password   VARCHAR(255) NOT NULL,          -- bcrypt hash
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    UNIQUE KEY uq_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Cafes ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cafes (
    cafe_id     INT          NOT NULL AUTO_INCREMENT,
    cafe_name   VARCHAR(150) NOT NULL,
    location    VARCHAR(255) NOT NULL,
    description TEXT,
    image_url   VARCHAR(500) DEFAULT NULL,
    PRIMARY KEY (cafe_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Drinks ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS drinks (
    drink_id    INT            NOT NULL AUTO_INCREMENT,
    cafe_id     INT            NOT NULL,
    drink_name  VARCHAR(150)   NOT NULL,
    category    VARCHAR(100)   DEFAULT NULL,
    description TEXT,
    price       DECIMAL(10,2)  NOT NULL,
    image_url   VARCHAR(500)   DEFAULT NULL,
    PRIMARY KEY (drink_id),
    KEY idx_cafe_id (cafe_id),
    CONSTRAINT fk_drinks_cafe FOREIGN KEY (cafe_id) REFERENCES cafes (cafe_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Reviews ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
    review_id        INT            NOT NULL AUTO_INCREMENT,
    user_id          INT            NOT NULL,
    cafe_id          INT            DEFAULT NULL,
    cafe_name        VARCHAR(150)   NOT NULL,
    item             VARCHAR(150)   NOT NULL,
    outlet_available TINYINT(1)     NOT NULL DEFAULT 0,
    rating           DECIMAL(2,1)   NOT NULL,
    comment          TEXT           NOT NULL,
    created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (review_id),
    KEY idx_user_id  (user_id),
    KEY idx_cafe_id  (cafe_id),
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_cafe FOREIGN KEY (cafe_id) REFERENCES cafes (cafe_id) ON DELETE SET NULL,
    CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Favorites ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
    favorite_id INT      NOT NULL AUTO_INCREMENT,
    user_id     INT      NOT NULL,
    cafe_id     INT      NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (favorite_id),
    UNIQUE KEY uq_user_cafe (user_id, cafe_id),
    CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_fav_cafe FOREIGN KEY (cafe_id) REFERENCES cafes (cafe_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Visits ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS visits (
    visit_id   INT      NOT NULL AUTO_INCREMENT,
    user_id    INT      NOT NULL,
    cafe_id    INT      NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (visit_id),
    UNIQUE KEY uq_visit_user_cafe (user_id, cafe_id),
    CONSTRAINT fk_visit_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_visit_cafe FOREIGN KEY (cafe_id) REFERENCES cafes (cafe_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Seed Data ─────────────────────────────────────────────────────────────────

INSERT IGNORE INTO cafes (cafe_id, cafe_name, location, description, image_url) VALUES
(1, 'Cafe Matcha',      'Chandigarh', 'A cozy cafe serving coffee and matcha.',     'cafe1.jpg'),
(2, 'The Coffee House', 'Ludhiana',   'Popular coffee and snacks cafe.',              'cafe2.jpg'),
(3, 'Green Cup Cafe',   'Mohali',     'Cafe famous for matcha and cold coffee.',      'cafe3.jpg');

INSERT IGNORE INTO drinks (drink_id, cafe_id, drink_name, category, description, price, image_url) VALUES
(13, 1, 'Classic Matcha Latte', 'Matcha', 'Smooth matcha latte.',         180.00, 'matcha1.jpg'),
(14, 1, 'Cold Coffee',           'Coffee', 'Creamy chilled coffee.',       150.00, 'coffee1.jpg'),
(15, 1, 'Cappuccino',            'Coffee', 'Classic cappuccino.',           140.00, 'cappuccino.jpg'),
(16, 2, 'Americano',             'Coffee', 'Strong black coffee.',          120.00, 'americano.jpg'),
(17, 2, 'Iced Latte',            'Coffee', 'Chilled espresso with milk.',   160.00, 'icedlatte.jpg'),
(18, 3, 'Strawberry Matcha',     'Matcha', 'Strawberry and matcha drink.',  220.00, 'strawberrymatcha.jpg');

INSERT IGNORE INTO reviews (review_id, user_id, cafe_id, cafe_name, item, outlet_available, rating, comment, created_at) VALUES
(5, 1, 1, 'Cafe Matcha',      'Classic Matcha Latte', 1, 5.0, 'Amazing matcha and nice ambience!', NOW()),
(6, 2, 1, 'Cafe Matcha',      'Cold Coffee',           1, 4.5, 'Good coffee and peaceful place.',    NOW()),
(7, 3, 2, 'The Coffee House', 'Americano',             0, 4.0, 'Coffee was good.',                   NOW()),
(8, 1, 3, 'Green Cup Cafe',   'Strawberry Matcha',     1, 5.0, 'Best matcha I have tried!',          NOW());
