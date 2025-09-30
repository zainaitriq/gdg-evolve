"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Workshop {
  id: number
  name: string
  description: string
  date: string
  start_time: string
  end_time: string
  location: string
  capacity: number
  current_registrations: number
  event_type?: string
  speakers?: any[]
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
  role: string
}

interface WorkshopRegistrationModalProps {
  workshop: Workshop | null
  isOpen?: boolean
  onClose?: () => void
  trigger?: React.ReactNode
}

function WorkshopRegistrationModal({ workshop, isOpen, onClose, trigger }: WorkshopRegistrationModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    university: "",
    major: "",
    yearOfStudy: "",
    experience: "",
    selectedEvents: [] as number[],
    agreeToTerms: false,
  })
  const [teamData, setTeamData] = useState({
    teamName: "",
    teamDescription: "",
    teamMembers: [] as TeamMember[],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationResult, setRegistrationResult] = useState<any>(null)

  const modalOpen = isOpen !== undefined ? isOpen : internalOpen
  const handleOpenChange = (open: boolean) => {
    if (isOpen !== undefined && onClose) {
      if (!open) onClose()
    } else {
      setInternalOpen(open)
    }
  }

  useEffect(() => {
    if (workshop && modalOpen) {
      setFormData((prev) => ({
        ...prev,
        selectedEvents: [workshop.id],
      }))
    }
  }, [workshop, modalOpen])

  const addTeamMember = () => {
    if (teamData.teamMembers.length < (workshop?.max_team_size || 5) - 1) {
      setTeamData((prev) => ({
        ...prev,
        teamMembers: [
          ...prev.teamMembers,
          {
            name: "",
            email: "",
            phone: "",
            university: "",
            major: "",
            yearOfStudy: "",
            role: "Member",
          },
        ],
      }))
    }
  }

  const removeTeamMember = (index: number) => {
    setTeamData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index),
    }))
  }

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    setTeamData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) => (i === index ? { ...member, [field]: value } : member)),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.agreeToTerms) {
      alert("Please agree to the terms and conditions")
      return
    }

    if (workshop?.event_type === "competition" && workshop?.requires_team) {
      if (!teamData.teamName.trim()) {
        alert("Please enter a team name for this competition")
        return
      }

      const totalTeamSize = teamData.teamMembers.length + 1 // +1 for team leader
      if (totalTeamSize < (workshop.min_team_size || 1)) {
        alert(
          `This competition requires at least ${workshop.min_team_size} team members. Please add ${(workshop.min_team_size || 1) - totalTeamSize} more member(s).`,
        )
        return
      }

      for (let i = 0; i < teamData.teamMembers.length; i++) {
        const member = teamData.teamMembers[i]
        if (!member.name.trim() || !member.email.trim()) {
          alert(`Please fill in all required fields for team member ${i + 1}`)
          return
        }
      }
    }

    setIsSubmitting(true)
    try {
      const requestBody = {
        attendee: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          university: formData.university,
          fieldOfStudy: formData.major,
          yearOfStudy: formData.yearOfStudy,
          programmingExperience: formData.experience,
        },
        eventIds: formData.selectedEvents,
        ...(workshop?.event_type === "competition" &&
          workshop?.requires_team && {
            teamData: {
              teamName: teamData.teamName,
              teamDescription: teamData.teamDescription,
              teamMembers: teamData.teamMembers,
            },
          }),
      }

      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()
      if (response.ok) {
        setRegistrationResult(result)
      } else {
        alert(result.error || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      alert("Registration failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleTeamInputChange = (field: string, value: string) => {
    setTeamData((prev) => ({ ...prev, [field]: value }))
  }

  const handleClose = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      university: "",
      major: "",
      yearOfStudy: "",
      experience: "",
      selectedEvents: [],
      agreeToTerms: false,
    })
    setTeamData({
      teamName: "",
      teamDescription: "",
      teamMembers: [],
    })
    setRegistrationResult(null)
    handleOpenChange(false)
  }

  const handleDownloadTicket = async () => {
    if (!registrationResult?.ticketData) return

    try {
      const response = await fetch("/api/download-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationResult.ticketData),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `evolve-2025-ticket-${formData.firstName}-${formData.lastName}.html`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        alert("Failed to download ticket. Please try again.")
      }
    } catch (error) {
      console.error("Ticket download error:", error)
      alert("Failed to download ticket. Please try again.")
    }
  }

  if (!workshop) return null

  const eventType = workshop.event_type === "competition" ? "Competition" : "Workshop"
  const eventTypeAction = workshop.event_type === "competition" ? "Join" : "Register for"

  const modalContent = (
    <Dialog open={modalOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {eventTypeAction} {eventType}
          </DialogTitle>
        </DialogHeader>

        {registrationResult ? (
          <div className="text-center py-8">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-green-600 mb-2">Registration Successful!</h3>
              <p className="text-gray-600">
                Thank you for registering for <strong>{workshop.name}</strong>
              </p>
              {registrationResult.teamsCreated && registrationResult.teamsCreated.length > 0 && (
                <p className="text-sm text-blue-600 mt-2">
                  Team "{registrationResult.teamsCreated[0].name}" has been created successfully!
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Download your event ticket below. You can print it or save it on your device.
              </p>
            </div>

            {/* ... existing success content ... */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Your Event Ticket</h4>
              <p className="text-sm text-gray-600 mb-4">
                Your ticket contains all event details and serves as your entry pass.
              </p>
              <Button onClick={handleDownloadTicket} className="mb-4 bg-google-blue hover:bg-google-blue/90" size="lg">
                <span className="mr-2 text-base">⬇️</span>
                Download Ticket
              </Button>
            </div>

            <div className="text-left bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">{eventType} Details:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className="mr-2 text-base">🕒</span>
                  {new Date(workshop.date).toLocaleDateString()} • {workshop.start_time} - {workshop.end_time}
                </div>
                <div className="flex items-center">
                  <span className="mr-2 text-base">📍</span>
                  {workshop.location}
                </div>
                <div className="flex items-center">
                  <span className="mr-2 text-base">👥</span>
                  Max {workshop.capacity} participants
                </div>
              </div>
            </div>

            <div className="text-left bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
              <h4 className="font-semibold mb-2 text-blue-800">Important:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Please bring your downloaded ticket to the event</li>
                <li>• Arrive 15 minutes before the session starts</li>
                <li>• Bring a valid ID for verification</li>
                {workshop.event_type === "competition" && workshop.requires_team && (
                  <li>• You are registered as the team leader - you can invite other members later</li>
                )}
              </ul>
            </div>

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Workshop/Competition Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{workshop.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{workshop.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <span className="mr-2 text-base">🕒</span>
                  {new Date(workshop.date).toLocaleDateString()} • {workshop.start_time} - {workshop.end_time}
                </div>
                <div className="flex items-center">
                  <span className="mr-2 text-base">📍</span>
                  {workshop.location}
                </div>
                <div className="flex items-center">
                  <span className="mr-2 text-base">👥</span>
                  {workshop.current_registrations}/{workshop.capacity} registered
                </div>
                <Badge variant={workshop.current_registrations >= workshop.capacity ? "destructive" : "default"}>
                  {workshop.current_registrations >= workshop.capacity ? "Full" : "Available"}
                </Badge>
              </div>
              {workshop.event_type === "competition" && workshop.requires_team && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <span className="mr-2 text-base">👥</span>
                    <span className="text-sm font-medium text-blue-800">Team Competition</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    This competition requires teams of {workshop.min_team_size}-{workshop.max_team_size} members. You'll
                    be registered as the team leader and can invite other members later.
                  </p>
                </div>
              )}
            </div>

            {workshop.event_type === "competition" && workshop.requires_team && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-3 text-blue-800 flex items-center">
                  <span className="mr-2 text-base">👥</span>
                  Team Information
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teamName">Team Name *</Label>
                    <Input
                      id="teamName"
                      value={teamData.teamName}
                      onChange={(e) => handleTeamInputChange("teamName", e.target.value)}
                      placeholder="Enter your team name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teamDescription">Team Description (Optional)</Label>
                    <Textarea
                      id="teamDescription"
                      value={teamData.teamDescription}
                      onChange={(e) => handleTeamInputChange("teamDescription", e.target.value)}
                      placeholder="Brief description of your team's approach or goals..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Team Members</Label>
                      <div className="text-xs text-gray-600">
                        {teamData.teamMembers.length + 1}/{workshop.max_team_size} members
                      </div>
                    </div>

                    {/* Team Leader (current user) */}
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="flex items-center mb-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Team Leader
                        </Badge>
                      </div>
                      <div className="text-sm text-green-700">
                        <strong>
                          {formData.firstName} {formData.lastName}
                        </strong>{" "}
                        ({formData.email})
                      </div>
                    </div>

                    {/* Team Members */}
                    {teamData.teamMembers.map((member, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <Label className="font-medium">Team Member {index + 1}</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeTeamMember(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                            <Label>Phone</Label>
                            <Input
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
                              placeholder="Enter university"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Major</Label>
                            <Input
                              value={member.major}
                              onChange={(e) => updateTeamMember(index, "major", e.target.value)}
                              placeholder="Enter major/field of study"
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
                                <SelectItem value="1st Year">1st Year</SelectItem>
                                <SelectItem value="2nd Year">2nd Year</SelectItem>
                                <SelectItem value="3rd Year">3rd Year</SelectItem>
                                <SelectItem value="4th Year">4th Year</SelectItem>
                                <SelectItem value="Graduate">Graduate</SelectItem>
                                <SelectItem value="Professional">Professional</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add Team Member Button */}
                    {teamData.teamMembers.length < (workshop.max_team_size || 5) - 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addTeamMember}
                        className="w-full border-dashed border-2 border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent"
                      >
                        <span className="mr-2 text-base">➕</span>
                        Add Team Member ({teamData.teamMembers.length + 1}/{workshop.max_team_size})
                      </Button>
                    )}

                    <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                      <strong>Team Requirements:</strong> This competition requires {workshop.min_team_size}-
                      {workshop.max_team_size} members total. You are the team leader, so you need to add{" "}
                      {Math.max(0, (workshop.min_team_size || 1) - 1)} to {(workshop.max_team_size || 1) - 1} more
                      members.
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="university">University/Institution *</Label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) => handleInputChange("university", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="major">Major/Field of Study *</Label>
                <Input
                  id="major"
                  value={formData.major}
                  onChange={(e) => handleInputChange("major", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearOfStudy">Year of Study *</Label>
              <Select value={formData.yearOfStudy} onValueChange={(value) => handleInputChange("yearOfStudy", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st Year">1st Year</SelectItem>
                  <SelectItem value="2nd Year">2nd Year</SelectItem>
                  <SelectItem value="3rd Year">3rd Year</SelectItem>
                  <SelectItem value="4th Year">4th Year</SelectItem>
                  <SelectItem value="Graduate">Graduate</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Programming Experience Level</Label>
              <Textarea
                id="experience"
                placeholder="Brief description of your programming background and experience..."
                value={formData.experience}
                onChange={(e) => handleInputChange("experience", e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, agreeToTerms: checked as boolean }))}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the terms and conditions and privacy policy *
              </Label>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || workshop.current_registrations >= workshop.capacity}
                className="flex-1"
              >
                {isSubmitting ? "Registering..." : `${eventTypeAction} ${eventType}`}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )

  return trigger ? modalContent : modalContent
}

export default WorkshopRegistrationModal
export { WorkshopRegistrationModal }
