export interface ResearchReport {
  slug: string
  company: string
  ticker: string
  sector: string
  cycle: number
  analyst: string
  publishDate: string
  summary: string
  thesis: string
  keyRisks: string[]
  sources: string[]
  pdfUrl?: string
}

// Sample research data - in production this would come from a CMS/database/Google Sheet
export const researchReports: ResearchReport[] = [
  {
    slug: "sample-report-technology-cycle-1",
    company: "Sample Company",
    ticker: "SMPL",
    sector: "Technology",
    cycle: 1,
    analyst: "Research Team",
    publishDate: "2026-01-16",
    summary: "This is a sample report demonstrating the report format and structure for educational purposes.",
    thesis: "This sample report demonstrates how research reports are structured within HAVEN Equities. It showcases the format, metadata fields, and educational framing used across all published research.",
    keyRisks: [
      "This is a sample risk factor for demonstration purposes",
      "Reports would include company-specific and market risks",
      "All risks are presented for educational context only",
    ],
    sources: [
      "Company SEC Filings",
      "Industry Reports",
      "Management Presentations",
    ],
    pdfUrl: undefined, // PDF would be linked here when available
  },
]

export const sectors = [
  "All Sectors",
  "Technology",
  "Healthcare",
  "Financials",
  "Consumer Discretionary",
  "Consumer Staples",
  "Industrials",
  "Energy",
  "Materials",
  "Utilities",
  "Real Estate",
  "Communication Services",
]

export function getReportBySlug(slug: string): ResearchReport | undefined {
  return researchReports.find((report) => report.slug === slug)
}

export function getFilteredReports(
  sector?: string,
  searchQuery?: string
): ResearchReport[] {
  let filtered = [...researchReports]

  if (sector && sector !== "All Sectors") {
    filtered = filtered.filter((report) => report.sector === sector)
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filtered = filtered.filter(
      (report) =>
        report.company.toLowerCase().includes(query) ||
        report.ticker.toLowerCase().includes(query) ||
        report.analyst.toLowerCase().includes(query)
    )
  }

  // Sort by publish date (newest first)
  filtered.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())

  return filtered
}
