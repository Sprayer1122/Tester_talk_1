-- Migration script to add release and platform columns to issues table
-- Run this script to update your existing database

-- Add new columns to issues table
ALTER TABLE issues ADD COLUMN release VARCHAR(10) NULL;
ALTER TABLE issues ADD COLUMN platform VARCHAR(20) NULL;

-- Update existing issues to extract release and platform from testcase_path
-- This uses a regex pattern to extract the information
UPDATE issues 
SET 
    release = CASE 
        WHEN testcase_path REGEXP '/lan/fed/etpv5/release/([0-9]+)/' 
        THEN REGEXP_SUBSTR(testcase_path, '/lan/fed/etpv5/release/([0-9]+)/', 1, 1, '', 1)
        ELSE NULL 
    END,
    platform = CASE 
        WHEN testcase_path REGEXP '/lan/fed/etpv5/release/[0-9]+/([^/]+)/etautotest/' 
        THEN REGEXP_SUBSTR(testcase_path, '/lan/fed/etpv5/release/[0-9]+/([^/]+)/etautotest/', 1, 1, '', 1)
        ELSE NULL 
    END
WHERE testcase_path IS NOT NULL;

-- Create indexes for better query performance
CREATE INDEX idx_issues_release ON issues(release);
CREATE INDEX idx_issues_platform ON issues(platform);
CREATE INDEX idx_issues_release_platform ON issues(release, platform); 