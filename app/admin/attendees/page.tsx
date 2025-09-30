"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAdminAuth } from "@/lib/admin-auth"
import { User, Mail, Phone, GraduationCap, Calendar, MapPin, Eye, Trash2, Download } from "lucide-react"

interface Attendee {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  university: string
  field_of_study: string
  year_of_study: string
  created_at: string
  events: {
    event_name: string
    event_type: string
    event_date: string
    checked_in: boolean
    team_name?: string
    team_role?: string
  }[]
  total_events: number
}

export default function AdminAttendees() {
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [filteredAttendees, setFilteredAttendees] = useState<Attendee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterUniversity, setFilterUniversity] = useState("all")
  const [filterYear, setFilterYear] = useState("all")
  const [filterCheckedIn, setFilterCheckedIn] = useState("all")
  const [universities, setUniversities] = useState<string[]>([])
  const [years, setYears] = useState<string[]>([])
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const admin = useAdminAuth()

  useEffect(() => {
    if (!admin) {
      router.push("/admin/login")
      return
    }
    fetchAttendees()
  }, [admin, router])

  useEffect(() => {
    let filtered = attendees.filter(attendee => {
      const fullName = `${attendee.first_name} ${attendee.last_name}`.toLowerCase()
      const searchMatch = fullName.includes(searchTerm.toLowerCase()) ||
                         attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (attendee.university && attendee.university.toLowerCase().includes(searchTerm.toLowerCase()))

      const universityMatch = filterUniversity === "all" || attendee.university === filterUniversity
      const yearMatch = filterYear === "all" || attendee.year_of_study === filterYear
      
      let checkedInMatch = true
      if (filterCheckedIn === "checked-in") {
        checkedInMatch = attendee.events.some(event => event.checked_in)
      } else if (filterCheckedIn === "not-checked-in") {
        checkedInMatch = !attendee.events.some(event => event.checked_in)
      }

      return searchMatch && universityMatch && yearMatch && checkedInMatch
    })

    setFilteredAttendees(filtered)
  }, [searchTerm, filterUniversity, filterYear, filterCheckedIn, attendees])

  const fetchAttendees = async () => {
    try {
      const response = await fetch("/api/admin/attendees")
      if (response.ok) {
        const data = await response.json()
        setAttendees(data.attendees)
        setFilteredAttendees(data.attendees)
        
        // Extract unique universities and years for filters
        const uniqueUniversities = [...new Set(data.attendees.map((a: Attendee) => a.university).filter(Boolean))]
        const uniqueYears = [...new Set(data.attendees.map((a: Attendee) => a.year_of_study).filter(Boolean))]
        
        setUniversities(uniqueUniversities)
        setYears(uniqueYears.sort())
      }
    } catch (error) {
      console.error("Error fetching attendees:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAttendee = async () => {
    if (!selectedAttendee) return
    
    setSubmitting(true)
    try {
      const response = await fetch(`/api/admin/attendees/${selectedAttendee.id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        await fetchAttendees()
        setIsDeleteDialogOpen(false)
        setSelectedAttendee(null)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to delete attendee")
      }
    } catch (error) {
      console.error("Error deleting attendee:", error)
      alert("Failed to delete attendee")
    } finally {
      setSubmitting(false)
    }
  }

  const exportAttendees = async () => {
    try {
      const response = await fetch("/api/admin/attendees/export")
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `attendees-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error exporting attendees:", error)
    }
  }

  const openDetailDialog = (attendee: Attendee) => {
    setSelectedAttendee(attendee)
    setIsDetailDialogOpen(true)
  }

  const openDeleteDialog = (attendee: Attendee) => {
    setSelectedAttendee(attendee)
    setIsDeleteDialogOpen(true)
  }

  if (!admin) return null

  const totalAttendees = attendees.length
  const checkedInAttendees = attendees.filter(a => a.events.some(e => e.checked_in)).length
  const teamMembers = attendees.filter(a => a.events.some(e => e.team_name)).length
  const averageEvents = totalAttendees > 0 ? (attendees.reduce((sum, a) => sum + a.total_events, 0) / totalAttendees).toFixed(1) : 0

  return (
    <AdminHeader>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendees Management</h1>
            <p className="text-gray-600">View and manage conference attendees</p>
          </div>
          <Button onClick={exportAttendees} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAttendees}</div>
              <p className="text-xs text-muted-foreground">Registered attendees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Checked In</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{checkedInAttendees}</div>
              <p className="text-xs text-muted-foreground">
                {totalAttendees > 0 ? ((checkedInAttendees / totalAttendees) * 100).toFixed(1) : 0}% attendance rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamMembers}</div>
              <p className="text-xs text-muted-foreground">In competition teams</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageEvents}</div>
              <p className="text-xs text-muted-foreground">Events per attendee</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center flex-wrap">
          <Input
            placeholder="Search attendees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          <Select value={filterUniversity} onValueChange={setFilterUniversity}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by university" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Universities</SelectItem>
              {universities.map((university) => (
                <SelectItem key={university} value={university}>
                  {university}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCheckedIn} onValueChange={setFilterCheckedIn}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by attendance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Attendees</SelectItem>
              <SelectItem value="checked-in">Checked In</SelectItem>
              <SelectItem value="not-checked-in">Not Checked In</SelectItem>
            </SelectContent>
          </Select>

          <Badge variant="outline">{filteredAttendees.length} attendees</Badge>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading attendees...</div>
        ) : (
          <div className="grid gap-4">
            {filteredAttendees.map((attendee) => (
              <Card key={attendee.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {attendee.first_name} {attendee.last_name}
                        {attendee.events.some(e => e.checked_in) && (
                          <Badge variant="default">Checked In</Badge>
                        )}
                        {attendee.events.some(e => e.team_name) && (
                          <Badge variant="secondary">Team Member</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {attendee.email}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openDetailDialog(attendee)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openDeleteDialog(attendee)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {attendee.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{attendee.phone}</span>
                      </div>
                    )}
                    {attendee.university && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span>{attendee.university}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{attendee.total_events} events</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Registered {new Date(attendee.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {attendee.events.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm font-medium mb-2">Events:</div>
                      <div className="flex flex-wrap gap-1">
                        {attendee.events.slice(0, 3).map((event, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {event.event_name}
                          </Badge>
                        ))}
                        {attendee.events.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{attendee.events.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredAttendees.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No attendees found matching your criteria</p>
              </div>
            )}
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedAttendee && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedAttendee.first_name} {selectedAttendee.last_name}</DialogTitle>
                  <DialogDescription>Attendee details and event registrations</DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h4 className="font-medium mb-3">Personal Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Email:</span>
                        <div>{selectedAttendee.email}</div>
                      </div>
                      {selectedAttendee.phone && (
                        <div>
                          <span className="font-medium">Phone:</span>
                          <div>{selectedAttendee.phone}</div>
                        </div>
                      )}
                      {selectedAttendee.university && (
                        <div>
                          <span className="font-medium">University:</span>
                          <div>{selectedAttendee.university}</div>
                        </div>
                      )}
                      {selectedAttendee.field_of_study && (
                        <div>
                          <span className="font-medium">Field of Study:</span>
                          <div>{selectedAttendee.field_of_study}</div>
                        </div>
                      )}
                      {selectedAttendee.year_of_study && (
                        <div>
                          <span className="font-medium">Year of Study:</span>
                          <div>{selectedAttendee.year_of_study}</div>
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Registered:</span>
                        <div>{new Date(selectedAttendee.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Events */}
                  <div>
                    <h4 className="font-medium mb-3">Event Registrations ({selectedAttendee.events.length})</h4>
                    <div className="space-y-2">
                      {selectedAttendee.events.map((event, index) => (
                        <div key={index} className="border rounded-lg p-3 bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium">{event.event_name}</h5>
                            <div className="flex gap-2">
                              <Badge variant="outline">{event.event_type}</Badge>
                              <Badge variant={event.checked_in ? "default" : "secondary"}>
                                {event.checked_in ? "Checked In" : "Not Checked In"}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(event.event_date).toLocaleDateString()}
                          </div>
                          {event.team_name && (
                            <div className="text-sm text-blue-600 mt-1">
                              Team: {event.team_name} ({event.team_role})
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Attendee</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedAttendee?.first_name} {selectedAttendee?.last_name}"? 
                This will remove all their registrations and cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteAttendee} disabled={submitting}>
                {submitting ? "Deleting..." : "Delete Attendee"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminHeader>
  )
}
