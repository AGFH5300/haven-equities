import fs from "node:fs/promises"
import path from "node:path"
import process from "node:process"

const requiredEnv = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "REPORTS_BUCKET"]

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`)
    process.exit(1)
  }
}

const [pdfPath] = process.argv.slice(2)

if (!pdfPath) {
  console.error("Usage: node scripts/upload-report.mjs /path/to/report.pdf")
  process.exit(1)
}

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const bucket = process.env.REPORTS_BUCKET

const reportData = {
  slug: process.env.REPORT_SLUG,
  company: process.env.REPORT_COMPANY,
  ticker: process.env.REPORT_TICKER,
  sector: process.env.REPORT_SECTOR,
  cycle: Number(process.env.REPORT_CYCLE),
  analyst: process.env.REPORT_ANALYST,
  publish_date: process.env.REPORT_PUBLISH_DATE,
  summary: process.env.REPORT_SUMMARY,
  thesis: process.env.REPORT_THESIS,
  key_risks: process.env.REPORT_KEY_RISKS?.split("|").map((risk) => risk.trim()).filter(Boolean),
  sources: process.env.REPORT_SOURCES?.split("|").map((source) => source.trim()).filter(Boolean),
}

const requiredReportFields = [
  "REPORT_SLUG",
  "REPORT_COMPANY",
  "REPORT_TICKER",
  "REPORT_SECTOR",
  "REPORT_CYCLE",
  "REPORT_ANALYST",
  "REPORT_PUBLISH_DATE",
  "REPORT_SUMMARY",
  "REPORT_THESIS",
]

for (const key of requiredReportFields) {
  if (!process.env[key]) {
    console.error(`Missing required report env var: ${key}`)
    process.exit(1)
  }
}

if (Number.isNaN(reportData.cycle)) {
  console.error("REPORT_CYCLE must be a number.")
  process.exit(1)
}

const fileName = path.basename(pdfPath)
const storagePath = `${reportData.slug}/${fileName}`
const fileBuffer = await fs.readFile(pdfPath)

const uploadResponse = await fetch(
  `${supabaseUrl}/storage/v1/object/${bucket}/${storagePath}`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      "Content-Type": "application/pdf",
      "x-upsert": "true",
    },
    body: fileBuffer,
  }
)

if (!uploadResponse.ok) {
  const errorText = await uploadResponse.text()
  console.error("Upload failed:", errorText)
  process.exit(1)
}

const pdfUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${storagePath}`

const insertResponse = await fetch(`${supabaseUrl}/rest/v1/research_reports`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${serviceRoleKey}`,
    apikey: serviceRoleKey,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  },
  body: JSON.stringify({
    ...reportData,
    pdf_url: pdfUrl,
  }),
})

if (!insertResponse.ok) {
  const errorText = await insertResponse.text()
  console.error("Insert failed:", errorText)
  process.exit(1)
}

const inserted = await insertResponse.json()

console.log("Report uploaded and inserted:", inserted)
console.log("PDF URL:", pdfUrl)
