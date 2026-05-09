CREATE DATABASE IF NOT EXISTS chefconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE chefconnect;

CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'chef') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Chef (
    chef_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    bio TEXT,
    specialty_cuisine VARCHAR(255),
    rating_avg DECIMAL(3,2) DEFAULT 0.00,
    hourly_rate DECIMAL(8,2) DEFAULT 85.00,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

CREATE TABLE ChefMembership (
    membership_id INT AUTO_INCREMENT PRIMARY KEY,
    chef_id INT NOT NULL,
    plan_type ENUM('basic', 'premium') NOT NULL,
    monthly_fee DECIMAL(8,2),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (chef_id) REFERENCES Chef(chef_id)
);

CREATE TABLE ChefAvailability (
    availability_id INT AUTO_INCREMENT PRIMARY KEY,
    chef_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    FOREIGN KEY (chef_id) REFERENCES Chef(chef_id)
);

CREATE TABLE Dish (
    dish_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cuisine_type VARCHAR(100),
    description TEXT
);

CREATE TABLE Ingredient (
    ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
    ingredient_name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE DishIngredient (
    dish_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    amount_required VARCHAR(100),
    PRIMARY KEY (dish_id, ingredient_id),
    FOREIGN KEY (dish_id) REFERENCES Dish(dish_id),
    FOREIGN KEY (ingredient_id) REFERENCES Ingredient(ingredient_id)
);

CREATE TABLE Booking (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    chef_id INT NOT NULL,
    booking_datetime DATETIME NOT NULL,
    location_address VARCHAR(500) NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    custom_request TEXT,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (chef_id) REFERENCES Chef(chef_id)
);

CREATE TABLE BookingDish (
    booking_id INT NOT NULL,
    dish_id INT NOT NULL,
    PRIMARY KEY (booking_id, dish_id),
    FOREIGN KEY (booking_id) REFERENCES Booking(booking_id),
    FOREIGN KEY (dish_id) REFERENCES Dish(dish_id)
);

CREATE TABLE Payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    total_amount DECIMAL(10,2),
    platform_commission DECIMAL(10,2),
    booking_fee DECIMAL(10,2),
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    payment_date DATETIME,
    payment_method VARCHAR(100),
    FOREIGN KEY (booking_id) REFERENCES Booking(booking_id)
);

CREATE TABLE Review (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    chef_id INT NOT NULL,
    rating DECIMAL(2,1) NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_review (user_id, chef_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (chef_id) REFERENCES Chef(chef_id)
);
