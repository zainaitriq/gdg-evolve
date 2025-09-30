"use client"

import { useRouter, usePathname } from "next/navigation"
import { useAdminAuth } from "@/lib/admin-auth"
import { ReactNode } from "react"

interface AdminHeaderProps {
  children: ReactNode
}

interface NavItem {
  path: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/admin/events", label: "Events", icon: "📅" },
  { path: "/admin/ticket-generator", label: "Generate Ticket", icon: "🎫" },
  { path: "/admin/attendees", label: "Attendees", icon: "👥" },
  { path: "/admin/teams", label: "Teams", icon: "🏆" },
  { path: "/admin/tickets", label: "Tickets", icon: "🎫" },
  { path: "/admin/analytics", label: "Analytics", icon: "📈" },
]

export function AdminHeader({ children }: AdminHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const admin = useAdminAuth()

  const handleLogout = () => {
    // Add your logout logic here
    // For example: clear tokens, clear session, etc.
    router.push("/admin/login")
  }

  const isActive = (path: string) => pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Sidebar - Fixed Position */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b bg-red-500">
            <h1 className="text-xl font-semibold text-white">Evolve Admin</h1>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`${
                    isActive(item.path)
                      ? "bg-red-100 text-red-900 border-red-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left transition-colors border border-transparent`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
          
          {/* Admin User Info at Bottom */}
          <div className="flex-shrink-0 p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {admin?.fullName || "Admin User"}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded border hover:bg-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - With left margin for sidebar */}
      <div className="pl-64">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
