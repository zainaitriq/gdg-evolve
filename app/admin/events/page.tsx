"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAdminAuth } from "@/lib/admin-auth"
import { Calendar, Clock, MapPin, Users, Edit, Trash2, Plus, Eye } from "lucide-react"

interface Event {
  id: number
  name: string
  description: string
  event_type: string
  date: string
  start_time: string
  end_time: string
  location: string
  capacity: number
  requires_team: boolean
  min_team_size: number
  max_team_size: number
  created_at: string
  registration_count: number
}

interface EventFormData {
  name: string
  description: string
  event_type: string
  date: string
  start_time: string
  end_time: string
  location: string
  capacity: number
  requires_team: boolean
  min_team_size: number
  max_team_size: number
}

const eventTypes = [
  "session",
  "workshop", 
  "competition",
  "keynote",
  "networking",
  "ceremony"
]

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    description: "",
    event_type: "session",
    date: "",
    start_time: "",
    end_time: "",
    location: "",
    capacity: 50,
    requires_team: false,
    min_team_size: 2,
    max_team_size: 5
  })
  const router = useRouter()
  const admin = useAdminAuth()

  useEffect(() => {
    if (!admin) {
      router.push("/admin/login")
      return
    }
    fetchEvents()
  }, [admin, router])

  useEffect(() => {
    let filtered = events.filter(event =>
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (filterType !== "all") {
      filtered = filtered.filter(event => event.event_type === filterType)
    }

    setFilteredEvents(filtered)
  }, [searchTerm, filterType, events])

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/admin/events")
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
        setFilteredEvents(data)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async () => {
    setSubmitting(true)
    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchEvents()
        setIsCreateDialogOpen(false)
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create event")
      }
    } catch (error) {
      console.error("Error creating event:", error)
      alert("Failed to create event")
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return
    
    setSubmitting(true)
    try {
      const response = await fetch(`/api/admin/events/${selectedEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchEvents()
        setIsEditDialogOpen(false)
        setSelectedEvent(null)
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update event")
      }
    } catch (error) {
      console.error("Error updating event:", error)
      alert("Failed to update event")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return
    
    setSubmitting(true)
    try {
      const response = await fetch(`/api/admin/events/${selectedEvent.id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        await fetchEvents()
        setIsDeleteDialogOpen(false)
        setSelectedEvent(null)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to delete event")
      }
    } catch (error) {
      console.error("Error deleting event:", error)
      alert("Failed to delete event")
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      event_type: "session",
      date: "",
      start_time: "",
      end_time: "",
      location: "",
      capacity: 50,
      requires_team: false,
      min_team_size: 2,
      max_team_size: 5
    })
  }

  const openEditDialog = (event: Event) => {
    setSelectedEvent(event)
    setFormData({
      name: event.name,
      description: event.description,
      event_type: event.event_type,
      date: event.date,
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location,
      capacity: event.capacity,
      requires_team: event.requires_team,
      min_team_size: event.min_team_size,
      max_team_size: event.max_team_size
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (event: Event) => {
    setSelectedEvent(event)
    setIsDeleteDialogOpen(true)
  }

  if (!admin) return null

  const totalEvents = events.length
  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).length
  const totalRegistrations = events
    .filter(event => !event.name.toLowerCase().includes('opening ceremony'))
    .reduce((sum, event) => sum + parseInt(event.registration_count || 0), 0)
  const competitionEvents = events.filter(e => e.event_type === "competition").length

  return (
    <AdminHeader>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
            <p className="text-gray-600">Create, edit, and manage conference events</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>Add a new event to the conference schedule</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Event Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Event name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Event Type</Label>
                    <Select value={formData.event_type} onValueChange={(value) => setFormData({...formData, event_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Event description"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Event location"
                    />
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="requires_team"
                      checked={formData.requires_team}
                      onChange={(e) => setFormData({...formData, requires_team: e.target.checked})}
                    />
                    <Label htmlFor="requires_team">Requires Team Registration</Label>
                  </div>
                  {formData.requires_team && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="min_team_size">Min Team Size</Label>
                        <Input
                          id="min_team_size"
                          type="number"
                          value={formData.min_team_size}
                          onChange={(e) => setFormData({...formData, min_team_size: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="max_team_size">Max Team Size</Label>
                        <Input
                          id="max_team_size"
                          type="number"
                          value={formData.max_team_size}
                          onChange={(e) => setFormData({...formData, max_team_size: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateEvent} disabled={submitting}>
                  {submitting ? "Creating..." : "Create Event"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEvents}</div>
              <p className="text-xs text-muted-foreground">All events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">Future events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Competitions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{competitionEvents}</div>
              <p className="text-xs text-muted-foreground">Competition events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRegistrations}</div>
              <p className="text-xs text-muted-foreground">All registrations</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center flex-wrap">
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {eventTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Badge variant="outline">{filteredEvents.length} events</Badge>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading events...</div>
        ) : (
          <div className="grid gap-4">
            {filteredEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {event.name}
                        <Badge variant="outline">{event.event_type}</Badge>
                        {event.requires_team && <Badge variant="secondary">Team Required</Badge>}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {event.description}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/admin/events/${event.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(event)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openDeleteDialog(event)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{event.start_time} - {event.end_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{event.registration_count}/{event.capacity}</span>
                    </div>
                  </div>
                  {event.requires_team && (
                    <div className="mt-2 text-sm text-blue-600">
                      Team size: {event.min_team_size}-{event.max_team_size} members
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredEvents.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No events found matching your criteria</p>
              </div>
            )}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>Update event information</DialogDescription>
            </DialogHeader>
            {/* Same form fields as create dialog */}
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Event Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-type">Event Type</Label>
                  <Select value={formData.event_type} onValueChange={(value) => setFormData({...formData, event_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-start_time">Start Time</Label>
                  <Input
                    id="edit-start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-end_time">End Time</Label>
                  <Input
                    id="edit-end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-capacity">Capacity</Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-requires_team"
                    checked={formData.requires_team}
                    onChange={(e) => setFormData({...formData, requires_team: e.target.checked})}
                  />
                  <Label htmlFor="edit-requires_team">Requires Team Registration</Label>
                </div>
                {formData.requires_team && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-min_team_size">Min Team Size</Label>
                      <Input
                        id="edit-min_team_size"
                        type="number"
                        value={formData.min_team_size}
                        onChange={(e) => setFormData({...formData, min_team_size: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-max_team_size">Max Team Size</Label>
                      <Input
                        id="edit-max_team_size"
                        type="number"
                        value={formData.max_team_size}
                        onChange={(e) => setFormData({...formData, max_team_size: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateEvent} disabled={submitting}>
                {submitting ? "Updating..." : "Update Event"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Event</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedEvent?.name}"? This action cannot be undone.
                {selectedEvent?.registration_count > 0 && (
                  <div className="mt-2 text-red-600 font-medium">
                    Warning: This event has {selectedEvent.registration_count} registrations.
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteEvent} disabled={submitting}>
                {submitting ? "Deleting..." : "Delete Event"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminHeader>
  )
}
