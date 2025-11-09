-- Create the database
CREATE DATABASE IF NOT EXISTS boarding_house_system;

USE boarding_house_system;

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS MaintenanceRequests;

DROP TABLE IF EXISTS Payments;

DROP TABLE IF EXISTS Notifications;

DROP TABLE IF EXISTS Reviews;

DROP TABLE IF EXISTS Bookings;

DROP TABLE IF EXISTS RoomImages;

DROP TABLE IF EXISTS Rooms;

DROP TABLE IF EXISTS BoardingHouses;

DROP TABLE IF EXISTS Users;

-- Users table (for both students and landlords)
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('student', 'landlord') NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    profile_image_url VARCHAR(255)
);

-- Boarding Houses table
CREATE TABLE BoardingHouses (
    boarding_house_id INT PRIMARY KEY AUTO_INCREMENT,
    landlord_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    amenities JSON,
    rules TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM(
        'active',
        'inactive',
        'pending_review'
    ) DEFAULT 'pending_review',
    FOREIGN KEY (landlord_id) REFERENCES Users (user_id),
    INDEX idx_landlord (landlord_id),
    INDEX idx_status (status)
);

-- Rooms table
CREATE TABLE Rooms (
    room_id INT PRIMARY KEY AUTO_INCREMENT,
    boarding_house_id INT NOT NULL,
    room_number VARCHAR(50),
    room_type ENUM(
        'single',
        'double',
        'triple',
        'quad'
    ) NOT NULL,
    monthly_rent DECIMAL(10, 2) NOT NULL,
    capacity INT NOT NULL,
    current_occupants INT DEFAULT 0,
    floor_area DECIMAL(6, 2),
    description TEXT,
    amenities JSON,
    status ENUM(
        'available',
        'occupied',
        'maintenance'
    ) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (boarding_house_id) REFERENCES BoardingHouses (boarding_house_id),
    INDEX idx_boarding_house (boarding_house_id),
    INDEX idx_status (status)
);

-- Room Images table
CREATE TABLE RoomImages (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES Rooms (room_id),
    INDEX idx_room (room_id)
);

-- Bookings table
CREATE TABLE Bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT NOT NULL,
    student_id INT NOT NULL,
    move_in_date DATE NOT NULL,
    duration_months INT NOT NULL,
    monthly_rate DECIMAL(10, 2) NOT NULL,
    status ENUM(
        'pending',
        'approved',
        'rejected',
        'cancelled',
        'active',
        'completed'
    ) DEFAULT 'pending',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES Rooms (room_id),
    FOREIGN KEY (student_id) REFERENCES Users (user_id),
    INDEX idx_room (room_id),
    INDEX idx_student (student_id),
    INDEX idx_status (status)
);

-- Reviews table
CREATE TABLE Reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    boarding_house_id INT NOT NULL,
    student_id INT NOT NULL,
    rating DECIMAL(2, 1) NOT NULL CHECK (
        rating >= 1
        AND rating <= 5
    ),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (boarding_house_id) REFERENCES BoardingHouses (boarding_house_id),
    FOREIGN KEY (student_id) REFERENCES Users (user_id),
    INDEX idx_boarding_house (boarding_house_id),
    INDEX idx_student (student_id)
);

-- Notifications table
CREATE TABLE Notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM(
        'booking_request',
        'booking_update',
        'system',
        'payment'
    ) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users (user_id),
    INDEX idx_user (user_id),
    INDEX idx_is_read (is_read)
);

-- Payments table
CREATE TABLE Payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method ENUM(
        'cash',
        'bank_transfer',
        'gcash',
        'credit_card'
    ) NOT NULL,
    status ENUM(
        'pending',
        'completed',
        'failed',
        'refunded'
    ) DEFAULT 'pending',
    transaction_reference VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES Bookings (booking_id),
    INDEX idx_booking (booking_id),
    INDEX idx_status (status)
);

-- Maintenance Requests table
CREATE TABLE MaintenanceRequests (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT NOT NULL,
    reported_by INT NOT NULL,
    issue_type ENUM(
        'plumbing',
        'electrical',
        'structural',
        'appliance',
        'other'
    ) NOT NULL,
    description TEXT NOT NULL,
    status ENUM(
        'pending',
        'in_progress',
        'completed',
        'cancelled'
    ) DEFAULT 'pending',
    priority ENUM(
        'low',
        'medium',
        'high',
        'urgent'
    ) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (room_id) REFERENCES Rooms (room_id),
    FOREIGN KEY (reported_by) REFERENCES Users (user_id),
    INDEX idx_room (room_id),
    INDEX idx_status (status)
);