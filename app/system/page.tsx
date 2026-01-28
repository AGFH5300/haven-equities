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

const fetchUserEmail = async (accessToken: string) => {
  if (!supabaseUrl || !supabaseAnonKey) return null
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: supabaseAnonKey,
    },
  })

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as { email?: string }
  return data.email ?? null
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
          return
        }
        setSession((prev) => ({
          ...refreshed,
          email: prev?.email,
        }))
        storeSession(refreshed)
      }

      if (!session.email) {
        const email = await fetchUserEmail(session.accessToken)
        if (email) {
          const nextSession = { ...session, email }
          setSession(nextSession)
          storeSession(nextSession)
        }
      }
    }

    void syncSession()
  }, [session])

  const handleSignIn = () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setStatusMessage("Missing Supabase environment variables.")
      return
    }
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
    setStatusMessage("Signed out.")
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatusMessage(null)

    if (!supabaseUrl || !supabaseAnonKey) {
      setStatusMessage("Missing Supabase environment variables.")
      return
    }

    if (!session?.accessToken) {
      setStatusMessage("Please sign in first.")
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

      if (!response.ok) {
        throw new Error(data.error || "Upload failed.")
      }

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
      if (error instanceof Error) {
        setStatusMessage(error.message)
      } else {
        setStatusMessage("Upload failed.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusStyles = useMemo(() => {
    if (!statusMessage) return ""
    return statusMessage.toLowerCase().includes("success") ? "text-emerald-600" : "text-destructive"
  }, [statusMessage])

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
                <CardTitle>Sign in</CardTitle>
                <CardDescription>Use Google sign-in to access the admin uploader.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  {session?.accessToken ? (
                    <>
                      Signed in {session.email ? `as ${session.email}` : "successfully"}.
                    </>
                  ) : (
                    "You must sign in before uploading reports."
                  )}
                </div>
                <div className="flex gap-3">
                  {!session?.accessToken ? (
                    <Button type="button" onClick={handleSignIn}>
                      Sign in with Google
                    </Button>
                  ) : (
                    <Button type="button" variant="outline" onClick={handleSignOut}>
                      Sign out
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Upload report</CardTitle>
                <CardDescription>Fill in the report metadata and upload the PDF.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
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
