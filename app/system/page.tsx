"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Info } from "lucide-react"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { sectors } from "@/lib/research-data"
import {
  DENIED_EMAIL_KEY,
  readStoredSession,
  refreshSession,
  storeSession,
  type Session,
} from "@/app/system/auth"

export default function SystemPage() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)

  // NEW: server-verified gate
  const [gateStatus, setGateStatus] = useState<
    "signed_out" | "checking" | "allowed" | "denied"
  >("signed_out")

  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const [isDropZoneActive, setIsDropZoneActive] = useState(false)
  const dragCounter = useRef(0)
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
  const dateInputRef = useRef<HTMLInputElement | null>(null)

  const setPublishDate = (date: string) => {
    setFormState((prev) => ({ ...prev, publishDate: date }))
  }

  const handleTodayClick = () => {
    const today = new Date().toISOString().split("T")[0] ?? ""
    setPublishDate(today)
  }

  const handleOpenCalendar = () => {
    if (dateInputRef.current?.showPicker) {
      dateInputRef.current.showPicker()
      return
    }
    dateInputRef.current?.focus()
  }

  useEffect(() => {
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
        router.replace("/system/login")
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
        router.replace("/system/login")
        return
      }

      const data = (await res.json()) as { allowed: boolean; email: string | null }

      if (!data.allowed) {
        // kill local token & gate
        const resolvedEmail = data.email ?? session.email ?? ""
        sessionStorage.setItem(DENIED_EMAIL_KEY, resolvedEmail)
        storeSession(null)
        setSession(null)
        setGateStatus("denied")
        router.replace("/system/login")
        return
      }

      // allowed: keep email for UI
      setSession((prev) => (prev ? { ...prev, email: data.email ?? prev.email } : prev))
      setGateStatus("allowed")
    }

    void checkAllowed()
  }, [router, session?.accessToken, session?.email])

  useEffect(() => {
    const handleDragEnter = (event: DragEvent) => {
      event.preventDefault()
      dragCounter.current += 1
      setIsDragActive(true)
    }

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault()
    }

    const handleDragLeave = (event: DragEvent) => {
      event.preventDefault()
      dragCounter.current = Math.max(0, dragCounter.current - 1)
      if (dragCounter.current === 0) {
        setIsDragActive(false)
      }
    }

    const handleDrop = (event: DragEvent) => {
      event.preventDefault()
      dragCounter.current = 0
      setIsDragActive(false)
      setIsDropZoneActive(false)

      const droppedFile = event.dataTransfer?.files?.[0]
      if (!droppedFile) return
      if (droppedFile.type !== "application/pdf") {
        setStatusMessage("Please upload a PDF file.")
        return
      }
      setFile(droppedFile)
      setStatusMessage(null)
    }

    window.addEventListener("dragenter", handleDragEnter)
    window.addEventListener("dragover", handleDragOver)
    window.addEventListener("dragleave", handleDragLeave)
    window.addEventListener("drop", handleDrop)

    return () => {
      window.removeEventListener("dragenter", handleDragEnter)
      window.removeEventListener("dragover", handleDragOver)
      window.removeEventListener("dragleave", handleDragLeave)
      window.removeEventListener("drop", handleDrop)
    }
  }, [])

  const handleFileSelection = (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null)
      return
    }
    if (selectedFile.type !== "application/pdf") {
      setStatusMessage("Please upload a PDF file.")
      return
    }
    setFile(selectedFile)
    setStatusMessage(null)
    setUploadedPdfUrl(null)
  }

  const handleSignOut = () => {
    storeSession(null)
    sessionStorage.removeItem(DENIED_EMAIL_KEY)
    setSession(null)
    setGateStatus("signed_out")
    setStatusMessage("Signed out.")
    router.replace("/system/login")
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatusMessage(null)

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

      setStatusMessage("Report uploaded successfully.")
      setUploadedPdfUrl(data.pdfUrl ?? null)
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
      setUploadedPdfUrl(null)
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
   * - If NOT allowed: redirect to /system/login
   * - Only when allowed: render the full console (header/footer/upload form)
   */
  if (gateStatus === "signed_out") {
    return (
      <main className="min-h-screen grid place-items-center bg-background px-6">
        <p className="text-sm text-muted-foreground">Redirecting to sign in…</p>
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
      <main className="min-h-screen grid place-items-center bg-background px-6">
        <p className="text-sm text-muted-foreground">Redirecting to sign in…</p>
      </main>
    )
  }

  // ✅ allowed → render your full page
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
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
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-foreground" htmlFor="slug">
                          Slug
                        </label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:text-foreground"
                              aria-label="Slug info"
                            >
                              <Info className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Use a URL-friendly identifier, like company-quarter-year.
                          </TooltipContent>
                        </Tooltip>
                      </div>
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
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-foreground" htmlFor="ticker">
                          Ticker
                        </label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:text-foreground"
                              aria-label="Ticker info"
                            >
                              <Info className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Enter the stock ticker symbol (e.g., AAPL, MSFT).
                          </TooltipContent>
                        </Tooltip>
                      </div>
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
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-foreground" htmlFor="cycle">
                          Cycle
                        </label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:text-foreground"
                              aria-label="Cycle info"
                            >
                              <Info className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Enter the report iteration number for this company.</TooltipContent>
                        </Tooltip>
                      </div>
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
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="text-sm font-medium text-foreground" htmlFor="publishDate">
                          Publish date
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={handleTodayClick}>
                            Today
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleOpenCalendar}
                          >
                            Pick date
                          </Button>
                        </div>
                      </div>
                      <Input
                        id="publishDate"
                        type="date"
                        value={formState.publishDate}
                        onChange={(event) => setPublishDate(event.target.value)}
                        ref={dateInputRef}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="summary">
                        Summary
                      </label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:text-foreground"
                            aria-label="Summary info"
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Provide a concise overview of the report’s key points.
                        </TooltipContent>
                      </Tooltip>
                    </div>
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
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="thesis">
                        Thesis
                      </label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:text-foreground"
                            aria-label="Thesis info"
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Describe the core investment thesis and rationale.
                        </TooltipContent>
                      </Tooltip>
                    </div>
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
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-foreground" htmlFor="keyRisks">
                          Key risks (one per line)
                        </label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:text-foreground"
                              aria-label="Key risks info"
                            >
                              <Info className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            List the primary risks or uncertainties, one per line.
                          </TooltipContent>
                        </Tooltip>
                      </div>
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
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-foreground" htmlFor="sources">
                          Sources (one per line)
                        </label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:text-foreground"
                              aria-label="Sources info"
                            >
                              <Info className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Provide citations or links for data used in the report.
                          </TooltipContent>
                        </Tooltip>
                      </div>
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
                    <div
                      className={`rounded-lg border border-dashed px-4 py-5 transition ${
                        isDropZoneActive
                          ? "border-primary bg-primary/10"
                          : "border-border bg-muted/30"
                      }`}
                      onDragEnter={() => setIsDropZoneActive(true)}
                      onDragLeave={() => setIsDropZoneActive(false)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault()
                        setIsDropZoneActive(false)
                        const droppedFile = event.dataTransfer.files?.[0] ?? null
                        handleFileSelection(droppedFile)
                      }}
                    >
                      <Input
                        id="pdf"
                        type="file"
                        accept="application/pdf"
                        onChange={(event) => handleFileSelection(event.target.files?.[0] ?? null)}
                        className="sr-only"
                      />
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            Drag and drop your PDF here
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {file?.name ? file.name : "or choose a file from your device"}
                          </p>
                        </div>
                        <Button type="button" variant="outline" asChild>
                          <label htmlFor="pdf" className="cursor-pointer">
                            Choose file
                          </label>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {statusMessage && (
                    <div className={`text-sm ${statusStyles}`}>
                      <p>{statusMessage}</p>
                      {uploadedPdfUrl && (
                        <a
                          className="mt-1 inline-flex text-xs text-primary underline underline-offset-4"
                          href={uploadedPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open uploaded PDF
                        </a>
                      )}
                    </div>
                  )}

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Uploading..." : "Upload report"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {isDragActive && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/20 bg-black/40 px-8 py-6 text-center text-white shadow-lg backdrop-blur">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              Drop PDF to upload
            </div>
            <p className="text-lg font-semibold">Release to add your report</p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
