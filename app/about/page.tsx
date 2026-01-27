import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight, Users, Target, Shield, GraduationCap } from "lucide-react"

const leadership = [
  {
    name: "Rushil Bhandari",
    role: "Founder & CEO",
    description: "Leads strategic direction and portfolio case study execution.",
    image: "/images/team-placeholder.svg",
  },
  {
    name: "Joseph Augustine",
    role: "Chief Financial Officer",
    description: "Oversees capital stewardship and financial operations.",
    image: "/images/team-placeholder.svg",
  },
  {
    name: "Evan Kung",
    role: "Chief Operating Officer",
    description: "Manages day-to-day operations and project execution.",
    image: "/images/team-placeholder.svg",
  },
  {
    name: "Ansh Gupta",
    role: "Chief Technology Officer",
    description: "Leads product, data, and web infrastructure.",
    image: "/images/team-placeholder.svg",
  },
  {
    name: "Juan Rufino",
    role: "Chief Marketing Officer",
    description: "Drives brand storytelling and community outreach.",
    image: "/images/team-placeholder.svg",
  },
]

const ethicalPractices = [
  "No external capital accepted - all funds are founder-owned",
  "No investment advice provided to any party",
  "Full transparency in research methodology and decisions",
  "Clear educational framing on all published materials",
  "Compliance disclaimers on every page",
  "No solicitation of investments or subscribers",
]

const internBenefits = [
  {
    title: "Real-World Experience",
    description: "Apply academic knowledge to practical equity research using institutional frameworks.",
  },
  {
    title: "Published Work",
    description: "Build a portfolio of published research reports to demonstrate analytical capabilities.",
  },
  {
    title: "Mentorship",
    description: "Receive guidance from experienced team members on research methodology and presentation.",
  },
  {
    title: "Collaborative Environment",
    description: "Work alongside peers who share a passion for financial markets and analysis.",
  },
]

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-secondary py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl text-balance">
                About HAVEN Equities
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-balance">
                A student-led equity research collective dedicated to learning through practice.
              </p>
            </div>
          </div>
        </section>

        {/* Overview */}
        <section className="py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
                Overview
              </h2>
              <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  HAVEN Equities is an educational initiative that provides students with hands-on experience 
                  in equity research and portfolio analysis. We operate as a research collective, not an 
                  investment fund.
                </p>
                <p>
                  Our work centers on producing institutional-quality research reports and documenting 
                  portfolio decisions for educational purposes. All capital used in our case study is 
                  founder-owned, and we do not accept external investments or provide investment advice.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="border-y border-border bg-secondary py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-serif text-2xl">Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    To provide aspiring finance professionals with practical experience in equity research, 
                    portfolio analysis, and professional communication through a transparent, 
                    ethically-structured educational platform.
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-serif text-2xl">Vision</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    To become a recognized platform for student-led equity research that bridges the gap 
                    between academic finance education and professional investment analysis, while 
                    maintaining the highest standards of ethical conduct.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How We Stay Ethical */}
        <section className="py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
                  How We Stay Ethical
                </h2>
              </div>
              <ul className="mt-8 space-y-4">
                {ethicalPractices.map((practice, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{practice}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button asChild variant="outline">
                  <Link href="/compliance">
                    View Full Compliance Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Leadership */}
        <section className="border-y border-border bg-secondary py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
              Leadership
            </h2>
            <p className="mt-4 text-muted-foreground">
              The team driving our educational mission.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {leadership.map((member) => (
                <Card key={member.name} className="border-border bg-card">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-full border border-border">
                        <img
                          src={member.image}
                          alt={`${member.name} headshot placeholder`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="font-serif text-lg">{member.name}</CardTitle>
                        <CardDescription className="text-sm font-medium text-primary">
                          {member.role}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* For Students */}
        <section className="py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
                  For Students
                </h2>
                <p className="mt-1 text-muted-foreground">What interns and analysts gain from HAVEN.</p>
              </div>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {internBenefits.map((benefit) => (
                <Card key={benefit.title} className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="font-serif text-lg">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="leading-relaxed">
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
