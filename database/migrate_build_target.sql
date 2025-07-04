-- Migration to add build and target columns to issues table
-- Run this script to add the new columns for Build and Target filters

USE testing_platform;

-- Add build column (Weekly, Daily, Daily Plus)
ALTER TABLE issues ADD COLUMN build VARCHAR(20) NULL COMMENT 'Build type: Weekly, Daily, Daily Plus';

-- Add target column (release-specific build targets)
ALTER TABLE issues ADD COLUMN target VARCHAR(100) NULL COMMENT 'Target build version based on release';

-- Add indexes for better query performance
CREATE INDEX idx_issues_build ON issues(build);
CREATE INDEX idx_issues_target ON issues(target);

-- Show the updated table structure
DESCRIBE issues; 