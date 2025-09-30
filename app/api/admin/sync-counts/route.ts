import { NextRequest, NextResponse } from "next/server"
import { syncEventRegistrationCounts } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    console.log("Sync counts API called")
    await syncEventRegistrationCounts()
    return NextResponse.json({ 
      success: true, 
      message: "Registration counts synchronized successfully" 
    })
  } catch (error) {
    console.error("Error syncing counts:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to sync registration counts" }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
