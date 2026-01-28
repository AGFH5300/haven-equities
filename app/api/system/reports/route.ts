const requiredEnv = ["SUPABASE_SERVICE_ROLE_KEY", "REPORTS_BUCKET"]

const getConfig = () => {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const missing = requiredEnv.filter((key) => !process.env[key])

  if (!supabaseUrl) {
    missing.unshift("SUPABASE_URL")
  }

  if (missing.length) {
    return { error: `Missing required env var(s): ${missing.join(", ")}` }
  }

  const allowedEmails = (
    process.env.SYSTEM_ALLOWED_EMAILS ??
    process.env.SYSTEM_GOOGLE_ALLOWLIST ??
    ""
  )
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  return {
    supabaseUrl,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    reportsBucket: process.env.REPORTS_BUCKET as string,
    allowedEmails,
  }
}

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
  const config = getConfig()

  if ("error" in config) {
    return new Response(JSON.stringify({ error: config.error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const authHeader = request.headers.get("Authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

  if (!token) {
    return unauthorized("Missing access token.")
  }

  const userResponse = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: config.serviceRoleKey,
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

  if (config.allowedEmails.length > 0 && !config.allowedEmails.includes(email)) {
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
    `${config.supabaseUrl}/storage/v1/object/${config.reportsBucket}/${storagePath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.serviceRoleKey}`,
        apikey: config.serviceRoleKey,
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

  const pdfUrl = `${config.supabaseUrl}/storage/v1/object/public/${config.reportsBucket}/${storagePath}`

  const insertResponse = await fetch(`${config.supabaseUrl}/rest/v1/research_reports`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.serviceRoleKey}`,
      apikey: config.serviceRoleKey,
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
