-- Add new permission-based authorities for book service
USE bookvault_identity;

-- Insert new permissions if they don't exist
INSERT IGNORE INTO permission (name, description) VALUES
('book:read', 'Permission to read books'),
('book:create', 'Permission to create books'),
('book:update', 'Permission to update books'),
('book:delete', 'Permission to delete books'),
('author:read', 'Permission to read authors'),
('author:create', 'Permission to create authors'),
('author:update', 'Permission to update authors'),
('author:delete', 'Permission to delete authors'),
('category:read', 'Permission to read categories'),
('category:create', 'Permission to create categories'),
('category:update', 'Permission to update categories'),
('category:delete', 'Permission to delete categories'),
('publisher:read', 'Permission to read publishers'),
('publisher:create', 'Permission to create publishers'),
('publisher:update', 'Permission to update publishers'),
('publisher:delete', 'Permission to delete publishers');

-- Assign all new permissions to ADMIN role
INSERT IGNORE INTO role_permissions (role_name, permissions_name) 
SELECT 'ADMIN', name FROM permission WHERE name LIKE '%:%';

-- Show results
SELECT 'Roles:' as info;
SELECT * FROM role;

SELECT 'All Permissions:' as info;
SELECT * FROM permission;

SELECT 'Admin Role Permissions:' as info;
SELECT rp.* FROM role_permissions rp WHERE rp.role_name = 'ADMIN';
