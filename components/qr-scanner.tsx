"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, QrCode } from "lucide-react"

export default function QRScanner() {
  const [qrCode, setQrCode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    attendee?: any
    error?: string
  } | null>(null)

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!qrCode.trim()) return

    setIsScanning(true)
    setResult(null)

    try {
      const response = await fetch("/api/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qrCode: qrCode.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          attendee: data.attendee,
        })
        setQrCode("")
      } else {
        setResult({
          success: false,
          message: data.error,
          error: data.error,
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Failed to process check-in",
        error: "Network error",
      })
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <QrCode className="w-12 h-12 mx-auto mb-4 text-blue-600" />
          <CardTitle>Event Check-In</CardTitle>
          <CardDescription>Scan or enter QR code to check in attendees</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheckIn} className="space-y-4">
            <div>
              <Label htmlFor="qrCode">QR Code</Label>
              <Input
                id="qrCode"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="Enter QR code or scan"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isScanning || !qrCode.trim()}>
              {isScanning ? "Processing..." : "Check In"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>
            {result.message}
            {result.attendee && (
              <div className="mt-2 text-sm">
                <p>
                  <strong>Name:</strong> {result.attendee.name}
                </p>
                <p>
                  <strong>Event:</strong> {result.attendee.event}
                </p>
                <p>
                  <strong>Date:</strong> {new Date(result.attendee.date).toLocaleDateString()}
                </p>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
