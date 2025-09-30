import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { qrCode } = await request.json()

    if (!qrCode) {
      return NextResponse.json({ error: "QR code is required" }, { status: 400 })
    }

    // Find the RSVP by QR code
    const [rsvp] = await sql`
      SELECT r.*, a.first_name, a.last_name, a.email, e.name as event_name, e.date, e.start_time
      FROM conference.rsvps r
      JOIN conference.attendees a ON r.attendee_id = a.id
      JOIN conference.events e ON r.event_id = e.id
      WHERE r.qr_code = ${qrCode} AND r.status = 'confirmed'
    `

    if (!rsvp) {
      return NextResponse.json({ error: "Invalid QR code or registration not confirmed" }, { status: 404 })
    }

    if (rsvp.checked_in) {
      return NextResponse.json(
        {
          error: "Already checked in",
          checkedInAt: rsvp.check_in_time,
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
      message: "Check-in successful",
      attendee: {
        name: `${rsvp.first_name} ${rsvp.last_name}`,
        email: rsvp.email,
        event: rsvp.event_name,
        date: rsvp.date,
        time: rsvp.start_time,
      },
    })
  } catch (error) {
    console.error("Check-in API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
