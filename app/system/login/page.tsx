"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DENIED_EMAIL_KEY,
  getSupabaseConfig,
  parseHashParams,
  readStoredSession,
  refreshSession,
  storeSession,
  type Session,
} from "@/app/system/auth"

export default function SystemLoginPage() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [deniedEmail, setDeniedEmail] = useState<string | null>(null)
  const [gateStatus, setGateStatus] = useState<
    "signed_out" | "checking" | "allowed" | "denied"
  >("signed_out")

  useEffect(() => {
    const denied = sessionStorage.getItem(DENIED_EMAIL_KEY)
    if (denied) {
      setDeniedEmail(denied)
      setGateStatus("denied")
    }

    const maybeSession = parseHashParams()
    if (maybeSession) {
      const stored: Session = { ...maybeSession }
      storeSession(stored)
      setSession(stored)
      sessionStorage.removeItem(DENIED_EMAIL_KEY)
      window.history.replaceState(null, "", window.location.pathname)
      return
    }

    const stored = readStoredSession()
    if (stored) {
      setSession(stored)
    }
  }, [])

  useEffect(() => {
    const syncSession = async () => {
      if (!session) return

      if (session.expiresAt <= Date.now()) {
        const refreshed = await refreshSession(session.refreshToken)
        if (!refreshed) {
          storeSession(null)
          setSession(null)
          setGateStatus("signed_out")
          return
        }
        setSession((prev) => ({
          ...refreshed,
          email: prev?.email,
        }))
        storeSession(refreshed)
      }
    }

    void syncSession()
  }, [session])

  useEffect(() => {
    const checkAllowed = async () => {
      if (!session?.accessToken) {
        if (deniedEmail) return
        setGateStatus("signed_out")
        return
      }

      setGateStatus("checking")

      const res = await fetch("/api/system/me", {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })

      if (!res.ok) {
        storeSession(null)
        setSession(null)
        setGateStatus("signed_out")
        return
      }

      const data = (await res.json()) as { allowed: boolean; email: string | null }

      if (!data.allowed) {
        const resolvedEmail = data.email ?? session.email ?? ""
        setDeniedEmail(resolvedEmail)
        sessionStorage.setItem(DENIED_EMAIL_KEY, resolvedEmail)
        storeSession(null)
        setSession(null)
        setGateStatus("denied")
        return
      }

      setSession((prev) => (prev ? { ...prev, email: data.email ?? prev.email } : prev))
      setDeniedEmail(null)
      sessionStorage.removeItem(DENIED_EMAIL_KEY)
      setGateStatus("allowed")
      router.replace("/system")
    }

    void checkAllowed()
  }, [deniedEmail, router, session?.accessToken, session?.email])

  const handleSignIn = () => {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()
    if (!supabaseUrl || !supabaseAnonKey) return

    sessionStorage.removeItem(DENIED_EMAIL_KEY)
    setDeniedEmail(null)
    setGateStatus("signed_out")

    const redirectTo = `${window.location.origin}/system/login`

    const url = new URL(`${supabaseUrl}/auth/v1/authorize`)
    url.searchParams.set("provider", "google")
    url.searchParams.set("redirect_to", redirectTo)
    url.searchParams.set("apikey", supabaseAnonKey)

    window.location.href = url.toString()
  }

  if (gateStatus === "checking") {
    return (
      <main className="min-h-screen grid place-items-center bg-background px-6">
        <p className="text-sm text-muted-foreground">Checking access…</p>
      </main>
    )
  }

  if (gateStatus === "denied") {
    return (
      <main className="min-h-screen bg-[#ffecdd] text-slate-900">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-white p-8 text-center shadow-xl">
            <h1 className="mb-2 text-xl font-semibold text-red-600">Access denied</h1>

            <p className="text-sm text-slate-600">
              This Google account is not authorized to access this system.
            </p>

            {deniedEmail ? (
              <p className="mt-3 text-xs text-slate-500">
                Signed in as <span className="font-mono text-slate-700">{deniedEmail}</span>
              </p>
            ) : null}

            <div className="mt-6">
              <Button onClick={handleSignIn}>Sign in with a different Google account</Button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen grid place-items-center bg-background px-6">
      <Button onClick={handleSignIn} className="bg-white text-slate-900 hover:bg-slate-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="41" height="17">
          <g fill="none" fillRule="evenodd">
            <path
              d="M13.448 7.134c0-.473-.04-.93-.116-1.366H6.988v2.588h3.634a3.11 3.11 0 0 1-1.344 2.042v1.68h2.169c1.27-1.17 2.001-2.9 2.001-4.944"
              fill="#4285F4"
            />
            <path
              d="M6.988 13.7c1.816 0 3.344-.595 4.459-1.621l-2.169-1.681c-.603.406-1.38.643-2.29.643-1.754 0-3.244-1.182-3.776-2.774H.978v1.731a6.728 6.728 0 0 0 6.01 3.703"
              fill="#34A853"
            />
            <path
              d="M3.212 8.267a4.034 4.034 0 0 1 0-2.572V3.964H.978A6.678 6.678 0 0 0 .261 6.98c0 1.085.26 2.11.717 3.017l2.234-1.731z"
              fill="#FABB05"
            />
            <path
              d="M6.988 2.921c.992 0 1.88.34 2.58 1.008v.001l1.92-1.918C10.324.928 8.804.262 6.989.262a6.728 6.728 0 0 0-6.01 3.702l2.234 1.731c.532-1.592 2.022-2.774 3.776-2.774"
              fill="#E94235"
            />
          </g>
        </svg>
        Sign in with Google
      </Button>
    </main>
  )
}
