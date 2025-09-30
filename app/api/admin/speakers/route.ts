import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"

export async function GET() {
  try {
    const sql = getDatabase()

    const speakers = await sql`
      SELECT 
        s.id, s.name, s.title, s.company, s.bio, s.image_url, 
        s.linkedin_url, s.twitter_url, s.created_at,
        COUNT(es.event_id) as event_count,
        COALESCE(ARRAY_AGG(e.name) FILTER (WHERE e.name IS NOT NULL), ARRAY[]::text[]) as events
      FROM conference.speakers s
      LEFT JOIN conference.event_speakers es ON s.id = es.speaker_id
      LEFT JOIN conference.events e ON es.event_id = e.id AND e.is_active = true
      GROUP BY s.id, s.name, s.title, s.company, s.bio, s.image_url, 
               s.linkedin_url, s.twitter_url, s.created_at
      ORDER BY s.name ASC
    `

    return NextResponse.json(speakers)
  } catch (error: any) {
    console.error("[v0] Error fetching speakers:", error?.message || error)

    const errorMessage = error?.message?.includes("Database query failed")
      ? "Database temporarily unavailable. Please try again."
      : "Failed to fetch speakers"

    return NextResponse.json({ error: errorMessage, details: error?.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const sql = getDatabase()

    const result = await sql`
      INSERT INTO conference.speakers (
        name, title, company, bio, image_url, linkedin_url, twitter_url
      ) VALUES (
        ${data.name}, ${data.title}, ${data.company}, ${data.bio},
        ${data.image_url || null}, ${data.linkedin_url || null}, ${data.twitter_url || null}
      )
      RETURNING id
    `

    return NextResponse.json({ success: true, id: result[0].id })
  } catch (error: any) {
    console.error("[v0] Error creating speaker:", error?.message || error)

    const errorMessage = error?.message?.includes("Database query failed")
      ? "Database temporarily unavailable. Please try again."
      : "Failed to create speaker"

    return NextResponse.json({ error: errorMessage, details: error?.message }, { status: 500 })
  }
}
