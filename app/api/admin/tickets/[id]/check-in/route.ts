import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { checked_in } = await request.json()
    const sql = getDatabase()
    const ticketId = Number.parseInt(params.id)

    if (checked_in) {
      // Check in the attendee
      await sql`
        INSERT INTO conference.check_ins (rsvp_id, checked_in, check_in_time)
        VALUES (${ticketId}, true, NOW())
        ON CONFLICT (rsvp_id) 
        DO UPDATE SET checked_in = true, check_in_time = NOW()
      `
    } else {
      // Undo check-in
      await sql`
        UPDATE conference.check_ins 
        SET checked_in = false, check_in_time = NULL
        WHERE rsvp_id = ${ticketId}
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating check-in status:", error)
    return NextResponse.json({ error: "Failed to update check-in status" }, { status: 500 })
  }
}
