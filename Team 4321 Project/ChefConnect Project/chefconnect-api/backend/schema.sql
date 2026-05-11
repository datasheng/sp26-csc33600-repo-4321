-- ChefConnect Database Schema
-- Safe to run on any fresh MySQL instance.
-- Re-runnable: drops all tables first, then recreates them.

CREATE DATABASE IF NOT EXISTS chefconnection_db;
USE chefconnection_db;

-- Drop tables in reverse dependency order so foreign keys don't block drops
DROP TABLE IF EXISTS UserPantry;
DROP TABLE IF EXISTS ChefPayout;
DROP TABLE IF EXISTS UserPaymentMethod;
DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS ChefMembership;
DROP TABLE IF EXISTS DishIngredient;
DROP TABLE IF EXISTS BookingDish;
DROP TABLE IF EXISTS Review;
DROP TABLE IF EXISTS Booking;
DROP TABLE IF EXISTS Dish;
DROP TABLE IF EXISTS ChefAvailability;
DROP TABLE IF EXISTS Chef;
DROP TABLE IF EXISTS MembershipPlan;
DROP TABLE IF EXISTS ingredient;
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Role;

-- ─────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────

CREATE TABLE Role (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(255) NOT NULL UNIQUE
);

INSERT INTO Role (role_name) VALUES ('Admin'), ('Chef'), ('User');

CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Role(role_id)
);

CREATE TABLE Chef (
    chef_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bio TEXT,
    specialty VARCHAR(255),
    rating DECIMAL(3, 2),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

CREATE TABLE ChefAvailability (
    availability_id INT AUTO_INCREMENT PRIMARY KEY,
    chef_id INT NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (chef_id) REFERENCES Chef(chef_id),
    UNIQUE KEY unique_chef_schedule (chef_id, day_of_week, start_time, end_time)
);

CREATE TABLE MembershipPlan (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,
    plan_name VARCHAR(255) NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    duration_months INT NOT NULL
);

CREATE TABLE ChefMembership (
    membership_id INT AUTO_INCREMENT PRIMARY KEY,
    chef_id INT NOT NULL,
    plan_id INT NOT NULL,
    membership_type VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE,
    FOREIGN KEY (chef_id) REFERENCES Chef(chef_id),
    FOREIGN KEY (plan_id) REFERENCES MembershipPlan(plan_id)
);

CREATE TABLE Booking (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    chef_id INT NOT NULL,
    user_id INT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status VARCHAR(50) NOT NULL,
    customer_requests TEXT,
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    FOREIGN KEY (chef_id) REFERENCES Chef(chef_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

CREATE TABLE Review (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    chef_id INT NOT NULL,
    user_id INT NOT NULL,
    rating DECIMAL(3, 2) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chef_id) REFERENCES Chef(chef_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

CREATE TABLE Dish (
    dish_id INT AUTO_INCREMENT PRIMARY KEY,
    chef_id INT NOT NULL,
    dish_name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (chef_id) REFERENCES Chef(chef_id)
);

CREATE TABLE BookingDish (
    booking_dish_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    dish_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES Booking(booking_id)
);

-- ingredient must come before DishIngredient (foreign key dependency)
CREATE TABLE ingredient (
    ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
    ingredient_name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE DishIngredient (
    dish_ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
    dish_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity VARCHAR(255) NOT NULL,
    FOREIGN KEY (dish_id) REFERENCES Dish(dish_id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredient(ingredient_id)
);

CREATE TABLE Payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    chef_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(255) NOT NULL,
    FOREIGN KEY (chef_id) REFERENCES Chef(chef_id)
);

CREATE TABLE UserPaymentMethod (
    payment_method_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    card_number VARCHAR(20) NOT NULL,
    card_holder VARCHAR(255) NOT NULL,
    exp_month VARCHAR(2) NOT NULL,
    exp_year VARCHAR(4) NOT NULL,
    cvv VARCHAR(4) NOT NULL,
    billing_zip VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    UNIQUE (user_id)
);

CREATE TABLE ChefPayout (
    payout_id INT AUTO_INCREMENT PRIMARY KEY,
    chef_id INT NOT NULL,
    account_holder VARCHAR(255) NOT NULL,
    routing_number VARCHAR(20) NOT NULL,
    account_number VARCHAR(30) NOT NULL,
    bank_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chef_id) REFERENCES Chef(chef_id),
    UNIQUE (chef_id)
);

CREATE TABLE UserPantry (
    pantry_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    ingredient_name VARCHAR(255) NOT NULL,
    quantity VARCHAR(255),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

-- ─────────────────────────────────────────────
-- Stored Procedures
-- ─────────────────────────────────────────────

DELIMITER //

DROP PROCEDURE IF EXISTS GetUserBookingsWithStatus //
CREATE PROCEDURE GetUserBookingsWithStatus(IN p_user_id INT)
BEGIN
    SELECT
        b.booking_id,
        b.booking_date,
        b.booking_time,
        b.customer_requests,
        b.total_amount,
        c.chef_id,
        u.username AS chef_name,
        CASE
            WHEN b.status = 'accepted'
                 AND CONCAT(b.booking_date, ' ', b.booking_time) < NOW()
            THEN 'completed'
            ELSE b.status
        END AS status
    FROM Booking b
    JOIN Chef c ON b.chef_id = c.chef_id
    JOIN User u ON c.user_id = u.user_id
    WHERE b.user_id = p_user_id
    ORDER BY b.booking_date DESC, b.booking_time DESC;
END //

DROP PROCEDURE IF EXISTS GetChefBookingsWithStatus //
CREATE PROCEDURE GetChefBookingsWithStatus(IN p_chef_id INT)
BEGIN
    SELECT
        b.booking_id,
        b.booking_date,
        b.booking_time,
        b.customer_requests,
        b.total_amount,
        u.user_id AS customer_id,
        u.username AS customer_name,
        CASE
            WHEN b.status = 'accepted'
                 AND CONCAT(b.booking_date, ' ', b.booking_time) < NOW()
            THEN 'completed'
            ELSE b.status
        END AS status
    FROM Booking b
    JOIN User u ON b.user_id = u.user_id
    WHERE b.chef_id = p_chef_id
    ORDER BY b.booking_date DESC, b.booking_time DESC;
END //

DELIMITER ;
