-- Migration script to add voting columns
USE bug_resolve_db;

-- Add upvotes and downvotes columns to issues table
ALTER TABLE issues ADD COLUMN upvotes INT DEFAULT 0;
ALTER TABLE issues ADD COLUMN downvotes INT DEFAULT 0;

-- Add upvotes and downvotes columns to comments table
ALTER TABLE comments ADD COLUMN upvotes INT DEFAULT 0;
ALTER TABLE comments ADD COLUMN downvotes INT DEFAULT 0;

-- Verify the changes
DESCRIBE issues;
DESCRIBE comments; 