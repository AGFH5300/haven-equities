const requiredEnv = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "REPORTS_BUCKET"]

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`)
  }
}

const supabaseUrl = process.env.SUPABASE_URL as string
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
const reportsBucket = process.env.REPORTS_BUCKET as string
const allowedEmails = (process.env.SYSTEM_ALLOWED_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

const splitList = (value: string | null): string[] => {
  if (!value) return []
  return value
    .split(/\r?\n|[|,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

const unauthorized = (message: string) =>
  new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  })

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

  if (!token) {
    return unauthorized("Missing access token.")
  }

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: serviceRoleKey,
    },
  })

  if (!userResponse.ok) {
    return unauthorized("Invalid access token.")
  }

  const user = (await userResponse.json()) as { email?: string }
  const email = user.email?.toLowerCase()

  if (!email) {
    return unauthorized("Unable to resolve user email.")
  }

  if (allowedEmails.length > 0 && !allowedEmails.includes(email)) {
    return new Response(JSON.stringify({ error: "Access denied." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    })
  }

  const formData = await request.formData()
  const file = formData.get("pdf")

  if (!(file instanceof File)) {
    return new Response(JSON.stringify({ error: "PDF file is required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const slug = formData.get("slug")?.toString().trim()
  const company = formData.get("company")?.toString().trim()
  const ticker = formData.get("ticker")?.toString().trim()
  const sector = formData.get("sector")?.toString().trim()
  const cycle = Number(formData.get("cycle")?.toString())
  const analyst = formData.get("analyst")?.toString().trim()
  const publishDate = formData.get("publish_date")?.toString().trim()
  const summary = formData.get("summary")?.toString().trim()
  const thesis = formData.get("thesis")?.toString().trim()
  const keyRisks = splitList(formData.get("key_risks")?.toString() ?? "")
  const sources = splitList(formData.get("sources")?.toString() ?? "")

  if (
    !slug ||
    !company ||
    !ticker ||
    !sector ||
    !analyst ||
    !publishDate ||
    !summary ||
    !thesis ||
    Number.isNaN(cycle)
  ) {
    return new Response(JSON.stringify({ error: "Missing required fields." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const storagePath = `${slug}/${file.name}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const uploadResponse = await fetch(
    `${supabaseUrl}/storage/v1/object/${reportsBucket}/${storagePath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Content-Type": file.type || "application/pdf",
        "x-upsert": "true",
      },
      body: buffer,
    }
  )

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text()
    return new Response(JSON.stringify({ error: errorText || "Upload failed." }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    })
  }

  const pdfUrl = `${supabaseUrl}/storage/v1/object/public/${reportsBucket}/${storagePath}`

  const insertResponse = await fetch(`${supabaseUrl}/rest/v1/research_reports`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      slug,
      company,
      ticker,
      sector,
      cycle,
      analyst,
      publish_date: publishDate,
      summary,
      thesis,
      key_risks: keyRisks.length ? keyRisks : null,
      sources: sources.length ? sources : null,
      pdf_url: pdfUrl,
    }),
  })

  if (!insertResponse.ok) {
    const errorText = await insertResponse.text()
    return new Response(JSON.stringify({ error: errorText || "Insert failed." }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    })
  }

  const inserted = await insertResponse.json()

  return new Response(JSON.stringify({ pdfUrl, report: inserted }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
