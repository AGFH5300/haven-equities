import React from "react"
import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const playfairDisplay = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.havenequities.com'),
  title: 'HAVEN Equities | Student-Led Equity Research Collective',
  description: 'A student-led equity research collective using founder-owned capital as an educational case study.',
  applicationName: 'HAVEN Equities',
  keywords: [
    'HAVEN Equities',
    'equity research',
    'student-led',
    'investment research',
    'portfolio case study',
    'finance education',
  ],
  authors: [{ name: 'HAVEN Equities' }],
  creator: 'HAVEN Equities',
  publisher: 'HAVEN Equities',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'HAVEN Equities | Student-Led Equity Research Collective',
    siteName: 'HAVEN Equities',
    description: 'A student-led equity research collective using founder-owned capital as an educational case study.',
    images: [
      {
        url: '/icon.svg',
        alt: 'HAVEN Equities',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HAVEN Equities | Student-Led Equity Research Collective',
    description: 'A student-led equity research collective using founder-owned capital as an educational case study.',
    images: ['/apple-touch-icon.png'],
  },
  icons: {
    icon: [
      { url: '/apple-touch-icon.png', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', type: 'image/svg+xml' }],
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
