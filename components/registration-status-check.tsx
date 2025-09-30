"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Calendar, MapPin, Clock } from "lucide-react"

interface RegistrationData {
  id: string
  name: string
  email: string
  phone: string
  university: string
  status: "confirmed" | "waitlisted"
  qr_code: string
  events: Array<{
    id: string
    title: string
    type: "session" | "workshop" | "competition"
    date: string
    time: string
    location: string
    capacity: number
    registered_count: number
  }>
}

export default function RegistrationStatusCheck() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [registration, setRegistration] = useState<RegistrationData | null>(null)
  const [error, setError] = useState("")

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setError("")
    setRegistration(null)

    try {
      const response = await fetch("/api/registration-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to check registration status")
      }

      setRegistration(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const downloadQRCode = () => {
    if (!registration?.qr_code) return

    const link = document.createElement("a")
    link.href = registration.qr_code
    link.download = `evolve-conference-2025-${registration.name.replace(/\s+/g, "-").toLowerCase()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-google-red">Already Registered?</h2>
        <p className="text-gray-600 text-lg">Check your registration status and get your QR code</p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Check Registration Status
          </CardTitle>
          <CardDescription>
            Enter your email to check your registration status for Evolve Conference 2025
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheckStatus} className="flex gap-4">
            <Input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={loading} className="bg-google-red hover:bg-red-600">
              {loading ? "Checking..." : "Check Status"}
            </Button>
          </form>
          {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
        </CardContent>
      </Card>

      {/* Registration Results */}
      {registration && (
        <div className="space-y-6">
          {/* Personal Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-google-red">{registration.name}</CardTitle>
                  <CardDescription>{registration.email}</CardDescription>
                </div>
                <Badge
                  variant={registration.status === "confirmed" ? "default" : "secondary"}
                  className={registration.status === "confirmed" ? "bg-green-500" : "bg-yellow-500"}
                >
                  {registration.status === "confirmed" ? "Confirmed" : "Waitlisted"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Phone:</span> {registration.phone}
                </div>
                <div>
                  <span className="font-medium">University:</span> {registration.university}
                </div>
              </div>

              {registration.status === "confirmed" && registration.qr_code && (
                <div className="flex items-center gap-4 pt-4 border-t">
                  <div className="flex-1">
                    <h4 className="font-medium text-google-red mb-2">Your QR Code</h4>
                    <p className="text-sm text-gray-600">Present this QR code at the event for check-in</p>
                  </div>
                  <Button onClick={downloadQRCode} variant="outline" className="flex items-center gap-2 bg-transparent">
                    <Download className="h-4 w-4" />
                    Download QR Code
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Registered Events */}
          <Card>
            <CardHeader>
              <CardTitle>Your Registered Events</CardTitle>
              <CardDescription>
                {registration.events.length} event{registration.events.length !== 1 ? "s" : ""} registered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {registration.events.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-google-red">{event.title}</h4>
                      <Badge variant="outline" className="capitalize">
                        {event.type}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Capacity:</span> {event.registered_count}/{event.capacity}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
