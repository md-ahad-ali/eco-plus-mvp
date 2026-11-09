-- Migration for an existing database: create import_records table.
CREATE TABLE import_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    rows_imported INT NOT NULL DEFAULT 0,
    rows_rejected INT NOT NULL DEFAULT 0,
    status ENUM('pending', 'completed', 'partial', 'failed')
        NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;