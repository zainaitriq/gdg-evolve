"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"

export function StatsSection() {
  const [stats, setStats] = useState([
    {
      icon: "👥",
      value: "500+",
      label: "Expected Attendees",
      color: "text-google-green",
    },
    {
      icon: "📅",
      value: "20+",
      label: "Sessions & Workshops",
      color: "text-google-blue",
    },
    {
      icon: "🏆",
      value: "5+",
      label: "Competitions",
      color: "text-google-red",
    },
    {
      icon: "💼",
      value: "15+",
      label: "Industry Speakers",
      color: "text-google-yellow",
    },
  ])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats")
        if (!response.ok) {
          throw new Error("Failed to fetch stats")
        }
        const dbStats = await response.json()

        setStats([
          {
            icon: "👥",
            value: `300+`,
            label: "Registered Attendees",
            color: "text-google-green",
          },
          {
            icon: "📅",
            value: `${dbStats.totalEvents}`,
            label: "Sessions & Workshops",
            color: "text-google-blue",
          },
          {
            icon: "🏆",
            value: `${dbStats.totalCompetitions}`,
            label: "Competitions",
            color: "text-google-red",
          },
          {
            icon: "💼",
            value: `${dbStats.totalSpeakers}`,
            label: "Industry Speakers",
            color: "text-google-yellow",
          },
        ])
      } catch (error) {
        console.error("Failed to fetch stats:", error)
        // Keep default values on error
      }
    }

    fetchStats()
  }, [])

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-0 shadow-sm bg-background/50">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-3">
                  <span className={`text-2xl ${stat.color}`}>{stat.icon}</span>
                  <div className="space-y-1">
                    <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
