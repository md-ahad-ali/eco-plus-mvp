-- Migration for an existing database: add optional address column to buildings.
ALTER TABLE buildings ADD COLUMN address VARCHAR(255) NULL AFTER name;
