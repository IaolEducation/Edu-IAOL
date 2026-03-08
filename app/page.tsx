"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowRight, Building, Search, Users, FileText, BookOpen,
  Calculator, Stethoscope, Layers, Briefcase, Lightbulb,
  GraduationCap, Star,
} from "lucide-react"
import StatsSection from "@/components/stats-section"
import HomepageExperiences from "@/components/homepage-experiences"
import AdviceSection from "@/components/advice-section"
import { useAuth } from "@/contexts/auth-context"

// ─── Guest home (not logged in) ───────────────────────────────────────────────
function GuestHome() {
  return (
    <div className="flex flex-col gap-12 pb-8">
      <section className="w-full py-8 md:py-16 lg:py-24 bg-gradient-to-b from-muted/50 to-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="inline-flex items-center rounded-full border border-green-600 bg-green-100 dark:bg-green-900/30 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    Eduiaol · Affiliated with IAOL Education · Kargil, Ladakh
                  </div>
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-6xl/none">
                  Leverage the Experience of Those Who Came Before You
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  JEE, NEET, placements &amp; career guidance. Sign in to browse experiences, share your journey, and access study resources.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button asChild size="lg" className="h-12 text-xs sm:text-sm">
                  <Link href="/auth/login"><Search className="h-4 w-4 mr-1 sm:mr-2" /> Sign in to Browse</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 text-xs sm:text-sm">
                  <Link href="/auth/login"><Users className="h-4 w-4 mr-1 sm:mr-2" /> Sign in to Share</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 text-xs sm:text-sm">
                  <Link href="/auth/login"><FileText className="h-4 w-4 mr-1 sm:mr-2" /> Resume Builder</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 text-xs sm:text-sm">
                  <Link href="/auth/login"><BookOpen className="h-4 w-4 mr-1 sm:mr-2" /> Resources</Link>
                </Button>
              </div>
            </div>
            <div className="md:flex md:justify-center overflow-hidden">
              <Image src="/haseenNITH.png" alt="Eduiaol – students and mentors" width={500} height={500} className="rounded-b-full object-cover w-[500px] h-[500px]" />
            </div>
          </div>
        </div>
      </section>

      <section className="container px-4 md:px-6 py-6 md:py-8">
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Explore Experiences</CardTitle>
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>Browse placement experiences and exam prep insights.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Filter by stream, company, or type.</CardContent>
            <CardFooter>
              <Button asChild variant="ghost" className="w-full h-10">
                <Link href="/auth/login" className="flex items-center justify-between"><span>Sign in to View</span><ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Company Profiles</CardTitle>
                <Building className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>Learn about companies and placement stats.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Company details and placement statistics.</CardContent>
            <CardFooter>
              <Button asChild variant="ghost" className="w-full h-10">
                <Link href="/auth/login" className="flex items-center justify-between"><span>Sign in to Explore</span><ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Share Your Journey</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>Contribute your experience to help others.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Share preparation strategy, interview tips, and more.</CardContent>
            <CardFooter>
              <Button asChild variant="ghost" className="w-full h-10">
                <Link href="/auth/login" className="flex items-center justify-between"><span>Sign in to Submit</span><ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <AdviceSection />

      <section className="container px-4 md:px-6 py-8 md:py-16 bg-muted rounded-lg">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-[1.1]">Ready to Share Your Journey?</h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">Your experience can guide other students. Sign in to submit your story.</p>
          <Button asChild size="lg" className="mt-4 w-full sm:w-auto h-12">
            <Link href="/auth/login">Sign in to Submit</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

// ─── College Student home ──────────────────────────────────────────────────────
function CollegeStudentHome({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-10 pb-8">
      <section className="w-full py-8 md:py-12 bg-gradient-to-br from-blue-50 via-background to-background dark:from-blue-950/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">College Student</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Welcome back, {name}!</h1>
              <p className="mt-2 text-muted-foreground max-w-xl">Browse placement experiences, explore companies, and build your career profile.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button asChild size="lg" className="h-11">
                <Link href="/experiences"><Search className="h-4 w-4 mr-2" /> Browse Experiences</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11">
                <Link href="/submit"><FileText className="h-4 w-4 mr-2" /> Share Yours</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Placement Highlights — college students ONLY */}
      <StatsSection />

      <section className="container px-4 md:px-6">
        <h2 className="text-xl font-bold mb-4">Quick Access</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <Search className="h-4 w-4 text-primary" />, title: "Experiences", desc: "Placement & internship stories from seniors", href: "/experiences", cta: "Browse" },
            { icon: <Building className="h-4 w-4 text-primary" />, title: "Companies", desc: "Explore companies and placement stats", href: "/companies", cta: "Explore" },
            { icon: <FileText className="h-4 w-4 text-primary" />, title: "Resume Builder", desc: "Build and polish your resume", href: "/resume-builder", cta: "Open" },
            { icon: <BookOpen className="h-4 w-4 text-primary" />, title: "Resources", desc: "Interview guides and prep materials", href: "/resources", cta: "View" },
          ].map((item) => (
            <Card key={item.href} className="hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">{item.icon} {item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground pb-3">{item.desc}</CardContent>
              <CardFooter>
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link href={item.href}>{item.cta} <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section className="container px-3 sm:px-4 md:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Recent Placement Experiences</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/experiences" className="flex items-center gap-1">View All <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <HomepageExperiences />
      </section>

      <AdviceSection />
    </div>
  )
}

// ─── Exam-prep Student home ────────────────────────────────────────────────────
function StudentHome({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-10 pb-8">
      <section className="w-full py-8 md:py-12 bg-gradient-to-br from-green-50 via-background to-background dark:from-green-950/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Exam Preparation</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Welcome back, {name}!</h1>
              <p className="mt-2 text-muted-foreground max-w-xl">Access JEE, NEET, and other entrance exam resources tailored for you.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button asChild size="lg" className="h-11">
                <Link href="/resources"><BookOpen className="h-4 w-4 mr-2" /> Study Resources</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11">
                <Link href="/dashboard/student"><ArrowRight className="h-4 w-4 mr-2" /> Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container px-4 md:px-6">
        <h2 className="text-xl font-bold mb-4">Your Exam Streams</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <Card className="hover:border-primary/40 transition-colors border-2">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 mb-2">
                <Calculator className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">JEE</CardTitle>
              <CardDescription>JEE Main &amp; Advanced — syllabus, strategy, and preparation guides for engineering entrance.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li>• Physics, Chemistry, Mathematics</li>
                <li>• Previous year papers</li>
                <li>• Expert strategies &amp; tips</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/streams/jee">Open JEE <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:border-primary/40 transition-colors border-2">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 mb-2">
                <Stethoscope className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">NEET</CardTitle>
              <CardDescription>NEET UG — Biology, Chemistry, Physics and full exam pattern for medical entrance.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li>• Biology, Chemistry, Physics</li>
                <li>• NEET pattern &amp; mock tests</li>
                <li>• Topper strategies</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant="outline">
                <Link href="/streams/neet">Open NEET <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:border-primary/40 transition-colors border-2">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 mb-2">
                <Layers className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Other Streams</CardTitle>
              <CardDescription>CLAT, CUET, state exams, Commerce, and more — all under one roof.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li>• CLAT, CUET, State CETs</li>
                <li>• Commerce &amp; Arts streams</li>
                <li>• Vocational courses</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant="outline">
                <Link href="/streams/others">View Streams <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="container px-4 md:px-6">
        <div className="rounded-xl border-2 bg-muted/40 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Study Resources</h3>
              <p className="text-sm text-muted-foreground">Curated materials, previous year papers, and complete preparation guides</p>
            </div>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link href="/resources">Go to Resources <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <AdviceSection />
    </div>
  )
}

// ─── Professional home ─────────────────────────────────────────────────────────
function ProfessionalHome({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-10 pb-8">
      <section className="w-full py-8 md:py-12 bg-gradient-to-br from-purple-50 via-background to-background dark:from-purple-950/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">Professional</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Welcome back, {name}!</h1>
              <p className="mt-2 text-muted-foreground max-w-xl">Share your experience and help the next generation of students succeed.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button asChild size="lg" className="h-11">
                <Link href="/submit"><FileText className="h-4 w-4 mr-2" /> Share Experience</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11">
                <Link href="/profile"><Lightbulb className="h-4 w-4 mr-2" /> Post Advice</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container px-4 md:px-6">
        <h2 className="text-xl font-bold mb-4">How You Can Help</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:border-primary/40 transition-colors border-2">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 mb-2">
                <FileText className="h-6 w-6" />
              </div>
              <CardTitle>Share Your Story</CardTitle>
              <CardDescription>Submit your placement or career journey. Your experience is invaluable to students.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/submit">Submit Experience <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:border-primary/40 transition-colors border-2">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 mb-2">
                <Lightbulb className="h-6 w-6" />
              </div>
              <CardTitle>Post Advice</CardTitle>
              <CardDescription>Share career tips, interview strategies, and lessons learned for students.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/profile">Go to Profile <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:border-primary/40 transition-colors border-2">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 mb-2">
                <Users className="h-6 w-6" />
              </div>
              <CardTitle>Browse Experiences</CardTitle>
              <CardDescription>Read what others have shared. Compare journeys and find inspiration.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/experiences">View Experiences <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:border-primary/40 transition-colors sm:col-span-2 lg:col-span-3">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600">
                  <Star className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Join the Community</CardTitle>
                  <CardDescription>Connect with students, college seniors, and other professionals on Eduiaol.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardFooter className="gap-3 flex-wrap">
              <Button asChild variant="outline">
                <Link href="/community">Browse Community <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/advice">See All Advice <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <AdviceSection />
    </div>
  )
}

// ─── Root export ───────────────────────────────────────────────────────────────
export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const name = user?.displayName || user?.email?.split("@")[0] || "there"

  if (!user) return <GuestHome />

  switch (user.userType) {
    case "college_student": return <CollegeStudentHome name={name} />
    case "student":         return <StudentHome name={name} />
    case "professional":    return <ProfessionalHome name={name} />
    default:                return <GuestHome />
  }
}
