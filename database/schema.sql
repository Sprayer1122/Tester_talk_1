-- Database schema for Testing Platform (Tester Talk)
-- MySQL 8.0+ compatible

-- Note: Database creation is handled by setup script

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Issues table (main table)
CREATE TABLE IF NOT EXISTS issues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    testcase_title VARCHAR(500) NOT NULL,
    testcase_path VARCHAR(200) NOT NULL,
    severity ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
    test_case_ids VARCHAR(200) NOT NULL,
    `release` VARCHAR(10),
    platform VARCHAR(20),
    build VARCHAR(20),
    target VARCHAR(100),
    description TEXT NOT NULL,
    additional_comments TEXT,
    reporter_name VARCHAR(100) NOT NULL,
    reviewer_name VARCHAR(100) DEFAULT 'Admin',
    status ENUM('open', 'in_progress', 'resolved', 'closed', 'ccr') DEFAULT 'open',
    ccr_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    INDEX idx_status (status),
    INDEX idx_test_case_id (test_case_ids),
    INDEX idx_created_at (created_at)
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Issue-Tags relationship table
CREATE TABLE IF NOT EXISTS issue_tags (
    issue_id INT,
    tag_id INT,
    PRIMARY KEY (issue_id, tag_id),
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    issue_id INT NOT NULL,
    commenter_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    is_verified_solution BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    INDEX idx_issue_id (issue_id),
    INDEX idx_verified_solution (is_verified_solution)
);

-- File attachments table
CREATE TABLE IF NOT EXISTS attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    issue_id INT NOT NULL,
    comment_id INT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    uploaded_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_issue_id (issue_id),
    INDEX idx_comment_id (comment_id)
);

-- Additional testcase paths table
CREATE TABLE IF NOT EXISTS testcase_paths (
    id INT AUTO_INCREMENT PRIMARY KEY,
    issue_id INT NOT NULL,
    testcase_path VARCHAR(200) NOT NULL,
    `release` VARCHAR(10),
    platform VARCHAR(20),
    added_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);

-- Bucket reviewers mapping table
CREATE TABLE IF NOT EXISTS bucket_reviewers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bucket_name VARCHAR(100) UNIQUE NOT NULL,
    reviewer_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sample data for testing
INSERT INTO issues (testcase_title, testcase_path, severity, test_case_ids, `release`, platform, build, target, description, reporter_name, status) VALUES
('Login Button Not Responding', '/lan/fed/etpv5/release/251/lnx86/etautotest/ui/login/test_login_button', 'Critical', 'TC-20250101-TEST', '251', 'lnx86', 'Weekly', '25.11-d065_1_Jun23', 'The login button on the main page is not responding to clicks. Test case fails consistently.', 'John Tester', 'open'),
('Database Connection Timeout', '/lan/fed/etpv5/release/251/lnx86/etautotest/backend/db/test_connection', 'High', 'TC-20250102-TEST', '251', 'lnx86', 'Daily', '25.11-d065_1_Jun23', 'Getting connection timeout errors when running bulk data tests.', 'Sarah QA', 'resolved'),
('Mobile Layout Broken', '/lan/fed/etpv5/release/251/lnx86/etautotest/ui/mobile/test_responsive', 'Medium', 'TC-20250103-TEST', '251', 'lnx86', 'Weekly', '25.11-d065_1_Jun23', 'The dashboard layout breaks on mobile devices with screen width less than 768px.', 'Mike Dev', 'open');

INSERT INTO tags (name) VALUES
('UI'), ('Backend'), ('Mobile'), ('Database'), ('Performance'), ('Login'), ('ETT'), ('Critical');

-- Link tags to issues
INSERT INTO issue_tags (issue_id, tag_id) VALUES
(1, 1), (1, 6),  -- Login button: UI, Login
(2, 2), (2, 4),  -- Database timeout: Backend, Database
(3, 1), (3, 3);  -- Mobile layout: UI, Mobile

INSERT INTO comments (issue_id, commenter_name, content, is_verified_solution) VALUES
(1, 'Alice Dev', 'This was caused by a JavaScript event handler conflict. Fixed in commit #abc123.', FALSE),
(1, 'Bob Senior', 'The issue is resolved by removing the conflicting event listener. Verified working.', TRUE),
(2, 'Charlie DBA', 'Increased connection pool size from 10 to 50. This should resolve the timeout issues.', TRUE),
(3, 'Diana Frontend', 'Added media queries for mobile breakpoints. Testing in progress.', FALSE); 
