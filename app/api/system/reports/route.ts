const requiredEnv = ["SUPABASE_SERVICE_ROLE_KEY", "REPORTS_BUCKET"]

const splitCsv = (value: string | undefined) =>
  (value ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)

const getConfig = () => {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const missing = requiredEnv.filter((key) => !process.env[key])

  if (!supabaseUrl) missing.unshift("SUPABASE_URL")
  if (!anonKey) missing.unshift("NEXT_PUBLIC_SUPABASE_ANON_KEY")

  if (missing.length) {
    return { error: `Missing required env var(s): ${missing.join(", ")}` }
  }

  const allowedEmails = splitCsv(
    process.env.SYSTEM_ALLOWED_EMAILS ?? process.env.SYSTEM_GOOGLE_ALLOWLIST ?? ""
  )

  const allowedDomains = splitCsv(process.env.SYSTEM_GOOGLE_ALLOWED_DOMAINS ?? "")

  return {
    supabaseUrl,
    anonKey: anonKey as string,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    reportsBucket: process.env.REPORTS_BUCKET as string,
    allowedEmails,
    allowedDomains,
  }
}

const splitList = (value: string | null): string[] => {
  if (!value) return []
  return value
    .split(/\r?\n|[|,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })

const unauthorized = (message: string) => json(401, { error: message })

const isAllowed = (email: string, allowEmails: string[], allowDomains: string[]) => {
  const e = email.toLowerCase().trim()
  const domain = e.split("@")[1] ?? ""
  if (allowEmails.length > 0 && allowEmails.includes(e)) return true
  if (allowDomains.length > 0 && allowDomains.includes(domain)) return true

  // If BOTH lists are empty → allow nobody (safer default)
  if (allowEmails.length === 0 && allowDomains.length === 0) return false

  return false
}

export async function POST(request: Request) {
  const config = getConfig()
  if ("error" in config) return json(500, { error: config.error })

  const authHeader = request.headers.get("Authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  if (!token) return unauthorized("Missing access token.")

  // ✅ Verify user identity using the *user token* (GoTrue) + anon key
  const userResponse = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: config.anonKey,
    },
  })

  if (!userResponse.ok) return unauthorized("Invalid access token.")

  const user = (await userResponse.json()) as { email?: string }
  const email = user.email?.toLowerCase().trim()
  if (!email) return unauthorized("Unable to resolve user email.")

  if (!isAllowed(email, config.allowedEmails, config.allowedDomains)) {
    return json(403, { error: "Access denied." })
  }

  const formData = await request.formData()
  const file = formData.get("pdf")

  if (!(file instanceof File)) {
    return json(400, { error: "PDF file is required." })
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
    return json(400, { error: "Missing required fields." })
  }

  // Optional: sanitize file name a bit
  const safeName = (file.name || "report.pdf").replace(/[^\w.\-() ]+/g, "_")
  const storagePath = `${slug}/${safeName}`
  const buffer = Buffer.from(await file.arrayBuffer())

  // ✅ Upload with Service Role (server-only)
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
    return json(502, { error: errorText || "Upload failed." })
  }

  const signResponse = await fetch(
    `${config.supabaseUrl}/storage/v1/object/sign/${config.reportsBucket}/${storagePath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.serviceRoleKey}`,
        apikey: config.serviceRoleKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expiresIn: 60 * 60 * 24 * 7 }),
    }
  )

  if (!signResponse.ok) {
    const errorText = await signResponse.text()
    return json(502, { error: errorText || "Unable to sign PDF URL." })
  }

  const signData = (await signResponse.json()) as { signedURL?: string }
  if (!signData.signedURL) {
    return json(502, { error: "Unable to sign PDF URL." })
  }
  const pdfUrl = signData.signedURL.startsWith("http")
    ? signData.signedURL
    : `${config.supabaseUrl}${signData.signedURL}`
  const pdfPath = `${config.reportsBucket}/${storagePath}`

  // ✅ Insert with Service Role
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
      pdf_url: pdfPath,
    }),
  })

  if (!insertResponse.ok) {
    const errorText = await insertResponse.text()
    return json(502, { error: errorText || "Insert failed." })
  }

  const inserted = await insertResponse.json()
  return json(200, { pdfUrl, report: inserted })
}
