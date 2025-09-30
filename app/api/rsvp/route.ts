import { type NextRequest, NextResponse } from "next/server"
import {
  createAttendee,
  createRSVP,
  checkEventConflicts,
  getEventById,
  createTeam,
  createTeamMember,
  getEventRequiresTeam,
  getOpeningCeremonyId,
  getAttendeeByEmail,
  validateEventTimeConflicts,
  checkExistingRSVPs,
} from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { attendee, eventIds, teamData } = await request.json()

    if (!attendee.email || !attendee.firstName || !attendee.lastName) {
      return NextResponse.json({ error: "Email, first name, and last name are required" }, { status: 400 })
    }

    if (!eventIds || eventIds.length === 0) {
      return NextResponse.json({ error: "At least one event must be selected" }, { status: 400 })
    }

    const existingAttendee = await getAttendeeByEmail(attendee.email)
    if (existingAttendee) {
      const existingRSVPs = await checkExistingRSVPs(attendee.email)
      if (existingRSVPs.length > 0) {
        const eventNames = existingRSVPs.map((rsvp) => rsvp.event_name).join(", ")
        return NextResponse.json(
          {
            error: `An attendee with email ${attendee.email} is already registered for the following events: ${eventNames}. Duplicate registrations are not allowed.`,
          },
          { status: 400 },
        )
      }
    }

    const timeConflicts = await validateEventTimeConflicts(eventIds)
    if (timeConflicts.length > 0) {
      const conflictMessages = timeConflicts.map((conflict) => conflict.message).join("; ")
      return NextResponse.json(
        {
          error: `Time conflicts detected between selected events: ${conflictMessages}. Please select events that do not overlap.`,
        },
        { status: 400 },
      )
    }

    const competitionEvents = []
    for (const eventId of eventIds) {
      const eventTeamReq = await getEventRequiresTeam(eventId)
      if (eventTeamReq?.requires_team) {
        competitionEvents.push({ eventId, requirements: eventTeamReq })
      }
    }

    if (competitionEvents.length > 0 && (!teamData || !teamData.teamName)) {
      return NextResponse.json(
        {
          error: "Selected competition requires team registration. Please provide team information.",
        },
        { status: 400 },
      )
    }

    if (competitionEvents.length > 0 && teamData) {
      const totalMembers = (teamData.teamMembers?.length || 0) + 1 // +1 for team leader
      const requirements = competitionEvents[0].requirements
      if (totalMembers < requirements.min_team_size || totalMembers > requirements.max_team_size ) {
        return NextResponse.json(
          {
            error: `Team size must be between ${requirements.min_team_size} and ${requirements.max_team_size} members (including team leader). Current team size: ${totalMembers} members.`,
          },
          { status: 400 },
        )
      }
    }

    let attendeeRecord
    try {
      attendeeRecord = await createAttendee({
        email: attendee.email,
        first_name: attendee.firstName,
        last_name: attendee.lastName,
        phone: attendee.phone,
        university: attendee.university,
        year_of_study: attendee.yearOfStudy,
        field_of_study: attendee.fieldOfStudy,
      })
    } catch (error) {
      console.error("Failed to create attendee:", error)
      return NextResponse.json({ error: "Failed to create attendee record. Please try again." }, { status: 500 })
    }

    const openingCeremonyId = await getOpeningCeremonyId()
    const allEventIds = [...eventIds]
    if (openingCeremonyId && !allEventIds.includes(openingCeremonyId)) {
      allEventIds.unshift(openingCeremonyId) // Add at beginning
    }

    const rsvps = []
    const teamsCreated = []
    const createdRecords = { teams: [], rsvps: [] }

    try {
      for (const eventId of allEventIds) {
        // Check if event requires team
        const eventTeamReq = await getEventRequiresTeam(eventId)
        let teamId = null

        if (eventTeamReq?.requires_team && teamData && eventIds.includes(eventId)) {
          // Create team for this competition
          const team = await createTeam({
            name: teamData.teamName,
            event_id: eventId,
            team_leader_id: attendeeRecord.id,
            max_members: eventTeamReq.max_team_size,
            description: teamData.teamDescription || "",
          })
          teamId = team.id
          teamsCreated.push(team)
          createdRecords.teams.push(team.id)

          if (teamData.teamMembers && teamData.teamMembers.length > 0) {
            for (const member of teamData.teamMembers) {
              try {
                await createTeamMember(team.id, {
                  name: member.name,
                  email: member.email,
                  phone: member.phone,
                  university: member.university,
                  major: member.major,
                  yearOfStudy: member.yearOfStudy,
                  role: member.role || "member",
                })
              } catch (error) {
                console.error(`Error creating team member ${member.name}:`, error)
                throw new Error(`Failed to register team member ${member.name}. Registration cancelled.`)
              }
            }
          }
        }

        // Double-check for conflicts with existing registrations
        const eventConflicts = await checkEventConflicts(attendeeRecord.id, eventId)
        if (eventConflicts.length > 0) {
          throw new Error(`Time conflict detected with existing registrations for event ${eventId}`)
        }

        // Create RSVP
        const rsvp = await createRSVP(attendeeRecord.id, eventId, teamId)
        rsvps.push(rsvp)
        createdRecords.rsvps.push(rsvp.id)
      }
    } catch (error) {
      console.error("Error during registration process:", error)
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : "Registration failed. Please try again.",
        },
        { status: 500 },
      )
    }

    // Get event details for all registered events
    const eventDetails = await Promise.all(
      rsvps.map(async (rsvp) => {
        const event = await getEventById(rsvp.event_id)
        return {
          name: event.name,
          date: event.date,
          start_time: event.start_time,
          end_time: event.end_time,
          location: event.location,
          event_type: event.event_type,
          qr_code: rsvp.qr_code,
          status: rsvp.status,
        }
      }),
    )

    const ticketDataArray = []

    // Generate tickets for team members if they exist
    if (teamData && teamData.teamMembers && teamData.teamMembers.length > 0) {
      // Filter events by type for team leader and members
      const competitionEventIds = competitionEvents.map(ce => ce.eventId)
      
      // Team leader gets ALL events (competitions, workshops, sessions, etc.)
      const teamLeaderEvents = eventDetails
      
      // Team members only get competition events and opening ceremony
      const teamMemberEvents = eventDetails.filter(event => {
        const eventId = rsvps.find(r => r.qr_code === event.qr_code)?.event_id
        return competitionEventIds.includes(eventId) || event.name?.toLowerCase().includes('opening ceremony')
      })

      // Team leader ticket
      ticketDataArray[0] = {
        attendeeName: `${attendee.firstName} ${attendee.lastName}`,
        attendeeEmail: attendee.email,
        teamName: teamData.teamName,
        teamRole: "leader",
        teamMembers: [
          {
            name: `${attendee.firstName} ${attendee.lastName}`,
            email: attendee.email,
            role: "leader",
          },
          ...teamData.teamMembers.map((member) => ({
            name: member.name,
            email: member.email,
            role: member.role || "member",
          })),
        ],
        events: teamLeaderEvents, // Team leader gets all events
      }

      // Team member tickets - only get competition events and opening ceremony
      for (const member of teamData.teamMembers) {
        const memberTicketData = {
          attendeeName: member.name,
          attendeeEmail: member.email,
          teamName: teamData.teamName,
          teamRole: member.role || "member",
          teamMembers: [
            {
              name: `${attendee.firstName} ${attendee.lastName}`,
              email: attendee.email,
              role: "leader",
            },
            ...teamData.teamMembers.map((m) => ({
              name: m.name,
              email: m.email,
              role: m.role || "member",
            })),
          ],
          events: teamMemberEvents, // Team members only get competition events + opening ceremony
        }
        ticketDataArray.push(memberTicketData)
      }
    } else {
      // Individual attendee ticket
      const individualTicketData = {
        attendeeName: `${attendee.firstName} ${attendee.lastName}`,
        attendeeEmail: attendee.email,
        events: eventDetails,
      }
      ticketDataArray.push(individualTicketData)
    }

    return NextResponse.json({
      success: true,
      message: "Registration completed successfully. Opening ceremony automatically included. Download tickets below.",
      attendeeId: attendeeRecord.id,
      registeredEvents: eventDetails,
      teamsCreated,
      rsvps,
      ticketData: ticketDataArray[0], // Keep for backward compatibility
      ticketDataArray, // New field with all team member tickets
    })
  } catch (error) {
    console.error("RSVP API error:", error)
    return NextResponse.json({ error: "Internal server error. Please try again." }, { status: 500 })
  }
}
