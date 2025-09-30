import { NextRequest, NextResponse } from "next/server"
import { safeQuery, getDatabase } from "@/lib/database"

export async function GET() {
  try {
    const events = await safeQuery(async () => {
      const sql = getDatabase()

      return await sql`
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
          CASE 
            WHEN LOWER(e.name) LIKE '%opening ceremony%' THEN 0
            ELSE COUNT(r.id)
          END as registration_count
        FROM conference.events e
        LEFT JOIN conference.rsvps r ON e.id = r.event_id
        GROUP BY e.id, e.name, e.description, e.event_type, e.date, e.start_time, 
                 e.end_time, e.location, e.capacity, e.requires_team, 
                 e.min_team_size, e.max_team_size, e.created_at
        ORDER BY e.date ASC, e.start_time ASC
      `
    })

    return NextResponse.json(events)

  } catch (error: any) {
    console.error("[Admin] Error fetching events:", error?.message || error)

    let errorMessage = "Failed to fetch events"
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
      },
      { status: statusCode }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json()

    // Validate required fields
    if (!eventData.name || !eventData.date || !eventData.start_time || !eventData.end_time) {
      return NextResponse.json(
        { error: "Name, date, start time, and end time are required" },
        { status: 400 }
      )
    }

    const newEvent = await safeQuery(async () => {
      const sql = getDatabase()

      const [event] = await sql`
        INSERT INTO conference.events (
          name, description, event_type, date, start_time, end_time,
          location, capacity, requires_team, min_team_size, max_team_size
        ) VALUES (
          ${eventData.name},
          ${eventData.description || ""},
          ${eventData.event_type || "session"},
          ${eventData.date},
          ${eventData.start_time},
          ${eventData.end_time},
          ${eventData.location || ""},
          ${eventData.capacity || 50},
          ${eventData.requires_team || false},
          ${eventData.min_team_size || 2},
          ${eventData.max_team_size || 5}
        ) RETURNING *
      `

      return event
    })

    return NextResponse.json(newEvent, { status: 201 })

  } catch (error: any) {
    console.error("[Admin] Error creating event:", error?.message || error)

    let errorMessage = "Failed to create event"
    let statusCode = 500

    const errorString = error?.message || String(error)

    if (
      errorString.includes("Too Many Requests") ||
      errorString.includes("rate limit") ||
      errorString.includes("429")
    ) {
      errorMessage = "Database is currently busy. Please try again in a moment."
      statusCode = 429
    } else if (errorString.includes("duplicate") || errorString.includes("unique")) {
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
