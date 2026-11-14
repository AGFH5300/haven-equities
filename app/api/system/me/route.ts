import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function parseAllowList(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

function isAllowed(email: string, allowEmails: string[], allowDomains: string[]) {
  const e = email.toLowerCase().trim()
  const domain = e.split("@")[1] ?? ""
  if (allowEmails.includes(e)) return true
  if (allowDomains.length > 0 && allowDomains.includes(domain)) return true
  return false
}

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Missing Supabase env vars." }, { status: 500 })
  }

  const authHeader = request.headers.get("authorization") ?? ""
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null

  if (!token) {
    return NextResponse.json({ allowed: false, email: null }, { status: 401 })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user?.email) {
    return NextResponse.json({ allowed: false, email: null }, { status: 401 })
  }

  const email = data.user.email

  const allowEmails = parseAllowList(process.env.SYSTEM_GOOGLE_ALLOWLIST)
  const allowDomains = parseAllowList(process.env.SYSTEM_GOOGLE_ALLOWED_DOMAINS)

  const allowed = isAllowed(email, allowEmails, allowDomains)

  return NextResponse.json({ allowed, email })
}
