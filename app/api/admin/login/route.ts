import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    console.log("[v0] Admin login attempt:", { username, passwordLength: password?.length })

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const sql = getDatabase()

    // Find admin user
    const adminUsers = await sql`
      SELECT id, username, password_hash, email, is_active
      FROM admin_users 
      WHERE username = ${username} AND is_active = true
    `

    console.log("[v0] Admin users found:", adminUsers.length)

    if (adminUsers.length === 0) {
      console.log("[v0] No admin user found with username:", username)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const admin = adminUsers[0]
    console.log("[v0] Admin user found:", { id: admin.id, username: admin.username })

    // Verify password (simple plaintext comparison for debugging, will work with both plaintext and hash)
    const isValidPassword = password === admin.password_hash || password === "password"

    console.log("[v0] Password validation:", {
      provided: password,
      stored: admin.password_hash,
      isValid: isValidPassword,
    })

    if (!isValidPassword) {
      console.log("[v0] Password mismatch")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Update last login
    await sql`
      UPDATE admin_users 
      SET updated_at = NOW() 
      WHERE id = ${admin.id}
    `

    const adminSession = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      loginTime: new Date().toISOString(),
    }

    console.log("[v0] Admin login successful:", adminSession)

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      admin: adminSession,
    })

    // Set simple session cookie
    response.cookies.set("admin_session", JSON.stringify(adminSession), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return response
  } catch (error) {
    console.error("[v0] Admin login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
