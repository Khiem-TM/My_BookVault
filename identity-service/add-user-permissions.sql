-- Add book:read permission to USER role so they can view books
-- This allows regular users to browse and search books

USE bookvault_identity;

-- Verify current USER permissions
SELECT 'Current USER Role Permissions:' as info;
SELECT rp.* FROM role_permissions rp WHERE rp.role_name = 'USER';

-- Add book:read permission to USER role
INSERT IGNORE INTO role_permissions (role_name, permissions_name) 
VALUES ('USER', 'book:read');

-- Verify updated permissions
SELECT 'Updated USER Role Permissions:' as info;
SELECT rp.* FROM role_permissions rp WHERE rp.role_name = 'USER';

-- Show all role-permission mappings
SELECT 'All Role-Permission Mappings:' as info;
SELECT r.name as role_name, p.name as permission_name, p.description
FROM role r
JOIN role_permissions rp ON r.name = rp.role_name
JOIN permission p ON rp.permissions_name = p.name
ORDER BY r.name, p.name;
