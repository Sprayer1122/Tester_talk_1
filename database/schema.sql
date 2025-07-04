-- Database schema for Internal Stack Overflow Platform
-- MySQL 8.0+ compatible

CREATE DATABASE IF NOT EXISTS testing_platform;
USE testing_platform;

-- Issues table
CREATE TABLE issues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    test_case_id VARCHAR(100),
    commenter_name VARCHAR(100) NOT NULL,
    status ENUM('open', 'resolved') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    INDEX idx_status (status),
    INDEX idx_test_case_id (test_case_id),
    INDEX idx_created_at (created_at)
);

-- Tags table
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Issue-Tags relationship table
CREATE TABLE issue_tags (
    issue_id INT,
    tag_id INT,
    PRIMARY KEY (issue_id, tag_id),
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Comments table
CREATE TABLE comments (
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
CREATE TABLE attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    issue_id INT,
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

-- Sample data for testing
INSERT INTO issues (title, description, test_case_id, commenter_name, status) VALUES
('Login button not responding', 'The login button on the main page is not responding to clicks. Test case TC-001 fails consistently.', 'TC-001', 'John Tester', 'open'),
('Database connection timeout', 'Getting connection timeout errors when running bulk data tests. Affects TC-015 and TC-016.', 'TC-015', 'Sarah QA', 'resolved'),
('Mobile responsive layout broken', 'The dashboard layout breaks on mobile devices with screen width less than 768px.', 'TC-023', 'Mike Dev', 'open');

INSERT INTO tags (name) VALUES
('ui'), ('backend'), ('mobile'), ('database'), ('performance'), ('login');

-- Link tags to issues
INSERT INTO issue_tags (issue_id, tag_id) VALUES
(1, 1), (1, 6),  -- Login button: ui, login
(2, 2), (2, 4),  -- Database timeout: backend, database
(3, 1), (3, 3);  -- Mobile layout: ui, mobile

INSERT INTO comments (issue_id, commenter_name, content, is_verified_solution) VALUES
(1, 'Alice Dev', 'This was caused by a JavaScript event handler conflict. Fixed in commit #abc123.', FALSE),
(1, 'Bob Senior', 'The issue is resolved by removing the conflicting event listener. Verified working.', TRUE),
(2, 'Charlie DBA', 'Increased connection pool size from 10 to 50. This should resolve the timeout issues.', TRUE),
(3, 'Diana Frontend', 'Added media queries for mobile breakpoints. Testing in progress.', FALSE); 