import { NextResponse } from "next/server"
import { safeQuery, getDatabase } from "@/lib/database"

export async function GET() {
  try {
    const attendeesData = await safeQuery(async () => {
      const sql = getDatabase()

      return await sql`
        SELECT 
          a.id,
          a.first_name,
          a.last_name,
          a.email,
          a.phone,
          a.university,
          a.field_of_study,
          a.year_of_study,
          a.created_at,
          STRING_AGG(
            CASE WHEN LOWER(e.name) NOT LIKE '%opening ceremony%' 
            THEN e.name END, 
            '; '
          ) as events,
          COUNT(CASE WHEN LOWER(e.name) NOT LIKE '%opening ceremony%' THEN r.id END) as total_events,
          BOOL_OR(r.checked_in) as has_checked_in,
          STRING_AGG(
            CASE WHEN ct.name IS NOT NULL 
            THEN CONCAT(ct.name, ' (', ctm.role, ')') END, 
            '; '
          ) as teams
        FROM conference.attendees a
        LEFT JOIN conference.rsvps r ON a.id = r.attendee_id
        LEFT JOIN conference.events e ON r.event_id = e.id
        LEFT JOIN conference.competition_team_members ctm ON a.id = ctm.attendee_id
        LEFT JOIN conference.competition_teams ct ON ctm.team_id = ct.id
        GROUP BY a.id, a.first_name, a.last_name, a.email, a.phone, 
                 a.university, a.field_of_study, a.year_of_study, a.created_at
        ORDER BY a.created_at DESC
      `
    })

    // Convert to CSV format
    const csvHeaders = [
      "ID",
      "First Name", 
      "Last Name",
      "Email",
      "Phone",
      "University",
      "Field of Study",
      "Year of Study",
      "Registration Date",
      "Events",
      "Total Events",
      "Has Checked In",
      "Teams"
    ]

    const csvRows = attendeesData.map(attendee => [
      attendee.id,
      attendee.first_name || "",
      attendee.last_name || "",
      attendee.email || "",
      attendee.phone || "",
      attendee.university || "",
      attendee.field_of_study || "",
      attendee.year_of_study || "",
      new Date(attendee.created_at).toLocaleDateString(),
      attendee.events || "",
      attendee.total_events || 0,
      attendee.has_checked_in ? "Yes" : "No",
      attendee.teams || ""
    ])

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map(row => 
        row.map(field => {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const stringField = String(field)
          if (stringField.includes(",") || stringField.includes('"') || stringField.includes("\n")) {
            return `"${stringField.replace(/"/g, '""')}"`
          }
          return stringField
        }).join(",")
      )
    ].join("\n")

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="attendees-${new Date().toISOString().split("T")[0]}.csv"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })

  } catch (error: any) {
    console.error("[Admin] Error exporting attendees:", error?.message || error)

    return NextResponse.json(
      {
        error: "Failed to export attendees",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}
