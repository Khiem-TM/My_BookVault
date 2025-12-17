-- Initialize Permissions and Roles for Identity Service
-- Run this script on identity-service MySQL database

-- ========================================
-- 1. CREATE PERMISSIONS
-- ========================================

-- Book Management Permissions (Admin)
INSERT INTO permission (name, description) VALUES 
('CREATE_BOOK', 'Permission to create new books'),
('UPDATE_BOOK', 'Permission to update book information'),
('DELETE_BOOK', 'Permission to delete books'),
('MANAGE_INVENTORY', 'Permission to manage book inventory'),
('VIEW_STATISTICS', 'Permission to view book statistics and admin data')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- User Permissions
INSERT INTO permission (name, description) VALUES 
('BORROW_BOOK', 'Permission to borrow physical books'),
('RETURN_BOOK', 'Permission to return borrowed books'),
('RENT_BOOK', 'Permission to rent digital licensed books'),
('REVIEW_BOOK', 'Permission to review books'),
('VIEW_BOOKS', 'Permission to view books')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- ========================================
-- 2. CREATE ROLES
-- ========================================

-- Admin Role
INSERT INTO role (name, description) VALUES 
('ADMIN', 'Administrator role with full book management access')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- User Role (if not exists)
INSERT INTO role (name, description) VALUES 
('USER', 'Regular user role with basic book access')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- ========================================
-- 3. ASSIGN PERMISSIONS TO ROLES
-- ========================================

-- Admin gets all permissions
INSERT INTO role_permissions (role_name, permissions_name) VALUES 
('ADMIN', 'CREATE_BOOK'),
('ADMIN', 'UPDATE_BOOK'),
('ADMIN', 'DELETE_BOOK'),
('ADMIN', 'MANAGE_INVENTORY'),
('ADMIN', 'VIEW_STATISTICS'),
('ADMIN', 'BORROW_BOOK'),
('ADMIN', 'RETURN_BOOK'),
('ADMIN', 'RENT_BOOK'),
('ADMIN', 'REVIEW_BOOK'),
('ADMIN', 'VIEW_BOOKS')
ON DUPLICATE KEY UPDATE role_name=role_name;

-- User gets standard permissions
INSERT INTO role_permissions (role_name, permissions_name) VALUES 
('USER', 'BORROW_BOOK'),
('USER', 'RETURN_BOOK'),
('USER', 'RENT_BOOK'),
('USER', 'REVIEW_BOOK'),
('USER', 'VIEW_BOOKS')
ON DUPLICATE KEY UPDATE role_name=role_name;

-- ========================================
-- 4. CREATE ADMIN USER (for testing)
-- ========================================

-- Note: Password is bcrypt hash of "admin123"
-- Generate your own hash with: https://bcrypt-generator.com/
-- Or use Spring Security's BCryptPasswordEncoder

INSERT INTO user (id, username, email, password, email_verified) VALUES 
('admin-user-001', 'admin', 'admin@mybook.com', '$2a$10$7PtcjEnWb/ZkgyXyxY7C0uItGGD8NAw.X8e3u8V2J5YQU8.FX8qlO', true)
ON DUPLICATE KEY UPDATE username=VALUES(username);

-- ========================================
-- 5. ASSIGN ADMIN ROLE TO ADMIN USER
-- ========================================

INSERT INTO user_roles (user_id, roles_name) VALUES 
('admin-user-001', 'ADMIN')
ON DUPLICATE KEY UPDATE user_id=user_id;

-- ========================================
-- 6. VERIFICATION QUERIES
-- ========================================

-- Verify permissions created
SELECT * FROM permission ORDER BY name;

-- Verify roles created
SELECT * FROM role ORDER BY name;

-- Verify role-permission mappings
SELECT r.name as role_name, p.name as permission_name
FROM role r
JOIN role_permissions rp ON r.name = rp.role_name
JOIN permission p ON rp.permissions_name = p.name
ORDER BY r.name, p.name;

-- Verify admin user
SELECT u.id, u.username, u.email, u.email_verified, r.name as role_name
FROM user u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN role r ON ur.roles_name = r.name
WHERE u.username = 'admin';
