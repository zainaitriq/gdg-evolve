import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL)

async function checkAndCreateAdmin() {
  try {
    console.log("[v0] Checking existing admin users...")

    // Check if there are any admin users
    const existingAdmins = await sql`SELECT * FROM admin_users`
    console.log("[v0] Existing admin users:", existingAdmins.length)

    if (existingAdmins.length === 0) {
      console.log("[v0] No admin users found. Creating default admin...")

      // Hash the password
      const hashedPassword = await bcrypt.hash("password", 12)

      // Create default admin user
      const newAdmin = await sql`
        INSERT INTO admin_users (username, password_hash, full_name, email, is_active)
        VALUES ('admin', ${hashedPassword}, 'System Administrator', 'admin@evolve-conference.com', true)
        RETURNING id, username, full_name, email
      `

      console.log("[v0] Created default admin user:", newAdmin[0])
      console.log('[v0] Login credentials: username="admin", password="password"')
    } else {
      console.log("[v0] Admin users found:")
      existingAdmins.forEach((admin) => {
        console.log(`[v0] - ${admin.username} (${admin.full_name}) - Active: ${admin.is_active}`)
      })
    }

    // Test password hashing
    console.log("[v0] Testing password verification...")
    const testPassword = "password"
    const testHash = await bcrypt.hash(testPassword, 12)
    const isValid = await bcrypt.compare(testPassword, testHash)
    console.log("[v0] Password verification test:", isValid ? "PASSED" : "FAILED")
  } catch (error) {
    console.error("[v0] Error:", error)
  }
}

checkAndCreateAdmin()
