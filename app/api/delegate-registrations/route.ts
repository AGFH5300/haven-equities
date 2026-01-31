import { NextResponse } from "next/server"

type RegistrationPayload = {
  first_name?: string
  last_name?: string
  email?: string
  delegation_type?: string
  preferred_country?: string
  preferred_institution?: string
  committee_preference?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const getSupabaseConfig = () => ({
  supabaseUrl: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
})

export async function POST(request: Request) {
  const { supabaseUrl, serviceRoleKey } = getSupabaseConfig()

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required." },
      { status: 500 },
    )
  }

  const payload = (await request.json()) as RegistrationPayload
  const firstName = payload.first_name?.trim()
  const lastName = payload.last_name?.trim()
  const email = payload.email?.trim().toLowerCase()
  const delegationType = payload.delegation_type?.trim()

  if (!firstName || !lastName || !email || !delegationType) {
    return NextResponse.json(
      { error: "first_name, last_name, email, and delegation_type are required." },
      { status: 400 },
    )
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 })
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/delegate_registrations`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      email,
      delegation_type: delegationType,
      preferred_country: payload.preferred_country?.trim() || null,
      preferred_institution: payload.preferred_institution?.trim() || null,
      committee_preference: payload.committee_preference?.trim() || null,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    const status = response.status === 409 ? 409 : 500
    return NextResponse.json({ error }, { status })
  }

  const [record] = (await response.json()) as Array<{ id: string }>
  return NextResponse.json({ id: record?.id })
}
