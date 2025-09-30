"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAdminAuth } from "@/lib/admin-auth"
import { Calendar, Clock, MapPin, Users, ArrowLeft, Edit } from "lucide-react"

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

interface EventDetailsPageProps {
  params: {
    id: string
  }
}

export default function EventDetailsPage({ params }: EventDetailsPageProps) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const admin = useAdminAuth()

  useEffect(() => {
    if (!admin) {
      router.push("/admin/login")
      return
    }
    fetchEvent()
  }, [admin, router, params.id])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/admin/events/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data)
      } else {
        setError("Event not found")
      }
    } catch (error) {
      console.error("Error fetching event:", error)
      setError("Failed to load event")
    } finally {
      setLoading(false)
    }
  }

  if (!admin) return null

  if (loading) {
    return (
      <AdminHeader>
        <div className="text-center py-8">Loading event details...</div>
      </AdminHeader>
    )
  }

  if (error || !event) {
    return (
      <AdminHeader>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={() => router.push("/admin/events")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </AdminHeader>
    )
  }

  const isUpcoming = new Date(event.date) >= new Date()
  const registrationRate = (event.registration_count / event.capacity) * 100

  return (
    <AdminHeader>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <Button 
              variant="outline" 
              onClick={() => router.push("/admin/events")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{event.event_type}</Badge>
              {event.requires_team && <Badge variant="secondary">Team Required</Badge>}
              <Badge variant={isUpcoming ? "default" : "secondary"}>
                {isUpcoming ? "Upcoming" : "Past"}
              </Badge>
            </div>
          </div>
          <Button 
            onClick={() => router.push(`/admin/events?edit=${event.id}`)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Event
          </Button>
        </div>

        {/* Event Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registrations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{event.registration_count}</div>
              <p className="text-xs text-muted-foreground">
                {registrationRate.toFixed(1)}% of capacity
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(registrationRate, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Capacity</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{event.capacity}</div>
              <p className="text-xs text-muted-foreground">
                {event.capacity - event.registration_count} spots remaining
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {event.registration_count >= event.capacity ? "Full" : "Open"}
              </div>
              <p className="text-xs text-muted-foreground">
                Registration status
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
              <CardDescription>Basic event details and schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Date</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Time</div>
                    <div className="text-sm text-muted-foreground">
                      {event.start_time} - {event.end_time}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Location</div>
                  <div className="text-sm text-muted-foreground">{event.location}</div>
                </div>
              </div>

              <div>
                <div className="font-medium mb-2">Description</div>
                <p className="text-sm text-muted-foreground">
                  {event.description || "No description provided"}
                </p>
              </div>

              <div className="text-xs text-muted-foreground">
                Created on {new Date(event.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>

          {event.requires_team && (
            <Card>
              <CardHeader>
                <CardTitle>Team Requirements</CardTitle>
                <CardDescription>Competition team specifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium">Minimum Team Size</div>
                    <div className="text-2xl font-bold text-blue-600">{event.min_team_size}</div>
                    <div className="text-sm text-muted-foreground">members</div>
                  </div>
                  
                  <div>
                    <div className="font-medium">Maximum Team Size</div>
                    <div className="text-2xl font-bold text-blue-600">{event.max_team_size}</div>
                    <div className="text-sm text-muted-foreground">members</div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800">
                    This event requires team registration. Teams must have between {event.min_team_size} and {event.max_team_size} members to participate.
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks for this event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                onClick={() => router.push(`/admin/attendees?event=${event.id}`)}
                className="justify-start"
              >
                <Users className="h-4 w-4 mr-2" />
                View Attendees
              </Button>
              
              {event.requires_team && (
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/admin/teams?event=${event.id}`)}
                  className="justify-start"
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Teams
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => router.push(`/admin/tickets?event=${event.id}`)}
                className="justify-start"
              >
                <Calendar className="h-4 w-4 mr-2" />
                View Tickets
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminHeader>
  )
}
