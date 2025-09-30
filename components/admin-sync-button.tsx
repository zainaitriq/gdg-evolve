"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function AdminSyncButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSync = async () => {
    setIsLoading(true)
    setMessage("")
    
    try {
      const response = await fetch('/api/admin/sync-counts', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setMessage("✅ Counts synchronized successfully!")
        // Reload page after 2 seconds
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setMessage("❌ Error: " + (result.error || "Failed to sync"))
      }
    } catch (error) {
      setMessage("❌ Network error: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="text-center space-y-2">
      <Button
        onClick={handleSync}
        disabled={isLoading}
        variant="destructive"
        size="sm"
      >
        {isLoading ? "Syncing..." : "Fix Registration Counts (Admin)"}
      </Button>
      {message && (
        <p className="text-sm text-gray-600">{message}</p>
      )}
    </div>
  )
}
