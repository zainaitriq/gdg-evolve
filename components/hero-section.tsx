import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 ">
      
      </div>

      <div className="container mx-auto px-4 text-center relative z-10 bg-white">
        <div className="max-w-4xl mx-auto space-y-8 bg-white">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="/images/evolve-logo.png"
              alt="Evolve Conference 2025"
              width={300}
              height={120}
              className="h-20 w-auto md:h-24"
              priority
            />
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading text-google-red">
              Evolve Conference 2025
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              The premier tech conference organized by GDG On Campus HTU
            </p>
          </div>

          {/* Event Details */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-lg">
            <div className="flex items-center space-x-2">
              <span className="text-google-blue">📅</span>
              <span>September 13, 2025</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-google-red">📍</span>
              <span>Al-Hussein Technical University</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-google-green">👥</span>
              <span>300+ Attendees Expected</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
              <Link href="/tickets">Reserve Your Ticket</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
              <Link href="/agenda">View Full Agenda</Link>
            </Button>
          </div>

          {/* Organizer Logos */}
          <div className="pt-12">
            <p className="text-sm text-muted-foreground mb-6">Organized by</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Link
                href="https://gdg.community.dev/gdg-on-campus-al-hussein-technical-university-amman-jordan/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/images/gdg-logo.png"
                  alt="Google Developer Group"
                  width={200}
                  height={80}
                  className="h-16 w-auto opacity-80 hover:opacity-100 transition-opacity"
                />
              </Link>
              <Link href="https://htu.edu.jo" target="_blank" rel="noopener noreferrer">
                <Image
                  src="/images/htu-logo.png"
                  alt="Al-Hussein Technical University"
                  width={200}
                  height={80}
                  className="h-16 w-auto opacity-80 hover:opacity-100 transition-opacity"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
