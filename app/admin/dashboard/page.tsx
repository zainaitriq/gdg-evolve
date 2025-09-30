"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAdminAuth } from "@/lib/admin-auth"
import { AdminHeader } from "@/components/admin/header"

interface DashboardStats {
  total_events: string
  total_attendees: string
  total_speakers: string
  total_competitions: string
  total_sponsors: string
  recent_registrations: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const admin = useAdminAuth()

  useEffect(() => {
    if (!admin) {
      router.push("/admin/login")
      return
    }

    fetchDashboardStats()
  }, [admin, router])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!admin) return null

  return (
    <AdminHeader>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {admin.fullName}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <div className="text-2xl">📅</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats?.total_events || "0"}</div>
              <p className="text-xs text-muted-foreground">Active conference events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
              <div className="text-2xl">👥</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats?.total_attendees || "0"}</div>
              <p className="text-xs text-muted-foreground">Registered participants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Speakers</CardTitle>
              <div className="text-2xl">🎤</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats?.total_speakers || "0"}</div>
              <p className="text-xs text-muted-foreground">Conference speakers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Competitions</CardTitle>
              <div className="text-2xl">🏆</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats?.total_competitions || "0"}</div>
              <p className="text-xs text-muted-foreground">Active competitions</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Registrations</CardTitle>
              <CardDescription>Latest attendee registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{loading ? "..." : stats?.recent_registrations || "0"}</div>
              <p className="text-sm text-muted-foreground">New registrations in the last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => router.push("/admin/events")}
                className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">Manage Events</div>
                <div className="text-sm text-gray-600">Add, edit, or remove events</div>
              </button>
              <button
                onClick={() => router.push("/admin/attendees")}
                className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">View Attendees</div>
                <div className="text-sm text-gray-600">Manage registrations</div>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminHeader>
  )
}
