import { NextRequest, NextResponse } from "next/server"
import { safeQuery, getDatabase } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 })
    }

    const attendeeData = await safeQuery(async () => {
      const sql = getDatabase()

      // Get attendee basic info
      const attendees = await sql`
        SELECT 
          a.id,
          CONCAT(a.first_name, ' ', a.last_name) as attendee_name,
          a.email as attendee_email,
          a.phone as attendee_phone,
          a.university
        FROM conference.attendees a
        WHERE LOWER(a.email) = LOWER(${email})
      `

      if (attendees.length === 0) {
        throw new Error("No attendee found with this email address")
      }

      const attendee = attendees[0]

      // Get all registrations for this attendee
      const registrations = await sql`
        SELECT 
          e.name as event_name,
          e.event_type,
          e.date as event_date,
          CONCAT(e.start_time, ' - ', e.end_time) as event_time,
          e.location as event_location,
          r.qr_code,
          r.status,
          ct.name as team_name,
          ctm.role as team_role,
          COALESCE(
            ARRAY(
              SELECT CONCAT(tm_a.first_name, ' ', tm_a.last_name)
              FROM conference.competition_team_members tm_ctm
              JOIN conference.attendees tm_a ON tm_ctm.attendee_id = tm_a.id
              WHERE tm_ctm.team_id = ct.id AND tm_ctm.attendee_id != r.attendee_id
            ), 
            ARRAY[]::text[]
          ) as team_members
        FROM conference.rsvps r
        JOIN conference.events e ON r.event_id = e.id
        LEFT JOIN conference.competition_team_members ctm ON r.attendee_id = ctm.attendee_id
        LEFT JOIN conference.competition_teams ct ON ctm.team_id = ct.id AND ct.event_id = r.event_id
        WHERE r.attendee_id = ${attendee.id}
        AND LOWER(e.name) NOT LIKE '%opening ceremony%'
        ORDER BY e.date ASC, e.start_time ASC
      `

      return {
        ...attendee,
        registrations
      }
    })

    if (!attendeeData.registrations || attendeeData.registrations.length === 0) {
      return NextResponse.json(
        { error: "Attendee found but has no event registrations" }, 
        { status: 404 }
      )
    }

    return NextResponse.json(attendeeData)

  } catch (error: any) {
    console.error("[Admin] Error in attendee lookup:", error?.message || error)

    let errorMessage = "Failed to lookup attendee"
    let statusCode = 500

    const errorString = error?.message || String(error)

    if (errorString.includes("No attendee found")) {
      errorMessage = "No attendee found with this email address"
      statusCode = 404
    } else if (errorString.includes("Too Many Requests") || errorString.includes("rate limit")) {
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
      },
      { status: statusCode }
    )
  }
}
