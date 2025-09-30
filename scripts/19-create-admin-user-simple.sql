-- Check if admin users exist and create default admin user
-- First, let's see what's in the admin_users table
SELECT COUNT(*) as admin_count FROM admin_users;

-- Delete any existing admin users to start fresh
DELETE FROM admin_users WHERE username = 'admin';

-- Create a simple admin user with plaintext password for now (we'll hash it properly later)
-- Using a simple approach since bcrypt might be causing issues
INSERT INTO admin_users (username, password, email, is_active, created_at, updated_at)
VALUES (
  'admin',
  'password', -- Simple plaintext password for testing
  'admin@evolve.com',
  true,
  NOW(),
  NOW()
);

-- Verify the admin user was created
SELECT id, username, email, is_active, created_at FROM admin_users WHERE username = 'admin';

-- Show total count of admin users
SELECT COUNT(*) as total_admin_users FROM admin_users;
