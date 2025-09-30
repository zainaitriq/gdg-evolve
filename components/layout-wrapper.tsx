"use client"

import { usePathname } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ReactNode } from "react"

interface LayoutWrapperProps {
  children: ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) {
    // Admin layout without Navigation and Footer
    return <>{children}</>
  }

  // Regular layout with Navigation and Footer
  return (
    <>
      <Navigation />
      <main className="flex-1 mx-4 md:mx-8 lg:mx-12">{children}</main>
      <Footer />
    </>
  )
}
