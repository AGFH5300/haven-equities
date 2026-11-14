"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type FormStatus = "idle" | "loading" | "success" | "error"

export default function ContactPage() {
  const [status, setStatus] = useState<FormStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus("loading")
    setErrorMessage(null)

    const form = event.currentTarget
    if (!form) {
      setStatus("error")
      setErrorMessage("Unable to submit the form. Please refresh and try again.")
      return
    }

    const formData = new FormData(form)
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      subject: String(formData.get("subject") || ""),
      message: String(formData.get("message") || ""),
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result?.error || "Unable to send message.")
      }

      setStatus("success")
      form.reset()
    } catch (error) {
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Unable to send message.")
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="border-b border-border bg-secondary py-20 lg:py-24">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Contact Us
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Send a note to the HAVEN Equities team and we will follow up shortly.
            </p>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-border bg-card p-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" name="name" placeholder="Your name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" placeholder="How can we help?" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" placeholder="Share your question or request." rows={6} required />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="submit" disabled={status === "loading"}>
                  {status === "loading" ? "Sending..." : "Send Message"}
                </Button>
                {status === "success" && (
                  <p className="text-sm font-medium text-primary">
                    Message sent! We will be in touch soon.
                  </p>
                )}
                {status === "error" && (
                  <p className="text-sm text-destructive">
                    {errorMessage || "Unable to send message. Please try again."}
                  </p>
                )}
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
