import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"

export async function GET() {
  try {
    const sql = getDatabase()

    const tickets = await sql`
      SELECT 
        CONCAT(a.first_name, ' ', a.last_name) as attendee_name,
        a.email as attendee_email,
        a.phone,
        a.university,
        e.name as event_name,
        e.event_type,
        e.date as event_date,
        e.start_time,
        e.end_time,
        e.location,
        r.created_at as registration_date,
        COALESCE(ci.checked_in, false) as checked_in,
        ci.check_in_time,
        ct.team_name,
        ctm.role as team_role
      FROM conference.rsvps r
      JOIN conference.attendees a ON r.attendee_id = a.id
      JOIN conference.events e ON r.event_id = e.id
      LEFT JOIN conference.check_ins ci ON r.id = ci.rsvp_id
      LEFT JOIN conference.competition_team_members ctm ON r.attendee_id = ctm.attendee_id AND r.event_id = ctm.event_id
      LEFT JOIN conference.competition_teams ct ON ctm.team_id = ct.id
      ORDER BY e.date, e.start_time, attendee_name
    `

    // Convert to CSV
    const headers = [
      "Attendee Name",
      "Email",
      "Phone",
      "University",
      "Event Name",
      "Event Type",
      "Event Date",
      "Start Time",
      "End Time",
      "Location",
      "Registration Date",
      "Checked In",
      "Check-in Time",
      "Team Name",
      "Team Role",
    ]

    const csvContent = [
      headers.join(","),
      ...tickets.map((ticket) =>
        [
          `"${ticket.attendee_name}"`,
          `"${ticket.attendee_email}"`,
          `"${ticket.phone || ""}"`,
          `"${ticket.university}"`,
          `"${ticket.event_name}"`,
          `"${ticket.event_type}"`,
          `"${ticket.event_date}"`,
          `"${ticket.start_time}"`,
          `"${ticket.end_time}"`,
          `"${ticket.location}"`,
          `"${ticket.registration_date}"`,
          `"${ticket.checked_in ? "Yes" : "No"}"`,
          `"${ticket.check_in_time || ""}"`,
          `"${ticket.team_name || ""}"`,
          `"${ticket.team_role || ""}"`,
        ].join(","),
      ),
    ].join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="tickets-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("[v0] Error exporting tickets:", error)
    return NextResponse.json({ error: "Failed to export tickets" }, { status: 500 })
  }
}
