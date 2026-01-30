"use client"

export type Session = {
  accessToken: string
  refreshToken: string
  expiresAt: number
  email?: string
}

export const STORAGE_KEY = "haven-admin-session"
export const DENIED_EMAIL_KEY = "haven-admin-denied-email"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

export const getSupabaseConfig = () => ({
  supabaseUrl,
  supabaseAnonKey,
})

export const parseHashParams = () => {
  const hash = window.location.hash.replace("#", "")
  if (!hash) return null
  const params = new URLSearchParams(hash)
  const accessToken = params.get("access_token")
  const refreshToken = params.get("refresh_token")
  const expiresIn = Number(params.get("expires_in"))
  if (!accessToken || !refreshToken || Number.isNaN(expiresIn)) return null
  return {
    accessToken,
    refreshToken,
    expiresAt: Date.now() + expiresIn * 1000,
  }
}

export const readStoredSession = (): Session | null => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export const storeSession = (session: Session | null) => {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export const refreshSession = async (refreshToken: string) => {
  if (!supabaseUrl || !supabaseAnonKey) return null
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })

  if (!response.ok) return null

  const data = (await response.json()) as {
    access_token: string
    refresh_token: string
    expires_in: number
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }
}
