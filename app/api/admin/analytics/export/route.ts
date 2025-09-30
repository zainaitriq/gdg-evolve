import { NextResponse } from "next/server"
import { safeQuery, getDatabase } from "@/lib/database"

export async function GET() {
  try {
    const reportData = await safeQuery(async () => {
      const sql = getDatabase()

      // Get comprehensive analytics data for export
      const summary = await sql`
        SELECT 
          COUNT(DISTINCT a.id) as total_attendees,
          COUNT(DISTINCT e.id) as total_events,
          COUNT(CASE WHEN LOWER(e.name) NOT LIKE '%opening ceremony%' THEN r.id END) as total_registrations,
          ROUND(
            COUNT(CASE WHEN r.checked_in = true AND LOWER(e.name) NOT LIKE '%opening ceremony%' THEN r.id END) * 100.0 / 
            NULLIF(COUNT(CASE WHEN LOWER(e.name) NOT LIKE '%opening ceremony%' THEN r.id END), 0), 
            2
          ) as overall_check_in_rate,
          COUNT(DISTINCT ct.id) as total_teams
        FROM conference.attendees a
        LEFT JOIN conference.rsvps r ON a.id = r.attendee_id
        LEFT JOIN conference.events e ON r.event_id = e.id
        LEFT JOIN conference.competition_teams ct ON e.id = ct.event_id
      `

      const eventStats = await sql`
        SELECT 
          e.name as event_name,
          e.event_type,
          e.date,
          e.capacity,
          COUNT(r.id) as registrations,
          COUNT(CASE WHEN r.checked_in = true THEN r.id END) as checked_in,
          ROUND(
            COUNT(CASE WHEN r.checked_in = true THEN r.id END) * 100.0 / 
            NULLIF(COUNT(r.id), 0), 
            1
          ) as check_in_rate
        FROM conference.events e
        LEFT JOIN conference.rsvps r ON e.id = r.event_id
        WHERE LOWER(e.name) NOT LIKE '%opening ceremony%'
        GROUP BY e.id, e.name, e.event_type, e.date, e.capacity
        ORDER BY e.date ASC
      `

      const universityStats = await sql`
        SELECT 
          COALESCE(a.university, 'Not Specified') as university,
          COUNT(*) as attendee_count,
          COUNT(CASE WHEN r.checked_in = true THEN r.id END) as checked_in_count
        FROM conference.attendees a
        LEFT JOIN conference.rsvps r ON a.id = r.attendee_id
        LEFT JOIN conference.events e ON r.event_id = e.id AND LOWER(e.name) NOT LIKE '%opening ceremony%'
        GROUP BY a.university
        ORDER BY attendee_count DESC
      `

      const teamStats = await sql`
        SELECT 
          ct.name as team_name,
          e.name as event_name,
          COUNT(ctm.id) + 1 as team_size,
          CONCAT(leader.first_name, ' ', leader.last_name) as team_leader
        FROM conference.competition_teams ct
        JOIN conference.events e ON ct.event_id = e.id
        JOIN conference.attendees leader ON ct.team_leader_id = leader.id
        LEFT JOIN conference.competition_team_members ctm ON ct.id = ctm.team_id
        GROUP BY ct.id, ct.name, e.name, leader.first_name, leader.last_name
        ORDER BY e.name, team_size DESC
      `

      return { summary: summary[0], eventStats, universityStats, teamStats }
    })

    // Generate comprehensive CSV report
    const timestamp = new Date().toISOString().split('T')[0]
    
    let csvContent = `Conference Analytics Report - ${timestamp}\n\n`
    
    // Summary Section
    csvContent += `SUMMARY STATISTICS\n`
    csvContent += `Total Attendees,${reportData.summary.total_attendees}\n`
    csvContent += `Total Events,${reportData.summary.total_events}\n`
    csvContent += `Total Registrations,${reportData.summary.total_registrations}\n`
    csvContent += `Overall Check-in Rate,${reportData.summary.overall_check_in_rate}%\n`
    csvContent += `Total Competition Teams,${reportData.summary.total_teams}\n\n`

    // Event Performance Section
    csvContent += `EVENT PERFORMANCE\n`
    csvContent += `Event Name,Event Type,Date,Capacity,Registrations,Checked In,Check-in Rate\n`
    reportData.eventStats.forEach(event => {
      csvContent += `"${event.event_name}",${event.event_type},${event.date},${event.capacity},${event.registrations},${event.checked_in},${event.check_in_rate}%\n`
    })
    csvContent += `\n`

    // University Distribution Section
    csvContent += `UNIVERSITY DISTRIBUTION\n`
    csvContent += `University,Attendees,Checked In\n`
    reportData.universityStats.forEach(uni => {
      csvContent += `"${uni.university}",${uni.attendee_count},${uni.checked_in_count}\n`
    })
    csvContent += `\n`

    // Team Information Section
    csvContent += `COMPETITION TEAMS\n`
    csvContent += `Team Name,Event,Team Size,Team Leader\n`
    reportData.teamStats.forEach(team => {
      csvContent += `"${team.team_name}","${team.event_name}",${team.team_size},"${team.team_leader}"\n`
    })

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="analytics-report-${timestamp}.csv"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })

  } catch (error: any) {
    console.error("[Admin] Error exporting analytics:", error?.message || error)

    return NextResponse.json(
      {
        error: "Failed to export analytics",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}
