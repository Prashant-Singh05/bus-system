CREATE DATABASE IF NOT EXISTS college_bus_system;
USE college_bus_system;

-- USERS TABLE
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

-- BUSES TABLE
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

-- ROUTES TABLE
CREATE TABLE IF NOT EXISTS routes (
  route_id INT AUTO_INCREMENT PRIMARY KEY,
  route_name VARCHAR(100) UNIQUE,
  stops TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BOOKINGS TABLE (for hostel students)
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

-- ALLOCATIONS TABLE (for all students)
CREATE TABLE IF NOT EXISTS allocations (
  allocation_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT UNIQUE,
  bus_id INT,
  allocation_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (bus_id) REFERENCES buses(bus_id) ON DELETE CASCADE
);

-- LOCATIONS TABLE (Live bus status)
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

-- JKLU BUS MANAGEMENT SYSTEM SAMPLE DATA

-- USERS TABLE
INSERT INTO users (name,email,password,role,type,address,contact_no) VALUES
('Admin','admin@jklu.edu.in','$2a$10$SpGVSuAQeZEbqJO1Fxwwwusi6lV4vWBGTs1QYQxJBrSakrC8fqLa.','admin',NULL,'JKLU Campus','9876543210'),
('Aditi Sharma','aditi@jklu.edu.in','$2a$10$9ECXU9Kw.oMuOlCnKgKVH.EPoh0nFz.5YgZPunOtDCXgJmts2PweG','student','day_scholar','Mansarovar, Jaipur','9823456712'),
('Rohan Singh','rohan@jklu.edu.in','$2a$10$GQXeB51Vs4rYwophA8XZ7eEce2rDO4G.JWbBpte9p52hQ21Y8CShi','student','day_scholar','Vaishali Nagar, Jaipur','9812345671'),
('Priya Meena','priya@jklu.edu.in','$2a$10$iQwmq0QVdIWn0xuBeDnaMeZWPDwPExRgTO1VRwEWUOnjVDkHsOQuK','student','hostel','JKLU Hostel','9876123450'),
('Aman Verma','aman@jklu.edu.in','$2a$10$oNZJGgPhbdXJ1GADhOOjD.jHGXtV9GU0LGV8kHypyqiLG3Dn1XSQi','student','hostel','JKLU Hostel','9876098712'),
('Neha Saini','neha@jklu.edu.in','$2a$10$.F7yu3bKAKZwjrfTx8DiJuwxWekoMr.7HfxGJ7RX8NkRmhO/gW3ke','student','day_scholar','Malviya Nagar, Jaipur','9811098723')
ON DUPLICATE KEY UPDATE email = email;

-- BUSES TABLE
INSERT INTO buses (bus_no,driver_name,capacity,route_name,start_time,end_time,status) VALUES
('RJ14-AB-1201','Rajesh Kumar',40,'Mansarovar → JKLU','08:00:00','09:00:00','on_time'),
('RJ14-CD-1456','Suresh Singh',45,'Vaishali Nagar → JKLU','08:15:00','09:00:00','on_time'),
('RJ14-EF-1789','Mukesh Sharma',40,'Malviya Nagar → JKLU','08:00:00','09:00:00','delayed')
ON DUPLICATE KEY UPDATE bus_no = bus_no;

-- ROUTES TABLE
INSERT INTO routes (route_name,stops) VALUES
('Mansarovar → JKLU','Mansarovar,Gopalpura,Tonk Road,JKLU'),
('Vaishali Nagar → JKLU','Vaishali,Sodala,Gopalpura,JKLU'),
('Malviya Nagar → JKLU','Malviya,Durgapura,Tonk Road,JKLU')
ON DUPLICATE KEY UPDATE route_name = route_name;

-- LOCATIONS TABLE (Live status)
INSERT INTO locations (bus_id,current_stop,next_stop,eta,status,updated_at) VALUES
(1,'Gopalpura','JKLU','12 min','On Route',NOW()),
(2,'Vaishali Nagar','Sodala','10 min','On Route',NOW()),
(3,'Malviya Nagar','Durgapura','8 min','Delayed',NOW())
ON DUPLICATE KEY UPDATE bus_id = bus_id;

-- BOOKINGS (for hostel students)
INSERT INTO bookings (student_id,bus_id,date,status,remarks) VALUES
(4,NULL,'2025-11-02','pending','Waiting for admin approval'),
(5,2,'2025-11-02','approved','Approved for Vaishali route')
ON DUPLICATE KEY UPDATE booking_id = booking_id;

-- ALLOCATIONS (for all students)
INSERT INTO allocations (student_id,bus_id,allocation_date) VALUES
(2,1,'2025-10-30'),
(3,2,'2025-10-30'),
(6,3,'2025-10-30'),
(5,2,'2025-11-01')
ON DUPLICATE KEY UPDATE student_id = student_id;
