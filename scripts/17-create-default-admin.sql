-- Create default admin user for simple authentication
INSERT INTO admin_users (username, password_hash, full_name, email, is_active, created_at, updated_at)
VALUES (
  'admin',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtGtrKG5wy', -- bcrypt hash for 'password'
  'System Administrator',
  'admin@evolve-conference.com',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
