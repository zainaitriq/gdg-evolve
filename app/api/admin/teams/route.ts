import { NextResponse } from "next/server"
import { safeQuery, getDatabase } from "@/lib/database"

export async function GET() {
  try {
    const teams = await safeQuery(async () => {
      const sql = getDatabase()

      // Get all teams with their basic info
      const teamsData = await sql`
        SELECT 
          ct.id,
          ct.name,
          ct.description,
          ct.event_id,
          ct.max_members,
          ct.created_at,
          e.name as event_name,
          e.event_type,
          CONCAT(leader.first_name, ' ', leader.last_name) as team_leader_name,
          leader.email as team_leader_email
        FROM conference.competition_teams ct
        JOIN conference.events e ON ct.event_id = e.id
        JOIN conference.attendees leader ON ct.team_leader_id = leader.id
        ORDER BY ct.created_at DESC
      `

      // Get all team members for each team
      const allMembers = await sql`
        SELECT 
          ctm.team_id,
          ctm.attendee_id,
          ctm.role,
          CONCAT(a.first_name, ' ', a.last_name) as name,
          a.email,
          a.phone,
          a.university,
          a.field_of_study as major,
          a.year_of_study,
          ct.team_leader_id,
          ctm.id as member_id
        FROM conference.competition_team_members ctm
        JOIN conference.competition_teams ct ON ctm.team_id = ct.id
        JOIN conference.attendees a ON ctm.attendee_id = a.id
        ORDER BY ctm.team_id, ctm.id
      `

      // Combine teams with their members
      const teamsWithMembers = teamsData.map(team => {
        const teamMembers = allMembers.filter(member => member.team_id === team.id)
        
        // Add team leader to members list
        const leaderId = team.team_leader_name
        const leaderEmail = team.team_leader_email
        
        const membersWithLeader = [
          {
            id: `leader-${team.id}`,
            name: team.team_leader_name,
            email: team.team_leader_email,
            phone: "",
            university: "",
            major: "",
            year_of_study: "",
            role: "leader",
            is_leader: true
          },
          ...teamMembers.map(member => ({
            id: member.member_id,
            name: member.name,
            email: member.email,
            phone: member.phone || "",
            university: member.university || "",
            major: member.major || "",
            year_of_study: member.year_of_study || "",
            role: member.role || "member",
            is_leader: false
          }))
        ]

        return {
          ...team,
          members: membersWithLeader,
          total_members: membersWithLeader.length
        }
      })

      return teamsWithMembers
    })

    return NextResponse.json({ teams })

  } catch (error: any) {
    console.error("[Admin] Error fetching teams:", error?.message || error)

    let errorMessage = "Failed to fetch teams"
    let statusCode = 500

    const errorString = error?.message || String(error)

    // Handle rate limiting and other text-based error responses
    if (
      errorString.includes("Too Many Requests") ||
      errorString.includes("rate limit") ||
      errorString.includes("429") ||
      errorString.includes('Unexpected token') && errorString.includes('"Too Many R')
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
        teams: [], // Provide empty array as fallback
        timestamp: new Date().toISOString(),
      },
      { status: statusCode },
    )
  }
}
