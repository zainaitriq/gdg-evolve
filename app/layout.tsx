import type React from "react"
import type { Metadata } from "next"
import { Inter, Work_Sans } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { LayoutWrapper } from "@/components/layout-wrapper"


const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
})

export const metadata: Metadata = {
  title: "Evolve Conference 2025 | GDG On Campus HTU",
  description:
    "Join the premier tech conference organized by Google Developer Group On Campus at Al-Hussein Technical University. Featuring workshops, competitions, and networking opportunities.",
  keywords:
    "tech conference, GDG, Google Developer Group, HTU, Al-Hussein Technical University, workshops, competitions, developers",
  authors: [{ name: "GDG On Campus HTU" }],
  creator: "GDG On Campus HTU",
  openGraph: {
    title: "Evolve Conference 2025 | GDG On Campus HTU",
    description:
      "Join the premier tech conference organized by Google Developer Group On Campus at Al-Hussein Technical University.",
    url: "https://evolve-conference.vercel.app",
    siteName: "Evolve Conference",
    images: [
      {
        url: "/images/evolve-logo.png",
        width: 1200,
        height: 630,
        alt: "Evolve Conference 2025",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Evolve Conference 2025 | GDG On Campus HTU",
    description:
      "Join the premier tech conference organized by Google Developer Group On Campus at Al-Hussein Technical University.",
    images: ["/images/evolve-logo.png"],
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${workSans.variable}`}>
      <head>
        <link rel="icon" href="/images/evolve-logo.png" />
      </head>
      <body className="min-h-screen font-sans antialiased bg-white">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  )
}
