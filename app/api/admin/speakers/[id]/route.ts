import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = getDatabase()
    const speakerId = Number.parseInt(params.id)

    // Delete related records first
    await sql`DELETE FROM conference.event_speakers WHERE speaker_id = ${speakerId}`
    await sql`DELETE FROM conference.speakers WHERE id = ${speakerId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting speaker:", error)
    return NextResponse.json({ error: "Failed to delete speaker" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = getDatabase()
    const speakerId = Number.parseInt(params.id)

    const speakers = await sql`
      SELECT * FROM conference.speakers WHERE id = ${speakerId}
    `

    if (speakers.length === 0) {
      return NextResponse.json({ error: "Speaker not found" }, { status: 404 })
    }

    return NextResponse.json(speakers[0])
  } catch (error) {
    console.error("[v0] Error fetching speaker:", error)
    return NextResponse.json({ error: "Failed to fetch speaker" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const sql = getDatabase()
    const speakerId = Number.parseInt(params.id)

    await sql`
      UPDATE conference.speakers 
      SET 
        name = ${data.name},
        title = ${data.title},
        company = ${data.company},
        bio = ${data.bio},
        image_url = ${data.image_url || null},
        linkedin_url = ${data.linkedin_url || null},
        twitter_url = ${data.twitter_url || null}
      WHERE id = ${speakerId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating speaker:", error)
    return NextResponse.json({ error: "Failed to update speaker" }, { status: 500 })
  }
}
