CREATE DATABASE IF NOT EXISTS college_bus_system;
USE college_bus_system;

-- ================================
-- USERS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role ENUM('admin', 'student') DEFAULT 'student',
  type ENUM('day_scholar', 'hostel') NULL,
  address VARCHAR(255),
  contact_no VARCHAR(15),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- BUSES TABLE
-- ================================
CREATE TABLE IF NOT EXISTS buses (
  bus_id INT AUTO_INCREMENT PRIMARY KEY,
  bus_no VARCHAR(20) UNIQUE,
  driver_name VARCHAR(100),
  capacity INT,
  route_name VARCHAR(100),
  start_time TIME,
  end_time TIME,
  status ENUM('on_time', 'delayed', 'cancelled', 'inactive') DEFAULT 'on_time',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- ROUTES TABLE
-- ================================
CREATE TABLE IF NOT EXISTS routes (
  route_id INT AUTO_INCREMENT PRIMARY KEY,
  route_name VARCHAR(100) UNIQUE,
  stops TEXT,
  total_distance_km DECIMAL(5,2),
  estimated_duration VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- BOOKINGS TABLE (hostel requests)
-- ================================
CREATE TABLE IF NOT EXISTS bookings (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  bus_id INT NULL,
  date DATE,
  status ENUM('pending', 'approved', 'rejected', 'auto_assigned') DEFAULT 'pending',
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (bus_id) REFERENCES buses(bus_id) ON DELETE SET NULL
);

-- ================================
-- ALLOCATIONS TABLE (day scholars)
-- ================================
CREATE TABLE IF NOT EXISTS allocations (
  allocation_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT UNIQUE,
  bus_id INT,
  allocation_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (bus_id) REFERENCES buses(bus_id) ON DELETE CASCADE
);

-- ================================
-- LOCATIONS TABLE (Live tracking)
-- ================================
CREATE TABLE IF NOT EXISTS locations (
  bus_id INT PRIMARY KEY,
  current_stop VARCHAR(100),
  next_stop VARCHAR(100),
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  eta VARCHAR(50),
  status VARCHAR(50),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (bus_id) REFERENCES buses(bus_id) ON DELETE CASCADE
);

-- ================================
-- SAMPLE DATA
-- ================================

-- USERS
INSERT INTO users (name,email,password,role,type,address,contact_no) VALUES
('Admin','admin@jklu.edu.in','$2a$10$SpGVSuAQeZEbqJO1Fxwwwusi6lV4vWBGTs1QYQxJBrSakrC8fqLa.','admin',NULL,'JKLU Campus','9876543210'),
('Aditi Sharma','aditi@jklu.edu.in','$2a$10$9ECXU9Kw.oMuOlCnKgKVH.EPoh0nFz.5YgZPunOtDCXgJmts2PweG','student','day_scholar','Mansarovar, Jaipur','9823456712'),
('Rohan Singh','rohan@jklu.edu.in','$2a$10$GQXeB51Vs4rYwophA8XZ7eEce2rDO4G.JWbBpte9p52hQ21Y8CShi','student','day_scholar','Vaishali Nagar, Jaipur','9812345671'),
('Priya Meena','priya@jklu.edu.in','$2a$10$iQwmq0QVdIWn0xuBeDnaMeZWPDwPExRgTO1VRwEWUOnjVDkHsOQuK','student','hostel','JKLU Hostel','9876123450'),
('Aman Verma','aman@jklu.edu.in','$2a$10$oNZJGgPhbdXJ1GADhOOjD.jHGXtV9GU0LGV8kHypyqiLG3Dn1XSQi','student','hostel','JKLU Hostel','9876098712'),
('Neha Saini','neha@jklu.edu.in','$2a$10$.F7yu3bKAKZwjrfTx8DiJuwxWekoMr.7HfxGJ7RX8NkRmhO/gW3ke','student','day_scholar','Malviya Nagar, Jaipur','9811098723')
ON DUPLICATE KEY UPDATE email = email;

-- BUSES
INSERT INTO buses (bus_no,driver_name,capacity,route_name,start_time,end_time,status) VALUES
('RJ14-AB-1201','Rajesh Kumar',40,'Mansarovar → JKLU','08:00:00','09:00:00','on_time'),
('RJ14-CD-1456','Suresh Singh',45,'Vaishali Nagar → JKLU','08:15:00','09:00:00','on_time'),
('RJ14-EF-1789','Mukesh Sharma',40,'Malviya Nagar → JKLU','08:00:00','09:00:00','delayed'),
('RJ14-GH-1902','Vikas Yadav',40,'Jagatpura → JKLU','08:10:00','09:00:00','on_time'),
('RJ14-IJ-2234','Naveen Meena',35,'Ajmer Road → JKLU','07:50:00','09:00:00','on_time')
ON DUPLICATE KEY UPDATE bus_no = bus_no;

-- ROUTES (Jaipur → JKLU morning)
INSERT INTO routes (route_name,stops,total_distance_km,estimated_duration) VALUES
('Mansarovar → JKLU','Mansarovar Metro, Gopalpura, Tonk Road, JKLU',13.2,'45 min'),
('Vaishali Nagar → JKLU','Vaishali Nagar, Sodala, Gopalpura, JKLU',15.0,'50 min'),
('Malviya Nagar → JKLU','Malviya Nagar, Durgapura, Tonk Road, JKLU',11.4,'40 min'),
('Jagatpura → JKLU','Jagatpura, Malviya, Durgapura, JKLU',12.5,'45 min'),
('Ajmer Road → JKLU','Ajmer Road, Sodala, Tonk Road, JKLU',16.0,'55 min')
ON DUPLICATE KEY UPDATE route_name = route_name;

-- LOCATIONS (Mock live updates)
INSERT INTO locations (bus_id,current_stop,next_stop,latitude,longitude,eta,status,updated_at) VALUES
(1,'Gopalpura','Tonk Road',26.866880,75.789210,'12 min','On Route',NOW()),
(2,'Sodala','Gopalpura',26.899640,75.793650,'10 min','On Route',NOW()),
(3,'Malviya Nagar','Durgapura',26.852570,75.806880,'8 min','Delayed',NOW()),
(4,'Jagatpura','Malviya Nagar',26.836400,75.843000,'9 min','On Route',NOW()),
(5,'Ajmer Road','Sodala',26.906500,75.769800,'15 min','On Route',NOW())
ON DUPLICATE KEY UPDATE bus_id = bus_id;

-- BOOKINGS (Hostel requests)
INSERT INTO bookings (student_id,bus_id,date,status,remarks) VALUES
(4,NULL,'2025-11-03','pending','Waiting for admin approval'),
(5,2,'2025-11-03','approved','Approved for Vaishali route')
ON DUPLICATE KEY UPDATE booking_id = booking_id;

-- ALLOCATIONS (Permanent day scholars)
INSERT INTO allocations (student_id,bus_id,allocation_date) VALUES
(2,1,'2025-11-01'),
(3,2,'2025-11-01'),
(6,3,'2025-11-01'),
(5,2,'2025-11-01')
ON DUPLICATE KEY UPDATE student_id = student_id;
