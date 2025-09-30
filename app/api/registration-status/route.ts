import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Get attendee information
    const attendeeResult = await sql`
      SELECT 
        a.id,
        a.first_name,
        a.last_name,
        a.email,
        a.phone,
        a.university,
        a.field_of_study,
        a.year_of_study
      FROM conference.attendees a
      WHERE LOWER(a.email) = LOWER(${email})
      LIMIT 1
    `

    if (attendeeResult.length === 0) {
      return NextResponse.json({ error: "No registration found for this email address" }, { status: 404 })
    }

    const attendee = attendeeResult[0]

    // Get registered events with RSVP status
    const eventsResult = await sql`
      SELECT 
        e.id,
        e.name as title,
        e.event_type as type,
        e.date,
        e.start_time as time,
        e.location,
        e.capacity,
        e.current_registrations as registered_count,
        r.status as rsvp_status,
        r.qr_code,
        r.checked_in
      FROM conference.events e
      INNER JOIN conference.rsvps r ON e.id = r.event_id
      WHERE r.attendee_id = ${attendee.id}
      ORDER BY e.date, e.start_time
    `

    return NextResponse.json({
      id: attendee.id,
      name: `${attendee.first_name} ${attendee.last_name}`,
      email: attendee.email,
      phone: attendee.phone,
      university: attendee.university,
      field_of_study: attendee.field_of_study,
      year_of_study: attendee.year_of_study,
      events: eventsResult,
    })
  } catch (error) {
    console.error("Registration status check error:", error)
    return NextResponse.json({ error: "Failed to check registration status" }, { status: 500 })
  }
}
