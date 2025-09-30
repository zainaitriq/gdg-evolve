"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAdminAuth } from "@/lib/admin-auth"
import { Search, Download, User, Calendar, Users } from "lucide-react"

interface AttendeeData {
  id: number
  attendee_name: string
  attendee_email: string
  attendee_phone: string
  university: string
  registrations: {
    event_name: string
    event_type: string
    event_date: string
    event_time: string
    event_location: string
    qr_code: string
    status: string
    team_name?: string
    team_role?: string
    team_members?: string[]
  }[]
}

export default function AdminTicketGenerator() {
  const [searchEmail, setSearchEmail] = useState("")
  const [attendeeData, setAttendeeData] = useState<AttendeeData | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const admin = useAdminAuth()

  useEffect(() => {
    if (!admin) {
      router.push("/admin/login")
      return
    }
  }, [admin, router])

  const searchAttendee = async () => {
    if (!searchEmail.trim()) {
      setError("Please enter an email address")
      return
    }

    setLoading(true)
    setError("")
    setAttendeeData(null)

    try {
      const response = await fetch(`/api/admin/attendee-lookup?email=${encodeURIComponent(searchEmail)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to find attendee")
      }

      const data = await response.json()
      setAttendeeData(data)
    } catch (error) {
      console.error("Error searching attendee:", error)
      setError(error instanceof Error ? error.message : "Failed to search attendee")
    } finally {
      setLoading(false)
    }
  }

  const generateTicket = async () => {
    if (!attendeeData) return

    setGenerating(true)
    setError("")

    try {
      // Format data for ticket generation
      const ticketData = {
        attendeeName: attendeeData.attendee_name,
        attendeeEmail: attendeeData.attendee_email,
        teamName: attendeeData.registrations.find(r => r.team_name)?.team_name,
        teamRole: attendeeData.registrations.find(r => r.team_role)?.team_role,
        teamMembers: attendeeData.registrations.find(r => r.team_members)?.team_members?.map(member => ({
          name: member,
          role: "member"
        })) || [],
        events: attendeeData.registrations.map(reg => ({
          name: reg.event_name,
          date: reg.event_date,
          start_time: reg.event_time.split(' - ')[0],
          end_time: reg.event_time.split(' - ')[1],
          location: reg.event_location,
          event_type: reg.event_type,
          qr_code: reg.qr_code,
          status: reg.status
        }))
      }

      const response = await fetch("/api/download-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketData)
      })

      if (!response.ok) {
        throw new Error("Failed to generate ticket")
      }

      // Handle file download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${attendeeData.attendee_name.replace(/\s+/g, "_")}_ticket.html`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (error) {
      console.error("Error generating ticket:", error)
      setError(error instanceof Error ? error.message : "Failed to generate ticket")
    } finally {
      setGenerating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchAttendee()
    }
  }

  if (!admin) return null

  return (
    <AdminHeader>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ticket Generator</h1>
          <p className="text-gray-600">Generate tickets for existing attendees</p>
        </div>

        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Attendee
            </CardTitle>
            <CardDescription>
              Enter the attendee's email address to lookup their registration details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="attendee@example.com"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={searchAttendee} 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendee Details */}
        {attendeeData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Attendee Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Name</Label>
                  <p className="text-lg font-semibold">{attendeeData.attendee_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-lg">{attendeeData.attendee_email}</p>
                </div>
                {attendeeData.attendee_phone && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Phone</Label>
                    <p className="text-lg">{attendeeData.attendee_phone}</p>
                  </div>
                )}
                {attendeeData.university && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">University</Label>
                    <p className="text-lg">{attendeeData.university}</p>
                  </div>
                )}
              </div>

              {/* Team Info */}
              {attendeeData.registrations.some(r => r.team_name) && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4" />
                    Team Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm font-medium text-blue-700">Team Name</Label>
                      <p className="text-blue-900">{attendeeData.registrations.find(r => r.team_name)?.team_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-blue-700">Role</Label>
                      <p className="text-blue-900 capitalize">{attendeeData.registrations.find(r => r.team_role)?.team_role}</p>
                    </div>
                  </div>
                  {attendeeData.registrations.find(r => r.team_members)?.team_members && (
                    <div className="mt-2">
                      <Label className="text-sm font-medium text-blue-700">Team Members</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {attendeeData.registrations.find(r => r.team_members)?.team_members?.map((member, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-blue-100 text-blue-800">
                            {member}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Events */}
              <div>
                <h4 className="font-medium text-gray-900 flex items-center gap-2 mb-4">
                  <Calendar className="h-4 w-4" />
                  Registered Events ({attendeeData.registrations.length})
                </h4>
                <div className="grid gap-3">
                  {attendeeData.registrations.map((registration, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-gray-900">{registration.event_name}</h5>
                        <div className="flex gap-2">
                          <Badge variant="outline">{registration.event_type}</Badge>
                          <Badge variant={registration.status === 'confirmed' ? 'default' : 'secondary'}>
                            {registration.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Date:</span> {new Date(registration.event_date).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Time:</span> {registration.event_time}
                        </div>
                        <div>
                          <span className="font-medium">Location:</span> {registration.event_location}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Ticket Button */}
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={generateTicket}
                  disabled={generating}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {generating ? "Generating Ticket..." : "Generate & Download Ticket"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminHeader>
  )
}
