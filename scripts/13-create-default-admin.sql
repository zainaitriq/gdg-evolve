-- Create default admin user for the system
-- Password will be 'admin123' (hashed with bcrypt)

-- First, check if admin_users table exists and has the right structure
DO $$ 
BEGIN
    -- Insert default admin user if none exists
    IF NOT EXISTS (SELECT 1 FROM admin_users WHERE username = 'admin') THEN
        INSERT INTO admin_users (
            username, 
            password_hash, 
            full_name, 
            email, 
            is_active, 
            created_at, 
            updated_at
        ) VALUES (
            'admin',
            '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash for 'password'
            'System Administrator',
            'admin@evolve-conference.com',
            true,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Default admin user created successfully';
        RAISE NOTICE 'Username: admin';
        RAISE NOTICE 'Password: password';
    ELSE
        RAISE NOTICE 'Admin user already exists';
    END IF;
END $$;

-- Verify the admin user was created
SELECT 
    id,
    username,
    full_name,
    email,
    is_active,
    created_at
FROM admin_users 
WHERE username = 'admin';
