import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/images/gdg-logo.png"
                alt="Google Developer Group"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              The premier tech conference organized by GDG On Campus HTU, bringing together developers, designers, and
              tech enthusiasts.
            </p>
            <div className="flex space-x-3">
              <Link
                href="https://x.com/gdg_htu?s=11&t=5_KQwrBwKEVKi6TnfZuzEA"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-muted"
                aria-label="Follow us on Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
              <Link
                href="https://www.linkedin.com/company/google-developer-student-clubs-htu/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-muted"
                aria-label="Connect with us on LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </Link>
              <Link
                href="https://www.instagram.com/gdg_htu?igsh=MTRjcm9ueWs4aXNidw=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-muted"
                aria-label="View our GitHub"
              >
                
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="20" height="20" rx="6" ry="6" stroke="currentColor" strokeWidth="2" fill="none"/>
  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
  <circle cx="18.5" cy="5.5" r="1.5" fill="currentColor"/>
</svg>
              </Link>
              <Link
                href="mailto:contact@gdghtu.org"
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-muted"
                aria-label="Send us an email"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h.749L12 10.58l9.615-6.759h.749c.904 0 1.636.732 1.636 1.636z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tickets" className="text-muted-foreground hover:text-primary transition-colors">
                  Reserve Ticket
                </Link>
              </li>
              <li>
                <Link href="/agenda" className="text-muted-foreground hover:text-primary transition-colors">
                  View Agenda
                </Link>
              </li>
              <li>
                <Link href="/speakers" className="text-muted-foreground hover:text-primary transition-colors">
                  Meet Speakers
                </Link>
              </li>
              <li>
                <Link href="/workshops" className="text-muted-foreground hover:text-primary transition-colors">
                  Workshops
                </Link>
              </li>
              <li>
                <Link href="/competitions" className="text-muted-foreground hover:text-primary transition-colors">
                  Competitions
                </Link>
              </li>
            </ul>
          </div>

          {/* Event Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Event Info</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <span className="text-base">📅</span>
                <span>September 13, 2025</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-base">📍</span>
                <span>Al-Hussein Technical University</span>
              </li>
            </ul>
          </div>

          {/* Partners */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Organized By</h3>
            <div className="flex flex-col space-y-3">
              <Link
                href="https://gdg.community.dev/gdg-on-campus-al-hussein-technical-university-amman/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/images/gdg-logo.png"
                  alt="Google Developer Group"
                  width={150}
                  height={60}
                  className="h-12 w-auto opacity-80 hover:opacity-100 transition-opacity"
                />
              </Link>
              <Link href="https://htu.edu.jo" target="_blank" rel="noopener noreferrer">
                <Image
                  src="/images/htu-logo.png"
                  alt="Al-Hussein Technical University"
                  width={150}
                  height={60}
                  className="h-12 w-auto opacity-80 hover:opacity-100 transition-opacity"
                />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">© 2025 GDG On Campus HTU. All rights reserved.</p>
          <div className="flex space-x-4 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/code-of-conduct" className="text-muted-foreground hover:text-primary transition-colors">
              Code of Conduct
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
