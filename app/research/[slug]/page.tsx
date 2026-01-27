import Link from "next/link"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchReportBySlug } from "@/lib/research-data"
import { ArrowLeft, AlertTriangle, FileText, ExternalLink } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  try {
    const report = await fetchReportBySlug(slug)

    if (!report) {
      return {
        title: "Report Not Found | HAVEN Equities",
      }
    }

    return {
      title: `${report.company} (${report.ticker}) | HAVEN Equities Research`,
      description: report.summary,
    }
  } catch (error) {
    return {
      title: "Research Report | HAVEN Equities",
    }
  }
}

export default async function ReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let report

  try {
    report = await fetchReportBySlug(slug)
  } catch (error) {
    report = null
  }

  if (!report) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Back Navigation */}
        <section className="border-b border-border py-4">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <Button asChild variant="ghost" size="sm">
              <Link href="/research">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Research Library
              </Link>
            </Button>
          </div>
        </section>

        {/* Report Header */}
        <section className="border-b border-border bg-secondary py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="rounded bg-primary/10 px-3 py-1 text-primary">{report.sector}</span>
                <span>Cycle {report.cycle}</span>
                <span>Published {report.publishDate}</span>
              </div>
              <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {report.company} ({report.ticker})
              </h1>
              <p className="mt-4 text-muted-foreground">
                Research Analyst: <span className="font-medium text-foreground">{report.analyst}</span>
              </p>
            </div>
          </div>
        </section>

        {/* Report Content */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl space-y-8">
              {/* Quick Summary */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-serif text-xl">Educational Summary</CardTitle>
                  <CardDescription>
                    This summary is for educational purposes only. It is not investment advice.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Thesis (Educational)</h4>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {report.thesis}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Key Risks (Educational)</h4>
                    {report.keyRisks.length > 0 ? (
                      <ul className="mt-2 space-y-2">
                        {report.keyRisks.map((risk, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                            {risk}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Key risks will be listed once the report is finalized.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Report Viewer */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="font-serif text-xl">Full Report</CardTitle>
                </CardHeader>
                <CardContent>
                  {report.pdfUrl ? (
                    <div className="space-y-4">
                      <div className="h-[75vh] w-full overflow-hidden rounded-lg border border-border bg-muted lg:h-[80vh]">
                        <iframe
                          src={`/api/research/report-pdf/${report.slug}`}
                          className="h-full w-full"
                          title={`${report.company} Research Report`}
                        />
                      </div>
                      <Button asChild variant="outline">
                        <a
                          href={`/api/research/report-pdf/${report.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open Report in New Tab
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 py-16 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-4 font-medium text-foreground">PDF Report Coming Soon</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        The full report will be available here once uploaded.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sources */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="font-serif text-xl">Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  {report.sources.length > 0 ? (
                    <ul className="space-y-2">
                      {report.sources.map((source, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                          {source}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Source citations will appear here once the report is published.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Compliance Footer */}
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="flex items-start gap-4 py-6">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Educational Disclaimer</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      This research report is published for educational purposes only. It does not constitute 
                      investment advice, a recommendation to buy or sell any security, or a solicitation of 
                      investment. HAVEN Equities does not accept external capital. All portfolio activities 
                      use founder-owned capital only.
                    </p>
                    <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
                      <Link href="/compliance">
                        Read Full Compliance Policy
                        <ArrowLeft className="ml-1 h-3 w-3 rotate-180" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
