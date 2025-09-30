import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { qr_code } = await request.json()

    if (!qr_code) {
      return NextResponse.json({ success: false, error: "QR code is required" }, { status: 400 })
    }

    const sql = getDatabase()

    // Find the RSVP by QR code
    const rsvps = await sql`
      SELECT r.id, r.attendee_id, r.event_id, r.checked_in,
             a.first_name, a.last_name, a.email,
             e.name as event_name
      FROM conference.rsvps r
      JOIN conference.attendees a ON r.attendee_id = a.id
      JOIN conference.events e ON r.event_id = e.id
      WHERE r.qr_code = ${qr_code}
    `

    if (rsvps.length === 0) {
      return NextResponse.json({ success: false, error: "Invalid QR code" }, { status: 404 })
    }

    const rsvp = rsvps[0]

    if (rsvp.checked_in) {
      return NextResponse.json(
        {
          success: false,
          error: "Attendee already checked in to this event",
        },
        { status: 400 },
      )
    }

    // Check in the attendee
    await sql`
      UPDATE conference.rsvps 
      SET checked_in = true, check_in_time = NOW()
      WHERE id = ${rsvp.id}
    `

    return NextResponse.json({
      success: true,
      attendee: {
        id: rsvp.attendee_id,
        first_name: rsvp.first_name,
        last_name: rsvp.last_name,
        email: rsvp.email,
        event_name: rsvp.event_name,
      },
    })
  } catch (error) {
    console.error("[v0] Error checking in attendee:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
