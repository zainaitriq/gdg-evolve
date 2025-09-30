import { NextRequest, NextResponse } from "next/server"
import { safeQuery, getDatabase } from "@/lib/database"

interface RouteParams {
  params: {
    id: string
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const attendeeId = parseInt(params.id)
    
    if (isNaN(attendeeId)) {
      return NextResponse.json({ error: "Invalid attendee ID" }, { status: 400 })
    }

    const result = await safeQuery(async () => {
      const sql = getDatabase()

      // Check if attendee exists and get their info
      const [attendee] = await sql`
        SELECT 
          id, 
          CONCAT(first_name, ' ', last_name) as full_name,
          email
        FROM conference.attendees 
        WHERE id = ${attendeeId}
      `

      if (!attendee) {
        throw new Error("Attendee not found")
      }

      // Get count of registrations to inform user
      const registrations = await sql`
        SELECT COUNT(*) as count FROM conference.rsvps WHERE attendee_id = ${attendeeId}
      `
      const registrationCount = parseInt(registrations[0].count)

      // Delete related records in correct order (foreign key constraints)
      
      // 1. Delete team memberships
      await sql`
        DELETE FROM conference.competition_team_members WHERE attendee_id = ${attendeeId}
      `

      // 2. Delete teams where this attendee is the leader
      const teamIds = await sql`
        SELECT id FROM conference.competition_teams WHERE team_leader_id = ${attendeeId}
      `
      
      if (teamIds.length > 0) {
        for (const team of teamIds) {
          // Delete other team members first
          await sql`
            DELETE FROM conference.competition_team_members WHERE team_id = ${team.id}
          `
          // Delete the team
          await sql`
            DELETE FROM conference.competition_teams WHERE id = ${team.id}
          `
        }
      }

      // 3. Delete RSVPs
      await sql`
        DELETE FROM conference.rsvps WHERE attendee_id = ${attendeeId}
      `

      // 4. Finally delete the attendee
      const [deletedAttendee] = await sql`
        DELETE FROM conference.attendees WHERE id = ${attendeeId} RETURNING *
      `

      return { 
        deletedAttendee, 
        registrationCount,
        teamsDeleted: teamIds.length
      }
    })

    return NextResponse.json({
      success: true,
      message: `Attendee "${result.deletedAttendee.first_name} ${result.deletedAttendee.last_name}" deleted successfully. ${result.registrationCount} registrations and ${result.teamsDeleted} teams were also removed.`,
      deletedAttendee: result.deletedAttendee
    })

  } catch (error: any) {
    console.error("[Admin] Error deleting attendee:", error?.message || error)

    let errorMessage = "Failed to delete attendee"
    let statusCode = 500

    const errorString = error?.message || String(error)

    if (errorString.includes("Attendee not found")) {
      errorMessage = "Attendee not found"
      statusCode = 404
    } else if (errorString.includes("foreign key") || errorString.includes("constraint")) {
      errorMessage = "Cannot delete attendee due to existing dependencies. Please contact support."
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
