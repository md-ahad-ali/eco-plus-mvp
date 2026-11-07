-- Migration for an existing database: add the required, unique email column to users.
ALTER TABLE users ADD COLUMN email VARCHAR(255) NULL AFTER username;

-- Back-fill existing users with a placeholder email so the column can become NOT NULL.
UPDATE users SET email = CONCAT(username, '@example.com') WHERE email IS NULL;

ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NOT NULL;
ALTER TABLE users ADD CONSTRAINT uq_users_email UNIQUE (email);
