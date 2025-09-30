"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "Tickets", href: "/tickets" },
  { name: "Workshops", href: "/workshops" },
  { name: "Competitions", href: "/competitions" },
  { name: "Speakers", href: "/speakers" },
  { name: "Agenda", href: "/agenda" },
  { name: "About", href: "/about" },
  { name: "Sponsors & Partners", href: "/sponsors" },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="nav-professional sticky top-0 z-50 w-full">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/images/evolve-logo.png"
            alt="Evolve Conference"
            width={120}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary hover:border-b-2 hover:border-primary pb-1"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex">
          <Button asChild className="btn-primary">
            <Link href="/tickets">Reserve Ticket</Link>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="hover:bg-muted">
              <span className="text-lg">☰</span>
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[320px] sm:w-[400px] bg-background border-l border-border">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-center py-6 border-b border-border">
                <Link href="/" onClick={() => setIsOpen(false)}>
                  <Image
                    src="/images/evolve-logo.png"
                    alt="Evolve Conference"
                    width={150}
                    height={50}
                    className="h-10 w-auto"
                  />
                </Link>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 py-8">
                <div className="space-y-2">
                  {navigationItems.map((item, index) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center px-6 py-4 text-lg font-medium text-foreground/80 transition-all duration-200 hover:text-primary hover:bg-muted rounded-lg group"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="flex items-center space-x-3">
                        <span className="w-2 h-2 rounded-full bg-primary/30 group-hover:bg-primary transition-colors duration-200"></span>
                        <span>{item.name}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </nav>

              <div className="border-t border-border p-6 space-y-4">
                <Button asChild className="btn-primary w-full h-12">
                  <Link href="/tickets" onClick={() => setIsOpen(false)}>
                    Reserve Your Ticket
                  </Link>
                </Button>
                <p className="text-center text-sm text-muted-foreground">Join us for an amazing tech experience</p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
