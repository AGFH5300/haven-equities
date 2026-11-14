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

  let pdfUrl = report.pdfUrl

  if (!pdfUrl.startsWith("http")) {
    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
    const reportsBucket = process.env.REPORTS_BUCKET

    if (!supabaseUrl || !reportsBucket) {
      return new Response("Storage configuration missing.", { status: 500 })
    }

    const relativePath = pdfUrl.replace(`${reportsBucket}/`, "")
    pdfUrl = `${supabaseUrl}/storage/v1/object/public/${reportsBucket}/${relativePath}`
  }

  const pdfResponse = await fetch(pdfUrl, { cache: "no-store" })

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
