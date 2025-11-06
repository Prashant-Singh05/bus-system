-- Fix all passwords with valid bcrypt hashes
-- Admin password: admin123
UPDATE users SET password = '$2a$10$1D6.4s9Po7Y2NOhxx7ODnu2S1mjTrGCiuKIHqWiiLXynuDEcMQRhC' WHERE email = 'admin@example.com';

-- Bob Hostel password: student123  
UPDATE users SET password = '$2a$10$BW/2hCy.ce/0Ikkgh2FFFexRtT/uOhUMbpkszOVS2sQct1zF5KylK' WHERE email = 'bob.hostel@example.com';

