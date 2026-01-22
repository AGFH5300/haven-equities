import { supabaseFetch } from "@/lib/supabase"

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

type ResearchReportRow = {
  slug: string
  company: string
  ticker: string
  sector: string
  cycle: number
  analyst: string
  publish_date: string
  summary: string
  thesis: string
  key_risks: string[] | string | null
  sources: string[] | string | null
  pdf_url: string | null
}

const normalizeStringArray = (value: string[] | string | null): string[] => {
  if (!value) return []
  if (Array.isArray(value)) return value

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

const mapReport = (report: ResearchReportRow): ResearchReport => ({
  slug: report.slug,
  company: report.company,
  ticker: report.ticker,
  sector: report.sector,
  cycle: report.cycle,
  analyst: report.analyst,
  publishDate: report.publish_date,
  summary: report.summary,
  thesis: report.thesis,
  keyRisks: normalizeStringArray(report.key_risks),
  sources: normalizeStringArray(report.sources),
  pdfUrl: report.pdf_url ?? undefined,
})

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

const reportSelectFields =
  "slug, company, ticker, sector, cycle, analyst, publish_date, summary, thesis, key_risks, sources, pdf_url"

export async function fetchResearchReports(): Promise<ResearchReport[]> {
  const data = await supabaseFetch<ResearchReportRow[]>(
    `research_reports?select=${encodeURIComponent(reportSelectFields)}&order=publish_date.desc`
  )

  return data.map(mapReport)
}

export async function fetchReportBySlug(slug: string): Promise<ResearchReport | null> {
  const data = await supabaseFetch<ResearchReportRow[]>(
    `research_reports?select=${encodeURIComponent(reportSelectFields)}&slug=eq.${encodeURIComponent(
      slug
    )}&limit=1`
  )

  const report = data[0]
  return report ? mapReport(report) : null
}

export function getFilteredReports(
  reports: ResearchReport[],
  sector?: string,
  searchQuery?: string
): ResearchReport[] {
  let filtered = [...reports]

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

  return filtered
}
