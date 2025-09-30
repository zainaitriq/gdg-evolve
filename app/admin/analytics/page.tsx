"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAdminAuth } from "@/lib/admin-auth"
import { Download, TrendingUp, Users, Calendar, Trophy } from "lucide-react"

interface AnalyticsData {
  overview: {
    total_attendees: number
    total_events: number
    total_registrations: number
    check_in_rate: number
    team_events: number
    total_teams: number
  }
  registration_by_day: {
    date: string
    count: number
  }[]
  events_by_type: {
    event_type: string
    count: number
    registrations: number
  }[]
  university_distribution: {
    university: string
    count: number
  }[]
  year_distribution: {
    year_of_study: string
    count: number
  }[]
  field_distribution: {
    field_of_study: string
    count: number
  }[]
  check_in_by_event: {
    event_name: string
    total_registered: number
    checked_in: number
    check_in_rate: number
  }[]
  team_sizes: {
    team_name: string
    team_size: number
    event_name: string
  }[]
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("all")
  const router = useRouter()
  const admin = useAdminAuth()

  useEffect(() => {
    if (!admin) {
      router.push("/admin/login")
      return
    }
    fetchAnalytics()
  }, [admin, router, timeRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics/export")
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error exporting analytics:", error)
    }
  }

  const getBarWidth = (value: number, maxValue: number) => {
    return Math.max((value / maxValue) * 100, 2)
  }

  if (!admin) return null

  if (loading) {
    return (
      <AdminHeader>
        <div className="text-center py-8">Loading analytics...</div>
      </AdminHeader>
    )
  }

  if (!analytics) {
    return (
      <AdminHeader>
        <div className="text-center py-8 text-red-600">Failed to load analytics data</div>
      </AdminHeader>
    )
  }

  const maxUniversityCount = Math.max(...analytics.university_distribution.map(u => u.count))
  const maxEventRegistrations = Math.max(...analytics.check_in_by_event.map(e => e.total_registered))

  return (
    <AdminHeader>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Conference insights and statistics</p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 3 Months</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportAnalytics} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.total_attendees}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Event Registrations</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.total_registrations}</div>
              <p className="text-xs text-muted-foreground">Excluding opening ceremony</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Check-in Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.check_in_rate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Overall attendance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Competition Teams</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.total_teams}</div>
              <p className="text-xs text-muted-foreground">Across {analytics.overview.team_events} competitions</p>
            </CardContent>
          </Card>
        </div>

        {/* Event Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Events by Type</CardTitle>
            <CardDescription>Distribution of event categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.events_by_type.map((eventType, index) => (
                <div key={eventType.event_type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: `hsl(${index * 45}, 70%, 50%)` }}
                    />
                    <span className="font-medium capitalize">{eventType.event_type}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">{eventType.count} events</div>
                      <div className="text-sm text-muted-foreground">{eventType.registrations} registrations</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* University Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Top Universities</CardTitle>
            <CardDescription>Attendee distribution by institution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.university_distribution.slice(0, 8).map((university, index) => (
                <div key={university.university} className="flex items-center gap-3">
                  <div className="w-32 text-sm font-medium truncate">{university.university}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${getBarWidth(university.count, maxUniversityCount)}%` }}
                    />
                  </div>
                  <div className="w-12 text-right font-semibold">{university.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Academic Year Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Year Distribution</CardTitle>
            <CardDescription>Attendees by year of study</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analytics.year_distribution.map((year) => (
                <div key={year.year_of_study} className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{year.count}</div>
                  <div className="text-sm text-muted-foreground">{year.year_of_study}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Event Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Event Check-in Performance</CardTitle>
            <CardDescription>Attendance rates by event</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.check_in_by_event.map((event) => (
                <div key={event.event_name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm truncate">{event.event_name}</h4>
                    <Badge variant="outline">{event.check_in_rate.toFixed(1)}%</Badge>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${(event.checked_in / event.total_registered) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {event.checked_in}/{event.total_registered}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Field and Team Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Field Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Field of Study</CardTitle>
              <CardDescription>Academic backgrounds of attendees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.field_distribution.slice(0, 8).map((field, index) => (
                  <div key={field.field_of_study} className="flex justify-between items-center">
                    <span className="text-sm font-medium truncate">{field.field_of_study}</span>
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-2 rounded"
                        style={{
                          backgroundColor: `hsl(${index * 40}, 60%, 50%)`,
                          width: `${(field.count / analytics.field_distribution[0].count) * 100}px`
                        }}
                      />
                      <Badge variant="outline">{field.count}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Competition Teams</CardTitle>
              <CardDescription>Team size distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.team_sizes.slice(0, 6).map((team, index) => (
                  <div key={team.team_name} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-sm">{team.team_name}</h4>
                      <Badge variant="outline">{team.team_size} members</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{team.event_name}</p>
                  </div>
                ))}
                {analytics.team_sizes.length > 6 && (
                  <div className="text-center text-sm text-muted-foreground">
                    +{analytics.team_sizes.length - 6} more teams
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registration Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Registration Trend</CardTitle>
            <CardDescription>Daily registration activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.registration_by_day.slice(-10).map((day) => (
                <div key={day.date} className="flex items-center gap-3">
                  <div className="w-20 text-sm">{new Date(day.date).toLocaleDateString()}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-purple-500"
                      style={{ 
                        width: `${Math.max((day.count / Math.max(...analytics.registration_by_day.map(d => d.count))) * 100, 2)}%` 
                      }}
                    />
                  </div>
                  <div className="w-8 text-right font-semibold">{day.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminHeader>
  )
}
