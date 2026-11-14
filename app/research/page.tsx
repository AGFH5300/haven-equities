"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { researchReports, sectors, getFilteredReports } from "@/lib/research-data"
import { Search, ArrowRight, FileText } from "lucide-react"
import { useSearchParams, Suspense } from "next/navigation"

export default function ResearchPage() {
  const searchParams = useSearchParams()
  const [selectedSector, setSelectedSector] = useState(searchParams.get("sector") || "All Sectors")
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "")

  const filteredReports = getFilteredReports(selectedSector, searchQuery)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-secondary py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl text-balance">
                Research Library
              </h1>
              <p className="mt-4 text-lg text-muted-foreground text-balance">
                Explore equity research reports published by our student analysts.
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b border-border py-6">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by company or ticker..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-4">
                <Select value={selectedSector} onValueChange={setSelectedSector}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Research Grid */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {filteredReports.length > 0 ? (
              <>
                <p className="mb-8 text-sm text-muted-foreground">
                  Showing {filteredReports.length} report{filteredReports.length !== 1 ? "s" : ""}
                </p>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredReports.map((report) => (
                    <Card key={report.slug} className="flex flex-col border-border bg-card">
                      <CardHeader>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="rounded bg-muted px-2 py-1">{report.sector}</span>
                          <span>Cycle {report.cycle}</span>
                          <span>{report.publishDate}</span>
                        </div>
                        <CardTitle className="font-serif text-xl">
                          {report.company} ({report.ticker})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col">
                        <CardDescription className="flex-1 text-sm leading-relaxed">
                          {report.summary}
                        </CardDescription>
                        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                          <span className="text-xs text-muted-foreground">By {report.analyst}</span>
                          <Button asChild variant="link" size="sm" className="h-auto p-0">
                            <Link href={`/research/${report.slug}`}>
                              Read Report
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card className="border-border bg-card">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 font-serif text-lg font-medium text-foreground">No reports found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {searchQuery || selectedSector !== "All Sectors"
                      ? "Try adjusting your filters or search query."
                      : "Research reports will appear here once published."}
                  </p>
                  {(searchQuery || selectedSector !== "All Sectors") && (
                    <Button
                      variant="outline"
                      className="mt-4 bg-transparent"
                      onClick={() => {
                        setSearchQuery("")
                        setSelectedSector("All Sectors")
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Compliance Note */}
        <section className="border-t border-border bg-secondary py-8">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <p className="text-center text-xs text-muted-foreground">
              All research is published for educational purposes only. This is not investment advice.{" "}
              <Link href="/compliance" className="underline hover:text-foreground">
                Read our full compliance policy.
              </Link>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export function Loading() {
  return null
}
