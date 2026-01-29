import Link from "next/link"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Research", href: "/research" },
  { name: "Portfolio Case Study", href: "/portfolio-case-study" },
  { name: "About", href: "/about" },
  { name: "Join Us", href: "https://tinyurl.com/haven-equities-internship" },
  { name: "Contact", href: "/contact" },
  { name: "Compliance", href: "/compliance" },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="max-w-sm">
            <Link href="/" className="inline-block">
              <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
                HAVEN <span className="font-sans text-sm font-normal text-muted-foreground">Equities</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              A student-led equity research collective using founder-owned capital as an educational case study.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 border-t border-border pt-8">
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong>Disclaimer:</strong> HAVEN Equities is an educational initiative. All research and portfolio activities are conducted for learning purposes only. 
            This is not investment advice. No external capital is accepted. All capital used is founder-owned. 
            See our <Link href="/compliance" className="underline hover:text-foreground">Compliance page</Link> for full details.
          </p>
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
            <p className="text-gray-400 text-xs sm:text-sm">
              © 2026 HAVEN Equities. All rights reserved.
            </p>
            <p className="text-xs sm:text-sm">
              Made by <a href="https://anshgupta.site" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Ansh Gupta</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
