"use client"

import { useEffect, useMemo, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { sectors } from "@/lib/research-data"

type Session = {
  accessToken: string
  refreshToken: string
  expiresAt: number
  email?: string
}

const STORAGE_KEY = "haven-admin-session"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

const parseHashParams = () => {
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

const readStoredSession = (): Session | null => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

const storeSession = (session: Session | null) => {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

const refreshSession = async (refreshToken: string) => {
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

export default function SystemPage() {
  const [session, setSession] = useState<Session | null>(null)

  // NEW: server-verified gate
  const [gateStatus, setGateStatus] = useState<
    "signed_out" | "checking" | "allowed" | "denied"
  >("signed_out")

  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formState, setFormState] = useState({
    slug: "",
    company: "",
    ticker: "",
    sector: "Technology",
    cycle: "1",
    analyst: "",
    publishDate: "",
    summary: "",
    thesis: "",
    keyRisks: "",
    sources: "",
  })
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    const maybeSession = parseHashParams()
    if (maybeSession) {
      const stored: Session = { ...maybeSession }
      storeSession(stored)
      setSession(stored)
      // remove hash
      window.history.replaceState(null, "", window.location.pathname)
      return
    }

    const stored = readStoredSession()
    if (stored) {
      setSession(stored)
    }
  }, [])

  // Keep session fresh
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

  // NEW: server-side allow check (this is the important part)
  useEffect(() => {
    const checkAllowed = async () => {
      if (!session?.accessToken) {
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
        // kill local token & gate
        storeSession(null)
        setSession(null)
        setGateStatus("denied")
        return
      }

      // allowed: keep email for UI
      setSession((prev) => (prev ? { ...prev, email: data.email ?? prev.email } : prev))
      setGateStatus("allowed")
    }

    void checkAllowed()
  }, [session?.accessToken])

  const handleSignIn = () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setStatusMessage("Missing Supabase environment variables.")
      return
    }

    // IMPORTANT: redirect back to /system (your current hash-token flow expects this)
    const redirectTo = `${window.location.origin}/system`

    const url = new URL(`${supabaseUrl}/auth/v1/authorize`)
    url.searchParams.set("provider", "google")
    url.searchParams.set("redirect_to", redirectTo)
    url.searchParams.set("apikey", supabaseAnonKey)

    window.location.href = url.toString()
  }

  const handleSignOut = () => {
    storeSession(null)
    setSession(null)
    setGateStatus("signed_out")
    setStatusMessage("Signed out.")
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatusMessage(null)

    if (!supabaseUrl || !supabaseAnonKey) {
      setStatusMessage("Missing Supabase environment variables.")
      return
    }

    if (gateStatus !== "allowed" || !session?.accessToken) {
      setStatusMessage("You are not authorized.")
      return
    }

    if (!file) {
      setStatusMessage("Please select a PDF file.")
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("pdf", file)
      formData.append("slug", formState.slug)
      formData.append("company", formState.company)
      formData.append("ticker", formState.ticker)
      formData.append("sector", formState.sector)
      formData.append("cycle", formState.cycle)
      formData.append("analyst", formState.analyst)
      formData.append("publish_date", formState.publishDate)
      formData.append("summary", formState.summary)
      formData.append("thesis", formState.thesis)
      formData.append("key_risks", formState.keyRisks)
      formData.append("sources", formState.sources)

      const response = await fetch("/api/system/reports", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: formData,
      })

      const data = (await response.json()) as { error?: string; pdfUrl?: string }

      if (!response.ok) throw new Error(data.error || "Upload failed.")

      setStatusMessage(`Report uploaded successfully. PDF URL: ${data.pdfUrl}`)
      setFormState({
        slug: "",
        company: "",
        ticker: "",
        sector: "Technology",
        cycle: "1",
        analyst: "",
        publishDate: "",
        summary: "",
        thesis: "",
        keyRisks: "",
        sources: "",
      })
      setFile(null)
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Upload failed.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusStyles = useMemo(() => {
    if (!statusMessage) return ""
    return statusMessage.toLowerCase().includes("success") ? "text-emerald-600" : "text-destructive"
  }, [statusMessage])

  /**
   * ✅ HARD HIDE RULE:
   * - If NOT allowed: show only the Google button (and optionally “Not allowed”)
   * - Only when allowed: render the full console (header/footer/upload form)
   */
  if (gateStatus === "signed_out") {
    return (
      <main className="min-h-screen grid place-items-center bg-background px-6">
        <Button onClick={handleSignIn}>
          <svg xmlns="http://www.w3.org/2000/svg" width="41" height="17">
            <g fill="none" fillRule="evenodd">
              <path d="M13.448 7.134c0-.473-.04-.93-.116-1.366H6.988v2.588h3.634a3.11 3.11 0 0 1-1.344 2.042v1.68h2.169c1.27-1.17 2.001-2.9 2.001-4.944" fill="#4285F4" />
              <path d="M6.988 13.7c1.816 0 3.344-.595 4.459-1.621l-2.169-1.681c-.603.406-1.38.643-2.29.643-1.754 0-3.244-1.182-3.776-2.774H.978v1.731a6.728 6.728 0 0 0 6.01 3.703" fill="#34A853" />
              <path d="M3.212 8.267a4.034 4.034 0 0 1 0-2.572V3.964H.978A6.678 6.678 0 0 0 .261 6.98c0 1.085.26 2.11.717 3.017l2.234-1.731z" fill="#FABB05" />
              <path d="M6.988 2.921c.992 0 1.88.34 2.58 1.008v.001l1.92-1.918C10.324.928 8.804.262 6.989.262a6.728 6.728 0 0 0-6.01 3.702l2.234 1.731c.532-1.592 2.022-2.774 3.776-2.774" fill="#E94235" />
            </g>
          </svg>
          Sign in with Google
        </Button>
      </main>
    )
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
      <main className="min-h-screen grid place-items-center bg-background px-6 text-center">
        <div className="space-y-3">
          <p className="text-sm text-destructive font-medium">Not allowed.</p>
          <Button onClick={handleSignIn}>
            Sign in with a different Google account
          </Button>
        </div>
      </main>
    )
  }

  // ✅ allowed → render your full page
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="border-b border-border bg-secondary py-12 lg:py-16">
          <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
            <h1 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
              System Upload Console
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Securely upload research reports. Only authorized emails can submit content.
            </p>
          </div>
        </section>

        <section className="py-10">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <Card>
              <CardHeader>
                <CardTitle>Signed in</CardTitle>
                <CardDescription>You are authorized to upload reports.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  Signed in {session?.email ? `as ${session.email}` : "successfully"}.
                </div>
                <Button type="button" variant="outline" onClick={handleSignOut}>
                  Sign out
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Upload report</CardTitle>
                <CardDescription>Fill in the report metadata and upload the PDF.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {/* --- your existing form unchanged below --- */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="slug">
                        Slug
                      </label>
                      <Input
                        id="slug"
                        value={formState.slug}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, slug: event.target.value }))
                        }
                        placeholder="apple-q4-2024"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="company">
                        Company
                      </label>
                      <Input
                        id="company"
                        value={formState.company}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, company: event.target.value }))
                        }
                        placeholder="Apple Inc."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="ticker">
                        Ticker
                      </label>
                      <Input
                        id="ticker"
                        value={formState.ticker}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, ticker: event.target.value }))
                        }
                        placeholder="AAPL"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Sector</label>
                      <Select
                        value={formState.sector}
                        onValueChange={(value) =>
                          setFormState((prev) => ({ ...prev, sector: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sector" />
                        </SelectTrigger>
                        <SelectContent>
                          {sectors
                            .filter((sector) => sector !== "All Sectors")
                            .map((sector) => (
                              <SelectItem key={sector} value={sector}>
                                {sector}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="cycle">
                        Cycle
                      </label>
                      <Input
                        id="cycle"
                        type="number"
                        min={1}
                        value={formState.cycle}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, cycle: event.target.value }))
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="analyst">
                        Analyst
                      </label>
                      <Input
                        id="analyst"
                        value={formState.analyst}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, analyst: event.target.value }))
                        }
                        placeholder="Jane Doe"
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="publishDate">
                        Publish date
                      </label>
                      <Input
                        id="publishDate"
                        type="date"
                        value={formState.publishDate}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, publishDate: event.target.value }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="summary">
                      Summary
                    </label>
                    <Textarea
                      id="summary"
                      value={formState.summary}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, summary: event.target.value }))
                      }
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="thesis">
                      Thesis
                    </label>
                    <Textarea
                      id="thesis"
                      value={formState.thesis}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, thesis: event.target.value }))
                      }
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="keyRisks">
                        Key risks (one per line)
                      </label>
                      <Textarea
                        id="keyRisks"
                        value={formState.keyRisks}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, keyRisks: event.target.value }))
                        }
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="sources">
                        Sources (one per line)
                      </label>
                      <Textarea
                        id="sources"
                        value={formState.sources}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, sources: event.target.value }))
                        }
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="pdf">
                      PDF file
                    </label>
                    <Input
                      id="pdf"
                      type="file"
                      accept="application/pdf"
                      onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                      required
                    />
                  </div>

                  {statusMessage && <p className={`text-sm ${statusStyles}`}>{statusMessage}</p>}

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Uploading..." : "Upload report"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
