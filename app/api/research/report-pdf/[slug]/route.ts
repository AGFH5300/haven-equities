import { fetchReportBySlug } from "@/lib/research-data"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const report = await fetchReportBySlug(slug)

  if (!report?.pdfUrl) {
    return new Response("Report PDF not found.", { status: 404 })
  }

  const pdfResponse = await fetch(report.pdfUrl, { cache: "no-store" })

  if (!pdfResponse.ok) {
    return new Response("Unable to load report PDF.", { status: 502 })
  }

  const contentType = pdfResponse.headers.get("Content-Type") ?? "application/pdf"
  const pdfBuffer = await pdfResponse.arrayBuffer()

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
