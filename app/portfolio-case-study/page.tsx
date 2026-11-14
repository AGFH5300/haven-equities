import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react"

// Portfolio data - in production this would come from a CMS/database
const portfolioOverview = {
  startingCapital: 5000,
  currentValue: 5000,
  cashPosition: 5000,
  lastUpdated: "January 16, 2026",
  inceptionDate: "January 16, 2026",
}

const holdings: {
  ticker: string
  company: string
  sector: string
  shares: number
  avgCost: number
  currentPrice: number
  weight: number
}[] = []

const performanceData = {
  sinceInception: 0,
  mtd: 0,
  ytd: 0,
}

const decisionLog: {
  date: string
  action: string
  ticker?: string
  rationale: string[]
  researchLinks: { title: string; slug: string }[]
  riskNotes: string
}[] = [
  {
    date: "2026-01-16",
    action: "Portfolio Inception - Hold Cash",
    ticker: undefined,
    rationale: [
      "Establishing the educational case study with $5,000 founder-owned capital",
      "Initial period dedicated to research pipeline development",
      "No positions taken until research coverage is established",
      "Cash position maintained for educational demonstration purposes",
    ],
    researchLinks: [],
    riskNotes: "Holding cash carries opportunity cost if markets rise. This is an educational decision to demonstrate disciplined capital allocation.",
  },
]

export default function PortfolioCaseStudyPage() {
  const totalInvested = holdings.reduce((sum, h) => sum + h.shares * h.avgCost, 0)
  const totalCurrentValue = holdings.reduce((sum, h) => sum + h.shares * h.currentPrice, 0)
  const unrealizedPL = totalCurrentValue - totalInvested

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-secondary py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl text-balance">
                Founder Portfolio Case Study
              </h1>
              <p className="mt-4 text-lg text-muted-foreground text-balance">
                An educational demonstration using founder-owned capital.
              </p>
            </div>
          </div>
        </section>

        {/* Important Disclaimer */}
        <section className="border-b border-border bg-destructive/5 py-6">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Educational Case Study Only</p>
                <p className="text-xs text-muted-foreground">
                  This portfolio uses <strong>founder-owned capital only</strong>. No external capital is accepted. 
                  This is not investment advice or a recommendation to buy, sell, or hold any securities.{" "}
                  <Link href="/compliance" className="underline hover:text-foreground">
                    View full compliance details.
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Overview */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
              Portfolio Overview
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Last updated: {portfolioOverview.lastUpdated}
            </p>
            
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardDescription>Starting Capital</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-serif text-2xl font-semibold text-foreground">
                    ${portfolioOverview.startingCapital.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Founder-owned</p>
                </CardContent>
              </Card>
              
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardDescription>Current Value</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-serif text-2xl font-semibold text-foreground">
                    ${portfolioOverview.currentValue.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">As of {portfolioOverview.lastUpdated}</p>
                </CardContent>
              </Card>
              
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardDescription>Cash Position</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-serif text-2xl font-semibold text-foreground">
                    ${portfolioOverview.cashPosition.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {((portfolioOverview.cashPosition / portfolioOverview.currentValue) * 100).toFixed(1)}% of portfolio
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardDescription>Since Inception</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {performanceData.sinceInception > 0 ? (
                      <TrendingUp className="h-5 w-5 text-primary" />
                    ) : performanceData.sinceInception < 0 ? (
                      <TrendingDown className="h-5 w-5 text-destructive" />
                    ) : (
                      <Minus className="h-5 w-5 text-muted-foreground" />
                    )}
                    <p className={`font-serif text-2xl font-semibold ${
                      performanceData.sinceInception > 0 
                        ? "text-primary" 
                        : performanceData.sinceInception < 0 
                          ? "text-destructive" 
                          : "text-foreground"
                    }`}>
                      {performanceData.sinceInception >= 0 ? "+" : ""}{performanceData.sinceInception.toFixed(2)}%
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Since {portfolioOverview.inceptionDate}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Current Holdings */}
        <section className="border-y border-border bg-secondary py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
              Current Holdings
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Securities currently held in the case study portfolio.
            </p>
            
            <Card className="mt-8 border-border bg-card overflow-hidden">
              {holdings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticker</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead className="text-right">Shares</TableHead>
                      <TableHead className="text-right">Avg Cost</TableHead>
                      <TableHead className="text-right">Current</TableHead>
                      <TableHead className="text-right">Weight</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holdings.map((holding) => (
                      <TableRow key={holding.ticker}>
                        <TableCell className="font-medium">{holding.ticker}</TableCell>
                        <TableCell>{holding.company}</TableCell>
                        <TableCell>
                          <span className="rounded bg-muted px-2 py-1 text-xs">{holding.sector}</span>
                        </TableCell>
                        <TableCell className="text-right">{holding.shares}</TableCell>
                        <TableCell className="text-right">${holding.avgCost.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${holding.currentPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{holding.weight.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No positions currently held. Portfolio is 100% cash.</p>
                </CardContent>
              )}
            </Card>
          </div>
        </section>

        {/* Decision Log */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
              Decision Log
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Documented portfolio decisions with educational rationale.
            </p>
            
            <div className="mt-8 space-y-6">
              {decisionLog.length > 0 ? (
                decisionLog.map((decision, index) => (
                  <Card key={index} className="border-border bg-card">
                    <CardHeader>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded bg-muted px-3 py-1 text-xs font-medium text-foreground">
                          {decision.date}
                        </span>
                        {decision.ticker && (
                          <span className="rounded bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            {decision.ticker}
                          </span>
                        )}
                      </div>
                      <CardTitle className="font-serif text-lg">{decision.action}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-foreground">Educational Rationale</h4>
                        <ul className="mt-2 space-y-1">
                          {decision.rationale.map((point, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {decision.researchLinks.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-foreground">Research Inputs Referenced</h4>
                          <ul className="mt-2 space-y-1">
                            {decision.researchLinks.map((link, i) => (
                              <li key={i}>
                                <Link 
                                  href={`/research/${link.slug}`}
                                  className="text-sm text-primary hover:underline"
                                >
                                  {link.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-sm font-medium text-foreground">Risk Notes</h4>
                        <p className="mt-2 text-sm text-muted-foreground">{decision.riskNotes}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-border bg-card">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Decision log will be updated as portfolio decisions are made.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* Compliance Link */}
        <section className="border-t border-border bg-secondary py-8">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
              <p className="text-sm text-muted-foreground">
                All portfolio activities are documented for educational purposes only.
              </p>
              <Button asChild variant="outline">
                <Link href="/compliance">
                  View Compliance
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
