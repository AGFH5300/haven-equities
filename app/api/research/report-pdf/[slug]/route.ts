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

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const reportsBucket = process.env.REPORTS_BUCKET

  let pdfUrl = report.pdfUrl

  if (!pdfUrl.startsWith("http")) {
    if (!supabaseUrl || !serviceRoleKey || !reportsBucket) {
      return new Response("Storage configuration missing.", { status: 500 })
    }

    const signResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/sign/${reportsBucket}/${pdfUrl.replace(
        `${reportsBucket}/`,
        ""
      )}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expiresIn: 60 * 60 }),
      }
    )

    if (!signResponse.ok) {
      return new Response("Unable to sign report PDF.", { status: 502 })
    }

    const signData = (await signResponse.json()) as { signedURL?: string }
    if (!signData.signedURL) {
      return new Response("Report PDF not found.", { status: 404 })
    }

    pdfUrl = signData.signedURL.startsWith("http")
      ? signData.signedURL
      : `${supabaseUrl}${signData.signedURL}`
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
