import { NextResponse } from "next/server"

const CONTACT_TO = process.env.CONTACT_TO ?? "financewithrushil@gmail.com"
const RESEND_FROM = process.env.RESEND_FROM ?? "onboarding@resend.dev"

export async function POST(request: Request) {
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY is not configured." }, { status: 500 })
  }

  const { name, email, subject, message } = (await request.json()) as {
    name?: string
    email?: string
    subject?: string
    message?: string
  }

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 })
  }

  const text = [
    "New contact form submission:",
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    "",
    message,
  ].join("\n")

  const html = `
    <h2>New contact form submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, "<br />")}</p>
  `

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: CONTACT_TO,
      subject: `Contact form: ${subject}`,
      reply_to: email,
      text,
      html,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
