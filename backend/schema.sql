CREATE DATABASE IF NOT EXISTS stayvora DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE stayvora;

-- ------------------------------------------------------------
-- Table: users
-- ------------------------------------------------------------
CREATE TABLE users (
    id              INT             NOT NULL AUTO_INCREMENT,
    name            VARCHAR(255)    NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    phone           VARCHAR(50)     NULL DEFAULT NULL,
    role            ENUM('traveler', 'owner', 'admin') NOT NULL DEFAULT 'traveler',
    email_verified  TINYINT(1)      NOT NULL DEFAULT 0,
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,
    verification_code VARCHAR(6)    NULL DEFAULT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table: hotels
-- ------------------------------------------------------------
CREATE TABLE hotels (
    id              INT             NOT NULL AUTO_INCREMENT,
    owner_id        INT             NOT NULL,
    name            VARCHAR(255)    NOT NULL,
    description     TEXT            NULL,
    location        VARCHAR(255)    NULL DEFAULT NULL,
    address         TEXT            NULL,
    city            VARCHAR(255)    NULL DEFAULT NULL,
    country         VARCHAR(255)    NULL DEFAULT NULL,
    price_range     VARCHAR(100)    NULL DEFAULT NULL,
    map_url         VARCHAR(1000)   NULL DEFAULT NULL,
    rating          DECIMAL(2,1)    NOT NULL DEFAULT 0.0,
    amenities       TEXT            NULL,
    travel_purpose  VARCHAR(255)    NULL DEFAULT NULL,
    status          ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_hotels_owner_id (owner_id),
    INDEX idx_hotels_status (status),
    CONSTRAINT fk_hotels_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table: rooms
-- ------------------------------------------------------------
CREATE TABLE rooms (
    id              INT             NOT NULL AUTO_INCREMENT,
    hotel_id        INT             NOT NULL,
    room_type       VARCHAR(100)    NULL DEFAULT NULL,
    price           DECIMAL(10,2)   NOT NULL,
    capacity        INT             NOT NULL DEFAULT 2,
    description     TEXT            NULL,
    is_available    TINYINT(1)      NOT NULL DEFAULT 1,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_rooms_hotel_id (hotel_id),
    INDEX idx_rooms_available (hotel_id, is_available),
    CONSTRAINT fk_rooms_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table: events
-- ------------------------------------------------------------
CREATE TABLE events (
    id              INT             NOT NULL AUTO_INCREMENT,
    hotel_id        INT             NOT NULL,
    name            VARCHAR(255)    NOT NULL,
    description     TEXT            NULL,
    event_date      DATE            NULL DEFAULT NULL,
    price           DECIMAL(10,2)   NULL DEFAULT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_events_hotel_id (hotel_id),
    CONSTRAINT fk_events_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table: special_offers
-- ------------------------------------------------------------
CREATE TABLE special_offers (
    id              INT             NOT NULL AUTO_INCREMENT,
    hotel_id        INT             NOT NULL,
    name            VARCHAR(255)    NOT NULL,
    description     TEXT            NULL,
    discount        DECIMAL(5,2)    NULL DEFAULT NULL,
    valid_until     DATE            NULL DEFAULT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_offers_hotel_id (hotel_id),
    CONSTRAINT fk_offers_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table: nearby_places
-- ------------------------------------------------------------
CREATE TABLE nearby_places (
    id              INT             NOT NULL AUTO_INCREMENT,
    hotel_id        INT             NOT NULL,
    name            VARCHAR(255)    NOT NULL,
    description     TEXT            NULL,
    location_url    VARCHAR(500)    NULL DEFAULT NULL,
    latitude        DECIMAL(10,8)   NULL DEFAULT NULL,
    longitude       DECIMAL(11,8)   NULL DEFAULT NULL,
    distance        VARCHAR(100)    NULL DEFAULT NULL,
    category        VARCHAR(100)    NULL DEFAULT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_places_hotel_id (hotel_id),
    CONSTRAINT fk_places_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table: bookings
-- ------------------------------------------------------------
CREATE TABLE bookings (
    id                INT             NOT NULL AUTO_INCREMENT,
    user_id           INT             NOT NULL,
    hotel_id          INT             NOT NULL,
    room_id           INT             NOT NULL,
    booking_code      VARCHAR(20)     NULL DEFAULT NULL,
    check_in          DATE            NOT NULL,
    check_out         DATE            NOT NULL,
    guests            INT             NOT NULL DEFAULT 1,
    total_price       DECIMAL(10,2)   NOT NULL,
    status            ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
    guest_name        VARCHAR(255)    NULL DEFAULT NULL,
    guest_email       VARCHAR(255)    NULL DEFAULT NULL,
    guest_phone       VARCHAR(50)     NULL DEFAULT NULL,
    special_requests  TEXT            NULL,
    created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_bookings_code (booking_code),
    INDEX idx_bookings_user_id (user_id),
    INDEX idx_bookings_hotel_id (hotel_id),
    INDEX idx_bookings_room_id (room_id),
    INDEX idx_bookings_status (status),
    INDEX idx_bookings_dates (check_in, check_out),
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table: hotel_images
-- ------------------------------------------------------------
CREATE TABLE hotel_images (
    id              INT             NOT NULL AUTO_INCREMENT,
    hotel_id        INT             NOT NULL,
    image_url       VARCHAR(500)    NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_images_hotel_id (hotel_id),
    CONSTRAINT fk_images_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table: reviews
-- ------------------------------------------------------------
CREATE TABLE reviews (
    id              INT             NOT NULL AUTO_INCREMENT,
    hotel_id        INT             NOT NULL,
    user_id         INT             NOT NULL,
    booking_id      INT             NULL DEFAULT NULL,
    rating          DECIMAL(2,1)    NOT NULL,
    title           VARCHAR(255)    NULL DEFAULT NULL,
    comment         TEXT            NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_reviews_booking (booking_id),
    INDEX idx_reviews_hotel_id (hotel_id),
    INDEX idx_reviews_user_id (user_id),
    CONSTRAINT fk_reviews_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table: notifications
-- ------------------------------------------------------------
CREATE TABLE notifications (
    id              INT             NOT NULL AUTO_INCREMENT,
    user_id         INT             NOT NULL,
    booking_id      INT             NULL DEFAULT NULL,
    type            VARCHAR(50)     NOT NULL DEFAULT 'booking',
    title           VARCHAR(255)    NOT NULL,
    message         TEXT            NULL,
    is_read         TINYINT(1)      NOT NULL DEFAULT 0,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_read (user_id, is_read),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Seed Data
-- ------------------------------------------------------------

-- Admin user (password: password)
INSERT INTO users (name, email, password_hash, phone, role) VALUES
('Admin User', 'admin@stayvora.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0770000000', 'admin');
