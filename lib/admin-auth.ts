export interface AdminUser {
  id: number
  username: string
  fullName: string
  email: string
  loginTime: string
}

export function useAdminAuth(): AdminUser | null {
  if (typeof window === "undefined") return null

  try {
    const sessionData = localStorage.getItem("admin_session")
    if (!sessionData) return null

    const admin = JSON.parse(sessionData) as AdminUser

    // Check if session is still valid (24 hours)
    const loginTime = new Date(admin.loginTime)
    const now = new Date()
    const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

    if (hoursDiff > 24) {
      localStorage.removeItem("admin_session")
      return null
    }

    return admin
  } catch (error) {
    console.error("[v0] Error reading admin session:", error)
    localStorage.removeItem("admin_session")
    return null
  }
}

export function clearAdminSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_session")
  }
}
