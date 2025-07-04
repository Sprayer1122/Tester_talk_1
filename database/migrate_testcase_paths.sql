-- Migration script to add testcase_paths table
-- This allows issues to have multiple testcase paths tracked

USE testing_platform;

-- Create testcase_paths table
CREATE TABLE IF NOT EXISTS testcase_paths (
    id INT AUTO_INCREMENT PRIMARY KEY,
    issue_id INT NOT NULL,
    testcase_path VARCHAR(200) NOT NULL,
    `release` VARCHAR(10),
    platform VARCHAR(20),
    added_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    INDEX idx_issue_id (issue_id),
    INDEX idx_release_platform (`release`, platform),
    UNIQUE KEY unique_issue_path (issue_id, testcase_path)
);

-- Add some sample data if needed for testing
-- You can uncomment these if you want test data
-- INSERT INTO testcase_paths (issue_id, testcase_path, `release`, platform, added_by) VALUES
-- (1, '/lan/fed/etpv5/release/251/lnx86/etautotest/tests/login/alternate_path', '251', 'lnx86', 'John Tester'),
-- (1, '/lan/fed/etpv5/release/261/lr/etautotest/tests/auth/login_flow', '261', 'lr', 'Sarah QA');

SELECT 'testcase_paths table created successfully!' as result; 