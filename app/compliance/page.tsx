import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Shield, BookOpen, BanIcon, Database, GraduationCap, ArrowLeft } from "lucide-react"

const complianceSections = [
  {
    icon: BookOpen,
    title: "Educational Disclaimer",
    content: [
      "HAVEN Equities is an educational initiative operated by students for the purpose of learning about equity research and portfolio management.",
      "All content published on this website, including research reports, portfolio decisions, and commentary, is created for educational and informational purposes only.",
      "Nothing on this website constitutes investment advice, financial advice, trading advice, or any other sort of professional advice.",
      "The information provided should not be used as the basis for any investment decision.",
      "Past performance, whether actual or simulated, does not guarantee future results.",
    ],
  },
  {
    icon: BanIcon,
    title: "No External Capital",
    content: [
      "HAVEN Equities does not accept, solicit, or manage capital from any external parties.",
      "All capital used in the Founder Portfolio Case Study is owned exclusively by the founder(s) of HAVEN Equities.",
      "We are not a hedge fund, investment fund, investment advisor, or any form of regulated financial entity.",
      "We do not offer investment management services to any person or entity.",
      "Any inquiries about investing capital with HAVEN Equities will be declined.",
    ],
  },
  {
    icon: Shield,
    title: "No Advice / No Solicitation",
    content: [
      "HAVEN Equities does not provide personalized investment advice to any individual or institution.",
      "Research reports are general in nature and do not take into account individual circumstances, financial situations, or investment objectives.",
      "We do not recommend that any person buy, sell, or hold any security discussed in our research.",
      "Readers should conduct their own research and consult with qualified financial advisors before making any investment decisions.",
      "Nothing on this website should be construed as a solicitation or offer to buy or sell any securities.",
    ],
  },
  {
    icon: Database,
    title: "Data Accuracy Statement",
    content: [
      "While we strive to ensure the accuracy of information presented in our research reports, we make no representations or warranties regarding completeness, accuracy, or reliability.",
      "Financial data, market information, and company details are obtained from publicly available sources believed to be reliable, but accuracy cannot be guaranteed.",
      "Information may become outdated without notice. We are under no obligation to update previously published content.",
      "Users should verify all information independently before relying on it for any purpose.",
      "HAVEN Equities is not responsible for any errors, omissions, or inaccuracies in the information provided.",
    ],
  },
  {
    icon: GraduationCap,
    title: "Academic Integrity & AI Policy",
    content: [
      "All research produced by HAVEN Equities adheres to principles of academic integrity and intellectual honesty.",
      "Research analysts are expected to conduct original analysis and properly cite all sources used in their work.",
      "Plagiarism, data fabrication, or misrepresentation of information is strictly prohibited.",
      "AI tools may be used to assist with research formatting, grammar checking, or data organization, but core analysis and conclusions are human-generated.",
      "When AI tools contribute substantially to any content, this will be disclosed in the relevant publication.",
      "All team members are expected to maintain the highest standards of ethical conduct in their research activities.",
    ],
  },
]

export default function CompliancePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-secondary py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl text-balance">
                Compliance & Disclaimers
              </h1>
              <p className="mt-4 text-lg text-muted-foreground text-balance">
                Important legal and ethical information regarding HAVEN Equities.
              </p>
            </div>
          </div>
        </section>

        {/* Important Notice */}
        <section className="border-b border-border bg-destructive/5 py-8">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-destructive" />
              <div className="space-y-2">
                <p className="font-medium text-foreground">Please Read Carefully</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  By accessing and using this website, you acknowledge that you have read, understood, and agree to 
                  be bound by the following disclaimers and policies. If you do not agree with any part of these 
                  terms, please do not use this website.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance Sections */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl space-y-8">
              {complianceSections.map((section, index) => (
                <Card key={index} className="border-border bg-card">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <section.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="font-serif text-xl">{section.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.content.map((paragraph, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                          {paragraph}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact & Questions */}
        <section className="border-y border-border bg-secondary py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="font-serif text-xl">Questions About Compliance?</CardTitle>
                  <CardDescription>
                    If you have questions about our compliance policies or believe any content on this 
                    website violates these policies, please contact us.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We take compliance seriously and will respond to all legitimate inquiries regarding 
                    our educational mission and ethical standards.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-serif text-xl">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">HAVEN Equities is:</strong> An educational platform 
                    for students to learn equity research and portfolio analysis using founder-owned capital 
                    as a case study.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">HAVEN Equities is NOT:</strong> An investment fund, 
                    financial advisor, or provider of investment advice. We do not accept external capital 
                    or make recommendations for others to follow.
                  </p>
                  <div className="pt-4">
                    <Button asChild variant="outline">
                      <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Return to Home
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Last Updated */}
        <section className="border-t border-border py-6">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <p className="text-center text-xs text-muted-foreground">
              Last updated: February 1, 2025
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
