import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function debugAdminLogin() {
  try {
    console.log("[v0] Checking admin_users table...")

    // Check if admin_users table exists and what's in it
    const adminUsers = await sql`SELECT * FROM admin_users`
    console.log("[v0] Current admin users:", adminUsers)

    if (adminUsers.length === 0) {
      console.log("[v0] No admin users found. Creating default admin user...")

      // Import bcrypt for password hashing
      const bcrypt = await import("bcryptjs")
      const hashedPassword = await bcrypt.hash("password", 10)

      // Create default admin user
      await sql`
        INSERT INTO admin_users (username, password_hash, full_name, email, is_active)
        VALUES ('admin', ${hashedPassword}, 'Administrator', 'admin@evolve.com', true)
        ON CONFLICT (username) DO NOTHING
      `

      console.log("[v0] Default admin user created successfully")

      // Verify the user was created
      const newAdminUsers = await sql`SELECT username, full_name, email, is_active FROM admin_users`
      console.log("[v0] Admin users after creation:", newAdminUsers)
    } else {
      console.log("[v0] Admin users already exist")

      // Check if the default admin exists
      const defaultAdmin = await sql`SELECT * FROM admin_users WHERE username = 'admin'`
      if (defaultAdmin.length === 0) {
        console.log("[v0] Default admin user not found. Creating...")
        const bcrypt = await import("bcryptjs")
        const hashedPassword = await bcrypt.hash("password", 10)

        await sql`
          INSERT INTO admin_users (username, password_hash, full_name, email, is_active)
          VALUES ('admin', ${hashedPassword}, 'Administrator', 'admin@evolve.com', true)
        `
        console.log("[v0] Default admin user created")
      } else {
        console.log("[v0] Default admin user exists:", {
          username: defaultAdmin[0].username,
          full_name: defaultAdmin[0].full_name,
          is_active: defaultAdmin[0].is_active,
        })
      }
    }

    // Test password verification
    const testAdmin = await sql`SELECT * FROM admin_users WHERE username = 'admin'`
    if (testAdmin.length > 0) {
      const bcrypt = await import("bcryptjs")
      const isValidPassword = await bcrypt.compare("password", testAdmin[0].password_hash)
      console.log("[v0] Password verification test:", isValidPassword ? "PASS" : "FAIL")
    }
  } catch (error) {
    console.error("[v0] Error debugging admin login:", error)
  }
}

debugAdminLogin()
