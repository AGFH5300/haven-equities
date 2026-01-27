"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function InternshipApplicationPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    event.currentTarget.reset()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="border-b border-border bg-secondary py-20 lg:py-24">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Join Us Now
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Complete the internship application form below to express interest in joining HAVEN Equities.
            </p>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-border bg-card p-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full name</Label>
                  <Input id="full-name" name="full-name" placeholder="Your name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="school">School</Label>
                  <Input id="school" name="school" placeholder="University or college" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Graduation year</Label>
                  <Input id="year" name="year" placeholder="2026" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interest">Areas of interest</Label>
                <Input id="interest" name="interest" placeholder="Equity research, portfolio analysis, data, etc." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="background">Tell us about yourself</Label>
                <Textarea
                  id="background"
                  name="background"
                  placeholder="Share your experience, skills, and why you want to join."
                  rows={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="links">Resume or LinkedIn URL</Label>
                <Input id="links" name="links" placeholder="https://linkedin.com/in/yourname" />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="submit">Submit Application</Button>
                {submitted && (
                  <p className="text-sm font-medium text-primary">
                    Application received! We will follow up with next steps.
                  </p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                This form is a placeholder for your internship application intake. Connect it to your preferred
                form provider when ready.
              </p>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
