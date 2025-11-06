USE college_bus_system;

-- Update all passwords with verified bcrypt hashes
UPDATE users SET password = '$2a$10$Th0N8VcY2sZGwzUTXpZHS.5vSJfbAFSVmsKATzRebT34OZZ7.ddve' WHERE email = 'admin@college.edu';
UPDATE users SET password = '$2a$10$iT4FiVjB.qfySIet9QreU.kWDHFxWa7hhYlN2cq015ih26zofc1Yq' WHERE email = 'riya@college.edu';
UPDATE users SET password = '$2a$10$zvRALm64w7m19klo0woPbuUiHwuss8Yse1F23fAh6WtrqFCQG5Yu.' WHERE email = 'arjun@college.edu';
UPDATE users SET password = '$2a$10$2F.0UStJlJG2FLYQBn2KweQhJimNfHLCVPb4rUt77OYfsNYV9nGu.' WHERE email = 'priya@college.edu';
UPDATE users SET password = '$2a$10$5eK5NBCAvyru1o0RlC5XGek7tLl9wHGiNKlbsEzfX7IbccPqYeezC' WHERE email = 'karan@college.edu';


