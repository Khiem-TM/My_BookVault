-- Initialize admin user and roles for bookvault_identity database
USE bookvault_identity;

-- Insert roles if they don't exist
INSERT IGNORE INTO role (name, description) VALUES 
('ADMIN', 'Administrator role with full system access'),
('USER', 'Standard user role'),
('ROLE_ADMIN', 'Administrator role with full system access'),
('ROLE_USER', 'Standard user role');

-- Note: Admin user should be created via registration API endpoint
-- This ensures password is properly hashed using the application's BCrypt encoder
-- Manual SQL insertion of passwords may cause authentication failures

-- If needed, you can manually create admin user with this script, but ensure:
-- 1. Password is properly bcrypt hashed with rounds=10
-- 2. Email is set to a valid email address
-- 3. All roles are assigned correctly

-- IMPORTANT: After running this script, create admin user manually:
-- POST /auth/register with:
-- {
--   "username": "admin",
--   "email": "admin@bookvault.com", 
--   "password": "admin123",
--   "firstName": "Admin",
--   "lastName": "User"
-- }
-- Then assign ADMIN role via SQL:
-- INSERT INTO user_roles (user_id, roles_name) 
-- VALUES ((SELECT id FROM user WHERE username='admin'), 'ADMIN');
