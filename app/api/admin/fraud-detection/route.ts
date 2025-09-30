// Create this as /api/admin/fraud-detection/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { 
  generateFraudReport, 
  detectDuplicateNames, 
  detectMultipleWorkshopRegistrations,
  flagSuspiciousAccounts,
  detectSuspiciousPatterns 
} from '@/lib/database'

// Simple admin authentication check
function verifyAdminAccess(request: NextRequest) {
  const adminPassword = request.headers.get('x-admin-password')
  const expectedPassword = process.env.ADMIN_PASSWORD || 'your-secure-admin-password'
  
  if (adminPassword !== expectedPassword) {
    return false
  }
  return true
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    if (!verifyAdminAccess(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'report':
        const report = await generateFraudReport()
        return NextResponse.json(report)

      case 'duplicates':
        const duplicates = await detectDuplicateNames()
        return NextResponse.json(duplicates)

      case 'multiple-workshops':
        const violations = await detectMultipleWorkshopRegistrations()
        return NextResponse.json(violations)

      case 'suspicious-patterns':
        const patterns = await detectSuspiciousPatterns()
        return NextResponse.json(patterns)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Fraud detection API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    if (!verifyAdminAccess(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, attendeeIds, reason } = await request.json()

    switch (action) {
      case 'flag-accounts':
        if (!attendeeIds || !Array.isArray(attendeeIds)) {
          return NextResponse.json(
            { error: 'attendeeIds array is required' }, 
            { status: 400 }
          )
        }

        const result = await flagSuspiciousAccounts(
          attendeeIds, 
          reason || 'Fraudulent registration detected'
        )
        
        return NextResponse.json({
          success: true,
          message: `Flagged ${result.flaggedCount} accounts and cancelled their workshop/competition RSVPs`,
          flaggedCount: result.flaggedCount
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Fraud detection API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
