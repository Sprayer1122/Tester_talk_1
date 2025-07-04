-- Migration script to add reviewer system
-- This adds reviewer functionality with bucket-based assignment

USE testing_platform;

-- Add reviewer_name column to issues table
ALTER TABLE issues ADD COLUMN reviewer_name VARCHAR(100) DEFAULT 'Admin';

-- Create bucket_reviewers table to manage bucket-to-reviewer mappings
CREATE TABLE IF NOT EXISTS bucket_reviewers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bucket_name VARCHAR(50) NOT NULL UNIQUE,
    reviewer_name VARCHAR(100) NOT NULL DEFAULT 'Admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    INDEX idx_bucket_name (bucket_name),
    INDEX idx_reviewer_name (reviewer_name)
);

-- Insert default bucket-reviewer mappings with Admin as default reviewer
INSERT INTO bucket_reviewers (bucket_name, reviewer_name, created_by) VALUES
('CUSTOMER(IBM)', 'Admin', 'System'),
('CUSTOMER(OTHERS)', 'Admin', 'System'),
('DFT', 'Admin', 'System'),
('DIAGNOSTICS', 'Admin', 'System'),
('ETA', 'Admin', 'System'),
('ETT', 'Admin', 'System'),
('FLOW', 'Admin', 'System'),
('GUI', 'Admin', 'System'),
('LICENSE_TESTING', 'Admin', 'System'),
('LOWPOWER', 'Admin', 'System'),
('MISC', 'Admin', 'System'),
('MODEL', 'Admin', 'System'),
('PCRS', 'Admin', 'System'),
('RAKS', 'Admin', 'System'),
('RND', 'Admin', 'System'),
('SANITY', 'Admin', 'System')
ON DUPLICATE KEY UPDATE 
    reviewer_name = VALUES(reviewer_name),
    updated_at = CURRENT_TIMESTAMP;

-- Update existing issues to have reviewer assigned based on their bucket (if extractable)
-- For now, we'll set all existing issues to Admin as reviewer
UPDATE issues SET reviewer_name = 'Admin' WHERE reviewer_name IS NULL;

-- Create index on reviewer_name for faster queries
CREATE INDEX idx_issues_reviewer ON issues(reviewer_name);

SELECT 'Reviewer system migration completed successfully!' as result; 