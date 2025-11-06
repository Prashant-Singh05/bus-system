-- Update all passwords with correct bcrypt hashes
USE college_bus_system;

-- Admin password: admin123
UPDATE users SET password = '$2a$10$JaTaVY.rDQMF6lVUJZtQze1vcqvzGM7QZz9mvjbtEb5apYwJOB5Xi' WHERE email = 'admin@college.edu';

-- Riya password: riya123
UPDATE users SET password = '$2a$10$t7xS1sxP6b/pFTdJUxLwhO1I8mnZ5GrgT3faEqti9qj3dK6VD0W7a' WHERE email = 'riya@college.edu';

-- Arjun password: arjun123
UPDATE users SET password = '$2a$10$AFiz7nYCR6WNgVmp1qUtXu8D.ezKqhvmF485BBrNS96hCcY68dghC' WHERE email = 'arjun@college.edu';

-- Priya password: priya123
UPDATE users SET password = '$2a$10$TkU0K9Eco7/0RFzPYMEXOul4SHcWQaRVlSt/5HPfon4MxZ9h1nvB6' WHERE email = 'priya@college.edu';

-- Karan password: karan123
UPDATE users SET password = '$2a$10$O4qiTPehXIW6cWUVxOmTW.LwvYVjyQqz3qYZ96FqO4l3VrgP7OlCO' WHERE email = 'karan@college.edu';

