import { NextRequest, NextResponse } from "next/server"
import { safeQuery, getDatabase } from "@/lib/database"

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const eventId = parseInt(params.id)
    
    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 })
    }

    const event = await safeQuery(async () => {
      const sql = getDatabase()

      const [eventData] = await sql`
        SELECT 
          e.id,
          e.name,
          e.description,
          e.event_type,
          e.date,
          e.start_time,
          e.end_time,
          e.location,
          e.capacity,
          e.requires_team,
          e.min_team_size,
          e.max_team_size,
          e.created_at,
          COUNT(CASE WHEN LOWER(e.name) NOT LIKE '%opening ceremony%' THEN r.id END) as registration_count
        FROM conference.events e
        LEFT JOIN conference.rsvps r ON e.id = r.event_id
        WHERE e.id = ${eventId}
        GROUP BY e.id, e.name, e.description, e.event_type, e.date, e.start_time, 
                 e.end_time, e.location, e.capacity, e.requires_team, 
                 e.min_team_size, e.max_team_size, e.created_at
      `

      return eventData
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json(event)

  } catch (error: any) {
    console.error("[Admin] Error fetching event:", error?.message || error)
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const eventId = parseInt(params.id)
    const eventData = await request.json()
    
    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 })
    }

    // Validate required fields
    if (!eventData.name || !eventData.date || !eventData.start_time || !eventData.end_time) {
      return NextResponse.json(
        { error: "Name, date, start time, and end time are required" },
        { status: 400 }
      )
    }

    const updatedEvent = await safeQuery(async () => {
      const sql = getDatabase()

      const [event] = await sql`
        UPDATE conference.events SET
          name = ${eventData.name},
          description = ${eventData.description || ""},
          event_type = ${eventData.event_type || "session"},
          date = ${eventData.date},
          start_time = ${eventData.start_time},
          end_time = ${eventData.end_time},
          location = ${eventData.location || ""},
          capacity = ${eventData.capacity || 50},
          requires_team = ${eventData.requires_team || false},
          min_team_size = ${eventData.min_team_size || 2},
          max_team_size = ${eventData.max_team_size || 5}
        WHERE id = ${eventId}
        RETURNING *
      `

      return event
    })

    if (!updatedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json(updatedEvent)

  } catch (error: any) {
    console.error("[Admin] Error updating event:", error?.message || error)

    let errorMessage = "Failed to update event"
    let statusCode = 500

    const errorString = error?.message || String(error)

    if (errorString.includes("duplicate") || errorString.includes("unique")) {
      errorMessage = "An event with this name already exists"
      statusCode = 400
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? errorString : undefined,
      },
      { status: statusCode }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const eventId = parseInt(params.id)
    
    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 })
    }

    const result = await safeQuery(async () => {
      const sql = getDatabase()

      // Check if event has registrations
      const registrations = await sql`
        SELECT COUNT(*) as count FROM conference.rsvps WHERE event_id = ${eventId}
      `

      const registrationCount = parseInt(registrations[0].count)

      // Delete related records first (teams, team members, rsvps)
      if (registrationCount > 0) {
        // Delete team members for teams associated with this event
        await sql`
          DELETE FROM conference.competition_team_members
          WHERE team_id IN (
            SELECT id FROM conference.competition_teams WHERE event_id = ${eventId}
          )
        `

        // Delete teams for this event
        await sql`
          DELETE FROM conference.competition_teams WHERE event_id = ${eventId}
        `

        // Delete RSVPs for this event
        await sql`
          DELETE FROM conference.rsvps WHERE event_id = ${eventId}
        `
      }

      // Delete the event
      const [deletedEvent] = await sql`
        DELETE FROM conference.events WHERE id = ${eventId} RETURNING *
      `

      return { deletedEvent, registrationCount }
    })

    if (!result.deletedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `Event deleted successfully. ${result.registrationCount} registrations were also removed.`,
      deletedEvent: result.deletedEvent
    })

  } catch (error: any) {
    console.error("[Admin] Error deleting event:", error?.message || error)

    let errorMessage = "Failed to delete event"
    const errorString = error?.message || String(error)

    if (errorString.includes("foreign key") || errorString.includes("constraint")) {
      errorMessage = "Cannot delete event with existing registrations. Please remove registrations first."
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? errorString : undefined,
      },
      { status: 500 }
    )
  }
}
