import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL)

async function createAdminUser() {
  try {
    console.log("[v0] Checking for existing admin users...")

    // Check if admin users exist
    const existingAdmins = await sql`
      SELECT COUNT(*) as count FROM admin_users WHERE is_active = true
    `

    console.log("[v0] Existing admin users:", existingAdmins[0].count)

    if (Number.parseInt(existingAdmins[0].count) === 0) {
      console.log("[v0] No admin users found, creating default admin...")

      // Hash the password
      const hashedPassword = await bcrypt.hash("admin123", 12)

      // Create default admin user
      const result = await sql`
        INSERT INTO admin_users (username, password_hash, full_name, email, is_active)
        VALUES ('admin', ${hashedPassword}, 'System Administrator', 'admin@evolve.com', true)
        RETURNING id, username, full_name, email
      `

      console.log("[v0] Default admin user created:", result[0])
      console.log("[v0] Login credentials: username=admin, password=admin123")
    } else {
      console.log("[v0] Admin users already exist")

      // Show existing admin users
      const admins = await sql`
        SELECT id, username, full_name, email, is_active, created_at
        FROM admin_users
        ORDER BY created_at DESC
      `

      console.log("[v0] Existing admin users:")
      admins.forEach((admin) => {
        console.log(
          `  - ID: ${admin.id}, Username: ${admin.username}, Name: ${admin.full_name}, Active: ${admin.is_active}`,
        )
      })
    }
  } catch (error) {
    console.error("[v0] Error creating admin user:", error)
  }
}

createAdminUser()
