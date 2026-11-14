import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowRight, AlertTriangle, FileText, TrendingUp, BookOpen, ChevronRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section - Full height dramatic opener */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0A1A2F]">
          {/* Subtle geometric pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(255,255,255,0.1) 50px, rgba(255,255,255,0.1) 51px),
                               repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,255,255,0.1) 50px, rgba(255,255,255,0.1) 51px)`
            }} />
          </div>
          
          {/* Accent line */}
          <div className="absolute left-0 top-0 h-full w-1 bg-[#006039]" />
          
          <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-20">
            <div className="max-w-4xl">
              {/* Eyebrow */}
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px w-12 bg-[#006039]" />
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#006039]">
                  Student-Led Equity Research
                </span>
              </div>
              
              {/* Main headline */}
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-semibold tracking-tight text-white leading-[1.1]">
                HAVEN
                <span className="block text-[#006039]">Equities</span>
              </h1>
              
              {/* Tagline */}
              <p className="mt-8 max-w-xl text-lg sm:text-xl leading-relaxed text-slate-300">
                A student-led equity research collective using founder-owned capital as an educational case study.
              </p>
              
              {/* CTA buttons */}
              <div className="mt-12 flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-[#006039] hover:bg-[#004d2e] text-white px-8">
                  <Link href="/research">
                    Explore Research
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-slate-500 text-white hover:bg-white/10 bg-transparent px-8">
                  <Link href="/about">Our Mission</Link>
                </Button>
              </div>
              
              {/* Stats row */}
              <div className="mt-20 flex flex-wrap gap-12 lg:gap-20 pt-12 border-t border-white/10">
                <div>
                  <div className="text-3xl sm:text-4xl font-serif font-semibold text-white">$5,000</div>
                  <div className="mt-1 text-sm text-slate-400">Founder Capital</div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-serif font-semibold text-white">100%</div>
                  <div className="mt-1 text-sm text-slate-400">Educational Focus</div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-serif font-semibold text-white">0</div>
                  <div className="mt-1 text-sm text-slate-400">External Investors</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-slate-500">Scroll</span>
            <div className="h-12 w-px bg-gradient-to-b from-slate-500 to-transparent" />
          </div>
        </section>

        {/* Three Pillars - Horizontal showcase */}
        <section className="py-24 lg:py-32 bg-[#F5F5F5]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              {/* Left side - Title */}
              <div className="lg:sticky lg:top-32">
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#006039]">
                  Our Approach
                </span>
                <h2 className="mt-4 font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-[#0B0B0B] leading-tight">
                  Three pillars of educational research
                </h2>
                <p className="mt-6 text-lg text-[#6B7280] leading-relaxed">
                  Built on transparency, rigor, and a commitment to learning through real-world application.
                </p>
              </div>
              
              {/* Right side - Pillars */}
              <div className="space-y-8">
                {[
                  {
                    icon: FileText,
                    number: "01",
                    title: "Research",
                    description: "In-depth equity analysis conducted by student analysts following institutional methodologies and frameworks.",
                  },
                  {
                    icon: TrendingUp,
                    number: "02",
                    title: "Simulation",
                    description: "Real-world portfolio management using founder-owned capital as an educational case study for applied learning.",
                  },
                  {
                    icon: BookOpen,
                    number: "03",
                    title: "Publishing",
                    description: "Transparent publication of research reports and investment decisions, fostering accountability and learning.",
                  },
                ].map((pillar) => (
                  <div 
                    key={pillar.number}
                    className="group relative bg-white p-8 transition-all hover:shadow-lg"
                  >
                    <div className="absolute left-0 top-0 h-full w-1 bg-[#E5E7EB] group-hover:bg-[#006039] transition-colors" />
                    <div className="flex items-start gap-6">
                      <span className="font-serif text-5xl font-semibold text-[#E5E7EB] group-hover:text-[#006039]/20 transition-colors">
                        {pillar.number}
                      </span>
                      <div className="flex-1 pt-2">
                        <div className="flex items-center gap-3 mb-3">
                          <pillar.icon className="h-5 w-5 text-[#006039]" />
                          <h3 className="font-serif text-xl font-semibold text-[#0B0B0B]">{pillar.title}</h3>
                        </div>
                        <p className="text-[#6B7280] leading-relaxed">{pillar.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Latest Research - Magazine style */}
        <section className="py-24 lg:py-32 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-16">
              <div>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#006039]">
                  Research Library
                </span>
                <h2 className="mt-4 font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-[#0B0B0B]">
                  Latest Reports
                </h2>
              </div>
              <Link 
                href="/research" 
                className="inline-flex items-center gap-2 text-sm font-medium text-[#006039] hover:text-[#004d2e] transition-colors"
              >
                View All Research
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            {/* Featured Report Card */}
            <div className="relative bg-[#0A1A2F] overflow-hidden">
              <div className="absolute right-0 top-0 w-1/2 h-full opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 70% 30%, #006039 0%, transparent 50%)`
                }} />
              </div>
              <div className="relative p-8 sm:p-12 lg:p-16">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className="px-3 py-1 text-xs font-medium uppercase tracking-wider bg-[#006039] text-white">
                    Technology
                  </span>
                  <span className="text-sm text-slate-400">January 16, 2026</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-4">
                  Sample Company (SMPL)
                </h3>
                <p className="max-w-2xl text-slate-300 leading-relaxed mb-8">
                  This is a sample report demonstrating the report format and structure for educational purposes. It showcases how HAVEN Equities presents research findings.
                </p>
                <div className="flex flex-wrap items-center gap-6">
                  <Button asChild className="bg-white text-[#0A1A2F] hover:bg-slate-100">
                    <Link href="/research/sample-report-technology-cycle-1">
                      Read Full Report
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                  <span className="text-sm text-slate-400">By Research Team</span>
                </div>
              </div>
            </div>
            
            {/* Placeholder for more reports */}
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className="group border border-[#E5E7EB] p-6 hover:border-[#006039] transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-[#6B7280]">Coming Soon</span>
                    <div className="h-8 w-8 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                      <FileText className="h-4 w-4 text-[#6B7280]" />
                    </div>
                  </div>
                  <div className="h-4 w-3/4 bg-[#F5F5F5] rounded mb-2" />
                  <div className="h-3 w-1/2 bg-[#F5F5F5] rounded" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Portfolio Case Study - Split layout */}
        <section className="bg-[#F5F5F5]">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 min-h-[600px]">
              {/* Left - Content */}
              <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#006039]">
                  Educational Case Study
                </span>
                <h2 className="mt-4 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#0B0B0B]">
                  Founder Portfolio
                </h2>
                <p className="mt-6 text-[#6B7280] leading-relaxed">
                  An educational demonstration using founder-owned capital. All decisions are documented with rationale for learning purposes. This is not investment advice.
                </p>
                
                <div className="mt-10 flex flex-wrap gap-8">
                  <div>
                    <div className="text-2xl font-serif font-semibold text-[#0B0B0B]">$5,000</div>
                    <div className="text-sm text-[#6B7280]">Starting Capital</div>
                  </div>
                  <div>
                    <div className="text-2xl font-serif font-semibold text-[#0B0B0B]">Jan 16, 2026</div>
                    <div className="text-sm text-[#6B7280]">Last Updated</div>
                  </div>
                </div>
                
                <div className="mt-10">
                  <Button asChild className="bg-[#0B0B0B] hover:bg-[#1a1a1a] text-white">
                    <Link href="/portfolio-case-study">
                      View Case Study
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Right - Visual */}
              <div className="relative bg-[#0A1A2F] flex items-center justify-center min-h-[400px] lg:min-h-0">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(135deg, #006039 0%, transparent 50%)`
                  }} />
                </div>
                <div className="relative text-center p-8">
                  <div className="inline-block">
                    <div className="text-8xl sm:text-9xl font-serif font-bold text-white/10">H</div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-xs uppercase tracking-[0.3em] text-[#006039] mb-2">Founder-Owned</div>
                        <div className="text-4xl font-serif font-semibold text-white">Capital</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Steps - Timeline style */}
        <section className="py-24 lg:py-32 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#006039]">
                Our Process
              </span>
              <h2 className="mt-4 font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-[#0B0B0B]">
                How It Works
              </h2>
            </div>
            
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#E5E7EB] hidden lg:block" />
              
              <div className="space-y-12 lg:space-y-0">
                {[
                  {
                    number: "01",
                    title: "Research & Analysis",
                    description: "Student analysts conduct fundamental research using institutional-grade frameworks and methodologies.",
                  },
                  {
                    number: "02",
                    title: "Internal Review",
                    description: "Reports undergo peer review and editorial approval before publication to ensure quality.",
                  },
                  {
                    number: "03",
                    title: "Publication",
                    description: "Approved research is published to our library for educational transparency and access.",
                  },
                  {
                    number: "04",
                    title: "Case Study Application",
                    description: "Research insights inform the Founder Portfolio Case Study for educational purposes only.",
                  },
                ].map((step, index) => (
                  <div 
                    key={step.number}
                    className={`relative lg:grid lg:grid-cols-2 lg:gap-12 ${index % 2 === 1 ? 'lg:direction-rtl' : ''}`}
                  >
                    <div className={`lg:text-right ${index % 2 === 1 ? 'lg:col-start-2 lg:text-left' : ''}`}>
                      <div className="inline-flex items-center gap-4 mb-4">
                        <span className="font-serif text-6xl font-bold text-[#006039]/10">{step.number}</span>
                      </div>
                      <h3 className="font-serif text-xl font-semibold text-[#0B0B0B] mb-2">{step.title}</h3>
                      <p className="text-[#6B7280] leading-relaxed max-w-md">{step.description}</p>
                    </div>
                    
                    {/* Timeline dot */}
                    <div className="absolute left-1/2 top-6 -translate-x-1/2 hidden lg:block">
                      <div className="h-4 w-4 rounded-full bg-[#006039] ring-4 ring-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Compliance Banner */}
        <section className="bg-[#0A1A2F] py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 shrink-0 text-[#006039] mt-1" />
                <div>
                  <h3 className="font-serif text-xl font-semibold text-white">Educational Disclaimer</h3>
                  <p className="mt-2 text-slate-300 max-w-2xl leading-relaxed">
                    HAVEN Equities is for educational purposes only. We do not provide investment advice, manage external capital, or solicit investments. All content is for learning and demonstration.
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="border-slate-500 text-white hover:bg-white/10 shrink-0 bg-transparent">
                <Link href="/compliance">
                  Read Full Compliance
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
