import { NextResponse } from "next/server"
import { safeQuery, getDatabase } from "@/lib/database"

export async function GET() {
  try {
    const attendees = await safeQuery(async () => {
      const sql = getDatabase()

      // Get all attendees with their basic information
      const attendeesData = await sql`
        SELECT 
          a.id,
          a.first_name,
          a.last_name,
          a.email,
          a.phone,
          a.university,
          a.field_of_study,
          a.year_of_study,
          a.created_at
        FROM conference.attendees a
        ORDER BY a.created_at DESC
      `

      // Get all events and registrations for attendees (excluding opening ceremony)
      const eventsData = await sql`
        SELECT 
          r.attendee_id,
          e.name as event_name,
          e.event_type,
          e.date as event_date,
          r.checked_in,
          r.check_in_time,
          ct.name as team_name,
          ctm.role as team_role
        FROM conference.rsvps r
        JOIN conference.events e ON r.event_id = e.id
        LEFT JOIN conference.competition_team_members ctm ON r.attendee_id = ctm.attendee_id
        LEFT JOIN conference.competition_teams ct ON ctm.team_id = ct.id AND ct.event_id = r.event_id
        WHERE LOWER(e.name) NOT LIKE '%opening ceremony%'
        ORDER BY e.date ASC
      `

      // Combine attendees with their events
      const attendeesWithEvents = attendeesData.map(attendee => {
        const attendeeEvents = eventsData.filter(event => event.attendee_id === attendee.id)
        
        return {
          ...attendee,
          events: attendeeEvents.map(event => ({
            event_name: event.event_name,
            event_type: event.event_type,
            event_date: event.event_date,
            checked_in: event.checked_in,
            team_name: event.team_name,
            team_role: event.team_role
          })),
          total_events: attendeeEvents.length
        }
      })

      return attendeesWithEvents
    })

    return NextResponse.json({ attendees })

  } catch (error: any) {
    console.error("[Admin] Error fetching attendees:", error?.message || error)

    let errorMessage = "Failed to fetch attendees"
    let statusCode = 500

    const errorString = error?.message || String(error)

    if (
      errorString.includes("Too Many Requests") ||
      errorString.includes("rate limit") ||
      errorString.includes("429") ||
      (errorString.includes('Unexpected token') && errorString.includes('"Too Many R'))
    ) {
      errorMessage = "Database is currently busy. Please try again in a moment."
      statusCode = 429
    } else if (errorString.includes("connection") || errorString.includes("timeout")) {
      errorMessage = "Database connection issue. Please try again."
      statusCode = 503
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? errorString : undefined,
        attendees: [], // Provide empty array as fallback
        timestamp: new Date().toISOString(),
      },
      { status: statusCode },
    )
  }
}
