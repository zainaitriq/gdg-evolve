"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAdminAuth } from "@/lib/admin-auth"

interface Ticket {
  id: number
  attendee_name: string
  attendee_email: string
  event_name: string
  event_type: string
  event_date: string
  event_time: string
  registration_date: string
  checked_in: boolean
  check_in_time: string | null
  team_name: string | null
  team_role: string | null
  team_members: string[]
}

export default function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const router = useRouter()
  const admin = useAdminAuth()

  useEffect(() => {
    if (!admin) {
      router.push("/admin/login")
      return
    }
    fetchTickets()
  }, [admin, router])

  useEffect(() => {
    let filtered = tickets.filter(
      (ticket) =>
        ticket.attendee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.attendee_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.event_name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (filterType !== "all") {
      filtered = filtered.filter((ticket) => ticket.event_type === filterType)
    }

    if (filterStatus === "checked-in") {
      filtered = filtered.filter((ticket) => ticket.checked_in)
    } else if (filterStatus === "not-checked-in") {
      filtered = filtered.filter((ticket) => !ticket.checked_in)
    }

    setFilteredTickets(filtered)
  }, [searchTerm, filterType, filterStatus, tickets])

  const fetchTickets = async () => {
    try {
      const response = await fetch("/api/admin/tickets")

      if (!response.ok) {
        let errorMessage = "Failed to fetch tickets"

        // Check if response is JSON
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
          // Use fallback data if provided
          if (errorData.tickets) {
            setTickets(errorData.tickets)
            setFilteredTickets(errorData.tickets)
          }
        } else {
          // Handle plain text responses (like "Too Many Requests")
          const textError = await response.text()
          if (textError.includes("Too Many Requests") || textError.includes("rate limit")) {
            errorMessage = "Database is currently busy. Please try again in a moment."
          } else {
            errorMessage = textError || errorMessage
          }
          // Set empty arrays for non-JSON errors
          setTickets([])
          setFilteredTickets([])
        }

        console.error("[v0] Error fetching tickets:", errorMessage)
        return
      }

      const data = await response.json()
      setTickets(data)
      setFilteredTickets(data)
    } catch (error) {
      console.error("[v0] Error fetching tickets:", error)
      // Set empty arrays on error to prevent UI issues
      setTickets([])
      setFilteredTickets([])
    } finally {
      setLoading(false)
    }
  }

  const toggleCheckIn = async (ticketId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}/check-in`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked_in: !currentStatus }),
      })

      if (response.ok) {
        fetchTickets() // Refresh the list
      }
    } catch (error) {
      console.error("[v0] Error updating check-in status:", error)
    }
  }

  const exportTickets = async () => {
    try {
      const response = await fetch("/api/admin/tickets/export")
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `tickets-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("[v0] Error exporting tickets:", error)
    }
  }

  if (!admin) return null

  const checkedInCount = tickets.filter((t) => t.checked_in).length
  const totalTickets = tickets.length

  return (
    <AdminHeader>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ticket Management</h1>
            <p className="text-gray-600">Manage event tickets and check-ins</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportTickets}>
              Export CSV
            </Button>
            <Button
              onClick={() => router.push("/admin/tickets/bulk-check-in")}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Bulk Check-in
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <div className="text-2xl">🎫</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTickets}</div>
              <p className="text-xs text-muted-foreground">All event registrations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Checked In</CardTitle>
              <div className="text-2xl">✅</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{checkedInCount}</div>
              <p className="text-xs text-muted-foreground">
                {totalTickets > 0 ? ((checkedInCount / totalTickets) * 100).toFixed(1) : 0}% attendance rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <div className="text-2xl">⏳</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTickets - checkedInCount}</div>
              <p className="text-xs text-muted-foreground">Not checked in yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Tickets</CardTitle>
              <div className="text-2xl">👥</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tickets.filter((t) => t.team_name).length}</div>
              <p className="text-xs text-muted-foreground">Competition team members</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center flex-wrap">
          <Input
            placeholder="Search by attendee name, email, or event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Event Types</SelectItem>
              <SelectItem value="session">Sessions</SelectItem>
              <SelectItem value="workshop">Workshops</SelectItem>
              <SelectItem value="competition">Competitions</SelectItem>
              <SelectItem value="keynote">Keynotes</SelectItem>
              <SelectItem value="networking">Networking</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="checked-in">Checked In</SelectItem>
              <SelectItem value="not-checked-in">Not Checked In</SelectItem>
            </SelectContent>
          </Select>

          <Badge variant="outline">{filteredTickets.length} tickets</Badge>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading tickets...</div>
        ) : (
          <div className="grid gap-4">
            {filteredTickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {ticket.attendee_name}
                        <Badge variant={ticket.checked_in ? "default" : "secondary"}>
                          {ticket.checked_in ? "Checked In" : "Pending"}
                        </Badge>
                        <Badge variant="outline">{ticket.event_type}</Badge>
                        {ticket.team_name && <Badge variant="secondary">Team: {ticket.team_name}</Badge>}
                      </CardTitle>
                      <CardDescription>
                        {ticket.attendee_email} • {ticket.event_name}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={ticket.checked_in ? "secondary" : "default"}
                        size="sm"
                        onClick={() => toggleCheckIn(ticket.id, ticket.checked_in)}
                      >
                        {ticket.checked_in ? "Undo Check-in" : "Check In"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/admin/tickets/${ticket.id}`)}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Event Date:</span>
                      <div>{new Date(ticket.event_date).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="font-medium">Event Time:</span>
                      <div>{ticket.event_time}</div>
                    </div>
                    <div>
                      <span className="font-medium">Registered:</span>
                      <div>{new Date(ticket.registration_date).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="font-medium">Check-in:</span>
                      <div>
                        {ticket.checked_in && ticket.check_in_time
                          ? new Date(ticket.check_in_time).toLocaleString()
                          : "Not checked in"}
                      </div>
                    </div>
                  </div>
                  {ticket.team_name && ticket.team_members.length > 0 && (
                    <div className="mt-3">
                      <span className="font-medium text-sm">Team Members ({ticket.team_role}):</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ticket.team_members.slice(0, 4).map((member, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {member}
                          </Badge>
                        ))}
                        {ticket.team_members.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{ticket.team_members.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredTickets.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🎫</div>
                <p>No tickets found matching your criteria</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminHeader>
  )
}
