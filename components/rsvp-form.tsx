"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

interface Event {
  id: number
  name: string
  description: string
  date: string
  start_time: string
  end_time: string
  location: string
  capacity: number
  current_registrations: number
  event_type: "session" | "workshop" | "competition" | "opening_ceremony"
  speakers: Array<{ name: string; title: string; company: string }>
  requires_team?: boolean
  min_team_size?: number
  max_team_size?: number
}

interface TeamMember {
  name: string
  email: string
  phone: string
  university: string
  major: string
  yearOfStudy: string
}

interface RSVPFormProps {
  events: Event[]
}

export default function RSVPForm({ events }: RSVPFormProps) {
  const selectableEvents = events

  const [selectedEvents, setSelectedEvents] = useState<number[]>([])
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    university: "",
    yearOfStudy: "",
    fieldOfStudy: "",
    programmingExperience: "",
  })
  const [teamData, setTeamData] = useState({
    teamName: "",
    teamDescription: "",
  })
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [registrationData, setRegistrationData] = useState<any>(null)

  const checkTimeConflicts = (eventIds: number[]) => {
    const selectedEventsList = selectableEvents.filter((event) => eventIds.includes(event.id))
    const conflicts: string[] = []

    for (let i = 0; i < selectedEventsList.length; i++) {
      for (let j = i + 1; j < selectedEventsList.length; j++) {
        const event1 = selectedEventsList[i]
        const event2 = selectedEventsList[j]

        // Skip if both are sessions (sessions can overlap)
        if (event1.event_type === "session" && event2.event_type === "session") {
          continue
        }

        // Check if events are on the same date
        if (event1.date === event2.date) {
          const start1 = new Date(`${event1.date}T${event1.start_time}`)
          const end1 = new Date(`${event1.date}T${event1.end_time}`)
          const start2 = new Date(`${event2.date}T${event2.start_time}`)
          const end2 = new Date(`${event2.date}T${event2.end_time}`)

          // Check for time overlap
          if (start1 < end2 && start2 < end1) {
            conflicts.push(`"${event1.name}" and "${event2.name}" have overlapping times`)
          }
        }
      }
    }

    return conflicts
  }

  const selectedCompetition = selectableEvents.find(
    (event) => event.event_type === "competition" && selectedEvents.includes(event.id),
  )
  const selectedCompetitionRequiresTeam = () => selectedCompetition?.requires_team || false

  const addTeamMember = () => {
    setTeamMembers([
      ...teamMembers,
      {
        name: "",
        email: "",
        phone: "",
        university: "",
        major: "",
        yearOfStudy: "",
      },
    ])
  }

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index))
  }

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...teamMembers]
    updated[index] = { ...updated[index], [field]: value }
    setTeamMembers(updated)
  }

  const validateTeamSize = () => {
    if (!selectedCompetition?.requires_team) return true
    const totalMembers = teamMembers.length + 1 // +1 for team leader
    const minSize = selectedCompetition.min_team_size || 2
    const maxSize = selectedCompetition.max_team_size || 5
    return totalMembers >= minSize && totalMembers <= maxSize
  }

  const handleEventToggle = (eventId: number, eventType: string) => {
    setSelectedEvents((prev) => {
      let newSelection: number[]

      if (eventType === "workshop" || eventType === "competition") {
        const filtered = prev.filter((id) => {
          const event = selectableEvents.find((e) => e.id === id)
          return event?.event_type !== eventType
        })

        if (prev.includes(eventId)) {
          if (eventType === "competition") {
            setTeamData({ teamName: "", teamDescription: "" })
            setTeamMembers([])
          }
          newSelection = filtered
        } else {
          newSelection = [...filtered, eventId]
        }
      } else {
        if (prev.includes(eventId)) {
          newSelection = prev.filter((id) => id !== eventId)
        } else {
          newSelection = [...prev, eventId]
        }
      }

      const conflicts = checkTimeConflicts(newSelection)
      if (conflicts.length > 0) {
        setErrorMessage(`Time conflict detected: ${conflicts.join(", ")}`)
        return prev // Don't update selection if there are conflicts
      } else {
        setErrorMessage("")
        return newSelection
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    const conflicts = checkTimeConflicts(selectedEvents)
    if (conflicts.length > 0) {
      setErrorMessage(`Cannot register: ${conflicts.join(", ")}`)
      setIsSubmitting(false)
      return
    }

    if (selectedCompetitionRequiresTeam() && !validateTeamSize()) {
      const minSize = selectedCompetition?.min_team_size || 2
      const maxSize = selectedCompetition?.max_team_size || 5
      setErrorMessage(`Team size must be between ${minSize} and ${maxSize} members (including team leader)`)
      setIsSubmitting(false)
      return
    }

    try {
      const requestBody: any = {
        attendee: formData,
        eventIds: selectedEvents,
      }

      if (selectedCompetitionRequiresTeam()) {
        requestBody.teamData = {
          ...teamData,
          teamMembers: teamMembers,
        }
      }

      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit RSVP")
      }

      setSubmitStatus("success")
      setRegistrationData(result)

      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        university: "",
        yearOfStudy: "",
        fieldOfStudy: "",
        programmingExperience: "",
      })
      setTeamData({
        teamName: "",
        teamDescription: "",
      })
      setTeamMembers([])
      setSelectedEvents([])
    } catch (error) {
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "session":
        return "bg-blue-100 text-blue-800"
      case "workshop":
        return "bg-green-100 text-green-800"
      case "competition":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAvailabilityStatus = (event: Event) => {
    const available = event.capacity - event.current_registrations
    if (available > 10) return { status: "available", color: "text-green-600", icon: "✅" }
    if (available > 0) return { status: "limited", color: "text-yellow-600", icon: "⏰" }
    return { status: "full", color: "text-red-600", icon: "⚠️" }
  }

  if (submitStatus === "success") {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <CardTitle className="text-2xl text-green-700">RSVP Confirmed!</CardTitle>
          <CardDescription>
            Thank you for registering for Evolve Conference. Your registration is confirmed!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-lg font-semibold text-gray-800">
              <span className="text-xl">📥</span>
              {registrationData?.ticketDataArray && registrationData.ticketDataArray.length > 1
                ? "Your Team Tickets"
                : "Your Event Ticket"}
            </div>
            <p className="text-sm text-gray-600">
              {registrationData?.ticketDataArray && registrationData.ticketDataArray.length > 1
                ? "Individual tickets are ready for download for all team members. Save them for event check-in."
                : "Your ticket is ready for download. Save it for event check-in."}
            </p>

            {registrationData?.ticketDataArray && registrationData.ticketDataArray.length > 1 ? (
              <div className="space-y-3">
                {registrationData.ticketDataArray.map((ticketData: any, index: number) => (
                  <Button
                    key={index}
                    onClick={async () => {
                      try {
                        const response = await fetch("/api/download-ticket", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify(ticketData),
                        })

                        if (response.ok) {
                          const blob = await response.blob()
                          const url = window.URL.createObjectURL(blob)
                          const link = document.createElement("a")
                          link.href = url
                          link.download = `evolve-conference-ticket-${ticketData.attendeeName.replace(/\s+/g, "-").toLowerCase()}.html`
                          link.click()
                          window.URL.revokeObjectURL(url)
                        } else {
                          console.error("Failed to download ticket:", response.statusText)
                        }
                      } catch (error) {
                        console.error("Failed to download ticket:", error)
                      }
                    }}
                    className="gap-2 bg-google-blue hover:bg-blue-700 w-full"
                    variant={index === 0 ? "default" : "outline"}
                  >
                    <span>📥</span>
                    Download Ticket - {ticketData.attendeeName}
                    {index === 0 && " (Team Leader)"}
                  </Button>
                ))}
              </div>
            ) : (
              <Button
                onClick={async () => {
                  try {
                    const response = await fetch("/api/download-ticket", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(registrationData.ticketData),
                    })

                    if (response.ok) {
                      const blob = await response.blob()
                      const url = window.URL.createObjectURL(blob)
                      const link = document.createElement("a")
                      link.href = url
                      link.download = `evolve-conference-ticket-${registrationData.ticketData.attendeeName.replace(/\s+/g, "-").toLowerCase()}.html`
                      link.click()
                      window.URL.revokeObjectURL(url)
                    } else {
                      console.error("Failed to download ticket:", response.statusText)
                    }
                  } catch (error) {
                    console.error("Failed to download ticket:", error)
                  }
                }}
                className="gap-2 bg-google-blue hover:bg-blue-700"
              >
                <span>📥</span>
                Download Ticket
              </Button>
            )}
          </div>

          {registrationData?.registeredEvents && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Registered Events:</h3>
              {registrationData.registeredEvents.map((event: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{event.name}</p>
                    <p className="text-sm text-gray-600">
                      {event.date} • {event.start_time}
                    </p>
                  </div>
                  <Badge className={getEventTypeColor(event.event_type)}>{event.event_type}</Badge>
                </div>
              ))}
            </div>
          )}

          {registrationData?.teamData && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Team Created:</h3>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="font-medium text-green-800">{registrationData.teamData.name}</p>
                <p className="text-sm text-green-600">{registrationData.teamData.description}</p>
                <p className="text-xs text-green-500 mt-2">You are registered as the team leader.</p>
                {registrationData.teamData.members && registrationData.teamData.members.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-green-700">Team Members:</p>
                    {registrationData.teamData.members.map((member: any, index: number) => (
                      <p key={index} className="text-xs text-green-600">
                        {member.name} ({member.email})
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mx-2 sm:mx-0 w-full p-4 border border-blue-300 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-blue-500 text-lg flex-shrink-0">ℹ️</span>
              <p className="text-blue-700 text-sm">
                {registrationData?.ticketDataArray && registrationData.ticketDataArray.length > 1
                  ? "Individual tickets have been generated for all team members and are ready for download. Each person needs their own ticket for event check-in."
                  : "Your ticket has been generated and is ready for download. Please save it for event check-in."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-2 sm:px-4">
      <div className="text-center px-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
        <p className="text-base sm:text-lg text-gray-600">
         We apologize, tickets are sold out and currently unavailable. Stay tuned for future events and announcements we&#39;d love to see you next time
        </p>
      </div>
 {/* Temporary admin button - remove after fixing  <AdminSyncButton />
       
        "leveling up computer science skills: building real-time chat apps with node.js & socket.io",
     
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <Card className="mx-2 sm:mx-0">
          <CardHeader>
            <CardTitle>Select Events</CardTitle>
            <CardDescription>Choose the sessions, workshops, and competitions you'd like to attend.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectableEvents.map((event) => {
              const availability = getAvailabilityStatus(event)
              const isSelected = selectedEvents.includes(event.id)

              return (
                <div
                  key={event.id}
                  className={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-all ${
                    isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleEventToggle(event.id, event.event_type)}
                >
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base sm:text-lg break-words">{event.name}</h3>
                          <Badge className={getEventTypeColor(event.event_type)}>{event.event_type}</Badge>
                          {event.event_type === "competition" && event.requires_team && (
                            <Badge variant="outline" className="text-purple-600 border-purple-300 text-xs">
                              Team Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2 text-sm sm:text-base">{event.description}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500">
                          <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                          <span>
                            ⏰ {event.start_time} - {event.end_time}
                          </span>
                          <span>📍 {event.location}</span>
                        </div>
                        {event.speakers && event.speakers.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs sm:text-sm text-gray-500">Speakers: </span>
                            {event.speakers.map((speaker, index) => (
                              <span key={index} className="text-xs sm:text-sm text-gray-700">
                                {speaker.name}
                                {index < event.speakers.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-2 justify-between sm:justify-start">
                        <div className={`flex items-center gap-1 ${availability.color}`}>
                          <span className="text-sm">{availability.icon}</span>
                          <span className="text-xs sm:text-sm font-medium">
                            {availability.status === "available" && "Available"}
                            {availability.status === "limited" && "Limited"}
                            {availability.status === "full" && "Waitlist"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                          <span>👥</span>
                          <span>
                            {event.current_registrations}/{event.capacity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {selectedCompetitionRequiresTeam() && (
          <Card className="mx-2 sm:mx-0">
            <CardHeader>
              <CardTitle>Team Registration</CardTitle>
              <CardDescription>
                The selected competition requires a team. Please provide your team information and add team members.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Name *</Label>
                  <Input
                    id="teamName"
                    value={teamData.teamName}
                    onChange={(e) => setTeamData((prev) => ({ ...prev, teamName: e.target.value }))}
                    placeholder="Enter your team name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Team Size</Label>
                  <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                    Current: {teamMembers.length + 1} members (including you as leader)
                    <br />
                    Required: {selectedCompetition?.min_team_size || 2} - {selectedCompetition?.max_team_size || 5}{" "}
                    members
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamDescription">Team Description</Label>
                <Textarea
                  id="teamDescription"
                  value={teamData.teamDescription}
                  onChange={(e) => setTeamData((prev) => ({ ...prev, teamDescription: e.target.value }))}
                  placeholder="Describe your team's background, skills, or goals (optional)"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <Label className="text-base font-semibold">Team Members</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTeamMember}
                    disabled={teamMembers.length >= (selectedCompetition?.max_team_size || 5) - 1}
                    className="gap-2 w-full sm:w-auto"
                  >
                    <span>➕</span>
                    Add Member
                  </Button>
                </div>

                {teamMembers.map((member, index) => (
                  <Card key={index} className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                      <h4 className="font-medium">Team Member {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTeamMember(index)}
                        className="gap-2 text-red-600 hover:text-red-700 w-full sm:w-auto"
                      >
                        <span>🗑️</span>
                        Remove
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name *</Label>
                        <Input
                          value={member.name}
                          onChange={(e) => updateTeamMember(index, "name", e.target.value)}
                          placeholder="Enter full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          value={member.email}
                          onChange={(e) => updateTeamMember(index, "email", e.target.value)}
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input
                          type="tel"
                          value={member.phone}
                          onChange={(e) => updateTeamMember(index, "phone", e.target.value)}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>University</Label>
                        <Input
                          value={member.university}
                          onChange={(e) => updateTeamMember(index, "university", e.target.value)}
                          placeholder="Enter university name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Major/Field of Study</Label>
                        <Input
                          value={member.major}
                          onChange={(e) => updateTeamMember(index, "major", e.target.value)}
                          placeholder="e.g., Computer Science"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Year of Study</Label>
                        <Select
                          value={member.yearOfStudy}
                          onValueChange={(value) => updateTeamMember(index, "yearOfStudy", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1st">1st Year</SelectItem>
                            <SelectItem value="2nd">2nd Year</SelectItem>
                            <SelectItem value="3rd">3rd Year</SelectItem>
                            <SelectItem value="4th">4th Year</SelectItem>
                            <SelectItem value="graduate">Graduate</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>
                ))}

                {!validateTeamSize() && (
                  <div className="mx-2 sm:mx-0 w-full p-4 border border-red-300 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-red-500 text-lg flex-shrink-0">⚠️</span>
                      <p className="text-red-700 text-sm font-medium">
                        Team size must be between {selectedCompetition?.min_team_size || 2} and{" "}
                        {selectedCompetition?.max_team_size || 5} members (including team leader). Current team size:{" "}
                        {teamMembers.length + 1} members.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mx-2 sm:mx-0 w-full p-4 border border-blue-300 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-blue-500 text-lg flex-shrink-0">ℹ️</span>
                  <p className="text-blue-700 text-sm">
                    You will be registered as the team leader. Individual tickets will be generated for all team members
                    and available for download immediately after registration. No email notifications will be sent to
                    team members.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mx-2 sm:mx-0">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Please provide your details for registration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="university">University/Institution</Label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) => setFormData((prev) => ({ ...prev, university: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearOfStudy">Year of Study</Label>
                <Select
                  value={formData.yearOfStudy}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, yearOfStudy: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st">1st Year</SelectItem>
                    <SelectItem value="2nd">2nd Year</SelectItem>
                    <SelectItem value="3rd">3rd Year</SelectItem>
                    <SelectItem value="4th">4th Year</SelectItem>
                    <SelectItem value="graduate">Graduate</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fieldOfStudy">Field of Study</Label>
              <Input
                id="fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={(e) => setFormData((prev) => ({ ...prev, fieldOfStudy: e.target.value }))}
                placeholder="e.g., Computer Science, Engineering, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="programmingExperience">Programming Experience Level</Label>
              <Select
                value={formData.programmingExperience}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, programmingExperience: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                  <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
                  <SelectItem value="expert">Expert (5+ years)</SelectItem>
                  <SelectItem value="none">No programming experience</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {(submitStatus === "error" || errorMessage) && (
          <div className="mx-2 sm:mx-0 w-full p-4 border border-red-300 bg-red-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-red-500 text-lg flex-shrink-0">⚠️</span>
              <p className="text-red-700 text-sm font-medium">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="flex justify-center px-2 sm:px-0 pb-4">
          <Button
            type="submit"
            size="lg"
            disabled={
              isSubmitting ||
              selectedEvents.length === 0 ||
              (selectedCompetitionRequiresTeam() && !validateTeamSize()) ||
              errorMessage !== ""
            }
            className="px-6 sm:px-8 w-full sm:w-auto"
          >
            {isSubmitting ? "Submitting..." : "Complete Registration"}
          </Button>
        </div>
      </form>

 */}
 

    </div>
  )
}
