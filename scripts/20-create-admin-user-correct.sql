-- Create default admin user with correct column names
INSERT INTO admin_users (username, password_hash, email, full_name, is_active, created_at, updated_at)
VALUES ('admin', 'password', 'admin@evolve.com', 'System Administrator', true, NOW(), NOW())
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  updated_at = NOW();

-- Verify the admin user was created
SELECT id, username, password_hash, email, is_active FROM admin_users WHERE username = 'admin';
