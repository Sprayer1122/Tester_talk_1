-- Migration: Add 'ccr' to status ENUM in issues table
ALTER TABLE issues MODIFY COLUMN status ENUM('open', 'in_progress', 'resolved', 'closed', 'ccr') DEFAULT 'open'; 