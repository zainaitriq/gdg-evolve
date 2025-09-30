import { NextResponse } from "next/server"
import { safeQuery, getDatabase } from "@/lib/database"

export async function GET() {
  try {
    const tickets = await safeQuery(async () => {
      const sql = getDatabase()

      return await sql`
        SELECT DISTINCT ON (r.id)
          r.id,
          CONCAT(a.first_name, ' ', a.last_name) as attendee_name,
          a.email as attendee_email,
          a.phone as attendee_phone,
          a.university,
          e.name as event_name,
          e.event_type,
          e.date as event_date,
          CONCAT(e.start_time, ' - ', e.end_time) as event_time,
          e.location as event_location,
          r.created_at as registration_date,
          r.checked_in,
          r.check_in_time,
          r.status,
          r.qr_code,
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
        JOIN conference.attendees a ON r.attendee_id = a.id
        JOIN conference.events e ON r.event_id = e.id
        LEFT JOIN conference.competition_team_members ctm ON r.attendee_id = ctm.attendee_id 
          AND EXISTS (
            SELECT 1 FROM conference.competition_teams ct_check 
            WHERE ct_check.id = ctm.team_id AND ct_check.event_id = r.event_id
          )
        LEFT JOIN conference.competition_teams ct ON ctm.team_id = ct.id AND ct.event_id = r.event_id
        WHERE LOWER(e.name) NOT LIKE '%opening ceremony%'
        ORDER BY r.id, r.created_at DESC
      `
    })

    return NextResponse.json(tickets)
  } catch (error: any) {
    console.error("[v0] Error fetching tickets:", error?.message || error)

    let errorMessage = "Failed to fetch tickets"
    let statusCode = 500

    const errorString = error?.message || String(error)

    if (
      errorString.includes("Too Many Requests") ||
      errorString.includes("rate limit") ||
      errorString.includes("429")
    ) {
      errorMessage = "Database is currently busy. Please try again in a moment."
      statusCode = 429
    } else if (errorString.includes("connection") || errorString.includes("timeout")) {
      errorMessage = "Database connection issue. Please try again."
      statusCode = 503
    } else if (errorString.includes("Database query failed")) {
      errorMessage = "Database temporarily unavailable. Please try again."
      statusCode = 503
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? errorString : undefined,
        tickets: [], // Provide empty array as fallback
        timestamp: new Date().toISOString(),
      },
      { status: statusCode },
    )
  }
}
