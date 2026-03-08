"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Calculator, Target, FileText, ArrowRight } from "lucide-react"
function JEEContent() {
  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">JEE (Joint Entrance Examination)</h1>
          <p className="mt-2 text-muted-foreground">
            Preparation resources and guidance for JEE Main &amp; Advanced – engineering entrance by NTA and IITs.
          </p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="h-5 w-5" />
                JEE Main
              </CardTitle>
              <CardDescription>
                National-level exam for NITs, IIITs, CFTIs and many engineering colleges. Conducted by NTA (twice a year).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Physics, Chemistry, Mathematics</li>
                <li>Paper 1 (B.E./B.Tech) and Paper 2 (B.Arch/Planning)</li>
                <li>Negative marking applicable</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5" />
                JEE Advanced
              </CardTitle>
              <CardDescription>
                For admission to IITs. Only top rankers in JEE Main are eligible to appear.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Two papers (objective and numerical)</li>
                <li>Rigorous problem-solving and conceptual depth</li>
                <li>Conducted by an IIT (rotating)</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5" />
                Syllabus &amp; Pattern
              </CardTitle>
              <CardDescription>
                Class 11–12 PCM syllabus; focus on NCERT and standard reference books.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Physics: Mechanics, E&amp;M, Optics, Modern Physics</li>
                <li>Chemistry: Physical, Organic, Inorganic</li>
                <li>Maths: Algebra, Calculus, Coordinate Geometry, Vectors</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Preparation strategy
            </CardTitle>
            <CardDescription>Suggested approach for JEE aspirants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Foundation:</strong> Complete NCERT thoroughly. Use standard books (HC Verma, Cengage, etc.) for practice.
            </p>
            <p>
              <strong className="text-foreground">Mock tests:</strong> Take full-length mocks regularly. Analyse weak areas and revise.
            </p>
            <p>
              <strong className="text-foreground">Revision:</strong> Short notes and formula sheets for last-minute revision. Focus on high-weightage topics.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/experiences" className="inline-flex items-center gap-2">
              Browse experiences <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/resources">Resources</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function JEEPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/auth/login?redirectTo=/streams/jee")
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (!isAuthenticated) return null

  return <JEEContent />
}
